# Implementation Guide: Next 5 Tasks

**Status**: 14/77 tasks complete (18%)  
**Current Wave**: Backend AI + Frontend Hooks + Audio Processing

This guide provides complete, production-ready code for the 5 tasks that are ready to implement. Each section includes the full file content, test code, and integration instructions.

---

## Task 3.3: Risk Engine for Score Calculation

### File: `backend/app/services/risk_engine.py`

Create this new file with the following content:

```python
"""
Risk Engine for Voice Analysis
Calculates risk scores from AI model predictions
"""

import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class RiskEngine:
    """
    Analyzes AI model predictions and calculates risk scores.
    
    Requirements: 15.2, 15.3, 15.4
    """
    
    def __init__(
        self,
        low_threshold: int = 30,
        high_threshold: int = 70
    ):
        """
        Initialize Risk Engine with configurable thresholds.
        
        Args:
            low_threshold: Risk scores below this are LOW (default: 30)
            high_threshold: Risk scores above this are HIGH (default: 70)
        """
        self.low_threshold = low_threshold
        self.high_threshold = high_threshold
        
        logger.info(f"RiskEngine initialized (LOW<{low_threshold}, HIGH>={high_threshold})")
    
    def calculate_risk(self, model_prediction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk from AI model prediction.
        
        Args:
            model_prediction: Dict with keys:
                - synthetic_probability: float (0.0-1.0)
                - model_confidence: float (0.0-1.0)
                - acoustic_indicators: dict (optional)
                - prosody_indicators: dict (optional)
        
        Returns:
            dict: Risk analysis result with:
                - synthetic_confidence: float (0-100)
                - model_confidence: float (0-100)
                - risk_score: float (0-100)
                - risk_level: str ('LOW', 'MEDIUM', 'HIGH')
                - recommendation: str (context-aware message)
                - acoustic_indicators: dict (optional, from prediction)
                - prosody_indicators: dict (optional, from prediction)
                - timestamp: str (ISO format)
        """
        try:
            # Extract values from prediction
            synthetic_prob = model_prediction.get('synthetic_probability', 0.0)
            model_conf = model_prediction.get('model_confidence', 0.0)
            
            # Convert to 0-100 scale
            synthetic_confidence = synthetic_prob * 100
            model_confidence = model_conf * 100
            
            # Calculate risk score (0-100)
            risk_score = synthetic_confidence * (model_confidence / 100)
            
            # Determine risk level
            if risk_score < self.low_threshold:
                risk_level = 'LOW'
            elif risk_score < self.high_threshold:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'HIGH'
            
            # Generate context-aware recommendation
            recommendation = self._generate_recommendation(
                risk_level,
                risk_score,
                synthetic_confidence
            )
            
            # Build result
            result = {
                'synthetic_confidence': round(synthetic_confidence, 2),
                'model_confidence': round(model_confidence, 2),
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
                'recommendation': recommendation,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            
            # Include optional indicators if present
            if 'acoustic_indicators' in model_prediction:
                result['acoustic_indicators'] = model_prediction['acoustic_indicators']
            
            if 'prosody_indicators' in model_prediction:
                result['prosody_indicators'] = model_prediction['prosody_indicators']
            
            logger.debug(f"Risk calculated: {risk_level} (score={risk_score:.1f})")
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating risk: {e}")
            # Return safe fallback
            return {
                'synthetic_confidence': 0.0,
                'model_confidence': 0.0,
                'risk_score': 0.0,
                'risk_level': 'UNKNOWN',
                'recommendation': 'Unable to analyze call at this time',
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'error': str(e)
            }
    
    def _generate_recommendation(
        self,
        risk_level: str,
        risk_score: float,
        synthetic_confidence: float
    ) -> str:
        """Generate context-aware recommendation based on risk level."""
        
        if risk_level == 'LOW':
            return "Voice appears natural. Continue conversation normally."
        
        elif risk_level == 'MEDIUM':
            if synthetic_confidence < 40:
                return "Voice authenticity uncertain. Exercise caution and verify caller identity."
            else:
                return "Moderate synthetic indicators detected. Verify caller through alternative means."
        
        else:  # HIGH
            if synthetic_confidence > 80:
                return "⚠️ HIGH RISK: Strong synthetic voice indicators. Do not share sensitive information."
            else:
                return "⚠️ HIGH RISK: Voice authenticity questionable. End call if suspicious."


# Singleton instance
_risk_engine = None

def get_risk_engine() -> RiskEngine:
    """Get singleton Risk Engine instance."""
    global _risk_engine
    if _risk_engine is None:
        _risk_engine = RiskEngine()
    return _risk_engine
```

