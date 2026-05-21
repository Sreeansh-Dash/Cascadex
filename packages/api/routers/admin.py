"""
Cascadex API — Admin Router.

Endpoints for the Base44 pharmacist portal.
Read-heavy, designed for dashboard tables, patient detail views,
prescribe-check simulations, and aggregate statistics.

Connects to: Neo4j AuraDB (via neo4j_service)
"""

from fastapi import APIRouter, HTTPException

from ..services.neo4j_service import neo4j_service
from ..models.admin import (
    PrescribeCheckRequest,
    PrescribeCheckResponse,
    AdminStats,
)

router = APIRouter()


@router.get("/patients")
async def list_patients():
    """
    List all patients with their medication count and risk scores.
    Used by Base44 portal Patient Risk Dashboard.

    Returns patients sorted by risk score (critical interactions weighted 10x,
    moderate weighted 3x).
    """
    patients = await neo4j_service.get_all_patients()

    # Enrich with interaction alerts count and compute risk score
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
    """
    Get complete patient data for the portal detail view.
    Returns graph visualization data, medication list, and interaction alerts.
    """
    graph = await neo4j_service.get_full_graph(patient_id)
    meds = await neo4j_service.get_patient_medications(patient_id)
    alerts = await neo4j_service.get_patient_alerts(patient_id)
    return {
        "patient_id": patient_id,
        "graph": graph,
        "medications": meds,
        "alerts": alerts,
    }


@router.get("/patient/{patient_id}/medications")
async def admin_get_patient_medications(patient_id: str):
    """
    Get patient medication list for the portal medication table.
    Returns drug name, class, dose, frequency for each medication.
    """
    meds = await neo4j_service.get_patient_medications(patient_id)
    if not meds:
        raise HTTPException(status_code=404, detail="Patient not found or has no medications")
    return {"patient_id": patient_id, "medications": meds, "count": len(meds)}


@router.get("/patient/{patient_id}/interactions")
async def admin_get_patient_interactions(patient_id: str):
    """
    Get patient interactions with severity breakdown for the portal.
    Returns interactions sorted by severity, plus aggregate counts.
    """
    alerts = await neo4j_service.get_patient_alerts(patient_id)
    critical = sum(1 for a in alerts if a.get("severity") == "critical")
    moderate = sum(1 for a in alerts if a.get("severity") == "moderate")
    minor = sum(1 for a in alerts if a.get("severity") == "minor")
    return {
        "patient_id": patient_id,
        "interactions": alerts,
        "severity_breakdown": {
            "critical": critical,
            "moderate": moderate,
            "minor": minor,
        },
        "total": len(alerts),
    }


@router.get("/high-risk")
async def get_high_risk_patients():
    """
    Get patients with at least one 'strong' strength interaction.
    Used by Base44 High-Risk Alerts Board (Kanban view).
    """
    return await neo4j_service.get_high_risk_patients()


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats():
    """
    Aggregate dashboard statistics for the pharmacist portal.
    Returns total patients, interactions, high-risk count, and medications tracked.
    """
    patients = await neo4j_service.get_all_patients()
    high_risk = await neo4j_service.get_high_risk_patients()

    total_interactions = 0
    total_meds = 0
    for patient in patients:
        total_meds += patient.get("med_count", 0)
        total_interactions += patient.get("interaction_count", 0)

    return AdminStats(
        total_patients=len(patients),
        total_interactions=total_interactions,
        high_risk_patients=len(high_risk),
        total_medications_tracked=total_meds,
    )


@router.post("/prescribe-check", response_model=PrescribeCheckResponse)
async def prescribe_check(data: PrescribeCheckRequest):
    """
    Simulate adding a drug to a patient's regimen.
    Returns new interactions that would be created, with risk classification.

    Used by Base44 Prescribe-Check Tool.
    """
    new_interactions = await neo4j_service.simulate_add_drug(
        data.patient_id, data.new_drug_id
    )

    # Classify risk based on interaction strengths
    has_strong = any(i.get("strength") == "strong" for i in new_interactions)
    risk_level = "critical" if has_strong else ("moderate" if new_interactions else "safe")

    recommendation = {
        "critical": "⚠️ DO NOT PRESCRIBE without physician review — critical interactions detected",
        "moderate": "⚡ Monitor closely — moderate interactions found",
        "safe": "✅ No new interactions detected — safe to prescribe",
    }.get(risk_level, "Review required")

    return PrescribeCheckResponse(
        patient_id=data.patient_id,
        new_drug_id=data.new_drug_id,
        new_interactions_count=len(new_interactions),
        interactions=new_interactions,
        risk_level=risk_level,
        recommendation=recommendation,
    )
