from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.repositories import get_chat_repo
from api.repositories import ChatRepository
from api.schemas import ChatDetail, ChatOut

router = APIRouter(tags=["chats"])


@router.get("/chats", summary="List chats", response_model=list[ChatOut])
def list_chats(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    repo: ChatRepository = Depends(get_chat_repo),
) -> list[ChatOut]:
    return repo.list_chats(limit=limit, offset=offset)


@router.get("/chat/{chat_id}", summary="Get a chat by ID", response_model=ChatDetail)
def get_chat(
    chat_id: UUID, repo: ChatRepository = Depends(get_chat_repo)
) -> ChatDetail:
    chat = repo.get_chat(chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    return chat
