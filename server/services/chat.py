import asyncio
import json
import time
from typing import AsyncGenerator
from uuid import UUID

from fastapi.responses import StreamingResponse
from starlette.concurrency import run_in_threadpool

from llm import LLMClient
from models import MessageRole
from schemas import MessageOut
from repositories import MessageRepository
from services.rag import RAGService


class ChatStreamService:
    """
    Streams assistant replies over SSE using any LLMClient implementation.
    Supports RAG integration.
    """

    def __init__(self, llm_client: LLMClient, rag_service: RAGService | None = None):
        self.llm = llm_client
        self.rag = rag_service

    @staticmethod
    def sse_pack(
        data: str,
        event: str | None = None,
        id: str | None = None,
        retry_ms: int | None = None,
    ) -> bytes:
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

    @staticmethod
    def to_openai_messages(msgs: list[MessageOut]) -> list[dict]:
        out: list[dict] = []
        for m in msgs:
            role_raw = getattr(m, "role", "user")
            role = str(role_raw).lower()
            if role not in {"user", "assistant", "system", "tool"}:
                role = "user"
            out.append({"role": role, "content": m.content})
        return out

    async def token_generator(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
        use_rag: bool = True,
    ) -> AsyncGenerator[bytes, None]:
        final_tokens: list[str] = []
        last_ping = time.monotonic()
        sources: list[dict] = []

        yield self.sse_pack(
            json.dumps({"type": "start"}), event="message", retry_ms=2000
        )

        try:
            last_user_msg = next(
                (m["content"] for m in openai_msgs if m["role"] == "user"),
                None,
            )

            if use_rag and self.rag and last_user_msg:
                # Retrieve sources
                sources_data = await self.rag.search(last_user_msg, top_k=3)
                sources = [{"title": s["title"], "url": s["url"]} for s in sources_data]

                async for token in self.rag.stream_answer_with_rag(last_user_msg):
                    final_tokens.append(token)
                    yield self.sse_pack(
                        json.dumps({"type": "token", "content": token}),
                        event="message",
                    )
                    now = time.monotonic()
                    if now - last_ping > 15:
                        yield b": ping\n\n"
                        last_ping = now
            else:
                # Standard streaming without RAG
                async for token in self.llm.stream_chat(openai_msgs):
                    final_tokens.append(token)
                    yield self.sse_pack(
                        json.dumps({"type": "token", "content": token}),
                        event="message",
                    )
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
            return

        except Exception as e:
            import logging

            logging.error(f"Stream error: {e}", exc_info=True)
            yield self.sse_pack(
                json.dumps({"type": "error", "message": "stream_error"}),
                event="message",
            )
            return

        else:
            if sources:
                yield self.sse_pack(
                    json.dumps({"type": "sources", "data": sources}),
                    event="message",
                )

            text = "".join(final_tokens).strip()
            if text:
                try:
                    await run_in_threadpool(
                        msg_repo.insert_message,
                        chat_id=chat_id,
                        content=text,
                        role=MessageRole.ASSISTANT,
                    )
                except Exception:
                    pass
            yield self.sse_pack(json.dumps({"type": "done"}), event="message")

    def streaming_response(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
        use_rag: bool = True,
    ) -> StreamingResponse:
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
_rag_service_instance: RAGService | None = None


def set_llm_client(client: LLMClient):
    global _llm_client_instance
    _llm_client_instance = client


def set_rag_service(service: RAGService | None):
    global _rag_service_instance
    _rag_service_instance = service


def get_chat_stream_service() -> ChatStreamService:
    if _llm_client_instance is None:
        raise RuntimeError(
            "LLM client not initialized. Call set_llm_client() at startup."
        )
    return ChatStreamService(_llm_client_instance, _rag_service_instance)
