# Docstral Server

A FastAPI-based chat server with RAG over Mistral AI's documentation. The server supports streaming responses, tool calling for documentation search, and can run with either Mistral's API or a self-hosted LLM endpoint.

## Architecture

The server is built around a few core ideas: **streaming-first responses** using Server-Sent Events, **pluggable LLM providers** (Mistral API or self-hosted vLLM), and **optional RAG** powered by FAISS vector search over scraped documentation. The system prompt constrains the assistant to only answer Mistral AI documentation queries—anything else gets politely redirected.

At startup, the server probes for a self-hosted LLM instance and falls back to Mistral's API if unavailable. If the scraped documentation data exists, RAG is enabled and the LLM can call a `search_documentation` tool to retrieve relevant context. Otherwise, the assistant works without retrieval.

## Running the Server

The easiest path is Docker Compose, which orchestrates Postgres, Redis, the FastAPI server, and the React client:

```bash
docker-compose up --build
```

This handles database migrations, seeds initial data, and starts the server on `localhost:8000`. 

The entrypoint script waits for Postgres to be ready, runs Alembic migrations if needed, and executes the idempotent seed script before handing off to Uvicorn.

Once running, you can login the demo user with token `test`.

**Environment variables** are loaded from `.env` in the project root. Please, note the following:

- `DOCSTRAL_MISTRAL_API_KEY`: your Mistral API key
- `DOCSTRAL_MISTRAL_MODEL`: model name (default: `ministral-3b-2410`)
- `SELF_HOSTED_LLM_URL`: optional self-hosted endpoint (e.g., vLLM)
- `SELF_HOSTED_API_KEY`: auth token for self-hosted LLM


## Setting Up RAG (Optional)

RAG requires three files in `server/scraper/data/`:
- `mistral_docs.json` – scraped documentation
- `faiss_index.bin` – vector index
- `chunks.json` / `metadata.json` – chunk mappings

To generate these:

```bash
cd server
python scraper/setup_data.py
```

This scrapes Mistral's documentation via sitemap, converts HTML to Markdown, chunks it, and builds a FAISS index using `sentence-transformers/all-MiniLM-L6-v2` embeddings. The process takes a few minutes.

If these files are missing, the server starts without RAG. The assistant works but can't search documentation.

## Authentication

The server uses **bearer token auth**. The seed script creates a demo user with token `test`. To make requests:

```bash
curl -H "Authorization: Bearer test" http://localhost:8000/chats
```

## Streaming Architecture

Chat responses stream via SSE (Server-Sent Events). The flow:

1. Client posts a message to `/chat/{chat_id}/stream`
2. Server persists the user message
3. `StreamOrchestrator` sends conversation history to the LLM
4. If RAG is enabled and the LLM calls `search_documentation`, the server executes the tool, retrieves context, and makes a second LLM call with results
5. Tokens stream back as `SSETokenEvent` chunks
6. Sources (if any) arrive as `SSESourcesEvent`
7. Final `SSEDoneEvent` signals completion

The orchestrator handles tool execution, SSE formatting, and graceful cancellation. If the client disconnects mid-stream, partial content is still saved.

## Extending the Server

Want to add more tools? Implement them in `llm/tools.py` and handle execution in `StreamOrchestrator.execute_tool_call`. The tool definitions follow OpenAI's function calling spec, so they work with Mistral's API and vLLM with function calling enabled.

Need rate limiting? It's wired up via `fastapi-limiter` and Redis. Configure per-endpoint limits in the router decorators.

Want to support other LLM providers? Subclass `LLMClient`, implement `_build_url` and `_build_headers`, and register it in `LLMClientFactory`. The base class handles SSE parsing and tool call accumulation.