FROM python:3.12-slim AS build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /build

RUN python -m venv /venv

COPY server/requirements.txt .
RUN /venv/bin/pip install -r requirements.txt


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/server \
    PATH="/venv/bin:$PATH"

WORKDIR /app/server

COPY --from=build /venv /venv

COPY server/ .

COPY docker/prod/server/entrypoint /entrypoint
RUN chmod +x /entrypoint

RUN useradd -m -u 1000 docstral && chown -R docstral:docstral /app /venv
USER docstral

EXPOSE 8000

ENTRYPOINT ["/entrypoint"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]