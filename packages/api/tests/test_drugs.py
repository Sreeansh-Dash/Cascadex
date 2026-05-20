"""
Cascadex API — Drug Router Tests.

Tests the drug lookup (by name) and detail (by DrugBank ID) endpoints
against real Neo4j demo data.
"""

import pytest


# -----------------------------------------------------------------------
# GET /api/drugs/lookup?name=...
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_lookup_fluoxetine_returns_results(client):
    """Searching for 'Fluoxetine' should return at least one match."""
    resp = await client.get("/api/drugs/lookup", params={"name": "Fluoxetine"})
    assert resp.status_code == 200
    results = resp.json()
    assert isinstance(results, list)
    assert len(results) >= 1


@pytest.mark.asyncio(loop_scope="session")
async def test_lookup_fluoxetine_contains_correct_drug(client):
    """The result list should contain a drug named 'Fluoxetine'."""
    resp = await client.get("/api/drugs/lookup", params={"name": "Fluoxetine"})
    results = resp.json()
    names = [d.get("name", "").lower() for d in results]
    assert any("fluoxetine" in n for n in names)


@pytest.mark.asyncio(loop_scope="session")
async def test_lookup_nonexistent_drug_returns_404(client):
    """Searching for a nonsense name should yield 404."""
    resp = await client.get("/api/drugs/lookup", params={"name": "Zzzyxanthoflux"})
    assert resp.status_code == 404


# -----------------------------------------------------------------------
# GET /api/drugs/{drugbank_id}
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_get_drug_by_id_fluoxetine(client):
    """DB00472 is Fluoxetine in DrugBank — detail endpoint must return it."""
    resp = await client.get("/api/drugs/DB00472")
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("name", "").lower() == "fluoxetine"
    assert body.get("drugbank_id") == "DB00472"


@pytest.mark.asyncio(loop_scope="session")
async def test_get_drug_by_invalid_id_returns_404(client):
    """A DrugBank ID that doesn't exist should return 404."""
    resp = await client.get("/api/drugs/INVALID")
    assert resp.status_code == 404
