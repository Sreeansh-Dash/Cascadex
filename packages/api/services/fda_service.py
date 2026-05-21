"""
Cascadex API — OpenFDA NDC Lookup Service.

Looks up drug information from barcode NDC codes via the OpenFDA API.
API docs: https://open.fda.gov/apis/drug/ndc/
No API key required, but rate-limited to 240 requests/minute.
"""

from typing import Optional

import httpx

FDA_BASE = "https://api.fda.gov"


async def lookup_drug_by_ndc(ndc: str) -> Optional[dict]:
    """
    Look up a drug by its NDC (National Drug Code) barcode value.
    Returns drug name and basic info, or None if not found.
    """
    url = f"{FDA_BASE}/drug/ndc.json"
    params = {"search": f'product_ndc:"{ndc}"', "limit": 1}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    result = results[0]
                    return {
                        "ndc": result.get("product_ndc"),
                        "brand_name": result.get("brand_name"),
                        "generic_name": result.get("generic_name"),
                        "dosage_form": result.get("dosage_form"),
                        "route": result.get("route", []),
                        "manufacturer": result.get("labeler_name"),
                        "active_ingredients": result.get("active_ingredients", []),
                    }
            return None
        except httpx.HTTPError:
            return None


async def search_drug_by_name(name: str) -> list:
    """
    Search OpenFDA for drugs by brand or generic name.
    Returns a list of matching drugs.
    """
    url = f"{FDA_BASE}/drug/ndc.json"
    params = {
        "search": f'brand_name:"{name}" OR generic_name:"{name}"',
        "limit": 5,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                return [
                    {
                        "ndc": r.get("product_ndc"),
                        "brand_name": r.get("brand_name"),
                        "generic_name": r.get("generic_name"),
                        "dosage_form": r.get("dosage_form"),
                    }
                    for r in results
                ]
            return []
        except httpx.HTTPError:
            return []
