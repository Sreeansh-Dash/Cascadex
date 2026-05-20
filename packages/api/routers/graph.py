"""
Cascadex API — Graph Router.

Endpoints for full graph visualization data.
"""

from fastapi import APIRouter, HTTPException

from ..services.neo4j_service import neo4j_service
from ..models.graph import PatientGraph

router = APIRouter()


@router.get("/{patient_id}", response_model=PatientGraph)
async def get_graph(patient_id: str):
    """
    Get the full graph data (nodes + edges) for graph visualization.
    Returns node positions and edge data for Skia/D3 rendering.
    """
    graph_data = await neo4j_service.get_full_graph(patient_id)
    return graph_data


@router.get("/{patient_id}/enzyme/{enzyme_name}")
async def get_enzyme_blast_radius(patient_id: str, enzyme_name: str):
    """
    Get the blast radius of an enzyme being inhibited.
    Shows all downstream effects for the patient's current medications.
    """
    # First get the patient's medications
    meds = await neo4j_service.get_patient_medications(patient_id)
    med_names = [m["name"] for m in meds]

    blast_radius = await neo4j_service.get_blast_radius(enzyme_name, med_names)
    return {
        "enzyme": enzyme_name,
        "affected_drugs_count": len(blast_radius),
        "downstream_effects": blast_radius,
    }


@router.get("/{patient_id}/enzyme/{enzyme_name}/detail")
async def get_enzyme_detail(patient_id: str, enzyme_name: str):
    """
    Get detailed enzyme info including all substrate drugs and perpetrator drugs.
    Provides a complete view of an enzyme's role in the interaction network.
    """
    detail = await neo4j_service.get_enzyme_detail(enzyme_name)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Enzyme '{enzyme_name}' not found in graph",
        )
    return detail
