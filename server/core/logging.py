import logging
import sys

from core.settings import settings


def setup_logging():
    """
    Configure application-wide logging.
    Call once at startup (in lifespan or main.py).
    """
    log_level = logging.DEBUG if settings.debug else logging.INFO

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3.connectionpool").setLevel(logging.WARNING)

    logging.info(f"Logging configured (level={logging.getLevelName(log_level)})")