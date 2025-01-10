# LegalMind AI: Intelligent Legal Assistant Platform

## Project Overview
LegalMind AI is a sophisticated legal assistance platform designed for modern law practices, combining advanced AI capabilities with robust security features and intuitive user experience.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Yarn package manager
- Docker (optional, for containerized deployment)
- A Supabase account
- Pinecone or Weaviate account for vector storage

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/LoremIpsumMaestro/LegalMind_AI.git
   cd LegalMind_AI
   ```

2. **Set Up Environment Variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   ```
   Update the following variables in your .env file:
   ```env
   # Frontend
   REACT_APP_API_URL=https://api.legalmind.ai
   REACT_APP_WS_URL=wss://ws.legalmind.ai
   REACT_APP_ENCRYPTION_KEY=${ENCRYPTION_KEY}

   # Backend
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=${JWT_SECRET}
   SUPABASE_URL=${SUPABASE_URL}
   SUPABASE_KEY=${SUPABASE_KEY}
   VECTOR_STORE_API_KEY=${VECTOR_STORE_KEY}
   LLAMA2_MODEL_PATH=/opt/models/llama2
   ```

3. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   yarn install

   # Install backend dependencies
   cd ../backend
   yarn install
   ```

4. **Set Up Database**
   - Create a new Supabase project
   - Run the database schema migrations:
     ```bash
     cd backend
     yarn migrate
     ```

5. **Start Development Servers**
   ```bash
   # Start backend server
   cd backend
   yarn dev

   # In a new terminal, start frontend server
   cd frontend
   yarn dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Docker Setup (Alternative)
```bash
# Build and run using Docker Compose
docker-compose up --build
```

[Rest of the existing README content...]