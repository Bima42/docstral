from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware

from api.routers import chats_router, health_router, auth_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="DocStral API",
        version="0.1.0",
        default_response_class=ORJSONResponse,
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
