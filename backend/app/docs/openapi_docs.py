from fastapi.openapi.utils import get_openapi
from typing import Dict

def custom_openapi() -> Dict:
    """
    Customize OpenAPI documentation
    """
    
    openapi_schema = {
        "openapi": "3.0.2",
        "info": {
            "title": "LegalMind AI API",
            "description": """
            # LegalMind AI REST API Documentation
            
            This API provides endpoints for document management and real-time communication
            with the LegalMind AI assistant.
            
            ## Authentication
            All endpoints require authentication using a JWT token. Include the token
            in the Authorization header as: `Bearer <token>`.
            
            ## WebSocket Connections
            Real-time communication is handled through WebSocket connections. Connect
            to `/api/v1/chat/ws/{client_id}` with a valid token to establish a connection.
            
            ## Rate Limiting
            API requests are rate-limited to:
            - 100 requests per minute for REST endpoints
            - 60 messages per minute for WebSocket connections
            """,
            "version": "1.0.0",
            "contact": {
                "name": "LegalMind AI Support",
                "email": "support@legalmind.ai"
            },
            "license": {
                "name": "Proprietary",
                "url": "https://legalmind.ai/terms"
            }
        },
        "tags": [
            {
                "name": "documents",
                "description": "Operations related to legal document management"
            },
            {
                "name": "chat",
                "description": "Real-time communication with the AI assistant"
            },
            {
                "name": "auth",
                "description": "Authentication and authorization operations"
            }
        ],
        "components": {
            "schemas": {
                "Error": {
                    "type": "object",
                    "properties": {
                        "code": {"type": "string"},
                        "message": {"type": "string"}
                    }
                }
            },
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            },
            "examples": {
                "DocumentCreate": {
                    "value": {
                        "title": "Employment Contract",
                        "document_type": "contract",
                        "description": "Standard employment agreement"
                    }
                },
                "DocumentResponse": {
                    "value": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "title": "Employment Contract",
                        "document_type": "contract",
                        "description": "Standard employment agreement",
                        "created_at": "2025-01-28T09:00:00Z",
                        "updated_at": "2025-01-28T09:00:00Z",
                        "status": "processed",
                        "file_path": "/documents/123e4567-e89b-12d3-a456-426614174000.pdf"
                    }
                }
            }
        },
        "security": [{"bearerAuth": []}]
    }
    
    return openapi_schema

