from typing import Optional, Dict, List
from pydantic import BaseModel, Field


class ComplaintIn(BaseModel):
    sub_category: str = Field(..., examples=["Garbage dump"])
    ward: str = Field(..., examples=["Jogupalya"])
    status: str = Field("Registered", examples=["Registered"])
    staff_remarks: Optional[str] = Field(None, examples=["1st Assigned"])
    staff_name: Optional[str] = Field(None, description="'Name/Designation', designation is taken after the slash", examples=["Durga Prasad/AE"])
    designation: Optional[str] = Field(None, examples=["AE"])
    age_hours: Optional[float] = Field(None, ge=0)
    save: bool = True


class Factor(BaseModel):
    feature: str
    impact: float


class PredictionOut(BaseModel):
    id: Optional[int] = None
    priority: str
    confidence: float
    probabilities: Dict[str, float]
    reason: Optional[str] = None
    factors: List[Factor] = []
