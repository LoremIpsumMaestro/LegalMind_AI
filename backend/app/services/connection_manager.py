from fastapi import WebSocket
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.typing_users: Set[str] = set()
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total active connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            if client_id in self.typing_users:
                self.typing_users.remove(client_id)
        logger.info(f"Client {client_id} disconnected. Total active connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
    
    async def broadcast_message(self, message: str):
        """
        Broadcast a message to all connected clients
        """
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(json.dumps({
                    "type": "broadcast",
                    "content": message
                }))
            except Exception as e:
                logger.error(f"Error broadcasting to client {client_id}: {str(e)}")
                # Consider removing the failed connection
                await self.handle_failed_connection(client_id)
    
    async def broadcast_typing(self, client_id: str, is_typing: bool):
        """
        Broadcast typing status to all clients except the sender
        """
        if is_typing:
            self.typing_users.add(client_id)
        else:
            self.typing_users.discard(client_id)
        
        typing_message = {
            "type": "typing_status",
            "typing_users": list(self.typing_users)
        }
        
        for cid, connection in self.active_connections.items():
            if cid != client_id:  # Don't send back to the sender
                try:
                    await connection.send_text(json.dumps(typing_message))
                except Exception as e:
                    logger.error(f"Error broadcasting typing status to client {cid}: {str(e)}")
                    await self.handle_failed_connection(cid)
    
    async def handle_failed_connection(self, client_id: str):
        """
        Handle cleanup of failed connections
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            if client_id in self.typing_users:
                self.typing_users.remove(client_id)
            logger.info(f"Removed failed connection for client {client_id}")
    
    def get_active_connections_count(self) -> int:
        """
        Get the count of active connections
        """
        return len(self.active_connections)