### Update: `backend/app/services/__init__.py`

Add RiskEngine to the exports:

```python
from .ai_model_client import AIModelClient, MockAIModelClient, get_ai_client
from .call_session_manager import CallSessionManager
from .risk_engine import RiskEngine, get_risk_engine

__all__ = [
    'AIModelClient',
    'MockAIModelClient',
    'get_ai_client',
    'CallSessionManager',
    'RiskEngine',
    'get_risk_engine',
]
```

### Test: `backend/test_risk_engine.py`

Create this test file:

```python
"""Test Risk Engine"""
import sys
sys.path.insert(0, 'app')

from services.risk_engine import RiskEngine

def test_risk_engine():
    engine = RiskEngine()
    
    # Test LOW risk
    low_pred = {'synthetic_probability': 0.15, 'model_confidence': 0.90}
    result = engine.calculate_risk(low_pred)
    assert result['risk_level'] == 'LOW'
    print(f"✓ LOW risk: {result['risk_score']:.1f} - {result['recommendation']}")
    
    # Test MEDIUM risk
    med_pred = {'synthetic_probability': 0.50, 'model_confidence': 0.88}
    result = engine.calculate_risk(med_pred)
    assert result['risk_level'] == 'MEDIUM'
    print(f"✓ MEDIUM risk: {result['risk_score']:.1f} - {result['recommendation']}")
    
    # Test HIGH risk
    high_pred = {'synthetic_probability': 0.85, 'model_confidence': 0.92}
    result = engine.calculate_risk(high_pred)
    assert result['risk_level'] == 'HIGH'
    print(f"✓ HIGH risk: {result['risk_score']:.1f} - {result['recommendation']}")
    
    print("\n✓✓✓ All RiskEngine tests passed!")

if __name__ == '__main__':
    test_risk_engine()
```

**Run test:**
```bash
cd backend
python test_risk_engine.py
```

---

## Task 3.4: AudioBuffer for Transient Audio Storage

### File: `backend/app/services/audio_buffer.py`

Create this new file:

