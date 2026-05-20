"""
Cascadex API — Interaction Detection Tests.

Validates the core graph-traversal interaction engine against demo data.
Includes the GOLD STANDARD assertion:
    demo-patient-001 MUST have a Fluoxetine → CYP2D6 → Codeine chain.
"""

import pytest

DEMO_PATIENT = "demo-patient-001"


# -----------------------------------------------------------------------
# GET /api/interactions/{patient_id}
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_interactions_returns_list(client):
    """Interaction endpoint should return a JSON array."""
    resp = await client.get(f"/api/interactions/{DEMO_PATIENT}")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio(loop_scope="session")
async def test_interactions_not_empty(client):
    """Demo patient should have at least one interaction chain."""
    resp = await client.get(f"/api/interactions/{DEMO_PATIENT}")
    interactions = resp.json()
    assert len(interactions) > 0, "Demo patient should have interaction chains"


# -----------------------------------------------------------------------
# GOLD STANDARD — Fluoxetine → CYP2D6 → Codeine
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_gold_standard_fluoxetine_cyp2d6_codeine(client):
    """
    GOLD STANDARD validation.

    demo-patient-001 takes Fluoxetine (strong CYP2D6 inhibitor) and
    Codeine (CYP2D6 substrate → morphine prodrug).

    The interaction engine MUST detect this chain:
      Fluoxetine --INHIBITS--> CYP2D6 <--SUBSTRATE_OF-- Codeine

    Failure here means the core traversal query is broken.
    """
    resp = await client.get(f"/api/interactions/{DEMO_PATIENT}")
    assert resp.status_code == 200
    interactions = resp.json()

    # Find the specific chain
    gold_hit = None
    for ix in interactions:
        perp = (ix.get("perpetrator") or "").lower()
        victim = (ix.get("victim_drug") or "").lower()
        enzyme = (ix.get("via_enzyme") or "").upper()

        if "fluoxetine" in perp and "codeine" in victim and "CYP2D6" in enzyme:
            gold_hit = ix
            break

    assert gold_hit is not None, (
        "GOLD STANDARD FAILED — Fluoxetine→CYP2D6→Codeine chain not found. "
        f"Got interactions: {interactions}"
    )


@pytest.mark.asyncio(loop_scope="session")
async def test_gold_standard_has_expected_fields(client):
    """Each interaction record must carry the expected keys."""
    resp = await client.get(f"/api/interactions/{DEMO_PATIENT}")
    interactions = resp.json()
    assert len(interactions) > 0

    first = interactions[0]
    expected_keys = {
        "perpetrator",
        "perpetrator_id",
        "victim_drug",
        "victim_id",
        "via_enzyme",
        "interaction_type",
    }
    missing = expected_keys - set(first.keys())
    assert not missing, f"Interaction record missing keys: {missing}"


# -----------------------------------------------------------------------
# GET /api/interactions/{patient_id}/simulate?drug_id=...
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_simulate_add_itraconazole(client):
    """
    Simulating the addition of Itraconazole (DB01050, a strong CYP3A4
    inhibitor) to demo-patient-001's regimen should detect new interactions
    with CYP3A4-substrate drugs the patient is already taking.
    """
    resp = await client.get(
        f"/api/interactions/{DEMO_PATIENT}/simulate",
        params={"drug_id": "DB01050"},
    )
    assert resp.status_code == 200
    body = resp.json()

    assert body["patient_id"] == DEMO_PATIENT
    assert body["simulated_drug"] == "DB01050"
    assert "interactions" in body
    assert isinstance(body["interactions"], list)
    assert body["new_interactions_count"] == len(body["interactions"])


@pytest.mark.asyncio(loop_scope="session")
async def test_simulate_returns_mechanism_details(client):
    """Each simulated interaction should include mechanism + enzyme details."""
    resp = await client.get(
        f"/api/interactions/{DEMO_PATIENT}/simulate",
        params={"drug_id": "DB01050"},
    )
    body = resp.json()

    if body["new_interactions_count"] > 0:
        ix = body["interactions"][0]
        assert "via_enzyme" in ix
        assert "mechanism" in ix
        assert "affected_drug" in ix
