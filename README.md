# Lease Lens

Lease Lens is a foundation for an AI-powered rental agreement reviewer. This milestone focuses on project setup, proxy configuration, and a minimal working frontend/backend skeleton without implementing the PDF upload or AI review flow yet.

## Tech stack

- Frontend: React 19 + Vite + Tailwind CSS v4 + JavaScript
- Backend: Node.js 20+ + Express 5 + ES modules
- AI: Anthropic Claude via the backend only
- Validation: Zod
- PDF parsing: pdf-parse v2

## Quick start

1. Install dependencies at the root and within the app folders:
   - npm install
   - npm --prefix client install
   - npm --prefix server install
2. Start the full stack:
   - npm run dev
3. Or run them separately:
   - npm run client
   - npm run server

## Default ports

- Frontend: http://localhost:5180
- Backend: http://localhost:4000

The frontend uses a Vite proxy so requests to /api are forwarded to the backend.

## Notes

- The current branch is intentionally limited to the base foundation.
- The PDF upload and AI clause analysis will be added in the next implementation stage.
- No real API keys are committed. Use server/.env.example as a template.