```python
"""
AudioBuffer for Transient Audio Storage
Bounded in-memory buffer for audio processing
"""

import logging
from collections import deque
from typing import List

logger = logging.getLogger(__name__)


class AudioBuffer:
    """
    Bounded ring buffer for transient audio storage.
    
    Stores audio samples in memory with automatic cleanup.
    Maximum duration prevents unbounded memory growth.
    
    Requirements: 11.6, 13.1, 13.2, 13.5
    """
    
    def __init__(
        self,
        sample_rate: int = 16000,
        max_duration_seconds: int = 30
    ):
        """
        Initialize audio buffer.
        
        Args:
            sample_rate: Audio sample rate (default: 16000 Hz)
            max_duration_seconds: Maximum buffer duration (default: 30s)
        """
        self.sample_rate = sample_rate
        self.max_duration_seconds = max_duration_seconds
        
        # Calculate maximum samples
        self.max_samples = sample_rate * max_duration_seconds
        
        # Use deque for efficient ring buffer (O(1) append/pop)
        self.buffer = deque(maxlen=self.max_samples)
        
        logger.info(
            f"AudioBuffer initialized: {sample_rate}Hz, "
            f"max {max_duration_seconds}s ({self.max_samples:,} samples)"
        )
    
    def append(self, pcm_chunk: List[int]) -> None:
        """
        Append PCM audio chunk to buffer.
        
        Uses ring buffer - old samples automatically dropped when full.
        
        Args:
            pcm_chunk: List of Int16 PCM samples
        """
        self.buffer.extend(pcm_chunk)
        
        logger.debug(
            f"Appended {len(pcm_chunk)} samples "
            f"(buffer: {len(self.buffer)}/{self.max_samples})"
        )
    
    def get_window(self, duration_seconds: float) -> List[int]:
        """
        Extract recent audio window from buffer.
        
        Args:
            duration_seconds: Duration of window to extract (e.g., 3.0 for 3 seconds)
        
        Returns:
            List[int]: PCM samples from recent window (may be shorter if buffer < duration)
        """
        # Calculate number of samples needed
        num_samples = int(self.sample_rate * duration_seconds)
        
        # Get most recent samples (up to num_samples)
        window_size = min(num_samples, len(self.buffer))
        
        if window_size == 0:
            return []
        
        # Extract from end of buffer
        window = list(self.buffer)[-window_size:]
        
        logger.debug(
            f"Extracted {len(window)} samples "
            f"({duration_seconds}s window)"
        )
        
        return window
    
    def clear(self) -> None:
        """Clear buffer and release memory."""
        sample_count = len(self.buffer)
        self.buffer.clear()
        
        logger.info(f"AudioBuffer cleared ({sample_count:,} samples released)")
    
    def get_duration(self) -> float:
        """Get current buffer duration in seconds."""
        return len(self.buffer) / self.sample_rate
    
    def get_sample_count(self) -> int:
        """Get current number of samples in buffer."""
        return len(self.buffer)
    
    def is_full(self) -> bool:
        """Check if buffer is at maximum capacity."""
        return len(self.buffer) >= self.max_samples
```

### Update: `backend/app/services/__init__.py`

Add AudioBuffer to exports:

```python
from .audio_buffer import AudioBuffer

# Add to __all__
__all__ = [
    # ... existing exports ...
    'AudioBuffer',
]
```

### Test: `backend/test_audio_buffer.py`

Create this test file:

```python
"""Test AudioBuffer"""
import sys
sys.path.insert(0, 'app')

from services.audio_buffer import AudioBuffer

def test_audio_buffer():
    # Create buffer (1 second max for testing)
    buffer = AudioBuffer(sample_rate=16000, max_duration_seconds=1)
    
    # Test append
    chunk = [100] * 8000  # 0.5 seconds
    buffer.append(chunk)
    assert buffer.get_sample_count() == 8000
    print(f"✓ Appended 8000 samples, duration: {buffer.get_duration():.2f}s")
    
    # Test window extraction
    window = buffer.get_window(0.3)  # 300ms window
    assert len(window) == 4800  # 16000 * 0.3
    print(f"✓ Extracted 300ms window: {len(window)} samples")
    
    # Test ring buffer (overflow)
    buffer.append([200] * 16000)  # Fill completely
    assert buffer.is_full()
    print(f"✓ Buffer full at {buffer.get_sample_count()} samples")
    
    # Test clear
    buffer.clear()
    assert buffer.get_sample_count() == 0
    print("✓ Buffer cleared")
    
    print("\n✓✓✓ All AudioBuffer tests passed!")

if __name__ == '__main__':
    test_audio_buffer()
```

**Run test:**
```bash
cd backend
python test_audio_buffer.py
```

---

## Task 5.2: useWebRTC Hook Core State Management

### File: `frontend/src/hooks/useWebRTC.js`

Create this new file:

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

// Call states
export const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  FAILED: 'failed',
};

/**
 * useWebRTC Hook - Core State Management
 * 
 * Manages WebRTC call state, streams, and peer connections.
 * Requirements: 2.7, 5.5, 7.1, 7.2
 */
