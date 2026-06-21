import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

class AIExtractor:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found in environment. AI Extraction will fail.")
        self.client = Groq(api_key=self.api_key)

    def extract_interaction_details(self, drug1: str, drug2: str, description: str) -> dict | None:
        """
        Uses Groq (Llama 3) to extract structured interaction data from an NLM text description.
        Expected JSON schema:
        {
          "enzyme": "CYP2D6" | "CYP3A4" | null,
          "mechanism": "INHIBITS" | "INDUCES" | "SUBSTRATE_OF" | null,
          "perpetrator": "Drug Name",
          "victim": "Drug Name",
          "severity": "critical" | "moderate"
        }
        """
        system_prompt = (
            "You are a clinical pharmacologist AI. You extract structured data from drug interaction descriptions.\n"
            "Identify if an enzyme (especially a CYP450 enzyme) is mentioned.\n"
            "Identify the 'perpetrator' (the drug causing the effect, e.g., the inhibitor or inducer) and the 'victim' (the drug whose metabolism is affected).\n"
            "Determine the mechanism: INHIBITS, INDUCES, or SUBSTRATE_OF.\n"
            "Estimate severity: 'critical' if it significantly increases risk of adverse effects or decreases efficacy, 'moderate' otherwise.\n"
            "Respond ONLY with valid JSON, no markdown formatting."
        )

        user_prompt = f"Drugs: {drug1}, {drug2}\nDescription: {description}\n\nExtract JSON:"

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            logger.error(f"Groq Extraction failed for {drug1}-{drug2}: {e}")
            return None

    def generate_interactions(self, drug: str) -> list:
        """
        Uses Groq to generate real clinical interactions for a given drug from its own weights.
        """
        system_prompt = (
            "You are a clinical pharmacologist AI. Provide exactly 3 to 5 highly accurate, known real-world drug-drug interactions involving the requested drug.\n"
            "At least some interactions MUST involve CYP450 enzymes.\n"
            "Identify the 'perpetrator' (inhibitor/inducer) and 'victim' (substrate).\n"
            "Determine the mechanism (INHIBITS, INDUCES, SUBSTRATE_OF).\n"
            "Severity must be 'critical' or 'moderate'.\n"
            "Respond ONLY with valid JSON in the requested schema, no markdown."
        )

        user_prompt = f"Generate 5 interactions for the drug: {drug}\n\nJSON Schema:\n{{\"interactions\": [{{\"perpetrator\": \"\", \"victim\": \"\", \"enzyme\": \"\", \"mechanism\": \"\", \"severity\": \"\", \"description\": \"\"}}]}}"

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            return result.get("interactions", [])
        except Exception as e:
            logger.error(f"Groq Generation failed for {drug}: {e}")
            return []
