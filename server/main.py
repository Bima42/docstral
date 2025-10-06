from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis

from routers import chats_router, health_router, auth_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    redis_client = redis.from_url(
        "redis://redis:6379",
        encoding="utf-8",
        decode_responses=True,
    )
    await FastAPILimiter.init(redis=redis_client)
    yield
    await FastAPILimiter.close()


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
