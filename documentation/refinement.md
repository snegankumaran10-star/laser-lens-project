Continue the existing Lease Lens project. The foundation already exists. Inspect the current files before editing and preserve the existing working setup.

NON-NEGOTIABLE CONSTRAINTS
- No paid API keys or paid services.
- Do not call Anthropic, OpenAI or any cloud AI API.
- Do not implement the AI clause analysis yet.
- Keep React + Vite + Tailwind CSS on the frontend and Node.js + Express on the backend.
- Keep the frontend on port 5180 and backend on port 4000.
- Use the existing PDF extraction dependency if it works; otherwise inspect its installed version and use its correct API.

TASK 1: PDF UPLOAD
- Implement POST /api/extract in the Express backend.
- Accept exactly one PDF file using multipart/form-data.
- Validate the MIME type and PDF signature. Do not trust the filename or MIME type alone.
- Set a reasonable upload size limit of 5 MB.
- Extract text in memory. Do not write uploaded documents to disk or log document contents.
- Reject invalid PDFs with HTTP 400 and a clear JSON error.
- Reject password-protected, unreadable or image-only PDFs with a clear message explaining that only text-based PDFs are supported.
- Do not return extracted text when extraction fails.

TASK 2: KEY TERM EXTRACTION
- Initially use transparent JavaScript rules to identify possible monthly rent, security deposit, lock-in period and notice period from the extracted text.
- Treat results as candidate values, not verified legal conclusions.
- If a term cannot be confidently found, return null rather than inventing a value.
- Return extracted text and candidate terms for the local development screen only. Do not persist them.
- Never label this rule-based stage as AI analysis.

TASK 3: FRONTEND
- Add a PDF upload control and an Analyse Document button.
- Display loading, success and error states.
- Show the candidate key terms and extracted text for development verification.
- Display this disclaimer: "For informational purposes only. This tool does not provide legal advice."
- Ensure the page works on a narrow mobile viewport.
- Keep API requests routed through the existing Vite proxy.

TASK 4: TESTING
- Add or run checks for a valid text-based PDF, a non-PDF upload, a file over the limit, an empty/unreadable PDF and an image-only PDF.
- Use synthetic test documents, not real rental agreements containing personal data.
- Run the frontend production build and test the backend endpoint.
- Report which tests were actually executed and their results. Do not claim tests passed without running them.

TASK 5: KEEP THE PROJECT CLEAN
- Do not add a database, login, OCR, payment features or deployment configuration at this stage.
- Do not overwrite unrelated files.
- List all changed files, commands executed, test results and remaining limitations.

Stop after completing this stage and wait for review.