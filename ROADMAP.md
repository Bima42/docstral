# DocStral – Roadmap

## Vision
Build a small but exemplary chat experience on top of Mistral models: clean, reproducible, documented, and easy to run. Start with a focused MVP, then open‑source a “showable” version, and iterate toward a self‑hosted GPU setup.

## Guiding principles
- Ship small, useful increments; keep scope tight.
- Prefer clarity and reproducibility over cleverness.
- Measure what matters (latency, tokens, errors, cost if API).
- Be transparent: citations, limits, and trade‑offs are explicit.
- Keep the codebase approachable: simple architecture, clear docs, tests.

## Milestones

### V0 – Private MVP (pre open‑source)
Goal: have a working skeleton and prove the flow end‑to‑end.

![mvp_architecture.png](docs/mvp_architecture.png)

#### Frontend
- Minimal chat interface with a left sidebar.
- Sidebar lists chats; theme and language toggles.

#### Backend
- Health endpoint.
- GET /chats to list chats.
- GET /chat/{id} to fetch one chat.
- POST endpoint to append user/assistant messages and call Mistral API (simple call; streaming optional).
- Basic in‑memory or simple file store for messages.

#### Model
- Call Mistral via API with minimal params, no RAG.

#### Acceptance
- Can start a chat, send a prompt, receive a response.
- Health returns ok; basic errors handled.

### V1 – Public OSS “showable” release
Goal: clean demo others can run locally and understand in minutes.

#### Frontend
- Landing with a short modal: what it is, how to use, and an optional token input or short demo video.
- Functional chat tied to a user session.
- Minimal live metrics panel (avg latency, tokens, error rate).
- Sources under answers when RAG is on.
- “Reproduce this” button: cURL + Python/JS snippets.

#### Backend
- POST /chat with streaming (SSE).
- GET /metrics with basic aggregates (avg/p95 latency, tokens in/out, error rate, total).
- GET /health.

#### Database
- User: {id, name}
- Chat: {id, userId, createdAt}
- Message: {id, chatId, role, content, createdAt}

#### RAG (minimal, optional)
- Small curated corpus (key Mistral docs + a few READMEs).
- Simple chunking; Mistral embeddings; top‑k retrieval with citations.
- Context inserted into a clear system block.

#### Infra and tooling
- Everything dockerized; docker‑compose up works locally.
- Environment variables for keys; no secrets in the repo.
- GitHub Actions: lint + build; a couple of backend unit tests and one e2e smoke.

#### Docs
- README (run in 5 minutes), SETUP, ARCHITECTURE, DECISIONS, ROADMAP.
- Short 2–3 minute demo video.
- Banner: “Unofficial demo. Sources cited. Licenses respected.”

### V2 – Self‑hosted GPU option
- vLLM with Mistral open weights on RunPod or Infomaniak.
- GPU metrics exposed via /metrics (utilization, memory).
- docker‑compose production profile that includes vLLM and exporters.
- Cost and performance notes in DECISIONS.

### Out of scope for now
- Files, images, TTS.
- Auth roles, quotas, billing, multi‑tenant.
- Complex ingestion pipelines and automated evals at scale.
- SSR/SEO work.

### Architecture at a glance
- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui; light state via Zustand.
- Backend: FastAPI (Python 3.12), uvicorn, pydantic, httpx.
- RAG: Mistral embeddings; Qdrant or pgvector.

### Risks and mitigations
- Rate limits or API instability: exponential backoff, clear user messaging, retry budget.
- RAG relevance: keep corpus small and curated; measure hit rate; show sources.
- Latency variance: stream early tokens; keep requests lean; cache embeddings.
- Self‑host complexity: document defaults; provide a safe fallback to API mode.

### Tracking (first pass)
- V0: chat UI + sidebar, basic endpoints, simple Mistral call.
- V1: landing modal, streaming, metrics, citations, docker‑compose, docs, video.
- V2: vLLM deployment, GPU metrics, prod compose, observability.

That’s the baseline direction I want to show publicly while keeping the repo approachable.