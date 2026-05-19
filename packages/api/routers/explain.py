"""
Cascadex API — Explain Router.

Endpoints for Groq-powered plain-English explanations of drug interactions.
"""

from fastapi import APIRouter, HTTPException

from ..services.neo4j_service import neo4j_service
from ..services import groq_service
from ..services.cache_service import cache_service

router = APIRouter()


@router.get("/chain/{chain_id}")
async def explain_chain(chain_id: str):
    """
    Get a plain-English explanation of an interaction chain via Groq.
    chain_id format: 'perpetrator_id:victim_id:enzyme_name'
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

    chain_data = {
        "perpetrator_id": parts[0],
        "victim_id": parts[1],
        "enzyme_name": parts[2],
        "chain_id": chain_id,
    }

    explanation = await groq_service.explain_interaction_chain(chain_data)
    result = {"chain_id": chain_id, "explanation": explanation}

    # Cache for 1 hour — explanations don't change
    cache_service.set(cache_key, result, ttl=3600)
    return result


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

    explanation = await groq_service.explain_drug(drug)
    result = {"drugbank_id": drugbank_id, "explanation": explanation}

    cache_service.set(cache_key, result, ttl=3600)
    return result
