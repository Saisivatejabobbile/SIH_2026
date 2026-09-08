"""
WebRTC Signaling WebSocket
Handles real-time call signaling between peers
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
import logging
import json
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.call_session import CallSession
from app.auth.security import decode_access_token
from app.websockets.connection_manager import signaling_manager

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for active call sessions
active_calls: dict = {}  # call_id → CallSession


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


@router.websocket("/ws/signaling")
async def websocket_signaling(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebRTC Signaling WebSocket Endpoint
    
    Handles all WebRTC signaling messages:
    - call_initiate: Start a call
    - call_accept: Accept incoming call
    - call_reject: Reject incoming call
    - offer: WebRTC SDP offer
    - answer: WebRTC SDP answer
    - ice_candidate: ICE candidate
    - hangup: End call
    
    Connect: ws://localhost:8000/ws/signaling?token=YOUR_JWT_TOKEN
    """
    
    # Authenticate user
    user = await get_current_user_ws(token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning("WebSocket connection rejected: Invalid token")
        return
    
    # Connect user
    await signaling_manager.connect(websocket, user.id, {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email
    })
    
    # Update user online status
    user.is_online = True
    db.commit()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            logger.info(f"Received message from user {user.id}: {message_type}")
            
            # Handle different message types
            if message_type == "call_initiate":
                await handle_call_initiate(message, user, db)
            
            elif message_type == "call_accept":
                await handle_call_accept(message, user, db)
            
            elif message_type == "call_reject":
                await handle_call_reject(message, user, db)
            
            elif message_type == "offer":
                await handle_offer(message, user)
            
            elif message_type == "answer":
                await handle_answer(message, user)
            
            elif message_type == "ice_candidate":
                await handle_ice_candidate(message, user)
            
            elif message_type == "hangup":
                await handle_hangup(message, user, db)
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
    
    except WebSocketDisconnect:
        logger.info(f"User {user.id} disconnected from signaling")
    
    except Exception as e:
        logger.error(f"Error in WebSocket for user {user.id}: {e}")
    
    finally:
        # Cleanup on disconnect
        signaling_manager.disconnect(user.id)
        
        # Update user online status
        user.is_online = False
        user.last_seen = datetime.utcnow()
        db.commit()
        
        # End any active calls
        for call_id, call_session in list(active_calls.items()):
            if call_session.caller_id == user.id or call_session.callee_id == user.id:
                # Notify the other peer
                other_user_id = (
                    call_session.callee_id if call_session.caller_id == user.id 
                    else call_session.caller_id
                )
                await signaling_manager.send_personal_message({
                    "type": "hangup",
                    "call_id": call_id,
                    "reason": "peer_disconnected"
                }, other_user_id)
                
                # Remove call session
                del active_calls[call_id]


async def handle_call_initiate(message: dict, caller: User, db: Session):
    """
    Handle call initiation
    
    Message format:
    {
        "type": "call_initiate",
        "call_id": "call-123",
        "callee_id": 2
    }
    """
    call_id = message.get("call_id")
    callee_id = message.get("callee_id")
    
    if not call_id or not callee_id:
        logger.error("Missing call_id or callee_id in call_initiate")
        return
    
    # Get callee info
    callee = db.query(User).filter(User.id == callee_id).first()
    if not callee:
        logger.error(f"Callee {callee_id} not found")
        await signaling_manager.send_personal_message({
            "type": "error",
            "message": "User not found"
        }, caller.id)
        return
    
    # Check if callee is online
    if not signaling_manager.is_user_connected(callee_id):
        logger.warning(f"Callee {callee_id} is not online")
        await signaling_manager.send_personal_message({
            "type": "call_failed",
            "call_id": call_id,
            "reason": "user_offline"
        }, caller.id)
        return
    
    # Create call session
    call_session = CallSession(
        call_id=call_id,
        caller_id=caller.id,
        callee_id=callee.id,
        caller_name=caller.full_name,
        callee_name=callee.full_name
    )
    active_calls[call_id] = call_session
    
    logger.info(f"Call initiated: {caller.full_name} → {callee.full_name} (ID: {call_id})")
    
    # Send incoming_call to callee
    await signaling_manager.send_personal_message({
        "type": "incoming_call",
        "call_id": call_id,
        "from": caller.id,
        "caller_name": caller.full_name,
        "caller_email": caller.email
    }, callee_id)


async def handle_call_accept(message: dict, callee: User, db: Session):
    """
    Handle call acceptance
    
    Message format:
    {
        "type": "call_accept",
        "call_id": "call-123"
    }
    """
    call_id = message.get("call_id")
    
    if call_id not in active_calls:
        logger.error(f"Call {call_id} not found")
        return
    
    call_session = active_calls[call_id]
    call_session.set_state("ACCEPTED")
    
    logger.info(f"Call accepted: {call_id}")
    
    # Notify caller
    await signaling_manager.send_personal_message({
        "type": "call_accepted",
        "call_id": call_id,
        "by": callee.id
    }, call_session.caller_id)


async def handle_call_reject(message: dict, callee: User, db: Session):
    """
    Handle call rejection
    
    Message format:
    {
        "type": "call_reject",
        "call_id": "call-123"
    }
    """
    call_id = message.get("call_id")
    
    if call_id not in active_calls:
        logger.error(f"Call {call_id} not found")
        return
    
    call_session = active_calls[call_id]
    call_session.set_state("REJECTED")
    
    logger.info(f"Call rejected: {call_id}")
    
    # Notify caller
    await signaling_manager.send_personal_message({
        "type": "call_rejected",
        "call_id": call_id,
        "by": callee.id
    }, call_session.caller_id)
    
    # Remove call session
    del active_calls[call_id]


async def handle_offer(message: dict, caller: User):
    """
    Handle WebRTC offer
    
    Message format:
    {
        "type": "offer",
        "call_id": "call-123",
        "to": 2,
        "sdp": {...}
    }
    """
    call_id = message.get("call_id")
    to_user_id = message.get("to")
    sdp = message.get("sdp")
    
    if call_id not in active_calls:
        logger.error(f"Call {call_id} not found for offer")
        return
    
    call_session = active_calls[call_id]
    call_session.caller_offer = sdp
    
    logger.info(f"Forwarding offer from {caller.id} to {to_user_id}")
    
    # Forward offer to callee
    await signaling_manager.send_personal_message({
        "type": "offer",
        "call_id": call_id,
        "from": caller.id,
        "sdp": sdp
    }, to_user_id)


async def handle_answer(message: dict, callee: User):
    """
    Handle WebRTC answer
    
    Message format:
    {
        "type": "answer",
        "call_id": "call-123",
        "to": 1,
        "sdp": {...}
    }
    """
    call_id = message.get("call_id")
    to_user_id = message.get("to")
    sdp = message.get("sdp")
    
    if call_id not in active_calls:
        logger.error(f"Call {call_id} not found for answer")
        return
    
    call_session = active_calls[call_id]
    call_session.callee_answer = sdp
    call_session.set_state("CONNECTED")
    
    logger.info(f"Forwarding answer from {callee.id} to {to_user_id}")
    
    # Forward answer to caller
    await signaling_manager.send_personal_message({
        "type": "answer",
        "call_id": call_id,
        "from": callee.id,
        "sdp": sdp
    }, to_user_id)


async def handle_ice_candidate(message: dict, user: User):
    """
    Handle ICE candidate
    
    Message format:
    {
        "type": "ice_candidate",
        "call_id": "call-123",
        "to": 2,
        "candidate": {...}
    }
    """
    call_id = message.get("call_id")
    to_user_id = message.get("to")
    candidate = message.get("candidate")
    
    if call_id not in active_calls:
        logger.debug(f"Call {call_id} not found for ICE candidate (may have ended)")
        return
    
    call_session = active_calls[call_id]
    call_session.ice_candidates.append({
        "from": user.id,
        "to": to_user_id,
        "candidate": candidate
    })
    
    logger.debug(f"Forwarding ICE candidate from {user.id} to {to_user_id}")
    
    # Forward ICE candidate to peer
    await signaling_manager.send_personal_message({
        "type": "ice_candidate",
        "call_id": call_id,
        "from": user.id,
        "candidate": candidate
    }, to_user_id)


async def handle_hangup(message: dict, user: User, db: Session):
    """
    Handle call hangup
    
    Message format:
    {
        "type": "hangup",
        "call_id": "call-123"
    }
    """
    call_id = message.get("call_id")
    
    if call_id not in active_calls:
        logger.warning(f"Call {call_id} not found for hangup")
        return
    
    call_session = active_calls[call_id]
    call_session.set_state("ENDED")
    
    # Determine the other peer
    other_user_id = (
        call_session.callee_id if call_session.caller_id == user.id 
        else call_session.caller_id
    )
    
    logger.info(f"Call ended: {call_id} by user {user.id}")
    
    # Notify other peer
    await signaling_manager.send_personal_message({
        "type": "hangup",
        "call_id": call_id,
        "by": user.id
    }, other_user_id)
    
    # TODO: Save call history to database
    # For now, just remove the call session
    del active_calls[call_id]
