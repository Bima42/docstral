FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

RUN python -m venv /venv

COPY server/requirements.txt .
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/server \
    PATH="/venv/bin:$PATH"

RUN useradd -m -u 1000 docstral

WORKDIR /app/server

COPY --from=builder --chown=docstral:docstral /venv /venv
COPY --chown=docstral:docstral server/ .

COPY --chown=docstral:docstral docker/prod/server/entrypoint /entrypoint
RUN chmod +x /entrypoint

USER docstral

EXPOSE 8000

ENTRYPOINT ["/entrypoint"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]