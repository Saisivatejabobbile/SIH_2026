"""
Calls Router
Handles call history and session information
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.call_history import CallHistory
from app.schemas.call import CallHistoryResponse
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/history", response_model=List[CallHistoryResponse])
async def get_call_history(
    limit: int = 50,
    offset: int = 0,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get call history for current user
    
    - **limit**: Maximum number of records to return (default: 50)
    - **offset**: Number of records to skip (default: 0)
    - **risk_level**: Filter by risk level (LOW, MEDIUM, HIGH)
    
    Returns calls where user was either caller or callee
    """
    query = db.query(CallHistory).filter(
        (CallHistory.caller_id == current_user.id) | 
        (CallHistory.callee_id == current_user.id)
    )
    
    # Filter by risk level if provided
    if risk_level:
        query = query.filter(CallHistory.risk_level == risk_level.upper())
    
    # Order by most recent first
    query = query.order_by(CallHistory.ended_at.desc())
    
    # Apply pagination
    calls = query.offset(offset).limit(limit).all()
    
    return calls


@router.get("/{call_id}", response_model=CallHistoryResponse)
async def get_call_by_id(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get specific call details by call_id
    
    Returns complete call history record including risk analysis
    """
    call = db.query(CallHistory).filter(CallHistory.call_id == call_id).first()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    # Verify user was participant in this call
    if call.caller_id != current_user.id and call.callee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this call record"
        )
    
    return call


@router.get("/stats/summary")
async def get_call_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get call statistics summary for current user
    
    Returns:
    - Total calls
    - Calls by risk level (LOW, MEDIUM, HIGH)
    - Average call duration
    """
    # Get all calls for user
    calls = db.query(CallHistory).filter(
        (CallHistory.caller_id == current_user.id) | 
        (CallHistory.callee_id == current_user.id)
    ).all()
    
    total_calls = len(calls)
    
    # Count by risk level
    low_risk = sum(1 for call in calls if call.risk_level == "LOW")
    medium_risk = sum(1 for call in calls if call.risk_level == "MEDIUM")
    high_risk = sum(1 for call in calls if call.risk_level == "HIGH")
    
    # Calculate average duration
    durations = [call.duration for call in calls if call.duration]
    avg_duration = sum(durations) / len(durations) if durations else 0
    
    return {
        "total_calls": total_calls,
        "by_risk_level": {
            "LOW": low_risk,
            "MEDIUM": medium_risk,
            "HIGH": high_risk
        },
        "average_duration": int(avg_duration)
    }


@router.delete("/{call_id}")
async def delete_call_history(
    call_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a call history record
    
    Only the caller can delete the call record
    """
    call = db.query(CallHistory).filter(CallHistory.call_id == call_id).first()
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    # Only caller can delete
    if call.caller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the caller can delete this record"
        )
    
    db.delete(call)
    db.commit()
    
    return {
        "message": "Call history deleted",
        "call_id": call_id
    }
