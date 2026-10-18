# Lease Lens project decisions

## Scope for this stage

This milestone establishes the project foundation only. It includes the React frontend, Express backend, health endpoint, Vite proxy, environment config, and lightweight docs. It deliberately does not implement PDF parsing, upload flows, or AI clause analysis.

## Implementation plan

1. Confirm the workspace is empty and keep the existing requirement file intact.
2. Initialize the React 19/Vite client with a JavaScript setup and configure Tailwind v4.
3. Create the Express 5 backend with ES modules and a healthy /api/health route.
4. Add root-level scripts and environment templates for local development.
5. Validate the frontend build and backend startup before moving to the next milestone.

## Alternatives considered

- Monorepo with a single package.json: rejected because the team required separate frontend/backend runtime boundaries and straightforward local startup.
- TypeScript: rejected to align with the explicit JavaScript requirement and keep the initial setup fast.
- Full-stack framework (Next.js/Nest): rejected because the project requires a lightweight Vite + Express stack and a short 4-hour delivery window.
- AI logic on the frontend: rejected because the stack explicitly requires Anthropic calls from the backend only.

## Reasons and trade-offs

- Separating client and server keeps the project simple and deployable within the deadline.
- Tailwind v4 reduces setup friction while meeting the required stack.
- A minimal health route and static app shell give a working foundation without overbuilding.
- The trade-off is intentionally limited functionality, with PDF upload and analysis deferred until the next phase.

## Revisit conditions

- Revisit the project structure if the PDF and AI pipeline grows beyond a simple single-file flow.
- Revisit environment handling if multi-developer setup or deployment config requires a more formal process.
- Revisit dependency choices if the app needs more robust parsing, validation, or error handling.
