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

Imports now open an editable review before saving questions. The analyzer detects numbered prompts, Q/A pairs, multiple-choice options, answer keys, definitions, and individual formulas, while filtering common instructions, name/date fields, and page numbers. Choose Auto, Test/quiz, Formula sheet, or Notes mode. Unrecognized or answerless items require an answer or must be excluded. CSV and JSON questions also go through review.

Recognized formulas generate recall and worked application questions. Built-in worked examples cover Newton’s second law, Ohm’s law, momentum, weight, kinetic energy, density, and circle area. Other equations generate source-based recall prompts and a symbol/usage prompt requiring a user-supplied answer. This is deterministic recognition, not AI reasoning. Complex equations, multi-column PDFs, handwriting, and OCR symbol errors still require correction. It does not infer arbitrary test answers.

Existing libraries are preserved. Open a material’s Generate review to optionally replace its older automatically generated questions, or delete individual questions in the bank. Export a backup before replacing older questions if you want to retain their recall history.

Quizzes and flashcards reuse the reviewed bank; recall is self-rated. An AI integration remains future work. Never put an API key in browser code.

## Hosting

For Vercel, import `ciciofthe50/Operation-Lock-In` with the repository root as Root Directory. The included `vercel.json` selects the static app in `dist/` and runs the core checks before deployment. No environment variables or dependencies are required. Link the GitHub repository to deploy future pushes automatically. Configure Vercel Deployment Protection if owner-only access is desired; the private Sites access policy does not carry over to Vercel.

Export a backup from your existing study app before switching to the Vercel URL, then restore it there. Browser storage is separate for each domain.

`.openai/hosting.json` identifies the private Sites deployment. The GitHub source repository is maintained independently from the Sites deployment repository.
