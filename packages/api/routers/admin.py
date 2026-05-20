"""
Cascadex API — Admin Router.

Endpoints for the Base44 pharmacist portal.
Read-heavy, designed for dashboard tables and prescribe-check simulations.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..services.neo4j_service import neo4j_service

router = APIRouter()


class PrescribeCheckRequest(BaseModel):
    patient_id: str
    new_drug_id: str


@router.get("/patients")
async def list_patients():
    """
    List all patients with their medication count and risk scores.
    Used by Base44 portal Patient Risk Dashboard.
    """
    patients = await neo4j_service.get_all_patients()

    # Enrich with interaction alerts count
    for patient in patients:
        alerts = await neo4j_service.get_patient_alerts(patient["id"])
        critical = sum(1 for a in alerts if a.get("severity") == "critical")
        moderate = sum(1 for a in alerts if a.get("severity") == "moderate")
        patient["critical_alerts"] = critical
        patient["moderate_alerts"] = moderate
        patient["risk_score"] = critical * 10 + moderate * 3

    patients.sort(key=lambda p: p["risk_score"], reverse=True)
    return patients


@router.get("/patient/{patient_id}/graph")
async def admin_get_patient_graph(patient_id: str):
    """Get patient graph for the portal view."""
    graph = await neo4j_service.get_full_graph(patient_id)
    meds = await neo4j_service.get_patient_medications(patient_id)
    alerts = await neo4j_service.get_patient_alerts(patient_id)
    return {
        "patient_id": patient_id,
        "graph": graph,
        "medications": meds,
        "alerts": alerts,
    }


@router.get("/high-risk")
async def get_high_risk_patients():
    """Get patients with at least one 'strong' strength interaction."""
    return await neo4j_service.get_high_risk_patients()


@router.post("/prescribe-check")
async def prescribe_check(data: PrescribeCheckRequest):
    """
    Simulate adding a drug to a patient's regimen.
    Returns new interactions that would be created.
    """
    new_interactions = await neo4j_service.simulate_add_drug(
        data.patient_id, data.new_drug_id
    )
    return {
        "patient_id": data.patient_id,
        "new_drug_id": data.new_drug_id,
        "new_interactions_count": len(new_interactions),
        "interactions": new_interactions,
        "recommendation": "REVIEW REQUIRED" if new_interactions else "NO NEW INTERACTIONS",
    }
