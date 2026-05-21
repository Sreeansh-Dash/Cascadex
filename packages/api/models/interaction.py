"""
Cascadex API — Interaction Pydantic Models.
"""

from typing import Optional

from pydantic import BaseModel


class InteractionChain(BaseModel):
    perpetrator: str
    perpetrator_id: str
    victim_drug: str
    victim_id: str
    via_enzyme: str
    enzyme_family: Optional[str] = None
    interaction_type: str
    strengths: list[str] = []
    consequence: str
    severity: Optional[str] = None


class InteractionAlert(BaseModel):
    perpetrator: str
    victim_drug: str
    via_enzyme: str
    severity: str
    consequence: str


class SimulationResult(BaseModel):
    new_drug: str
    affected_drug: str
    via_enzyme: str
    mechanism: str
    strength: Optional[str] = None
