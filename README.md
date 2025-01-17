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

2. **Install Dependencies**
   ```bash
   yarn install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Update the following variables in your .env file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Database Setup**
   - Create a new Supabase project
   - The database schema will be automatically created when you run the application for the first time
   - You can manually run migrations using:
     ```bash
     yarn migrate
     ```

5. **Development Workflow**
   ```bash
   # Start the development server
   yarn dev

   # Run tests
   yarn test

   # Run tests in watch mode
   yarn test:watch

   # Type checking
   yarn type-check

   # Linting
   yarn lint
   ```

## Project Structure
```
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # Shared UI components
│   │   ├── layouts/   # Layout components
│   │   └── forms/     # Form components
│   ├── lib/           # Library code, utilities
│   │   ├── database.ts    # Database service
│   │   ├── auth.ts       # Authentication utilities
│   │   └── api.ts        # API utilities
│   ├── types/         # TypeScript type definitions
│   │   ├── database.types.ts
│   │   └── api.types.ts
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Next.js pages
│   │   ├── api/       # API routes
│   │   └── auth/      # Auth related pages
│   ├── styles/        # CSS/SCSS styles
│   └── __tests__/     # Test files
├── public/            # Static files
├── scripts/           # Build/deploy scripts
└── docs/              # Documentation
```

## Database Schema

The application uses Supabase as the database with the following main tables:

### Users
- Stores user information and preferences
- Integrated with Supabase Auth
- Contains roles and permissions

### Cases
- Legal case information
- Linked to users and documents
- Tracks case status and history

### Documents
- Legal document storage
- Vector embeddings for AI analysis
- Version control and metadata

### Conversations
- AI interaction history
- Context tracking
- Linked to cases and documents

## Testing

The project uses Jest for testing. Test files are located in `src/__tests__/`.

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

### Test Structure
- Unit tests for utilities and hooks
- Integration tests for API endpoints
- Component tests using React Testing Library

## Docker Setup

```bash
# Build and run using Docker Compose
docker-compose up --build
```

## Security Considerations

1. **Authentication**
   - Supabase JWT-based authentication
   - Role-based access control
   - Secure session management

2. **Data Protection**
   - Row Level Security (RLS) policies
   - Encrypted data storage
   - Secure file handling

3. **API Security**
   - Rate limiting
   - Request validation
   - CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team.