export const useWebRTC = () => {
  // Call state management
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Refs for WebRTC objects (don't trigger re-renders)
  const peerConnectionRef = useRef(null);
  const durationIntervalRef = useRef(null);
  
  /**
   * Call state machine transitions
   */
  const transitionToState = useCallback((newState) => {
    console.log(`Call state transition: ${callState} → ${newState}`);
    setCallState(newState);
    
    // Handle state-specific side effects
    if (newState === CALL_STATES.CONNECTED) {
      // Start call duration counter
      setCallDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    if (newState === CALL_STATES.ENDED || newState === CALL_STATES.FAILED) {
      // Stop duration counter
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [callState]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('useWebRTC cleanup: stopping streams and closing connections');
      
      // Stop duration counter
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      
      // Stop local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped local track: ${track.kind}`);
        });
      }
      
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        console.log('Peer connection closed');
      }
    };
  }, [localStream]);
  
  /**
   * Format call duration (seconds → MM:SS)
   */
  const formatDuration = useCallback(() => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [callDuration]);
  
  return {
    // State
    callState,
    currentCallId,
    localStream,
    remoteStream,
    isMuted,
    callDuration,
    
    // Setters (for other hooks to use)
    setCallState: transitionToState,
    setCurrentCallId,
    setLocalStream,
    setRemoteStream,
    setIsMuted,
    
    // Refs
    peerConnectionRef,
    
    // Utils
    formatDuration,
  };
};

