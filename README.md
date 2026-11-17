# Lock In — Personal Study Studio

A browser-based personal study app with custom subjects, document imports, a question bank, practice quizzes, flashcards, recall tracking, and JSON backup/restore.

## Run

Serve `dist/` with any static web server. No build or npm installation required. Run `node check.cjs` for core logic checks and `node --check dist/app.js` for syntax validation.

## Imports

- PDF selectable text and scanned pages (English OCR fallback)
- Word `.docx` (convert legacy `.doc` first)
- PNG, JPG, and WEBP photos (English OCR)
- TXT notes or `Q: question` / `A: answer` pairs
- CSV with `question,answer` headers
- JSON array of `{ "question": "...", "answer": "..." }`

Extracted text can be corrected before importing. PDF.js, Mammoth and Tesseract download from public CDNs; processing runs in the browser. OCR accuracy depends on scan quality, language and layout. Handwriting is not reliably supported.

## Storage and generation

Library and progress use localStorage on the current browser/origin. Export backups before clearing browser data, switching browsers, or moving between preview and the hosted URL. Uploaded files and personal study data are not committed to Git.

Question generation currently uses sentence-based fill-in-the-blank extraction, not AI. Quizzes and flashcards reuse the saved question bank; recall is self-rated. AI-written exam questions, multiple-choice distractors and explanations require a future server integration with a securely stored AI credential. Never put an API key in browser code.

## Hosting

`.openai/hosting.json` identifies the private Sites deployment. The GitHub source repository is maintained independently from the Sites deployment repository.
