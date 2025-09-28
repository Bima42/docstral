from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

from api.routers import chats_router
from api.routers import health_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="DocStral API",
        version="0.1.0",
        default_response_class=ORJSONResponse,
    )

    # Routers
    app.include_router(health_router)
    app.include_router(chats_router)

    @app.get("/", include_in_schema=False)
    def root():
        return {"ok": True}

    return app


app = create_app()
