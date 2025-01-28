# LegalMind AI

An AI-powered legal assistant interface that helps legal professionals manage documents and get instant answers to legal queries.

## Features

- 💬 Interactive chat interface for legal queries
- 📄 Document management system with search and organization
- 🔍 Smart document analysis and summarization
- 🛡️ Secure document handling
- 🌙 Dark mode support
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js (placeholder for actual backend implementation)
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives with shadcn/ui

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/LoremIpsumMaestro/LegalMind_AI.git
cd LegalMind_AI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
LegalMind_AI/
├── src/
│   ├── components/    # React components
│   │   ├── ui/       # shadcn/ui components
│   │   └── ...       # Feature components
│   ├── lib/          # Utilities and helpers
│   ├── styles/       # Global styles and theme
│   └── types/        # TypeScript types
├── pages/            # Next.js pages
│   ├── api/          # API routes
│   └── ...           # Page components
├── public/           # Static assets
└── tests/            # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## UI Components

### Chat Interface
The chat interface provides:
- Real-time message updates
- File attachment support
- Message history
- Loading states
- Error handling

### Document Dashboard
The document management dashboard includes:
- Document upload with drag & drop
- Search and filtering
- Document preview
- Quick actions (view, delete)
- File type support (PDF, DOCX, TXT)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Next.js](https://nextjs.org/) for the React framework

## TODO

- [ ] Implement authentication system
- [ ] Add document version control
- [ ] Integrate with actual AI backend
- [ ] Add document collaboration features
- [ ] Implement real-time updates
