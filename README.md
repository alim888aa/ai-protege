# AI Protégé

Learn by teaching an AI student that asks questions and fact-checks you.

**Live demo:** [ai-protege.xyz](https://ai-protege.xyz)

## What is this?

AI Protégé implements the Feynman Technique—the idea that if you can't explain something simply, you don't really understand it. Instead of passively consuming content, you actively teach an AI that acts like a curious 12-year-old student.

Think of it as rubber duck debugging, but for learning anything.

## How it works

1. **Provide source material** - Drop in a URL or PDF
2. **Extract concepts** - The app identifies key concepts to learn
3. **Teach each concept** - Draw diagrams on a canvas and write explanations
4. **Get challenged** - The AI asks questions and uses RAG to fact-check you against the source
5. **See the summary** - The AI summarizes what it learned from your teaching

The AI combines three inputs: your canvas drawing (vision), your text explanation, and relevant chunks from your source material (RAG). This ensures it can challenge both clarity and accuracy.

## Tech Stack

- **Next.js 15** - App Router
- **Convex** - Real-time database + vector search for RAG
- **Excalidraw** - Canvas for drawing diagrams
- **OpenAI** - GPT for dialogue, embeddings for RAG
- **Clerk** - Authentication
- **Vercel** - Deployment

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Convex account
- OpenAI API key
- Clerk account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-protege.git
cd ai-protege
```

2. Install dependencies
pnpm install

3.Set up environment variables
cp .env.example .env.local
- Fill in your API keys:
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=

4. Start Convex
npx convex dev

5. Start the development server
pnpm dev

6. Open http://localhost:3000

Project Structure
├── src/app/                 # Next.js App Router pages
│   ├── dashboard/           # Session management
│   ├── teach/               # Teaching interface
│   ├── review/              # Concept review
│   ├── complete/            # Session completion
│   └── actions/             # Server actions for AI
├── convex/                  # Convex backend
│   ├── actions/             # Scraping, RAG, PDF processing
│   ├── utils/               # Chunking, similarity, jargon
│   └── schema.ts            # Database schema
└── .kiro/specs/             # Kiro spec documents
Built with Kiro
This project was built using Kiro's spec-driven development. The .kiro/specs/ folder contains the requirements, design docs, and implementation tasks that guided development.
