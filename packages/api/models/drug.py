"""
Cascadex API — Drug Pydantic Models.
"""

from typing import Optional

from pydantic import BaseModel


class DrugBase(BaseModel):
    drugbank_id: str
    name: str
    drug_class: Optional[str] = None


class DrugDetail(DrugBase):
    brand_names: Optional[list[str]] = None
    half_life: Optional[str] = None
    bioavailability: Optional[str] = None
    molecular_weight: Optional[float] = None
    description: Optional[str] = None


class DrugSearchResult(BaseModel):
    drugbank_id: str
    name: str
    drug_class: Optional[str] = None


class NDCLookupResult(BaseModel):
    ndc: Optional[str] = None
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
