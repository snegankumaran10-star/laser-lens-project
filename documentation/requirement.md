We are building **Lease Lens**, an AI-powered rental agreement reviewer. We have a strict 4-hour deadline for a working, tested submission.

Act as a senior engineer. For this first task, ONLY inspect the workspace and establish the project plan and foundation. Do not implement application features yet.

TECH STACK
- Frontend: React 19, Vite, Tailwind CSS v4, JavaScript (no TypeScript).
- Backend: Node.js 20+, Express 5, ES modules.
- AI: Anthropic Claude using @anthropic-ai/sdk, called exclusively from the backend.
- Validation: Zod.
- PDF extraction: pdf-parse v2.
- Frontend port: 5180, strictPort enabled.
- Backend port: 4000.
- Frontend API proxy: /api to http://localhost:4000.

PRODUCT SCOPE
- Accept one text-based rental agreement PDF.
- Extract monthly rent, security deposit, lock-in period and notice period when explicitly present.
- Flag at most 8 potentially risky clauses, ranked by severity.
- Each flag must contain the exact source quotation, a plain-English explanation and a question to ask the landlord.
- Remove any flag whose quotation cannot be verified against the source text.
- Display a clear legal disclaimer.
- Do not provide legal advice or declare a clause illegal.
- No login, database, saved agreements, saved results, scanned-PDF OCR or Tamil output in version one.

TASKS
1. Inspect the current directory and report existing files before making changes. Do not overwrite existing work or expose secrets.
2. Create a concise implementation plan and a decisions.md file. Include scope, alternatives considered, reasons, trade-offs and revisit conditions.
3. Create or initialise the client/ and server/ folders using the specified stack. If the workspace already contains a project, preserve it and adapt rather than reinitialising it.
4. Configure the Vite proxy, basic React screen, Express server and GET /api/health endpoint.
5. Create a root README.md and .gitignore. Ensure .env, node_modules and dist are ignored. Create server/.env.example with empty placeholders for ANTHROPIC_API_KEY and sensible configuration defaults. Never create, print or commit a real API key.
6. Add useful npm scripts for running both applications. Keep the setup simple and explain how to start each process.
7. Do not implement the PDF upload or AI analysis yet.
8. Run available checks and show the actual results. Do not claim a command succeeded unless you ran it.

TIME CONSTRAINT
Keep this step within approximately 20 minutes. Prefer a small, working foundation over unnecessary abstractions.

At the end, report:
- Files created or changed.
- Dependencies installed.
- Commands actually tested and their results.
- Any errors or manual actions still required.
- The exact next implementation step.

Wait for my review before proceeding to the next stage.