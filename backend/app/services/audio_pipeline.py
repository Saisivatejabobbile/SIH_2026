"""
Audio Processing Pipeline Handler
Processes audio chunks through AI analysis and risk calculation
"""

import logging
from typing import Dict
import asyncio

from app.services.audio_buffer import AudioBuffer
from app.services.ai_model_client import AIModelClient
from app.services.risk_engine import RiskEngine
from app.websockets.connection_manager import ConnectionManager

logger = logging.getLogger(__name__)


async def process_audio_chunk(
    call_id: str,
    pcm_data: list,
    sample_rate: int,
    audio_buffers: Dict[str, AudioBuffer],
    ai_client: AIModelClient,
    risk_engine: RiskEngine,
    connection_manager: ConnectionManager,
    receiver_user_id: int
) -> None:
    """
    Process audio chunk through AI analysis pipeline.
    
    Flow:
    1. Get or create audio buffer for this call
    2. Append PCM data to buffer
    3. Extract 3-second analysis window
    4. Send to AI model for prediction
    5. Calculate risk score
    6. Send risk update to receiver
    
    Requirements: 11.2, 11.4, 11.5, 15.1, 15.4, 15.5
    
    Args:
        call_id: Unique identifier for the call
        pcm_data: Int16 PCM samples from audio
        sample_rate: Audio sample rate (Hz)
        audio_buffers: Dict mapping call_id to AudioBuffer instances
        ai_client: AI model client for predictions
        risk_engine: Risk calculation engine
        connection_manager: WebSocket connection manager
        receiver_user_id: User ID to send risk updates to
    """
    try:
        # Get or create audio buffer for this call
        if call_id not in audio_buffers:
            audio_buffers[call_id] = AudioBuffer(
                sample_rate=sample_rate,
                max_duration_seconds=30
            )
            logger.info(f"Created audio buffer for call {call_id}")
        
        buffer = audio_buffers[call_id]
        
        # Append new audio data
        buffer.append(pcm_data)
        logger.debug(
            f"Appended {len(pcm_data)} samples to buffer for call {call_id} "
            f"(total: {buffer.get_sample_count()} samples, {buffer.get_duration():.2f}s)"
        )
        
        # Only analyze if we have at least 3 seconds of audio
        if buffer.get_duration() < 3.0:
            logger.debug(f"Insufficient audio for analysis ({buffer.get_duration():.2f}s < 3.0s)")
            return
        
        # Extract 3-second window for analysis
        analysis_window = buffer.get_window(3.0)
        logger.debug(f"Extracted {len(analysis_window)} samples for analysis")
        
        # Convert to bytes for AI model
        audio_bytes = bytes(analysis_window)
        
        # Call AI model for prediction
        logger.debug(f"Sending audio to AI model for call {call_id}")
        prediction = await ai_client.predict(audio_bytes, sample_rate)
        
        # Calculate risk from prediction
        risk_result = risk_engine.calculate_risk(prediction)
        
        logger.info(
            f"Risk analysis for call {call_id}: {risk_result['risk_level']} "
            f"(score={risk_result['risk_score']:.1f})"
        )
        
        # Send risk update to receiver
        await connection_manager.send_personal_message({
            "type": "risk_update",
            "call_id": call_id,
            "synthetic_confidence": risk_result['synthetic_confidence'],
            "model_confidence": risk_result['model_confidence'],
            "risk_score": risk_result['risk_score'],
            "risk_level": risk_result['risk_level'],
            "recommendation": risk_result['recommendation'],
            "acoustic_indicators": risk_result.get('acoustic_indicators'),
            "prosody_indicators": risk_result.get('prosody_indicators'),
            "timestamp": risk_result['timestamp']
        }, receiver_user_id)
        
        logger.debug(f"Risk update sent to user {receiver_user_id} for call {call_id}")
    
    except Exception as e:
        logger.error(
            f"Error processing audio chunk for call {call_id}: {e}",
            exc_info=True
        )
        
        # Send error notification to receiver (optional)
        try:
            await connection_manager.send_personal_message({
                "type": "analysis_error",
                "call_id": call_id,
                "message": "Audio analysis temporarily unavailable"
            }, receiver_user_id)
        except Exception as send_error:
            logger.error(f"Failed to send error notification: {send_error}")
