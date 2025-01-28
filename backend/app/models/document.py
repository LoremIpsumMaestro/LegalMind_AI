from sqlalchemy import Column, String, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import Base, TimestampMixin, SoftDeleteMixin

class DocumentStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    ERROR = "error"

class DocumentType(enum.Enum):
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    LEGAL_OPINION = "legal_opinion"
    COURT_DOCUMENT = "court_document"
    LEGISLATION = "legislation"
    REGULATION = "regulation"
    OTHER = "other"

class Document(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    status = Column(SQLEnum(DocumentStatus), nullable=False, default=DocumentStatus.PENDING)
    
    # File information
    file_path = Column(String, nullable=False)
    file_size = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    
    # Meta information
    metadata = Column(JSON, nullable=True)
    analysis_results = Column(JSON, nullable=True)
    
    # Relations
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="documents")
    conversations = relationship("Conversation", back_populates="document")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.metadata:
            self.metadata = {}
        if not self.analysis_results:
            self.analysis_results = {}

    def update_status(self, status: DocumentStatus):
        """Update document status and track in metadata"""
        self.status = status
        if 'status_history' not in self.metadata:
            self.metadata['status_history'] = []
        self.metadata['status_history'].append({
            'status': status.value,
            'timestamp': str(self.updated_at)
        })

    def add_analysis_result(self, analysis_type: str, result: dict):
        """Add or update analysis result"""
        if not self.analysis_results:
            self.analysis_results = {}
        self.analysis_results[analysis_type] = {
            'result': result,
            'timestamp': str(self.updated_at)
        }

    def get_summary(self) -> dict:
        """Get document summary including latest analysis results"""
        return {
            'id': str(self.id),
            'title': self.title,
            'document_type': self.document_type.value,
            'status': self.status.value,
            'file_type': self.file_type,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'latest_analysis': self.get_latest_analysis()
        }

    def get_latest_analysis(self) -> dict:
        """Get the latest analysis results summary"""
        if not self.analysis_results:
            return None
        
        return {
            analysis_type: data['result'].get('summary')
            for analysis_type, data in self.analysis_results.items()
        }

    def to_dict(self) -> dict:
        """Convert document to dictionary representation"""
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'document_type': self.document_type.value,
            'status': self.status.value,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'metadata': self.metadata,
            'analysis_results': self.analysis_results,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'deleted_at': str(self.deleted_at) if self.deleted_at else None,
        }