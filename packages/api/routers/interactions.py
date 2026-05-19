"""
Cascadex API — Interactions Router.

Endpoints for drug interaction detection, chain details, and simulation.
"""

from fastapi import APIRouter, HTTPException

from ..services.neo4j_service import neo4j_service
from ..services.cache_service import cache_service

router = APIRouter()


@router.get("/{patient_id}")
async def get_interactions(patient_id: str):
    """Get all interaction chains for a patient's current medications."""
    interactions = await neo4j_service.get_patient_interactions(patient_id)
    return interactions


@router.get("/chain/{chain_id}")
async def get_chain_detail(chain_id: str):
    """
    Get a single interaction chain's full detail.
    Note: chain_id is constructed as 'perpetrator_id:victim_id:enzyme_name'.
    """
    parts = chain_id.split(":")
    if len(parts) != 3:
        raise HTTPException(status_code=400, detail="Invalid chain ID format. Use 'perpetrator_id:victim_id:enzyme_name'")

    # For now, return the chain_id parsed — full implementation will fetch from graph
    return {
        "chain_id": chain_id,
        "perpetrator_id": parts[0],
        "victim_id": parts[1],
        "enzyme_name": parts[2],
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
