# Contributing to Docstral

Contributions are welcome! Whether you want to report a bug, suggest a feature, or submit a pull request, feel free to open an issue or PR.

## Commit Convention

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification as much as possible. Here are some common prefixes to use:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance tasks

## Getting Started

Everything runs via Docker Compose. To launch the project locally:

1. Copy `.env.example` to `.env` and review all environment variables carefully
2. Ensure all required values are set (Mistral API key, database credentials, etc.)
3. Run `docker compose up`

## Testing & CI

Automated tests, linting, and CI pipelines will be added in future iterations. For now, manual testing is expected.

## Roadmap Context

This project currently uses direct API calls to Mistral. The architecture will evolve toward self‑hosted models via vLLM. See [ROADMAP.md](./ROADMAP.md) for details.

## Questions or Access Requests

- Open an issue on GitHub
- Reach out directly: [LinkedIn](https://www.linkedin.com/in/tanguy-pauvret) or [GitHub](https://github.com/Bima42)