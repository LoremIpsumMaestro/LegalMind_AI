# LegalMind AI

## 🚀 Project Overview
Your intelligent, secure, and confidential legal assistant. LegalMind AI helps legal professionals analyze documents, answer questions, and streamline their workflow using advanced AI technology.

## 🌟 Features

- Document Management
  - Upload and manage legal documents
  - Automatic document analysis and summarization
  - Document version control
  - Secure storage and encryption

- AI-Powered Analysis
  - Legal document understanding
  - Contract analysis and risk assessment
  - Legal research assistance
  - Question answering based on provided documents

- Real-time Communication
  - Interactive chat with AI assistant
  - Document-specific discussions
  - Typing indicators and presence awareness

## 🛠 Technical Stack

- Backend:
  - FastAPI (Python web framework)
  - WebSocket support for real-time features
  - PostgreSQL database
  - Redis for caching and rate limiting
  - Mistral AI integration

- Security:
  - JWT authentication
  - Role-based access control
  - Data encryption
  - Input validation and sanitization

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- Node.js 16+ (for frontend)

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/LoremIpsumMaestro/LegalMind_AI.git
   cd LegalMind_AI
   ```

2. Set up the Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```bash
   alembic upgrade head
   ```

5. Start the development server:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

The API will be available at `http://localhost:8000`. Access the interactive API documentation at `http://localhost:8000/docs`.

## 📝 API Documentation

### Document Operations

- `POST /api/v1/documents/`: Upload a new document
- `GET /api/v1/documents/`: List all documents
- `GET /api/v1/documents/{document_id}`: Get document details
- `PUT /api/v1/documents/{document_id}`: Update document metadata
- `DELETE /api/v1/documents/{document_id}`: Delete a document
- `POST /api/v1/documents/{document_id}/analyze`: Analyze document content

### Chat Operations

- `WebSocket /api/v1/chat/ws/{client_id}`: Real-time chat connection
- `GET /api/v1/chat/history/{conversation_id}`: Get chat history
- `DELETE /api/v1/chat/history/{conversation_id}`: Delete chat history

### Authentication

- `POST /api/v1/auth/register`: Register new user
- `POST /api/v1/auth/login`: Login and get access token
- `POST /api/v1/auth/refresh`: Refresh access token
- `POST /api/v1/auth/logout`: Logout and invalidate token

## 🔒 Security Considerations

1. Authentication:
   - JWT-based authentication
   - Token expiration and refresh mechanisms
   - Secure password hashing using bcrypt

2. Authorization:
   - Role-based access control
   - Document-level permissions
   - API rate limiting

3. Data Protection:
   - Encryption at rest for sensitive data
   - Secure file storage
   - Input validation and sanitization
   - CORS configuration

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=backend

# Run specific test file
pytest tests/test_documents.py
```

## 🔄 WebSocket Events

### Client to Server:
```javascript
// Chat message
{
  "type": "chat_message",
  "content": "What are the key terms in this contract?"
}

// Document analysis request
{
  "type": "document_analysis",
  "document_id": "uuid-here"
}

// Typing indicator
{
  "type": "typing",
  "is_typing": true
}
```

### Server to Client:
```javascript
// Chat response
{
  "type": "chat_response",
  "content": "Based on my analysis..."
}

// Analysis response
{
  "type": "analysis_response",
  "content": {
    "summary": "...",
    "key_points": ["..."],
    "risks": ["..."]
  }
}

// Typing status
{
  "type": "typing_status",
  "typing_users": ["user1", "user2"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and queries:
- Email: support@legalmind.ai
- Documentation: https://docs.legalmind.ai
- Issue Tracker: GitHub Issues