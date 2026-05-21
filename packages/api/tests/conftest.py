"""
Cascadex API — Shared Test Fixtures.

Provides an httpx.AsyncClient wired to the FastAPI app via ASGITransport.
The client triggers the app's lifespan events so Neo4j is connected before
any test runs.
"""

import sys
from pathlib import Path

import pytest_asyncio
from dotenv import load_dotenv
from httpx import ASGITransport, AsyncClient

# ---------------------------------------------------------------------------
# 1. Load .env from the project root (three levels up from this file)
#    This must happen BEFORE any app code is imported so pydantic-settings
#    picks up NEO4J_URI, NEO4J_PASSWORD, GROQ_API_KEY, etc.
# ---------------------------------------------------------------------------
_project_root = Path(__file__).resolve().parents[3]  # packages/api/tests -> Cascadex
load_dotenv(_project_root / ".env", override=True)

# ---------------------------------------------------------------------------
# 2. Make sure the project root is on sys.path so "packages.api.main" resolves
# ---------------------------------------------------------------------------
_root_str = str(_project_root)
if _root_str not in sys.path:
    sys.path.insert(0, _root_str)

# ---------------------------------------------------------------------------
# 3. Import the FastAPI application and services
# ---------------------------------------------------------------------------
from packages.api.config import get_settings  # noqa: E402
from packages.api.main import app  # noqa: E402
from packages.api.services.groq_service import init_groq  # noqa: E402
from packages.api.services.neo4j_service import neo4j_service  # noqa: E402


# ---------------------------------------------------------------------------
# 4. Async client fixture — manually fires lifespan to connect Neo4j,
#    then yields the test client.
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="session")
async def client():
    """Yield an httpx.AsyncClient bound to the Cascadex FastAPI app."""
    # Manually connect Neo4j + Groq (lifespan won't fire with ASGITransport)
    settings = get_settings()
    await neo4j_service.connect(
        uri=settings.neo4j_uri,
        user=settings.neo4j_effective_user,
        password=settings.neo4j_password,
    )
    init_groq(settings.groq_api_key)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Teardown
    await neo4j_service.close()
