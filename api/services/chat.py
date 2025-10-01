import asyncio
import json
import time
from typing import AsyncGenerator
from uuid import UUID

from fastapi.responses import StreamingResponse
from starlette.concurrency import run_in_threadpool

from api.llm import MistralConfig, MistralLLMClient
from api.models import MessageRole
from api.schemas import MessageOut
from api.repositories import MessageRepository


class ChatStreamService:
    """
    Streams assistant replies over SSE using a MistralLLMClient.
    - Converts DB messages to OpenAI/Mistral format.
    - Emits tokens as SSE events, with heartbeats.
    - Persists partial/final assistant messages without breaking the stream.
    """

    def __init__(self, llm_client: MistralLLMClient | None = None):
        self.llm = llm_client or MistralLLMClient(MistralConfig.from_env())

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
        # SSE allows multi-line data by repeating "data:" per line
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
    ) -> AsyncGenerator[bytes, None]:
        final_tokens: list[str] = []
        last_ping = time.monotonic()

        yield self.sse_pack(
            json.dumps({"type": "start"}), event="message", retry_ms=2000
        )

        try:
            async for token in self.llm.stream_chat(openai_msgs):
                final_tokens.append(token)
                yield self.sse_pack(
                    json.dumps({"type": "token", "content": token}), event="message"
                )
                now = time.monotonic()
                if now - last_ping > 15:
                    # Heartbeat comment for proxies
                    yield b": ping\n\n"
                    last_ping = now

        except asyncio.CancelledError:
            # Persist partial on client disconnect; don't break the stream.
            text = "".join(final_tokens).strip()
            if text:
                await run_in_threadpool(
                    msg_repo.insert_message,
                    chat_id=chat_id,
                    content=text,
                    role=MessageRole.ASSISTANT,
                )
            return

        except Exception:
            # Best effort: notify client, then end the stream gracefully.
            yield self.sse_pack(
                json.dumps({"type": "error", "message": "stream_error"}),
                event="message",
            )
            return

        else:
            # Persist final message; never let failures break SSE completion.
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
                    # Optional: log/metrics here
                    pass
            yield self.sse_pack(json.dumps({"type": "done"}), event="message")

    def streaming_response(
        self,
        openai_msgs: list[dict],
        chat_id: UUID,
        msg_repo: MessageRepository,
    ) -> StreamingResponse:
        headers = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
        return StreamingResponse(
            self.token_generator(
                openai_msgs=openai_msgs, chat_id=chat_id, msg_repo=msg_repo
            ),
            headers=headers,
            status_code=200,
        )


def get_chat_stream_service() -> ChatStreamService:
    return ChatStreamService()
