import asyncio
import logging
import time
from typing import AsyncGenerator
from uuid import UUID

from fastapi.responses import StreamingResponse
from starlette.concurrency import run_in_threadpool

from llm import LLMClient
from models import MessageRole
from repositories import MessageRepository
from services.retrieval import (
    RetrievalService,
    get_retrieval_service,
)
from services.prompt import PromptBuilder
from services.sse_events import (
    SSEStartEvent,
    SSETokenEvent,
    SSESourcesEvent,
    SSEDoneEvent,
    SSEErrorEvent,
    SourceReference,
)

logger = logging.getLogger(__name__)


class StreamOrchestrator:
    """
    Orchestrates streaming responses with optional RAG.
    Handles SSE formatting, persistence, and fallback logic.
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
        """
        Pack data into SSE format.
        """
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

    async def token_generator(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
        use_rag: bool = True,
    ) -> AsyncGenerator[bytes, None]:
        """
        Stream tokens as SSE events with optional RAG augmentation.
        Persists final message and handles fallback gracefully.
        """
        final_tokens: list[str] = []
        last_ping = time.monotonic()
        sources: list[SourceReference] = []

        yield self.sse_pack(
            SSEStartEvent().model_dump_json(), event="message", retry_ms=2000
        )

        try:
            last_user_msg = next(
                (m["content"] for m in reversed(openai_msgs) if m["role"] == "user"),
                None,
            )
            logger.debug(f"LASTUSERMESSAGE : {last_user_msg}")

            if use_rag and self.retrieval and last_user_msg:
                try:
                    chunks = await self.retrieval.search(last_user_msg, top_k=3)
                    if chunks:
                        sources = [
                            SourceReference(title=c.title, url=c.url) for c in chunks
                        ]
                        rag_prompt = PromptBuilder.build_rag_prompt(
                            last_user_msg, chunks
                        )
                        messages = [{"role": "user", "content": rag_prompt}]
                        logger.info(f"RAG enabled: found {len(chunks)} relevant chunks")
                    else:
                        logger.warning("No relevant chunks found, using direct query")
                        messages = openai_msgs
                except Exception as e:
                    logger.warning(f"RAG retrieval failed: {e}, falling back")
                    messages = openai_msgs
            else:
                messages = openai_msgs

            async for token in self.llm.stream_chat(messages):
                final_tokens.append(token)
                event = SSETokenEvent(content=token)
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
            if sources:
                sources_event = SSESourcesEvent(data=sources)
                yield self.sse_pack(sources_event.model_dump_json(), event="message")

            text = "".join(final_tokens).strip()
            if text:
                try:
                    await run_in_threadpool(
                        msg_repo.insert_message,
                        chat_id=chat_id,
                        content=text,
                        role=MessageRole.ASSISTANT,
                    )
                except Exception as e:
                    logger.error(f"Failed to persist message: {e}")

            done_event = SSEDoneEvent()
            yield self.sse_pack(done_event.model_dump_json(), event="message")

    def streaming_response(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
        use_rag: bool = True,
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
                use_rag=use_rag,
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
