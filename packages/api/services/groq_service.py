"""
Cascadex API — Groq Inference Service.

Plain-English explanations of drug interaction graph results via Groq.
Model: llama-3.1-70b-versatile (fastest large model on Groq)
"""

from groq import AsyncGroq
import json
import os


groq_client: AsyncGroq = None


def init_groq(api_key: str):
    """Initialize the Groq async client."""
    global groq_client
    groq_client = AsyncGroq(api_key=api_key)


INTERACTION_EXPLAIN_PROMPT = """
You are a clinical pharmacist explaining a drug interaction to a patient with no medical background.

The biochemical chain you must explain:
{chain_json}

Rules:
- Maximum 3 sentences
- No medical jargon. Use plain words.
- State: what drug interferes, how, and what happens to the other drug
- End with a simple recommended action (talk to your doctor/pharmacist)
- Tone: concerned but calm, not alarming

Respond with ONLY the explanation. No preamble, no "here is your explanation".
"""

DRUG_EXPLAIN_PROMPT = """
Explain this drug in 2 sentences for a patient with no medical background.
Drug data: {drug_json}
No jargon. Be clear and helpful.
Respond with ONLY the explanation.
"""


async def explain_interaction_chain(chain_data: dict) -> str:
    """
    Takes a Neo4j graph traversal result dict and returns
    a plain-English patient-facing explanation via Groq.
    """
    if groq_client is None:
        return "AI explanation unavailable — Groq not configured."

    response = await groq_client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": INTERACTION_EXPLAIN_PROMPT.format(
                chain_json=json.dumps(chain_data, indent=2, default=str)
            )
        }],
        model="llama-3.1-70b-versatile",
        max_tokens=200,
        temperature=0.3,  # Low temperature for clinical accuracy
        stream=False,
    )
    return response.choices[0].message.content


async def explain_drug(drug_data: dict) -> str:
    """Returns a plain-English 2-sentence drug overview for the patient."""
    if groq_client is None:
        return "AI explanation unavailable — Groq not configured."

    response = await groq_client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": DRUG_EXPLAIN_PROMPT.format(
                drug_json=json.dumps(drug_data, indent=2, default=str)
            )
        }],
        model="llama-3.1-70b-versatile",
        max_tokens=120,
        temperature=0.3,
    )
    return response.choices[0].message.content
