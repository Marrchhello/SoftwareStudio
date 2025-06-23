from fastapi import APIRouter, Depends
from typing import Annotated
from Models import ChatListModel, ChatMessageListModel
from auth import UserAuth, get_current_active_user
from Query import getChats, getChatMessages, postChatMessage, createChat
from db_session import engine

router = APIRouter()

@router.get("/chats/", response_model=ChatListModel)
def chat_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return getChats(engine=engine, user=current_user)

@router.get("/chats/{chat_id}/messages/", response_model=ChatMessageListModel)
def chat_messages_get(
    chat_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return getChatMessages(engine=engine, chat_id=chat_id, user=current_user)

@router.post("/chats/{chat_id}/messages/")
def chat_message_post(
    chat_id: int,
    message: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return postChatMessage(engine=engine, chat_id=chat_id, message=message, user=current_user)

@router.post("/chats/")
def chat_create(
    user2_role: str,
    user2_role_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    return createChat(engine=engine, user1=current_user, user2_role=user2_role, user2_role_id=user2_role_id) 