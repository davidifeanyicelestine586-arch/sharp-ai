# Sharp AI

Sharp AI is an AI-powered Content Studio MVP focused on transforming one idea into multiple content formats, including blog posts, social posts, and email. The repository contains a frontend built with HTML/CSS/JavaScript and a small Node/Express backend that proxies provider requests and handles simple usage/subscription logic.

## Portfolio context

This is a project in David Ifeanyi's software/web development portfolio. It demonstrates work across application UI, backend integration, API handling, deployment, and debugging. It is presented as an MVP/project rather than as a production-scale SaaS platform.

## Current scope

- Multi-format content generation workflow
- Frontend interface and responsive UI work
- Node/Express backend
- Provider/API request proxying
- Simple local usage/subscription logic
- Local mock database for development usage tracking

The current repository uses a small on-disk `mock_db.json` for local development. A production database would require a separate persistence implementation.

## Quick start

1. Install dependencies:

```bash
npm ci
```

2. Copy `.env.example` to `.env` and configure the required provider variables.

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The server defaults to port 3000.

## Development scripts

- `npm run dev` — start the development server
- `npm run start` — start the server in production mode
- `npm run lint` — run the linter
- `npm test` — run tests

## Security

Do not commit API keys, credentials, `.env` files, or other secrets. Provider credentials belong in environment configuration and must remain server-side.

## Project status

**Status:** Portfolio project / MVP.

The repository should be evaluated from its current implementation rather than from planned production capabilities.

## Evidence

- Repository source code: GitHub
- Live project: https://sharp-ai-murex.vercel.app
