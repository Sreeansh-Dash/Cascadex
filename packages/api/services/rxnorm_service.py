"""
Cascadex API — RxNorm Drug Name Normalization Service.

Normalizes drug names to their canonical RxNorm representation.
API docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html
Free REST API, no key required.
"""

from typing import Optional

import httpx

RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST"


async def normalize_drug_name(name: str) -> Optional[str]:
    """
    Normalize a drug name via RxNorm API.
    Returns the canonical name, or None if not found.
    """
    url = f"{RXNORM_BASE}/rxcui.json"
    params = {"name": name, "search": 1}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                id_group = data.get("idGroup", {})
                rxnorm_ids = id_group.get("rxnormId", [])
                if rxnorm_ids:
                    # Get the canonical name for the first RxCUI
                    rxcui = rxnorm_ids[0]
                    name_resp = await client.get(f"{RXNORM_BASE}/rxcui/{rxcui}/properties.json")
                    if name_resp.status_code == 200:
                        props = name_resp.json().get("properties", {})
                        return props.get("name")
            return None
        except httpx.HTTPError:
            return None


async def get_drug_interactions_rxnorm(rxcui: str) -> list:
    """
    Get known drug interactions from RxNorm for a given RxCUI.
    Note: This is supplementary — Neo4j graph traversal is the primary method.
    """
    url = f"{RXNORM_BASE}/interaction/interaction.json"
    params = {"rxcui": rxcui}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                interactions = []
                for group in data.get("interactionTypeGroup", []):
                    for itype in group.get("interactionType", []):
                        for pair in itype.get("interactionPair", []):
                            interactions.append({
                                "description": pair.get("description"),
                                "severity": pair.get("severity"),
                            })
                return interactions
            return []
        except httpx.HTTPError:
            return []
