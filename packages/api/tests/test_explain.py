"""
Cascadex API — Explain Router Tests.

Tests the Groq integration for plain-English explanations.
Uses the real Neo4j database to get graph data, but mocks Groq to
avoid hitting the LLM API during tests. Also tests caching logic.
"""

import pytest
from unittest.mock import patch, AsyncMock

from packages.api.services.cache_service import cache_service


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear the in-memory cache before each test."""
    cache_service.clear()
    yield


@pytest.fixture
def mock_groq_explain_chain():
    with patch("packages.api.services.groq_service.explain_interaction_chain", new_callable=AsyncMock) as mock:
        mock.return_value = "This is a mocked Groq interaction explanation."
        yield mock


@pytest.fixture
def mock_groq_explain_drug():
    with patch("packages.api.services.groq_service.explain_drug", new_callable=AsyncMock) as mock:
        mock.return_value = "This is a mocked Groq drug explanation."
        yield mock


@pytest.fixture
def mock_groq_client_error():
    # Patch the groq_client in the module directly
    with patch("packages.api.services.groq_service.groq_client") as mock:
        mock.chat.completions.create.side_effect = Exception("Groq API Error")
        yield mock


# -----------------------------------------------------------------------
# GET /api/explain/chain/{chain_id}
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_explain_chain_success(client, mock_groq_explain_chain):
    """Should return a mocked explanation for a valid chain ID."""
    # Find a valid chain ID first using the Neo4j patient interactions
    resp = await client.get("/api/admin/patients")
    patients = resp.json()
    if not patients:
        pytest.skip("No patients found in test database")
    
    patient_id = patients[0]["id"]
    graph_resp = await client.get(f"/api/admin/patient/{patient_id}/interactions")
    interactions = graph_resp.json().get("interactions", [])
    
    if not interactions:
        pytest.skip("No interactions found in test database")
        
    interaction = interactions[0]
    chain_id = f"{interaction['perpetrator_id']}:{interaction['victim_id']}:{interaction['via_enzyme']}"

    resp = await client.get(f"/api/explain/chain/{chain_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["chain_id"] == chain_id
    assert data["explanation"] == "This is a mocked Groq interaction explanation."
    assert "chain_data" in data

    mock_groq_explain_chain.assert_called_once()


@pytest.mark.asyncio(loop_scope="session")
async def test_explain_chain_cache_hit(client, mock_groq_explain_chain):
    """Second call to the same chain should hit cache and NOT call Groq."""
    # Use a dummy but correctly formatted chain ID. The endpoint validates format,
    # then calls Neo4j. We need a real chain ID or mock Neo4j. Let's mock neo4j for this.
    chain_id = "DB001:DB002:CYP3A4"
    
    with patch("packages.api.routers.explain.neo4j_service.get_chain_detail", new_callable=AsyncMock) as mock_neo4j:
        mock_neo4j.return_value = {"dummy": "data"}
        
        # Call 1: Misses cache, calls Neo4j & Groq
        resp1 = await client.get(f"/api/explain/chain/{chain_id}")
        assert resp1.status_code == 200
        assert mock_neo4j.call_count == 1
        assert mock_groq_explain_chain.call_count == 1
        
        # Call 2: Hits cache, no Neo4j or Groq calls
        resp2 = await client.get(f"/api/explain/chain/{chain_id}")
        assert resp2.status_code == 200
        assert mock_neo4j.call_count == 1  # Still 1
        assert mock_groq_explain_chain.call_count == 1  # Still 1


@pytest.mark.asyncio(loop_scope="session")
async def test_explain_chain_invalid_format(client):
    """Invalid chain ID format should return 400."""
    resp = await client.get("/api/explain/chain/invalid-format")
    assert resp.status_code == 400
    assert "Invalid chain ID" in resp.json()["detail"]


@pytest.mark.asyncio(loop_scope="session")
async def test_explain_chain_not_found(client):
    """Correct format but non-existent chain should return 404."""
    chain_id = "DB999:DB888:FAKE"
    with patch("packages.api.routers.explain.neo4j_service.get_chain_detail", new_callable=AsyncMock) as mock_neo4j:
        mock_neo4j.return_value = None
        resp = await client.get(f"/api/explain/chain/{chain_id}")
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"]


# -----------------------------------------------------------------------
# GET /api/explain/drug/{drug_id}
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_explain_drug_success(client, mock_groq_explain_drug):
    """Should return a mocked drug explanation."""
    with patch("packages.api.routers.explain.neo4j_service.get_drug_by_id", new_callable=AsyncMock) as mock_neo4j:
        mock_neo4j.return_value = {"name": "Aspirin", "drugbank_id": "DB00945"}
        
        resp = await client.get("/api/explain/drug/DB00945")
        assert resp.status_code == 200
        data = resp.json()
        assert data["drugbank_id"] == "DB00945"
        assert data["explanation"] == "This is a mocked Groq drug explanation."
        
        mock_groq_explain_drug.assert_called_once()


# -----------------------------------------------------------------------
# Error Handling (Groq Failure)
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_explain_chain_groq_failure_returns_fallback(client, mock_groq_client_error):
    """If Groq throws an exception, the endpoint should return fallback text."""
    chain_id = "DB001:DB002:CYP3A4"
    with patch("packages.api.routers.explain.neo4j_service.get_chain_detail", new_callable=AsyncMock) as mock_neo4j:
        mock_neo4j.return_value = {"dummy": "data"}
        
        resp = await client.get(f"/api/explain/chain/{chain_id}")
        assert resp.status_code == 200
        assert "fallback" in resp.json()["explanation"].lower() or "unable" in resp.json()["explanation"].lower()
