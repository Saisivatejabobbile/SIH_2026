"""
Call Schemas
Pydantic models for call-related requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class CallInitiate(BaseModel):
    """Schema for initiating a call"""
    callee_id: int = Field(..., description="ID of user to call")


class CallAccept(BaseModel):
    """Schema for accepting a call"""
    call_id: str


class CallReject(BaseModel):
    """Schema for rejecting a call"""
    call_id: str


class CallHistoryResponse(BaseModel):
    """Schema for call history response"""
    id: int
    call_id: str
    caller_id: int
    callee_id: int
    started_at: datetime
    connected_at: Optional[datetime]
    ended_at: datetime
    duration: Optional[int]
    final_state: str
    risk_level: Optional[str]
    risk_score: Optional[float]
    synthetic_confidence: Optional[float]
    model_confidence: Optional[float]
    recommendation: Optional[str]
    acoustic_indicators: Optional[Dict[str, Any]]
    prosody_indicators: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class RiskAnalysisUpdate(BaseModel):
    """Schema for risk analysis update"""
    risk_level: str = Field(..., description="Risk level: LOW, MEDIUM, HIGH")
    risk_score: float = Field(..., ge=0, le=100, description="Risk score 0-100")
    synthetic_confidence: float = Field(..., ge=0, le=100)
    model_confidence: float = Field(..., ge=0, le=100)
    recommendation: str
    acoustic_indicators: Optional[Dict[str, Any]] = None
    prosody_indicators: Optional[Dict[str, Any]] = None
