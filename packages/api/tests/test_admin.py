"""
Cascadex API — Admin Router Tests.

Tests the pharmacist portal endpoints: listing patients, checking stats,
filtering high risk, and simulating prescribe-check.
"""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.fixture
def mock_all_patients():
    return [
        {"id": "p1", "age_range": "20-30", "med_count": 5, "interaction_count": 2},
        {"id": "p2", "age_range": "60-70", "med_count": 2, "interaction_count": 0},
        {"id": "p3", "age_range": "40-50", "med_count": 8, "interaction_count": 5},
    ]


@pytest.fixture
def mock_high_risk_patients():
    return [
        {"id": "p3", "age_range": "40-50", "med_count": 8, "strong_interactions": 2},
    ]


@pytest.fixture
def mock_patient_alerts():
    return [
        {"severity": "critical", "perpetrator": "DrugA", "victim_drug": "DrugB"},
        {"severity": "moderate", "perpetrator": "DrugC", "victim_drug": "DrugD"},
    ]


@pytest.fixture
def mock_patient_medications():
    return [
        {"drugbank_id": "DB1", "name": "DrugA", "class": "Class1"},
        {"drugbank_id": "DB2", "name": "DrugB", "class": "Class2"},
    ]


@pytest.fixture
def mock_simulate_add_drug():
    return [
        {"new_drug": "NewDrug", "affected_drug": "OldDrug", "strength": "strong", "mechanism": "INHIBITS"},
        {"new_drug": "OldDrug2", "affected_drug": "NewDrug", "strength": "moderate", "mechanism": "INDUCES"},
    ]


# -----------------------------------------------------------------------
# GET /api/admin/patients
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_list_patients(client, mock_all_patients, mock_patient_alerts):
    with (
        patch("packages.api.routers.admin.neo4j_service.get_all_patients", new_callable=AsyncMock) as m_all,
        patch("packages.api.routers.admin.neo4j_service.get_patient_alerts", new_callable=AsyncMock) as m_alerts,
    ):
        m_all.return_value = mock_all_patients
        m_alerts.return_value = mock_patient_alerts  # 1 critical, 1 moderate -> risk score 13

        resp = await client.get("/api/admin/patients")
        assert resp.status_code == 200

        data = resp.json()
        assert len(data) == 3

        # Check enrichment
        for patient in data:
            assert "critical_alerts" in patient
            assert "moderate_alerts" in patient
            assert "risk_score" in patient
            assert patient["risk_score"] == 13  # 1*10 + 1*3

        # Check sorting (all have same risk score here, but testing keys exist)


# -----------------------------------------------------------------------
# GET /api/admin/high-risk
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_high_risk_patients(client, mock_high_risk_patients):
    with patch("packages.api.routers.admin.neo4j_service.get_high_risk_patients", new_callable=AsyncMock) as mock_hr:
        mock_hr.return_value = mock_high_risk_patients

        resp = await client.get("/api/admin/high-risk")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "p3"


# -----------------------------------------------------------------------
# POST /api/admin/prescribe-check
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_prescribe_check_critical_risk(client, mock_simulate_add_drug):
    with patch("packages.api.routers.admin.neo4j_service.simulate_add_drug", new_callable=AsyncMock) as mock_sim:
        # Mock returns 1 strong, 1 moderate interaction
        mock_sim.return_value = mock_simulate_add_drug

        payload = {"patient_id": "p1", "new_drug_id": "DB999"}
        resp = await client.post("/api/admin/prescribe-check", json=payload)

        assert resp.status_code == 200
        data = resp.json()

        assert data["patient_id"] == "p1"
        assert data["new_drug_id"] == "DB999"
        assert data["new_interactions_count"] == 2
        assert data["risk_level"] == "critical"
        assert "DO NOT PRESCRIBE" in data["recommendation"]


@pytest.mark.asyncio(loop_scope="session")
async def test_prescribe_check_safe(client):
    with patch("packages.api.routers.admin.neo4j_service.simulate_add_drug", new_callable=AsyncMock) as mock_sim:
        # Mock returns empty list (no interactions)
        mock_sim.return_value = []

        payload = {"patient_id": "p1", "new_drug_id": "DB999"}
        resp = await client.post("/api/admin/prescribe-check", json=payload)

        assert resp.status_code == 200
        data = resp.json()

        assert data["new_interactions_count"] == 0
        assert data["risk_level"] == "safe"
        assert "safe to prescribe" in data["recommendation"].lower()


# -----------------------------------------------------------------------
# GET /api/admin/stats
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_admin_stats(client, mock_all_patients, mock_high_risk_patients):
    with (
        patch("packages.api.routers.admin.neo4j_service.get_all_patients", new_callable=AsyncMock) as m_all,
        patch("packages.api.routers.admin.neo4j_service.get_high_risk_patients", new_callable=AsyncMock) as m_hr,
    ):
        m_all.return_value = mock_all_patients
        m_hr.return_value = mock_high_risk_patients

        resp = await client.get("/api/admin/stats")
        assert resp.status_code == 200
        data = resp.json()

        assert data["total_patients"] == 3
        assert data["high_risk_patients"] == 1
        assert data["total_interactions"] == 7  # 2 + 0 + 5
        assert data["total_medications_tracked"] == 15  # 5 + 2 + 8


# -----------------------------------------------------------------------
# GET /api/admin/patient/{id}/medications and /interactions
# -----------------------------------------------------------------------
@pytest.mark.asyncio(loop_scope="session")
async def test_patient_medications(client, mock_patient_medications):
    with patch("packages.api.routers.admin.neo4j_service.get_patient_medications", new_callable=AsyncMock) as m_meds:
        m_meds.return_value = mock_patient_medications

        resp = await client.get("/api/admin/patient/p1/medications")
        assert resp.status_code == 200
        data = resp.json()

        assert data["count"] == 2
        assert len(data["medications"]) == 2


@pytest.mark.asyncio(loop_scope="session")
async def test_patient_interactions(client, mock_patient_alerts):
    with patch("packages.api.routers.admin.neo4j_service.get_patient_alerts", new_callable=AsyncMock) as m_alerts:
        m_alerts.return_value = mock_patient_alerts

        resp = await client.get("/api/admin/patient/p1/interactions")
        assert resp.status_code == 200
        data = resp.json()

        assert data["total"] == 2
        assert data["severity_breakdown"]["critical"] == 1
        assert data["severity_breakdown"]["moderate"] == 1
        assert data["severity_breakdown"]["minor"] == 0
