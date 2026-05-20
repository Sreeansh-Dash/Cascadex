"""
Cascadex API — Patient Router Tests.

Tests patient medications retrieval, graph visualization data,
and alert generation/sorting for demo-patient-001.
"""

import pytest

DEMO_PATIENT = "demo-patient-001"


# -----------------------------------------------------------------------
# GET /api/patient/{patient_id}/medications
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_medications_returns_list(client):
    """Medications endpoint should return a JSON array."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/medications")
    assert resp.status_code == 200
    meds = resp.json()
    assert isinstance(meds, list)


@pytest.mark.asyncio(loop_scope="session")
async def test_medications_not_empty(client):
    """Demo patient should have at least one medication."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/medications")
    meds = resp.json()
    assert len(meds) > 0, "Demo patient should have medications"


@pytest.mark.asyncio(loop_scope="session")
async def test_medications_have_required_fields(client):
    """Each medication record should have drugbank_id and name."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/medications")
    meds = resp.json()
    assert len(meds) > 0

    for med in meds:
        assert "drugbank_id" in med, f"Medication missing drugbank_id: {med}"
        assert "name" in med, f"Medication missing name: {med}"


@pytest.mark.asyncio(loop_scope="session")
async def test_medications_include_fluoxetine_and_codeine(client):
    """Demo patient must be taking both Fluoxetine and Codeine (gold standard setup)."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/medications")
    meds = resp.json()
    med_names = {m.get("name", "").lower() for m in meds}

    assert "fluoxetine" in med_names, f"Fluoxetine not in patient meds: {med_names}"
    assert "codeine" in med_names, f"Codeine not in patient meds: {med_names}"


# -----------------------------------------------------------------------
# GET /api/patient/{patient_id}/graph
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_graph_returns_nodes_and_edges(client):
    """Graph endpoint must return a dict with 'nodes' and 'edges' arrays."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/graph")
    assert resp.status_code == 200
    body = resp.json()
    assert "nodes" in body, "Graph response missing 'nodes'"
    assert "edges" in body, "Graph response missing 'edges'"
    assert isinstance(body["nodes"], list)
    assert isinstance(body["edges"], list)


@pytest.mark.asyncio(loop_scope="session")
async def test_graph_has_drug_nodes(client):
    """Graph should contain at least one node of type 'drug'."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/graph")
    body = resp.json()
    drug_nodes = [n for n in body["nodes"] if n.get("type") == "drug"]
    assert len(drug_nodes) > 0, "Graph should have drug nodes"


@pytest.mark.asyncio(loop_scope="session")
async def test_graph_has_enzyme_nodes(client):
    """Graph should contain enzyme nodes for the demo patient's interaction pathways."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/graph")
    body = resp.json()
    enzyme_nodes = [n for n in body["nodes"] if n.get("type") == "enzyme"]
    assert len(enzyme_nodes) > 0, "Graph should have enzyme nodes"


@pytest.mark.asyncio(loop_scope="session")
async def test_graph_has_edges(client):
    """Graph should contain edges linking drugs to enzymes."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/graph")
    body = resp.json()
    assert len(body["edges"]) > 0, "Graph should have at least one edge"


# -----------------------------------------------------------------------
# GET /api/patient/{patient_id}/alerts
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_alerts_returns_list(client):
    """Alerts endpoint should return a JSON array."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/alerts")
    assert resp.status_code == 200
    alerts = resp.json()
    assert isinstance(alerts, list)


@pytest.mark.asyncio(loop_scope="session")
async def test_alerts_sorted_by_severity(client):
    """Alerts should be sorted: critical first, then moderate, then minor."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/alerts")
    alerts = resp.json()

    if len(alerts) < 2:
        pytest.skip("Need at least 2 alerts to validate sort order")

    severity_order = {"critical": 0, "moderate": 1, "minor": 2}
    severities = [severity_order.get(a.get("severity", "minor"), 3) for a in alerts]
    assert severities == sorted(severities), (
        f"Alerts not sorted by severity. Order: {[a.get('severity') for a in alerts]}"
    )


@pytest.mark.asyncio(loop_scope="session")
async def test_alerts_have_severity_field(client):
    """Each alert should include a 'severity' field."""
    resp = await client.get(f"/api/patient/{DEMO_PATIENT}/alerts")
    alerts = resp.json()

    if len(alerts) == 0:
        pytest.skip("No alerts to validate")

    for alert in alerts:
        assert "severity" in alert, f"Alert missing 'severity': {alert}"
        assert alert["severity"] in {"critical", "moderate", "minor"}, (
            f"Unexpected severity value: {alert['severity']}"
        )
