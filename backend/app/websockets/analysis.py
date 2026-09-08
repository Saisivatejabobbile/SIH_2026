"""
Audio Analysis WebSocket
Receives PCM audio chunks and broadcasts AI risk analysis
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, Dict
import logging
import json
import asyncio
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.auth.security import decode_access_token
from app.services.ai_analyzer import get_analyzer

router = APIRouter()
logger = logging.getLogger(__name__)


# Track active analysis sessions
# call_id → {"caller_ws": WebSocket, "callee_ws": WebSocket, "analysis_count": int}
active_analysis_sessions: Dict[str, dict] = {}


async def get_current_user_ws(
    token: str = Query(...),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user from WebSocket token query parameter
    
    Args:
        token: JWT token from query string
        db: Database session
        
    Returns:
        User object or None if invalid
    """
    payload = decode_access_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


@router.websocket("/ws/analysis")
async def websocket_analysis(
    websocket: WebSocket,
    token: str = Query(...),
    call_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Audio Analysis WebSocket Endpoint
    
    Receives PCM audio chunks from frontend and broadcasts risk analysis.
    
    Messages from client:
    {
        "type": "audio_chunk",
        "call_id": "call-123",
        "audio_data": [base64 encoded PCM data or array]
    }
    
    Messages to client:
    {
        "type": "risk_update",
        "call_id": "call-123",
        "risk_level": "LOW|MEDIUM|HIGH",
        "risk_score": 15.5,
        "synthetic_confidence": 10.2,
        "model_confidence": 95.8,
        "recommendation": "...",
        "acoustic_indicators": {...},
        "prosody_indicators": {...},
        "timestamp": "2025-01-15T10:30:00Z"
    }
    
    {
        "type": "analysis_status",
        "state": "ANALYZING|IDLE|ERROR",
        "message": "Processing audio..."
    }
    
    Connect: ws://localhost:8000/ws/analysis?token=JWT&call_id=call-123
    """
    
    # Authenticate user
    user = await get_current_user_ws(token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning("Analysis WebSocket rejected: Invalid token")
        return
    
    # Accept connection
    await websocket.accept()
    logger.info(f"User {user.id} ({user.full_name}) connected to analysis for call {call_id}")
    
    # Initialize analysis session for this call if not exists
    if call_id not in active_analysis_sessions:
        active_analysis_sessions[call_id] = {
            "websockets": [],
            "analysis_count": 0,
            "started_at": datetime.utcnow()
        }
    
    # Add this WebSocket to the session
    active_analysis_sessions[call_id]["websockets"].append({
        "user_id": user.id,
        "websocket": websocket
    })
    
    # Get AI analyzer
    analyzer = get_analyzer()
    
    # Send initial status
    await websocket.send_json({
        "type": "analysis_status",
        "state": "READY",
        "message": "Audio analysis ready"
    })
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "audio_chunk":
                await handle_audio_chunk(message, call_id, analyzer, websocket)
            
            elif message_type == "start_analysis":
                await websocket.send_json({
                    "type": "analysis_status",
                    "state": "ANALYZING",
                    "message": "Starting audio analysis"
                })
                logger.info(f"Analysis started for call {call_id}")
            
            elif message_type == "stop_analysis":
                await websocket.send_json({
                    "type": "analysis_status",
                    "state": "STOPPED",
                    "message": "Audio analysis stopped"
                })
                logger.info(f"Analysis stopped for call {call_id}")
            
            elif message_type == "get_summary":
                summary = analyzer.get_analysis_summary()
                await websocket.send_json({
                    "type": "analysis_summary",
                    **summary
                })
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
    
    except WebSocketDisconnect:
        logger.info(f"User {user.id} disconnected from analysis")
    
    except Exception as e:
        logger.error(f"Error in analysis WebSocket for user {user.id}: {e}")
    
    finally:
        # Cleanup on disconnect
        if call_id in active_analysis_sessions:
            # Remove this WebSocket from session
            active_analysis_sessions[call_id]["websockets"] = [
                ws for ws in active_analysis_sessions[call_id]["websockets"]
                if ws["user_id"] != user.id
            ]
            
            # If no more WebSockets, remove session
            if not active_analysis_sessions[call_id]["websockets"]:
                logger.info(f"All users disconnected from analysis for call {call_id}")
                del active_analysis_sessions[call_id]


async def handle_audio_chunk(
    message: dict,
    call_id: str,
    analyzer,
    sender_websocket: WebSocket
):
    """
    Handle incoming audio chunk
    
    Args:
        message: Message with audio data
        call_id: Call ID
        analyzer: AI analyzer instance
        sender_websocket: WebSocket that sent the audio
    """
    audio_data = message.get("audio_data")
    
    if not audio_data:
        logger.warning("Received audio_chunk without audio_data")
        return
    
    # Increment analysis count
    if call_id in active_analysis_sessions:
        active_analysis_sessions[call_id]["analysis_count"] += 1
        count = active_analysis_sessions[call_id]["analysis_count"]
    else:
        count = 1
    
    # Log every 10th chunk to avoid spam
    if count % 10 == 0:
        logger.info(f"Processing audio chunk #{count} for call {call_id}")
    
    try:
        # Convert audio data to bytes if needed
        # In production, audio_data would be base64 encoded PCM
        # For mock, we just pass it to analyzer
        audio_bytes = audio_data if isinstance(audio_data, bytes) else b""
        
        # Analyze audio with AI model
        analysis_result = analyzer.analyze_audio_chunk(audio_bytes)
        
        # Add metadata
        analysis_result["call_id"] = call_id
        analysis_result["timestamp"] = datetime.utcnow().isoformat()
        analysis_result["chunk_number"] = count
        
        # Create risk update message
        risk_update = {
            "type": "risk_update",
            **analysis_result
        }
        
        # Broadcast to all WebSockets in this call's analysis session
        if call_id in active_analysis_sessions:
            await broadcast_to_call(call_id, risk_update)
        
        # Log significant risk changes
        if analysis_result["risk_level"] in ["MEDIUM", "HIGH"]:
            logger.warning(
                f"⚠️  {analysis_result['risk_level']} risk detected in call {call_id}: "
                f"Score={analysis_result['risk_score']:.1f}%"
            )
    
    except Exception as e:
        logger.error(f"Error analyzing audio chunk: {e}")
        
        # Send error status
        await sender_websocket.send_json({
            "type": "analysis_status",
            "state": "ERROR",
            "message": f"Analysis error: {str(e)}"
        })


async def broadcast_to_call(call_id: str, message: dict):
    """
    Broadcast a message to all WebSockets in a call's analysis session
    
    Args:
        call_id: Call ID
        message: Message to broadcast
    """
    if call_id not in active_analysis_sessions:
        return
    
    session = active_analysis_sessions[call_id]
    disconnected = []
    
    for ws_info in session["websockets"]:
        try:
            await ws_info["websocket"].send_json(message)
        except Exception as e:
            logger.error(f"Error broadcasting to user {ws_info['user_id']}: {e}")
            disconnected.append(ws_info)
    
    # Remove disconnected WebSockets
    for ws_info in disconnected:
        session["websockets"].remove(ws_info)


def get_active_analysis_count() -> int:
    """
    Get number of active analysis sessions
    
    Returns:
        int: Number of active sessions
    """
    return len(active_analysis_sessions)


def get_session_info(call_id: str) -> Optional[dict]:
    """
    Get information about an analysis session
    
    Args:
        call_id: Call ID
        
    Returns:
        dict: Session info or None
    """
    if call_id not in active_analysis_sessions:
        return None
    
    session = active_analysis_sessions[call_id]
    return {
        "call_id": call_id,
        "connected_users": len(session["websockets"]),
        "analysis_count": session["analysis_count"],
        "duration": (datetime.utcnow() - session["started_at"]).total_seconds()
    }
