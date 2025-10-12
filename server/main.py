from contextlib import asynccontextmanager
from fastapi import FastAPI, Path
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
import logging

from core.logging import setup_logging
from routers import chats_router, health_router, auth_router

from llm import LLMClientFactory
from scraper.retrieval import RetrievalService, set_retrieval_service
from services import set_llm_client

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()

    redis_client = redis.from_url(
        "redis://redis:6379",
        encoding="utf-8",
        decode_responses=True,
    )
    await FastAPILimiter.init(redis=redis_client)

    llm_client = await LLMClientFactory.create()
    set_llm_client(llm_client)

    try:
        retrieval_service = RetrievalService(data_dir=Path("/app/server/scraper/data"))
        set_retrieval_service(retrieval_service)
    except FileNotFoundError as e:
        logger.warning(f"RAG disabled: {e}")
        set_retrieval_service(None)

    yield

    await FastAPILimiter.close()
    await llm_client.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="DocStral API",
        version="0.1.0",
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health_router)
    app.include_router(chats_router)
    app.include_router(auth_router)

    @app.get("/", include_in_schema=False)
    def root():
        return {"ok": True}

    return app


app = create_app()