export default useWebRTC;
```

### Update: `frontend/src/constants.js` (or create if doesn't exist)

```javascript
// Call states
export const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  FAILED: 'failed',
};
```

---

## Task 6.1: useWebSocket Hook for Signaling

### File: `frontend/src/hooks/useWebSocket.js`

Create this new file:

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useWebSocket Hook
 * 
 * Manages WebSocket connections with reconnection logic.
 * Requirements: 1.1, 1.5, 9.4
 */
export const useWebSocket = (url, token) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds
  
  /**
   * Register message handler
   */
  const onMessage = useCallback((messageType, handler) => {
    if (!messageHandlersRef.current.has(messageType)) {
      messageHandlersRef.current.set(messageType, []);
    }
    messageHandlersRef.current.get(messageType).push(handler);
    
    // Return cleanup function
    return () => {
      const handlers = messageHandlersRef.current.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }, []);
  
  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      const { type } = message;
      
      console.log(`WebSocket received: ${type}`, message);
      
      // Call registered handlers for this message type
      const handlers = messageHandlersRef.current.get(type) || [];
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${type}:`, error);
        }
      });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);
  
  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((message) => {
    if (wsRef.current && isConnected) {
      const jsonMessage = JSON.stringify(message);
      wsRef.current.send(jsonMessage);
      console.log(`WebSocket sent: ${message.type}`, message);
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }, [isConnected]);
  
  /**
   * Attempt reconnection with exponential backoff
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      setConnectionState('failed');
      return;
    }
    
    reconnectAttemptsRef.current += 1;
    const delay = baseReconnectDelay * reconnectAttemptsRef.current;
    
    console.log(
      `Attempting reconnect ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms...`
    );
    
    setConnectionState('reconnecting');
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, []);
  
  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!url || !token) {
      console.warn('WebSocket URL or token not provided');
      return;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnectionState('connecting');
    
    try {
      const wsUrl = `${url}?token=${token}`;
      console.log(`WebSocket connecting to: ${url}`);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected: ${url}`);
        setConnectionState('connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.onmessage = handleMessage;
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log(`WebSocket closed: ${url}`);
        setConnectionState('disconnected');
        setIsConnected(false);
        
        // Attempt reconnection
        attemptReconnect();
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionState('disconnected');
      attemptReconnect();
    }
  }, [url, token, handleMessage, attemptReconnect]);
  
  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    console.log('WebSocket disconnecting...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);
  
  /**
   * Auto-connect on mount and when URL/token changes
   */
  useEffect(() => {
    if (url && token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url, token]);
  
  return {
    isConnected,
    connectionState,
    sendMessage,
    onMessage,
    connect,
    disconnect,
  };
};

export default useWebSocket;
```

---

## Task 7.1: AudioWorklet Processor Script

### File: `frontend/public/audioProcessor.js`

Create this new file in the `public` folder:

```javascript
/**
 * AudioWorklet Processor for Real-time Audio Processing
 * 
 * Processes audio in 128-sample quantums, accumulates to buffer,
 * converts to Int16 PCM, detects voice activity, and sends to main thread.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

class VoiceShieldAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Configuration
    this.bufferSize = 4096;  // Accumulate 4096 samples before sending
    this.targetSampleRate = 16000;  // Target sample rate (16kHz)
    this.vadThreshold = 0.01;  // Voice activity detection threshold
    
    // State
    this.buffer = [];
    this.currentSampleRate = sampleRate;  // Global sampleRate from AudioContext
    
    console.log(
      `AudioProcessor initialized: ${this.currentSampleRate}Hz → ${this.targetSampleRate}Hz, ` +
      `buffer=${this.bufferSize}, VAD=${this.vadThreshold}`
    );
  }
  
  /**
   * Process audio (called for each 128-sample quantum)
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    // No input channels - skip processing
    if (!input || input.length === 0) {
      return true;
    }
    
    // Get first channel (mono)
    const inputChannel = input[0];
    
    // Convert to mono if stereo
    let monoSamples;
    if (input.length > 1) {
      monoSamples = this.convertToMono(input);
    } else {
      monoSamples = inputChannel;
    }
    
    // Resample to target rate if needed
    let processedSamples;
    if (this.currentSampleRate !== this.targetSampleRate) {
      processedSamples = this.resample(monoSamples, this.currentSampleRate, this.targetSampleRate);
    } else {
      processedSamples = monoSamples;
    }
    
    // Accumulate samples
    for (let i = 0; i < processedSamples.length; i++) {
      this.buffer.push(processedSamples[i]);
    }
    
    // Send when buffer is full
    if (this.buffer.length >= this.bufferSize) {
      this.sendBuffer();
    }
    
    // Return true to keep processor alive
    return true;
  }
  
  /**
   * Convert stereo to mono (average of channels)
   */
  convertToMono(channels) {
    const length = channels[0].length;
    const mono = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let c = 0; c < channels.length; c++) {
        sum += channels[c][i];
      }
      mono[i] = sum / channels.length;
    }
    
    return mono;
  }
  
  /**
   * Simple linear interpolation resampling
   */
  resample(samples, fromRate, toRate) {
    if (fromRate === toRate) {
      return samples;
    }
    
    const ratio = toRate / fromRate;
    const newLength = Math.floor(samples.length * ratio);
    const resampled = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i / ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, samples.length - 1);
      const fraction = srcIndex - srcIndexFloor;
      
      // Linear interpolation
      resampled[i] = samples[srcIndexFloor] * (1 - fraction) +
                     samples[srcIndexCeil] * fraction;
    }
    
    return resampled;
  }
  
  /**
   * Detect voice activity using energy-based VAD
   */
  detectVoiceActivity(samples) {
    // Calculate RMS (Root Mean Square) energy
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);
    
    // Voice detected if energy exceeds threshold
    return rms > this.vadThreshold;
  }
  
  /**
   * Convert Float32 samples to Int16 PCM
   */
  floatToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1] and scale to Int16 range
      const clamped = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = Math.round(clamped * 32767);
    }
    
    return int16Array;
  }
  
  /**
   * Send accumulated buffer to main thread
   */
  sendBuffer() {
    const samples = new Float32Array(this.buffer);
    
    // Detect voice activity
    const hasSpeech = this.detectVoiceActivity(samples);
    
    // Convert to Int16 PCM
    const pcmData = this.floatToInt16(samples);
    
    // Send to main thread
    this.port.postMessage({
      type: 'pcm_chunk',
      data: pcmData,
      timestamp: currentTime,
      hasSpeech: hasSpeech,
    });
    
    // Clear buffer
    this.buffer = [];
  }
}

