"""
Cascadex API — Patient Pydantic Models.
"""

from typing import Optional

from pydantic import BaseModel


class PatientCreate(BaseModel):
    age_range: Optional[str] = None
    weight_range: Optional[str] = None


class PatientProfile(BaseModel):
    id: str
    age_range: Optional[str] = None
    weight_range: Optional[str] = None
    created_at: Optional[str] = None


class MedicationAdd(BaseModel):
    drugbank_id: str
    dose: Optional[str] = None
    frequency: Optional[str] = None
    indication: Optional[str] = None


class MedicationInfo(BaseModel):
    drugbank_id: str
    name: str
    drug_class: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[str] = None
