"""
Cascadex API — Graph Visualization Pydantic Models.
"""

from typing import Optional

from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'drug', 'enzyme', 'metabolite', 'receptor'
    # Type-specific fields
    drug_class: Optional[str] = None
    family: Optional[str] = None
    active: Optional[bool] = None
    effect: Optional[str] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str
    strength: Optional[str] = None


class PatientGraph(BaseModel):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
