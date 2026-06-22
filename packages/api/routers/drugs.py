"""
Cascadex API — Drug Router.

Endpoints for drug lookup, search, and barcode scanning.
"""

from fastapi import APIRouter, HTTPException

from ..services.fda_service import lookup_drug_by_ndc
from ..services.neo4j_service import neo4j_service

router = APIRouter()


@router.get("/lookup")
async def lookup_drug(name: str):
    """Search for a drug by name in the Neo4j graph."""
    results = await neo4j_service.lookup_drug_by_name(name)
    if not results:
        raise HTTPException(status_code=404, detail=f"No drug found matching '{name}'")
    return results


@router.get("/search")
async def search_drugs(q: str):
    """Search for drugs via fulltext index. Returns empty array if none found."""
    results = await neo4j_service.search_drugs_fulltext(q)
    return results


@router.get("/barcode/{ndc}")
async def lookup_barcode(ndc: str):
    """Look up a drug by its NDC barcode via OpenFDA."""
    result = await lookup_drug_by_ndc(ndc)
    if not result:
        raise HTTPException(status_code=404, detail=f"No drug found for NDC '{ndc}'")
    return result


@router.get("/{drugbank_id}")
async def get_drug_detail(drugbank_id: str):
    """Get full drug details from the Neo4j graph by DrugBank ID."""
    drug = await neo4j_service.get_drug_by_id(drugbank_id)
    if not drug:
        raise HTTPException(status_code=404, detail=f"Drug '{drugbank_id}' not found")
    return drug
