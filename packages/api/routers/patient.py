"""
Cascadex API — Patient Router.

Endpoints for patient profile management and medication CRUD.
"""

from fastapi import APIRouter, HTTPException
import uuid

from ..services.neo4j_service import neo4j_service
from ..services.cache_service import cache_service
from ..models.patient import PatientCreate, MedicationAdd

router = APIRouter()


@router.post("/create")
async def create_patient(data: PatientCreate):
    """Create a new anonymized patient profile."""
    patient_id = str(uuid.uuid4())
    patient = await neo4j_service.create_patient(
        patient_id=patient_id,
        age_range=data.age_range,
        weight_range=data.weight_range,
    )
    if not patient:
        raise HTTPException(status_code=500, detail="Failed to create patient")
    return {"id": patient_id, **patient}


@router.get("/{patient_id}/graph")
async def get_patient_graph(patient_id: str):
    """Get the full graph visualization data for a patient."""
    # Check cache first
    cache_key = f"graph:{patient_id}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    graph_data = await neo4j_service.get_full_graph(patient_id)
    cache_service.set(cache_key, graph_data, ttl=120)
    return graph_data


@router.get("/{patient_id}/medications")
async def get_medications(patient_id: str):
    """Get all medications a patient is currently taking."""
    meds = await neo4j_service.get_patient_medications(patient_id)
    return meds


@router.post("/{patient_id}/medications")
async def add_medication(patient_id: str, data: MedicationAdd):
    """Add a medication to the patient's regimen."""
    result = await neo4j_service.add_patient_medication(
        patient_id=patient_id,
        drugbank_id=data.drugbank_id,
        dose=data.dose,
        frequency=data.frequency,
        indication=data.indication,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Patient or drug not found")

    # Invalidate cache
    cache_service.invalidate_patient(patient_id)
    return {"message": "Medication added", **result}


@router.delete("/{patient_id}/medications/{drug_id}")
async def remove_medication(patient_id: str, drug_id: str):
    """Remove a medication from the patient's regimen."""
    success = await neo4j_service.remove_patient_medication(patient_id, drug_id)
    if not success:
        raise HTTPException(status_code=404, detail="Medication not found for patient")

    # Invalidate cache
    cache_service.invalidate_patient(patient_id)
    return {"message": "Medication removed", "drugbank_id": drug_id}


@router.get("/{patient_id}/alerts")
async def get_patient_alerts(patient_id: str):
    """Get current interaction alerts for a patient, sorted by severity."""
    cache_key = f"alerts:{patient_id}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    alerts = await neo4j_service.get_patient_alerts(patient_id)
    cache_service.set(cache_key, alerts, ttl=60)
    return alerts
