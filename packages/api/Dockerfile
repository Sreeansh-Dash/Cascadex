# ===========================
# Cascadex API — Docker Image
# ===========================
# Multi-stage build for the FastAPI backend.
# Compatible with docker-compose (local dev) and Render/Railway deploys.

# ---- Stage 1: Builder ----
FROM python:3.12-slim AS builder

WORKDIR /build

# Install dependencies into a virtualenv for clean copying
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ---- Stage 2: Runtime ----
FROM python:3.12-slim AS runtime

# Security: run as non-root user
RUN groupadd --gid 1000 cascadex && \
    useradd --uid 1000 --gid 1000 --create-home cascadex

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import httpx; r = httpx.get('http://localhost:8000/health'); exit(0 if r.status_code == 200 else 1)" || exit 1

# Switch to non-root user
USER cascadex

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
