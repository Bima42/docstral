from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from api.core.security import get_current_user
from api.models import User
from api.repositories import get_chat_repo, get_message_repo
from api.repositories import ChatRepository
from api.schemas import ChatDetail, ChatOut, MessageCreate, MessageOut
from api.repositories import MessageRepository

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
    "/chat/{chat_id}/messages",
    summary="Add a user message to a chat",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
)
def add_message(
    chat_id: UUID,
    payload: MessageCreate,
    chat_repo: ChatRepository = Depends(get_chat_repo),
    repo: MessageRepository = Depends(get_message_repo),
    current_user: User = Depends(get_current_user),
) -> MessageOut:
    chat = chat_repo.get_chat(user_id=current_user.id, chat_id=chat_id)
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    return repo.insert_message(chat_id=chat.id, content=payload.content)
