from sqlalchemy import Column, String, ForeignKey, JSON, Enum as SQLEnum, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import Base, TimestampMixin, SoftDeleteMixin
from datetime import datetime

class MessageType(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    DOCUMENT_ANALYSIS = "document_analysis"

class ConversationType(enum.Enum):
    GENERAL = "general"
    DOCUMENT_SPECIFIC = "document_specific"
    LEGAL_RESEARCH = "legal_research"

class Conversation(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    conversation_type = Column(SQLEnum(ConversationType), nullable=False)
    
    # Metadata
    metadata = Column(JSON, nullable=True)
    summary = Column(String, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    
    # Relations
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="conversations")
    
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    document = relationship("Document", back_populates="conversations")
    
    messages = relationship("Message", back_populates="conversation",
                          order_by="Message.timestamp",
                          cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.metadata:
            self.metadata = {}
        if not self.tags:
            self.tags = []

    def add_message(self, content: str, message_type: MessageType, metadata: dict = None) -> "Message":
        """Add a new message to the conversation"""
        message = Message(
            conversation_id=self.id,
            content=content,
            message_type=message_type,
            metadata=metadata or {}
        )
        self.messages.append(message)
        return message

    def update_summary(self):
        """Update conversation summary based on messages"""
        if not self.messages:
            self.summary = None
            return

        # Get last few messages for summary
        recent_messages = self.messages[-3:]
        summary_text = " | ".join([
            f"{msg.message_type.value}: {msg.content[:50]}..."
            for msg in recent_messages
        ])
        
        self.summary = summary_text

    def get_context_window(self, limit: int = 10) -> list:
        """Get recent messages for context window"""
        return self.messages[-limit:] if self.messages else []

    def to_dict(self, include_messages: bool = True) -> dict:
        """Convert conversation to dictionary representation"""
        data = {
            'id': str(self.id),
            'title': self.title,
            'conversation_type': self.conversation_type.value,
            'metadata': self.metadata,
            'summary': self.summary,
            'tags': self.tags,
            'user_id': str(self.user_id),
            'document_id': str(self.document_id) if self.document_id else None,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'deleted_at': str(self.deleted_at) if self.deleted_at else None
        }
        
        if include_messages:
            data['messages'] = [msg.to_dict() for msg in self.messages]
        
        return data

class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    content = Column(String, nullable=False)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    metadata = Column(JSON, nullable=True)
    timestamp = Column(String, nullable=False, default=lambda: datetime.utcnow().isoformat())

    # Relations
    conversation = relationship("Conversation", back_populates="messages")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.metadata:
            self.metadata = {}

    def to_dict(self) -> dict:
        """Convert message to dictionary representation"""
        return {
            'id': str(self.id),
            'conversation_id': str(self.conversation_id),
            'content': self.content,
            'message_type': self.message_type.value,
            'metadata': self.metadata,
            'timestamp': self.timestamp,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }