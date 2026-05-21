"""
Cascadex API — Interactions Router.

Endpoints for drug interaction detection, chain details, and simulation.
"""

from fastapi import APIRouter, HTTPException

from ..services.neo4j_service import neo4j_service

router = APIRouter()


@router.get("/{patient_id}")
async def get_interactions(patient_id: str):
    """Get all interaction chains for a patient's current medications."""
    interactions = await neo4j_service.get_patient_interactions(patient_id)
    return interactions


@router.get("/chain/{chain_id}")
async def get_chain_detail(chain_id: str):
    """
    Get a single interaction chain's full detail via graph traversal.
    chain_id format: 'perpetrator_id:victim_id:enzyme_name'
    Returns full path: Drug → Enzyme → Drug → Metabolite → Receptor.
    """
    parts = chain_id.split(":")
    if len(parts) != 3:
        raise HTTPException(status_code=400, detail="Invalid chain ID format. Use 'perpetrator_id:victim_id:enzyme_name'")

    perpetrator_id, victim_id, enzyme_name = parts
    chain_data = await neo4j_service.get_chain_detail(perpetrator_id, victim_id, enzyme_name)
    if not chain_data:
        raise HTTPException(status_code=404, detail=f"Interaction chain '{chain_id}' not found in graph")

    return {
        "chain_id": chain_id,
        **chain_data,
    }


@router.get("/{patient_id}/simulate")
async def simulate_add_drug(patient_id: str, drug_id: str):
    """
    Simulate adding a new drug to a patient's regimen.
    Returns new interaction chains that WOULD be created, without persisting.
    """
    results = await neo4j_service.simulate_add_drug(patient_id, drug_id)
    return {
        "patient_id": patient_id,
        "simulated_drug": drug_id,
        "new_interactions_count": len(results),
        "interactions": results,
    }
