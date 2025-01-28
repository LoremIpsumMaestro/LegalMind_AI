from sqlalchemy import Column, String, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import Base, TimestampMixin, SoftDeleteMixin
from passlib.hash import bcrypt

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"

class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.USER)
    
    # Profile information
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    position = Column(String, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Preferences and settings
    preferences = Column(JSON, nullable=True)
    
    # Relations
    documents = relationship("Document", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")

    def __init__(self, **kwargs):
        # Remove password from kwargs and hash it
        password = kwargs.pop('password', None)
        super().__init__(**kwargs)
        if password:
            self.set_password(password)
        if not self.preferences:
            self.preferences = self.get_default_preferences()

    def set_password(self, password: str):
        """Hash and set the user's password"""
        self.password_hash = bcrypt.hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify a password against the hash"""
        return bcrypt.verify(password, self.password_hash)

    def get_full_name(self) -> str:
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

    @staticmethod
    def get_default_preferences() -> dict:
        """Get default user preferences"""
        return {
            'theme': 'light',
            'language': 'en',
            'notifications': {
                'email': True,
                'web': True
            },
            'document_view': 'list',
            'analysis_preferences': {
                'auto_analyze': True,
                'summarize_length': 'medium'
            }
        }

    def update_preferences(self, new_preferences: dict):
        """Update user preferences"""
        if not self.preferences:
            self.preferences = self.get_default_preferences()
        self.preferences.update(new_preferences)

    def to_dict(self, include_private: bool = False) -> dict:
        """Convert user to dictionary representation"""
        data = {
            'id': str(self.id),
            'email': self.email,
            'role': self.role.value,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'company': self.company,
            'position': self.position,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }
        
        if include_private:
            data.update({
                'preferences': self.preferences,
                'deleted_at': str(self.deleted_at) if self.deleted_at else None
            })
        
        return data

    def has_permission(self, action: str, resource: any) -> bool:
        """Check if user has permission for an action on a resource"""
        if not self.is_active:
            return False
            
        if self.role == UserRole.ADMIN:
            return True
            
        if isinstance(resource, Document):
            if action in ['read', 'update', 'delete']:
                return resource.user_id == self.id
            if action == 'create':
                return True
                
        if isinstance(resource, Conversation):
            if action in ['read', 'update', 'delete']:
                return resource.user_id == self.id
            if action == 'create':
                return True
                
        return False