from __future__ import annotations

from sqlmodel import Session, select

from api.core.db import engine
from api.core.security import hash_token
from api.models import User, Chat, Message, MessageRole, UserToken


def seed() -> None:
    with Session(engine) as session:
        user = session.exec(select(User).where(User.name == "Demo User")).first()
        if not user:
            user = User(name="Demo User")
            session.add(user)
            session.commit()
            session.refresh(user)

        plain_token = "test"
        hashed = hash_token(plain_token)
        token_row = session.exec(
            select(UserToken).where(UserToken.token == hashed)
        ).first()
        if not token_row:
            token_row = UserToken(user_id=user.id, token=hashed)
            session.add(token_row)
            session.commit()

        chats = session.exec(
            select(Chat).where(Chat.user_id == user.id).order_by(Chat.created_at)
        ).all()
        missing = 3 - len(chats)
        for _ in range(max(0, missing)):
            session.add(Chat(user_id=user.id))
        if missing > 0:
            session.commit()
            chats = session.exec(
                select(Chat).where(Chat.user_id == user.id).order_by(Chat.created_at)
            ).all()

        if chats:
            first_chat = chats[0]
            msgs = session.exec(
                select(Message)
                .where(Message.chat_id == first_chat.id)
                .order_by(Message.created_at)
            ).all()
            if len(msgs) == 0:
                session.add(
                    Message(
                        chat_id=first_chat.id,
                        role=MessageRole.USER,
                        content="Hello there!",
                    )
                )
                session.add(
                    Message(
                        chat_id=first_chat.id,
                        role=MessageRole.ASSISTANT,
                        content="Hi! How can I help you today?",
                    )
                )
            session.commit()

        # Summary
        chats_count = session.exec(select(Chat).where(Chat.user_id == user.id)).all()
        print("Seed complete.")
        print(f"User: {user.name} ({user.id})")
        print(f"Token (use as Bearer): {plain_token}")
        print(f"Number of chats: {len(chats_count)}")


if __name__ == "__main__":
    seed()
