import logging
import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from core.auth import get_current_user
from llm import SYSTEM_PROMPT, get_llm_client, get_mistral_tools
from models import User
from repositories import get_chat_repo, get_message_repo
from repositories import ChatRepository
from schemas import ChatDetail, ChatOut, MessageCreate, ChatCreate
from repositories import MessageRepository
from models import MessageRole
from scraper.retrieval import get_retrieval_service
from fastapi.responses import StreamingResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chats"])


@router.get(
    "/chats",
    summary="List chats",
    operation_id="list_chats",
    response_model=list[ChatOut],
)
def list_chats(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    repo: ChatRepository = Depends(get_chat_repo),
    current_user: User = Depends(get_current_user),
) -> list[ChatOut]:
    return repo.list_chats(user_id=current_user.id, limit=limit, offset=offset)


@router.get(
    "/chat/{chat_id}",
    summary="Get a chat by ID",
    operation_id="get_chat_by_id",
    response_model=ChatDetail,
)
def get_chat(
    chat_id: UUID,
    repo: ChatRepository = Depends(get_chat_repo),
    current_user: User = Depends(get_current_user),
) -> ChatDetail:
    chat = repo.get_chat(user_id=current_user.id, chat_id=chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    return chat


@router.put(
    "/chat/{chat_id}",
    summary="Update a chat's title",
    operation_id="update_chat",
    response_model=ChatOut,
)
def update_chat(
    chat_id: UUID,
    payload: ChatCreate,
    repo: ChatRepository = Depends(get_chat_repo),
    current_user: User = Depends(get_current_user),
) -> ChatOut:
    chat = repo.get_chat(user_id=current_user.id, chat_id=chat_id)
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    updated_chat = repo.update_chat(chat_id=chat_id, title=payload.title)
    return ChatOut.model_validate(updated_chat)


@router.delete(
    "/chat/{chat_id}",
    summary="Delete a chat",
    operation_id="delete_chat",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_chat(
    chat_id: UUID,
    repo: ChatRepository = Depends(get_chat_repo),
    current_user: User = Depends(get_current_user),
):
    chat = repo.get_chat(user_id=current_user.id, chat_id=chat_id)
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    repo.delete_chat(chat_id=chat_id)
    return


@router.post(
    "/chats",
    summary="Create a new chat",
    response_model=ChatOut,
    status_code=status.HTTP_201_CREATED,
)
def create_chat(
    payload: ChatCreate,
    repo: ChatRepository = Depends(get_chat_repo),
    current_user: User = Depends(get_current_user),
) -> ChatOut:
    chat = repo.create_chat(user_id=current_user.id, title=payload.title)
    return ChatOut.model_validate(chat)


@router.post(
    "/chat/{chat_id}/stream",
    summary="Stream an assistant reply to a user message",
    operation_id="stream_message",
)
async def stream_message(
    chat_id: UUID,
    payload: MessageCreate,
    retry: bool = Query(
        False, description="Allow retry without consecutive user message check"
    ),
    chat_repo: ChatRepository = Depends(get_chat_repo),
    message_repo: MessageRepository = Depends(get_message_repo),
    current_user: User = Depends(get_current_user),
):
    """
    Stream assistant response with automatic tool call handling.

    Flow:
    1. Save user message (or reuse last one if retry=true)
    2. Check for tool calls (non-streaming invoke)
    3. If tool call: execute retrieval, add context, stream final response
    4. If no tool call: stream response directly
    5. Save assistant message with usage metrics
    """
    chat = chat_repo.get_chat(user_id=current_user.id, chat_id=chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Skip consecutive-user check if retry
    if not retry:
        last_msg = chat.messages[-1] if chat.messages else None
        if last_msg and last_msg.role == MessageRole.USER:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Cannot send multiple user messages in a row",
            )

    # Handle user message: reuse last if retry, or insert new
    if retry and chat.messages and chat.messages[-1].role == MessageRole.USER:
        user_message = chat.messages[-1]
        if user_message.content != payload.content:
            message_repo.update_message_content(
                user_message.id, new_content=payload.content
            )
            user_message.content = payload.content
    else:
        user_message = message_repo.insert_message(
            chat_id=chat_id,
            role=MessageRole.USER,
            content=payload.content,
        )
        chat.messages.append(user_message)

    # Build conversation history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(
        [{"role": msg.role.value, "content": msg.content} for msg in chat.messages]
    )

    llm_client = get_llm_client()
    retrieval_service = get_retrieval_service()
    tools = get_mistral_tools() if retrieval_service else None

    async def generate():
        full_response = []
        usage_data = None

        try:
            # Check for tool calls first (non-streaming)
            content, usage, tool_calls = await llm_client.invoke(messages, tools=tools)

            if tool_calls and retrieval_service:
                logger.info(f"Tool calls detected: {len(tool_calls)}")

                # Execute all tool calls
                for tool_call in tool_calls:
                    if tool_call["function"]["name"] == "search_documentation":
                        args = json.loads(tool_call["function"]["arguments"])
                        query = args.get("query", "")

                        logger.debug(f"Searching docs: {query}")
                        docs = await retrieval_service.search(query, top_k=3)

                        context = "\n\n".join(
                            [
                                f"**{doc.title}**\n{doc.chunk}\nSource: {doc.url}"
                                for doc in docs
                            ]
                        )

                        # Append assistant message with tool call
                        messages.append(
                            {
                                "role": "assistant",
                                "content": "",
                                "tool_calls": [
                                    {
                                        "id": tool_call["id"],
                                        "type": "function",
                                        "function": {
                                            "name": tool_call["function"]["name"],
                                            "arguments": tool_call["function"][
                                                "arguments"
                                            ],
                                        },
                                    }
                                ],
                            }
                        )
                        # Append tool result
                        messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tool_call["id"],
                                "content": context,
                            }
                        )

                # Stream final response with context
                async for chunk, usage in llm_client.stream(messages, tools=None):
                    if chunk:
                        full_response.append(chunk)
                        yield chunk
                    if usage:
                        usage_data = usage

            else:
                # No tool calls - stream directly
                async for chunk, usage in llm_client.stream(messages, tools=tools):
                    if chunk:
                        full_response.append(chunk)
                        yield chunk
                    if usage:
                        usage_data = usage

            final_content = "".join(full_response)
            if not final_content:
                final_content = "No response generated"

            message_repo.insert_message(
                chat_id=chat_id,
                role=MessageRole.ASSISTANT,
                content=final_content,
                latency_ms=usage_data["latency_ms"] if usage_data else None,
                prompt_tokens=usage_data["prompt_tokens"] if usage_data else None,
                completion_tokens=(
                    usage_data["completion_tokens"] if usage_data else None
                ),
            )

        except Exception as e:
            logger.error(f"Stream failed: {e}", exc_info=True)
            raise

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
