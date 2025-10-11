import asyncio
import json
import logging
import time
from typing import AsyncGenerator
from uuid import UUID

from fastapi.responses import StreamingResponse
from starlette.concurrency import run_in_threadpool

from llm import LLMClient, SYSTEM_PROMPT, get_mistral_tools
from models import MessageRole
from repositories import MessageRepository
from .sse_events import (
    SSEStartEvent,
    SSETokenEvent,
    SSESourcesEvent,
    SSEDoneEvent,
    SSEErrorEvent,
    SourceReference,
)
from services import (
    RetrievalService,
    get_retrieval_service,
)

logger = logging.getLogger(__name__)


class StreamOrchestrator:
    """
    Orchestrates streaming responses with optional tool calling (RAG).
    Handles SSE formatting, persistence, and multi-turn tool execution.
    """

    def __init__(
        self,
        llm_client: LLMClient,
        retrieval_service: RetrievalService | None = None,
    ):
        self.llm = llm_client
        self.retrieval = retrieval_service

    @staticmethod
    def sse_pack(
        data: str,
        event: str | None = None,
        id: str | None = None,
        retry_ms: int | None = None,
    ) -> bytes:
        """Pack data into SSE format."""
        lines: list[str] = []
        if id is not None:
            lines.append(f"id: {id}")
        if event is not None:
            lines.append(f"event: {event}")
        for ln in data.splitlines() or [""]:
            lines.append(f"data: {ln}")
        if retry_ms is not None:
            lines.append(f"retry: {retry_ms}")
        return ("\n".join(lines) + "\n\n").encode("utf-8")

    async def execute_tool_call(self, tool_call: dict) -> str:
        """
        Execute a single tool call and return the result as a string.
        Currently only supports search_documentation.
        """
        function_name = tool_call["function"]["name"]

        if function_name != "search_documentation":
            return f"Error: Unknown tool '{function_name}'"

        if not self.retrieval:
            return "Error: Documentation search not available"

        try:
            args = json.loads(tool_call["function"]["arguments"])
            query = args.get("query", "")

            if not query:
                return "Error: No query provided"

            chunks = await self.retrieval.search(query, top_k=3)

            if not chunks:
                return "No relevant documentation found for this query."

            results = []
            for i, chunk in enumerate(chunks, 1):
                results.append(
                    f"[{i}] {chunk.title}\n"
                    f"URL: {chunk.url}\n"
                    f"Content: {chunk.chunk}\n"
                )

            return "\n\n".join(results)

        except json.JSONDecodeError:
            return "Error: Invalid tool call arguments"
        except Exception as e:
            logger.error(f"Tool execution error: {e}", exc_info=True)
            return f"Error executing tool: {str(e)}"

    async def token_generator(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
    ) -> AsyncGenerator[bytes, None]:
        """
        Stream tokens as SSE events with automatic tool calling when needed.
        Persists final message and handles tool execution.
        """
        final_tokens: list[str] = []
        last_ping = time.monotonic()
        sources: list[SourceReference] = []

        yield self.sse_pack(
            SSEStartEvent().model_dump_json(), event="message", retry_ms=2000
        )

        try:
            # Prepare messages with system prompt
            messages = openai_msgs.copy()
            if not messages or messages[0].get("role") != "system":
                messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

            logger.info(f"Sending {len(messages)} messages to LLM")

            tools = get_mistral_tools() if self.retrieval else None
            tool_calls_made = False

            async for chunk in self.llm.stream_chat(messages, tools=tools):
                # Handle tool calls
                if isinstance(chunk, dict) and "tool_calls" in chunk:
                    tool_calls = chunk["tool_calls"]
                    tool_calls_made = True

                    # Add assistant message with tool calls
                    messages.append(
                        {
                            "role": "assistant",
                            "content": None,
                            "tool_calls": tool_calls,
                        }
                    )

                    # Execute tools and collect sources
                    for tc in tool_calls:
                        function_name = tc["function"]["name"]
                        logger.info(f"Executing tool: {function_name}")

                        result = await self.execute_tool_call(tc)

                        messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc["id"],
                                "name": function_name,
                                "content": result,
                            }
                        )

                        # Extract sources for frontend
                        if function_name == "search_documentation" and "URL:" in result:
                            title = None
                            for line in result.split("\n"):
                                if line.startswith("[") and "]" in line:
                                    title = line.split("]")[1].strip()
                                elif line.startswith("URL:"):
                                    url = line.replace("URL:", "").strip()
                                    if title and url:
                                        sources.append(
                                            SourceReference(title=title, url=url)
                                        )
                                        title = None

                    break  # Exit first stream to make second call

                # Handle content tokens
                elif isinstance(chunk, str):
                    final_tokens.append(chunk)
                    event = SSETokenEvent(content=chunk)
                    yield self.sse_pack(event.model_dump_json(), event="message")

                    now = time.monotonic()
                    if now - last_ping > 15:
                        yield b": ping\n\n"
                        last_ping = now

            # Second call -> generate final answer using tool results (no tools offered)
            if tool_calls_made:
                logger.info("Generating final answer with tool results")

                async for chunk in self.llm.stream_chat(messages, tools=None):
                    if isinstance(chunk, str):
                        final_tokens.append(chunk)
                        event = SSETokenEvent(content=chunk)
                        yield self.sse_pack(event.model_dump_json(), event="message")

                        now = time.monotonic()
                        if now - last_ping > 15:
                            yield b": ping\n\n"
                            last_ping = now

        except asyncio.CancelledError:
            text = "".join(final_tokens).strip()
            if text:
                await run_in_threadpool(
                    msg_repo.insert_message,
                    chat_id=chat_id,
                    content=text,
                    role=MessageRole.ASSISTANT,
                )
            logger.info(f"Stream cancelled for chat {chat_id}, partial text saved")
            return

        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            error_event = SSEErrorEvent(message="stream_error")
            yield self.sse_pack(error_event.model_dump_json(), event="message")
            return

        else:
            # Send sources
            if sources:
                unique_sources = []
                seen_urls = set()
                for src in sources:
                    if src.url not in seen_urls:
                        unique_sources.append(src)
                        seen_urls.add(src.url)

                sources_event = SSESourcesEvent(data=unique_sources)
                yield self.sse_pack(sources_event.model_dump_json(), event="message")

            # Persist final message
            text = "".join(final_tokens).strip()
            if text:
                try:
                    await run_in_threadpool(
                        msg_repo.insert_message,
                        chat_id=chat_id,
                        content=text,
                        role=MessageRole.ASSISTANT,
                    )
                    logger.info(f"Persisted assistant message ({len(text)} chars)")
                except Exception as e:
                    logger.error(f"Failed to persist message: {e}")
            else:
                logger.warning("No content generated")

            done_event = SSEDoneEvent()
            yield self.sse_pack(done_event.model_dump_json(), event="message")

    def streaming_response(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
    ) -> StreamingResponse:
        """
        Return a FastAPI StreamingResponse with SSE headers.
        """
        headers = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
        return StreamingResponse(
            self.token_generator(
                openai_msgs=openai_msgs,
                chat_id=chat_id,
                msg_repo=msg_repo,
            ),
            headers=headers,
            status_code=200,
        )


_llm_client_instance: LLMClient | None = None


def set_llm_client(client: LLMClient):
    global _llm_client_instance
    _llm_client_instance = client


def get_stream_orchestrator() -> StreamOrchestrator:
    if _llm_client_instance is None:
        raise RuntimeError(
            "LLM client not initialized. Call set_llm_client() at startup."
        )
    return StreamOrchestrator(_llm_client_instance, get_retrieval_service())
