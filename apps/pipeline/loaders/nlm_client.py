import logging
import time

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NLMClient:
    def __init__(self):
        self.base_url = "https://rxnav.nlm.nih.gov/REST"

    def get_rxcui(self, drug_name: str) -> str | None:
        """Fetch RxCUI for a drug name."""
        try:
            url = f"{self.base_url}/rxcui.json"
            response = requests.get(url, params={"name": drug_name})
            response.raise_for_status()
            data = response.json()

            rxnorm_ids = data.get("idGroup", {}).get("rxnormId")
            if rxnorm_ids:
                return rxnorm_ids[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching RxCUI for {drug_name}: {e}")
            return None

    def get_interactions(self, rxcui: str) -> list[dict]:
        """Fetch all interactions for a given RxCUI from DrugBank/ONCHigh."""
        try:
            url = f"{self.base_url}/interaction/interaction.json"
            response = requests.get(url, params={"rxcui": rxcui, "sources": "DrugBank"})
            response.raise_for_status()
            data = response.json()

            interactions = []
            groups = data.get("interactionTypeGroup", [])
            for group in groups:
                for int_type in group.get("interactionType", []):
                    for pair in int_type.get("interactionPair", []):
                        concepts = pair.get("interactionConcept", [])
                        if len(concepts) == 2:
                            drug1 = concepts[0].get("minConceptItem", {}).get("name")
                            drug2 = concepts[1].get("minConceptItem", {}).get("name")
                            desc = pair.get("description", "")

                            interactions.append({
                                "drug1": drug1,
                                "drug2": drug2,
                                "description": desc
                            })

            # Sleep to respect rate limits
            time.sleep(0.1)
            return interactions

        except Exception as e:
            logger.error(f"Error fetching interactions for RxCUI {rxcui}: {e}")
            return []
