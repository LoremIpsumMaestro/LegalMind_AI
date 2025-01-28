from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
import json
from ..dependencies import get_current_user
from ..services.chat_service import ChatService
from ..services.connection_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

class ChatWebSocket:
    def __init__(self, websocket: WebSocket, user_id: str):
        self.websocket = websocket
        self.user_id = user_id

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    token: str
):
    try:
        # Verify token and get user
        user = await get_current_user(token)
        await manager.connect(websocket, client_id)
        
        chat_service = ChatService()
        
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Process different types of messages
                if message_data["type"] == "chat_message":
                    # Handle regular chat message
                    response = await chat_service.process_message(
                        user_id=user.id,
                        message=message_data["content"]
                    )
                    await manager.send_personal_message(
                        message={"type": "chat_response", "content": response},
                        websocket=websocket
                    )
                
                elif message_data["type"] == "document_analysis":
                    # Handle document analysis request
                    analysis = await chat_service.analyze_document(
                        user_id=user.id,
                        document_id=message_data["document_id"]
                    )
                    await manager.send_personal_message(
                        message={"type": "analysis_response", "content": analysis},
                        websocket=websocket
                    )
                
                elif message_data["type"] == "typing":
                    # Handle typing indicator
                    await manager.broadcast_typing(
                        client_id,
                        message_data["is_typing"]
                    )

        except WebSocketDisconnect:
            manager.disconnect(websocket, client_id)
            await manager.broadcast_message(
                f"Client #{client_id} left the chat"
            )
            
    except Exception as e:
        await websocket.close(code=1008, reason=str(e))

@router.get("/history/{conversation_id}")
async def get_chat_history(
    conversation_id: str,
    current_user = Depends(get_current_user)
):
    """
    Retrieve chat history for a specific conversation
    """
    chat_service = ChatService()
    history = await chat_service.get_conversation_history(
        user_id=current_user.id,
        conversation_id=conversation_id
    )
    return history

@router.delete("/history/{conversation_id}")
async def delete_chat_history(
    conversation_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete chat history for a specific conversation
    """
    chat_service = ChatService()
    success = await chat_service.delete_conversation_history(
        user_id=current_user.id,
        conversation_id=conversation_id
    )
    return {"status": "success" if success else "failed"}
