from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from core.security import get_current_user
from models import User
from repositories import get_chat_repo, get_message_repo
from repositories import ChatRepository
from schemas import ChatDetail, ChatOut, MessageCreate, MessageOut, ChatCreate
from repositories import MessageRepository
from models import MessageRole
from services.chat import get_chat_stream_service, ChatStreamService

router = APIRouter(tags=["chats"])


@router.get("/chats", summary="List chats", response_model=list[ChatOut])
def list_chats(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    repo: ChatRepository = Depends(get_chat_repo),
    current_user: User = Depends(get_current_user),
) -> list[ChatOut]:
    return repo.list_chats(user_id=current_user.id, limit=limit, offset=offset)


@router.get("/chat/{chat_id}", summary="Get a chat by ID", response_model=ChatDetail)
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
    summary="Stream an assistant reply to a user message (SSE)",
)
def stream_reply(
    chat_id: UUID,
    payload: MessageCreate,
    chat_repo: ChatRepository = Depends(get_chat_repo),
    msg_repo: MessageRepository = Depends(get_message_repo),
    chat_stream_service: ChatStreamService = Depends(get_chat_stream_service),
    current_user: User = Depends(get_current_user),
):
    chat = chat_repo.get_chat(user_id=current_user.id, chat_id=chat_id)
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    last_msg = chat.messages[-1] if chat.messages else None
    if last_msg and last_msg.role == MessageRole.USER:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot send multiple user messages in a row",
        )

    user_msg = msg_repo.insert_message(
        chat_id=chat.id, content=payload.content, role=MessageRole.USER
    )
    chat.messages.append(user_msg)

    openai_msgs = chat_stream_service.to_openai_messages(chat.messages)
    return chat_stream_service.streaming_response(
        openai_msgs=openai_msgs, chat_id=chat.id, msg_repo=msg_repo
    )
