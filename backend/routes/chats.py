from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from Models import ChatListModel, ChatMessageListModel
from auth import UserAuth, get_current_active_user
from Query import getChats, getChatMessages, postChatMessage, createChat, getUserId, TestUserChat
from db_session import engine

router = APIRouter()

# Get Chats
@router.get("/chats/", response_model=ChatListModel)
def chat_get(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    user_id = getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role)
    return getChats(engine=engine, user_id=user_id)


# Get Chat Messages
@router.get("/chats/{chat_id}/messages/", response_model=ChatMessageListModel)
def chat_messages_get(
    chat_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    user_id = getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role)
    if not TestUserChat(engine=engine, user_id=user_id, chat_id=chat_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    chat_messages = getChatMessages(engine=engine, chat_id=chat_id)
    if chat_messages.ChatMessageList:
        return chat_messages
    raise HTTPException(status_code=404, detail="No messages found for this chat")


# Create Chat (returns chat id)
@router.post("/chats/")
def chat_create(
    user2_role: str,
    user2_role_id: int,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    user1_id = getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role)
    user2_id = getUserId(engine=engine, role_id=user2_role_id, role=user2_role)
    return createChat(engine=engine, user1_id=user1_id, user2_id=user2_id)


# Post Chat Message
@router.post("/chats/{chat_id}/messages/")
def chat_message_post(
    chat_id: int,
    message: str,
    current_user: Annotated[UserAuth, Depends(get_current_active_user)]
):
    sender_id = getUserId(engine=engine, role_id=current_user.role_id, role=current_user.role)
    if not TestUserChat(engine=engine, user_id=sender_id, chat_id=chat_id):
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    return postChatMessage(engine=engine, chat_id=chat_id, sender_id=sender_id, message=message)