// Register processor
registerProcessor('voiceshield-audio-processor', VoiceShieldAudioProcessor);
```

---

## Testing All 5 Tasks

### Backend Tests

Run these commands in the `backend` directory:

```bash
# Test Risk Engine
python test_risk_engine.py

# Test AudioBuffer
python test_audio_buffer.py

# Integration test (AI → Risk flow)
python -c "
from app.services import get_ai_client, get_risk_engine
import asyncio

async def test():
    client = get_ai_client(use_mock=True)
    engine = get_risk_engine()
    
    pred = await client.predict(b'test_audio', 16000)
    risk = engine.calculate_risk(pred)
    
    print(f'✓ AI → Risk pipeline works!')
    print(f'  Risk: {risk[\"risk_level\"]} (score={risk[\"risk_score\"]:.1f})')
    print(f'  Recommendation: {risk[\"recommendation\"]}')

asyncio.run(test())
"
```

### Frontend Tests

1. **Check hooks are importable:**

Open browser console after starting frontend and run:

```javascript
// Check if hooks can be imported
import { useWebRTC } from './hooks/useWebRTC.js';
import { useWebSocket } from './hooks/useWebSocket.js';
console.log('✓ Hooks loaded successfully');
```

2. **Check AudioWorklet file is accessible:**

Open browser console:

```javascript
fetch('/audioProcessor.js')
  .then(r => r.text())
  .then(t => console.log('✓ AudioProcessor accessible:', t.length, 'bytes'))
  .catch(e => console.error('✗ AudioProcessor not found:', e));
```

---

## Integration Checklist

Use this checklist to verify all tasks are complete:

- [ ] **Task 3.3**: `backend/app/services/risk_engine.py` created
- [ ] **Task 3.3**: `test_risk_engine.py` passes
- [ ] **Task 3.4**: `backend/app/services/audio_buffer.py` created
- [ ] **Task 3.4**: `test_audio_buffer.py` passes
- [ ] **Task 3.3 & 3.4**: Both exported in `backend/app/services/__init__.py`
- [ ] **Task 5.2**: `frontend/src/hooks/useWebRTC.js` created
- [ ] **Task 6.1**: `frontend/src/hooks/useWebSocket.js` created
- [ ] **Task 7.1**: `frontend/public/audioProcessor.js` created
- [ ] **Integration**: AI → Risk pipeline test passes
- [ ] **Integration**: Frontend hooks importable
- [ ] **Integration**: AudioWorklet file accessible at `/audioProcessor.js`
- [ ] **Git**: All changes committed
- [ ] **Git**: Code pushed to GitHub

---

## Next Steps After Completion

Once all 5 tasks are complete and tested, the next ready tasks will be:

**Wave 4 tasks (will become ready):**
- Task 2.4: Signaling message routing logic
- Task 3.5: Audio processing pipeline handler
- Task 5.3: Microphone access and local stream management
- Task 5.4: Peer connection creation and setup
- Task 7.2: useAudioProcessor hook

These represent the next layer of the implementation, building on the foundation established by tasks 3.3, 3.4, 5.2, 6.1, and 7.1.

---

## Estimated Implementation Time

- **Backend tasks (3.3, 3.4)**: 30-45 minutes (includes testing)
- **Frontend hooks (5.2, 6.1)**: 30-45 minutes
- **AudioWorklet (7.1)**: 15-20 minutes
- **Testing & integration**: 15-20 minutes

**Total**: ~2 hours for all 5 tasks

---

## Tips for Implementation

1. **Start with backend** (tasks 3.3, 3.4) since they're faster to test
2. **Test each component individually** before integration
3. **Run tests after each file creation** to catch issues early
4. **Use the integration tests** to verify end-to-end flow
5. **Commit after each task completes** to preserve working state

---

**Ready to implement? Start with Task 3.3 (Risk Engine) - it's the quickest!** 🚀
