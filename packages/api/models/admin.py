"""
Cascadex API — Admin Pydantic Models.

Request/response models for the Base44 pharmacist portal endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PrescribeCheckRequest(BaseModel):
    """Request body for the prescribe-check simulation tool."""
    patient_id: str = Field(..., description="Patient UUID")
    new_drug_id: str = Field(..., description="DrugBank ID of drug to simulate adding")


class PrescribeCheckResponse(BaseModel):
    """Response from prescribe-check simulation."""
    patient_id: str
    new_drug_id: str
    new_interactions_count: int = 0
    interactions: list = Field(default_factory=list)
    risk_level: str = "safe"
    recommendation: str = ""


class AdminStats(BaseModel):
    """Dashboard-level statistics for the pharmacist portal."""
    total_patients: int = 0
    total_interactions: int = 0
    high_risk_patients: int = 0
    total_medications_tracked: int = 0


class AdminPatientSummary(BaseModel):
    """Patient summary for the portal patient list table."""
    id: str
    age_range: Optional[str] = None
    weight_range: Optional[str] = None
    med_count: int = 0
    interaction_count: int = 0
    critical_alerts: int = 0
    moderate_alerts: int = 0
    risk_score: int = 0
    created_at: Optional[datetime] = None


class AdminPatientDetail(BaseModel):
    """Detailed patient view for the portal, includes graph + meds + alerts."""
    patient_id: str
    graph: dict = Field(default_factory=dict)
    medications: list = Field(default_factory=list)
    alerts: list = Field(default_factory=list)
