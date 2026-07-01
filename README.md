# Sharp AI

Sharp AI is an AI-powered Content Studio MVP focused on transforming a single idea into multiple content formats (blog, social posts, email). This repository contains the frontend (static HTML/CSS/JS) and a small Node/Express backend used to proxy OpenAI requests and manage simple usage/subscription logic.

Quick start

1. Clone:

   git clone https://github.com/davidifeanyicelestine586-arch/sharp-ai.git
   cd sharp-ai

2. Install dependencies:

   npm ci

3. Create environment variables:

   - Copy `.env.example` to `.env` and fill in provider keys.

   cp .env.example .env
   # then edit .env

4. Run the app (development):

   npm run dev

   - Server defaults to port 3000. Visit http://localhost:3000

Notes

- Do NOT commit secrets. `.env` is ignored by .gitignore.
- The repository currently contains a small on-disk mock DB at `mock_db.json` for local dev usage tracking. Consider switching to SQLite, Supabase, or another database for production.

Required environment variables (see `.env.example`):

- OPENAI_API_KEY — server-side API key for the OpenAI-compatible provider
- PORT — optional (defaults to 3000)
- ALLOWED_ORIGINS — optional comma-separated origins for CORS

Development scripts

- npm run dev — start the server with `node server.js`
- npm run start — start production server (`node server.js`)
- npm run lint — run linter (added later)
- npm test — run tests (added later)

Security & deployment

- The repo should not include `node_modules/`. If you see `node_modules` tracked, remove it with `git rm -r --cached node_modules` then commit.
- Configure environment variables in your hosting provider (Vercel, Netlify, etc.) and do not commit them.

How to contribute

- Follow the code style and keep changes modular. Open an issue or PR for larger changes.

Contact

- Project founder: David
