"""
Cascadex API — Explain Router.

Endpoints for Groq-powered plain-English explanations of drug interactions.
Includes both standard JSON responses and SSE streaming for the mobile
typewriter effect.

Connects to: Groq API (via groq_service), Neo4j (via neo4j_service)
"""

import json
import logging

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from ..services.neo4j_service import neo4j_service
from ..services import groq_service
from ..services.cache_service import cache_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/chain/{chain_id}")
async def explain_chain(chain_id: str):
    """
    Get a plain-English explanation of an interaction chain via Groq.

    chain_id format: 'perpetrator_id:victim_id:enzyme_name'
    Results are cached for 1 hour — the same chain always gets the same explanation.
    """
    # Check cache first
    cache_key = f"explain:{chain_id}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    parts = chain_id.split(":")
    if len(parts) != 3:
        raise HTTPException(
            status_code=400,
            detail="Invalid chain ID. Use 'perpetrator_id:victim_id:enzyme_name'",
        )

    perpetrator_id, victim_id, enzyme_name = parts

    # Fetch real chain data from Neo4j graph traversal
    chain_data = await neo4j_service.get_chain_detail(
        perpetrator_id, victim_id, enzyme_name
    )
    if not chain_data:
        raise HTTPException(
            status_code=404,
            detail=f"Interaction chain '{chain_id}' not found in graph",
        )

    explanation = await groq_service.explain_interaction_chain(chain_data, chain_id=chain_id)
    result = {"chain_id": chain_id, "explanation": explanation, "chain_data": chain_data}

    # Cache for 1 hour — explanations don't change
    cache_service.set(cache_key, result, ttl=3600)
    return result


@router.get("/chain/{chain_id}/stream")
async def stream_chain_explanation(chain_id: str):
    """
    SSE streaming endpoint for the typewriter effect on mobile.

    Returns a text/event-stream response where each Groq token is sent
    as an SSE 'data:' event. The mobile TypewriterText component reads
    these events and renders them character-by-character.

    chain_id format: 'perpetrator_id:victim_id:enzyme_name'
    """
    parts = chain_id.split(":")
    if len(parts) != 3:
        raise HTTPException(
            status_code=400,
            detail="Invalid chain ID. Use 'perpetrator_id:victim_id:enzyme_name'",
        )

    perpetrator_id, victim_id, enzyme_name = parts

    # Fetch chain data from Neo4j
    chain_data = await neo4j_service.get_chain_detail(
        perpetrator_id, victim_id, enzyme_name
    )
    if not chain_data:
        raise HTTPException(
            status_code=404,
            detail=f"Interaction chain '{chain_id}' not found in graph",
        )

    async def event_generator():
        """Yield SSE events from Groq streaming response."""
        full_text = []
        async for chunk in groq_service.stream_interaction_explanation(chain_data):
            full_text.append(chunk)
            yield f"data: {json.dumps({'text': chunk})}\n\n"

        # Final event with complete text
        yield f"data: {json.dumps({'done': True, 'full_text': ''.join(full_text)})}\n\n"

        # Cache the complete explanation for future non-streaming requests
        complete_explanation = "".join(full_text)
        cache_service.set(f"groq:chain:{chain_id}", complete_explanation, ttl=3600)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.get("/drug/{drugbank_id}")
async def explain_drug(drugbank_id: str):
    """Get a plain-English 2-sentence drug overview via Groq."""
    cache_key = f"explain_drug:{drugbank_id}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    drug = await neo4j_service.get_drug_by_id(drugbank_id)
    if not drug:
        raise HTTPException(status_code=404, detail=f"Drug '{drugbank_id}' not found")

    explanation = await groq_service.explain_drug(drug, drug_id=drugbank_id)
    result = {"drugbank_id": drugbank_id, "explanation": explanation}

    cache_service.set(cache_key, result, ttl=3600)
    return result


@router.get("/blast-radius/{enzyme_name}")
async def explain_blast_radius(
    enzyme_name: str,
    patient_id: str = Query(..., description="Patient ID to check medications against"),
):
    """
    Explain the downstream effects of a specific enzyme being inhibited,
    scoped to a patient's current medications.

    Uses Neo4j blast radius traversal + Groq for plain-English explanation.
    """
    # Get patient's medications
    meds = await neo4j_service.get_patient_medications(patient_id)
    med_names = [m["name"] for m in meds]

    if not med_names:
        raise HTTPException(
            status_code=404,
            detail=f"Patient '{patient_id}' has no medications",
        )

    # Get blast radius data from Neo4j
    blast_data = await neo4j_service.get_blast_radius(enzyme_name, med_names)
    if not blast_data:
        return {
            "enzyme": enzyme_name,
            "patient_id": patient_id,
            "explanation": f"No downstream effects found for {enzyme_name} with your current medications.",
            "blast_data": [],
        }

    explanation = await groq_service.explain_blast_radius(enzyme_name, blast_data)
    return {
        "enzyme": enzyme_name,
        "patient_id": patient_id,
        "explanation": explanation,
        "blast_data": blast_data,
    }


@router.get("/cache-stats")
async def get_cache_stats():
    """Return cache statistics for debugging. Not exposed in production."""
    return cache_service.stats
