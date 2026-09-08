# Sharp AI

An AI-assisted content studio MVP for turning one idea into multiple content formats such as blog posts, social posts, and email.

## Overview

Sharp AI demonstrates frontend UI work, a Node/Express backend, provider API integration, and simple development-time usage tracking. It is presented as an MVP rather than a production-scale SaaS platform.

## Current scope

- Multi-format content generation workflow
- Responsive frontend interface
- Node/Express backend
- Provider/API request proxying
- Simple local usage/subscription logic
- Local development usage tracking

The current repository uses a small on-disk `mock_db.json` for local development.

## Requirements

- Node.js
- npm

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/davidifeanyicelestine586-arch/sharp-ai.git
cd sharp-ai
npm ci
```

Copy the example environment file and configure the provider values required by the current implementation:

```bash
cp .env.example .env
```

Never commit `.env` or API credentials.

## Usage

Start the development server:

```bash
npm run dev
```

The server defaults to port `3000`.

For a production-style local run:

```bash
npm run start
```

## Development scripts

- `npm run dev` — start the development server
- `npm run start` — start the server
- `npm run lint` — run ESLint

There is currently no `npm test` script in `package.json`, so a test command is not advertised here.

## Configuration

Provider/API configuration is supplied through local environment variables using `.env`. The exact required variables should be taken from `.env.example` and the current server implementation.

## Testing

Automated tests are not currently exposed as an npm script. Use `npm run lint` for the available static-quality check and verify the main generation flow manually when making UI or integration changes.

## Evidence

- **Repository / download:** https://github.com/davidifeanyicelestine586-arch/sharp-ai
- **Live project:** https://sharp-ai-murex.vercel.app
- **Documentation:** https://github.com/davidifeanyicelestine586-arch/sharp-ai/blob/main/README.md

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).

## Support

For questions, bug reports, or project discussion, use the repository [issue tracker](https://github.com/davidifeanyicelestine586-arch/sharp-ai/issues).

## Security

Do not commit API keys, credentials, `.env` files, or other secrets. Provider credentials belong in environment configuration and must remain server-side.
