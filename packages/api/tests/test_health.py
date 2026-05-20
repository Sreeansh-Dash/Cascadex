"""
Cascadex API — Health Endpoint Tests.

Validates that the /health endpoint returns 200 with correct status fields
and confirms the Neo4j driver is connected after the app lifespan fires.
"""

import pytest


@pytest.mark.asyncio(loop_scope="session")
async def test_health_returns_200(client):
    """GET /health should return HTTP 200."""
    resp = await client.get("/health")
    assert resp.status_code == 200


@pytest.mark.asyncio(loop_scope="session")
async def test_health_has_required_fields(client):
    """Response body must include 'status' and 'neo4j_connected'."""
    resp = await client.get("/health")
    body = resp.json()
    assert "status" in body
    assert "neo4j_connected" in body


@pytest.mark.asyncio(loop_scope="session")
async def test_health_neo4j_connected(client):
    """After lifespan init the Neo4j driver should be connected."""
    resp = await client.get("/health")
    body = resp.json()
    assert body["neo4j_connected"] is True
    assert body["status"] == "healthy"
