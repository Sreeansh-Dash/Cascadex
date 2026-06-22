"""
Cascadex API — Groq Inference Service.

Plain-English explanations of drug interaction graph results via Groq.
Model: llama-3.1-70b-versatile (fastest large model on Groq)

Groq explains, Neo4j finds. This service ONLY translates graph traversal
results into human language — it never deduces interactions from training data.
"""

import json
import logging
from typing import AsyncGenerator

from groq import AsyncGroq

from .cache_service import cache_service

logger = logging.getLogger(__name__)

groq_client: AsyncGroq = None

# Cache TTL: explanations don't change, so cache for 1 hour
EXPLANATION_CACHE_TTL = 3600


def init_groq(api_key: str):
    """Initialize the Groq async client."""
    global groq_client
    groq_client = AsyncGroq(api_key=api_key)


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

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

BLAST_RADIUS_PROMPT = """
You are a clinical pharmacist explaining what happens in the body when a specific enzyme is blocked.

Enzyme: {enzyme_name}
Downstream effects data:
{blast_json}

Rules:
- Maximum 4 sentences
- Explain in simple terms: which drugs are affected, what builds up or gets blocked, and what the patient might experience
- End with a recommended action
- Tone: informative and calm

Respond with ONLY the explanation. No preamble.
"""

FALLBACK_EXPLANATION = (
    "We're unable to generate an AI explanation right now. "
    "Please consult your pharmacist or doctor for details about this interaction."
)

FALLBACK_DRUG_EXPLANATION = (
    "AI explanation is temporarily unavailable. Ask your pharmacist for information about this medication."
)


# ---------------------------------------------------------------------------
# Core explanation functions (with caching and error handling)
# ---------------------------------------------------------------------------


async def explain_interaction_chain(chain_data: dict, chain_id: str = None) -> str:
    """
    Takes a Neo4j graph traversal result dict and returns
    a plain-English patient-facing explanation via Groq.

    Results are cached by chain_id if provided.
    """
    # Check cache first if we have a cache key
    if chain_id:
        cache_key = f"groq:chain:{chain_id}"
        cached = cache_service.get(cache_key)
        if cached is not None:
            return cached

    if groq_client is None:
        return FALLBACK_EXPLANATION

    try:
        response = await groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": INTERACTION_EXPLAIN_PROMPT.format(
                        chain_json=json.dumps(chain_data, indent=2, default=str)
                    ),
                }
            ],
            model="llama-3.1-70b-versatile",
            max_tokens=200,
            temperature=0.3,  # Low temperature for clinical accuracy
            stream=False,
        )
        explanation = response.choices[0].message.content

        # Cache the result
        if chain_id:
            cache_service.set(f"groq:chain:{chain_id}", explanation, ttl=EXPLANATION_CACHE_TTL)

        return explanation

    except Exception as e:
        logger.error("Groq API error for chain explanation: %s", e)
        return FALLBACK_EXPLANATION


async def explain_drug(drug_data: dict, drug_id: str = None) -> str:
    """Returns a plain-English 2-sentence drug overview for the patient."""
    # Check cache first
    if drug_id:
        cache_key = f"groq:drug:{drug_id}"
        cached = cache_service.get(cache_key)
        if cached is not None:
            return cached

    if groq_client is None:
        return FALLBACK_DRUG_EXPLANATION

    try:
        response = await groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": DRUG_EXPLAIN_PROMPT.format(drug_json=json.dumps(drug_data, indent=2, default=str)),
                }
            ],
            model="llama-3.1-70b-versatile",
            max_tokens=120,
            temperature=0.3,
        )
        explanation = response.choices[0].message.content

        if drug_id:
            cache_service.set(f"groq:drug:{drug_id}", explanation, ttl=EXPLANATION_CACHE_TTL)

        return explanation

    except Exception as e:
        logger.error("Groq API error for drug explanation: %s", e)
        return FALLBACK_DRUG_EXPLANATION


async def explain_blast_radius(enzyme_name: str, blast_data: list) -> str:
    """
    Explain the downstream effects of an enzyme being inhibited.
    Used by the enzyme detail screen.
    """
    cache_key = f"groq:blast:{enzyme_name}"
    cached = cache_service.get(cache_key)
    if cached is not None:
        return cached

    if groq_client is None:
        return FALLBACK_EXPLANATION

    try:
        response = await groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": BLAST_RADIUS_PROMPT.format(
                        enzyme_name=enzyme_name, blast_json=json.dumps(blast_data, indent=2, default=str)
                    ),
                }
            ],
            model="llama-3.1-70b-versatile",
            max_tokens=250,
            temperature=0.3,
        )
        explanation = response.choices[0].message.content
        cache_service.set(cache_key, explanation, ttl=EXPLANATION_CACHE_TTL)
        return explanation

    except Exception as e:
        logger.error("Groq API error for blast radius explanation: %s", e)
        return FALLBACK_EXPLANATION


# ---------------------------------------------------------------------------
# Streaming explanation (for typewriter effect on mobile)
# ---------------------------------------------------------------------------


async def stream_interaction_explanation(chain_data: dict) -> AsyncGenerator[str, None]:
    """
    Async generator that yields Groq response chunks for SSE streaming.
    Used by the /explain/chain/{id}/stream endpoint for the typewriter effect.
    """
    if groq_client is None:
        yield FALLBACK_EXPLANATION
        return

    try:
        stream = await groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": INTERACTION_EXPLAIN_PROMPT.format(
                        chain_json=json.dumps(chain_data, indent=2, default=str)
                    ),
                }
            ],
            model="llama-3.1-70b-versatile",
            max_tokens=200,
            temperature=0.3,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

    except Exception as e:
        logger.error("Groq streaming error: %s", e)
        yield FALLBACK_EXPLANATION
