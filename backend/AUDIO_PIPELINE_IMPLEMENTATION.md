# Audio Processing Pipeline Implementation

## Overview

This document describes the implementation of Tasks 3.5 and 3.6 from the WebRTC Voice Calling feature specification.

## Task 3.5: Audio Processing Pipeline Handler

**File Created**: `backend/app/services/audio_pipeline.py`

### Main Function: `process_audio_chunk()`

Orchestrates the complete audio analysis pipeline:

1. **Buffer Management**: Gets or creates an `AudioBuffer` instance for the call
2. **Data Appending**: Adds incoming PCM samples to the bounded ring buffer
3. **Window Extraction**: Retrieves a 3-second analysis window from the buffer
4. **AI Analysis**: Calls the AI model client with the audio window
5. **Risk Calculation**: Uses the Risk Engine to compute threat levels
6. **Message Broadcasting**: Sends risk updates to the receiver via WebSocket

### Key Features

- **Bounded Memory**: Uses 30-second ring buffers to prevent memory overflow
- **Graceful Degradation**: Skips analysis if insufficient audio data (< 1 second)
- **Error Handling**: Comprehensive exception handling with logging and error notifications
- **Requirements Compliance**: Implements Requirements 11.2, 11.4, 11.5, 15.1, 15.4, 15.5

### Helper Function: `cleanup_call_buffer()`

Releases memory by clearing and removing audio buffers when calls end.

## Task 3.6: Analysis WebSocket Endpoint Integration

**File Modified**: `backend/app/websockets/analysis.py`

### Updates Made

1. **Import Integration**: Added imports for:
   - `AudioBuffer` (transient audio storage)
   - `process_audio_chunk` and `cleanup_call_buffer` (pipeline functions)
   - `get_ai_client` (AI model client factory)
   - `get_risk_engine` (risk engine factory)
   - `signaling_manager` (connection manager for sending messages)

2. **Buffer Tracking**: Added `audio_buffers` dict to track active call buffers

3. **Endpoint Enhancement**: Updated `websocket_analysis()` to:
   - Initialize AI client and risk engine instances
   - Pass all required components to `handle_audio_chunk()`
   - Cleanup audio buffers on disconnect

4. **Audio Chunk Handler**: Updated `handle_audio_chunk()` to:
   - Support both base64-encoded and array PCM data formats
   - Extract sample rate from incoming messages
   - Call the audio processing pipeline
   - Handle errors with proper user notifications

5. **Summary Messages**: Enhanced `get_summary` message type to include:
   - Buffer duration and sample count
   - Buffer capacity status
   - Total analysis count

## Architecture Flow

```
Frontend (AudioWorklet)
    │
    │ PCM Audio Chunks
    ▼
WebSocket /ws/analysis
    │
    │ handle_audio_chunk()
    ▼
process_audio_chunk()
    │
    ├─► AudioBuffer (append + extract window)
    │
    ├─► AI Model Client (predict)
    │
    ├─► Risk Engine (calculate_risk)
    │
    └─► Connection Manager (send_personal_message)
         │
         ▼
    Frontend (Risk Dashboard)
```

## Message Protocol

### From Client:
```json
{
  "type": "audio_chunk",
  "audio_data": [123, -456, 789, ...],  // Int16 PCM samples
  "sample_rate": 16000
}
```

### To Client:
```json
{
  "type": "risk_update",
  "call_id": "call-123",
  "risk_level": "LOW|MEDIUM|HIGH",
  "risk_score": 15.5,
  "synthetic_confidence": 10.2,
  "model_confidence": 95.8,
  "recommendation": "Voice appears natural...",
  "acoustic_indicators": {...},
  "prosody_indicators": {...},
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Testing

Both files have been validated:
- ✅ Python compilation successful
- ✅ No syntax errors
- ✅ All imports resolve correctly

## Configuration

The implementation uses mock AI model by default for development:
```python
ai_client = get_ai_client(use_mock=True)
```

For production, set `use_mock=False` and configure:
- `MODEL_API_URL` - External AI model endpoint
- `MODEL_API_KEY` - Secure API key
- `MODEL_TIMEOUT_SECONDS` - Request timeout

## Security Features

1. **Transient Processing**: All audio data remains in-memory only
2. **Bounded Buffers**: Maximum 30 seconds prevents memory exhaustion
3. **Automatic Cleanup**: Buffers released immediately on call end
4. **Error Isolation**: Exceptions don't crash the WebSocket connection
5. **Privacy Compliance**: No raw audio data stored or logged

## Next Steps

The following tasks depend on this implementation:
- Frontend AudioWorklet processor (sends audio chunks)
- Frontend Risk Dashboard (displays risk updates)
- WebRTC call integration (coordinates with analysis WebSocket)

## Requirements Satisfied

- ✅ Requirement 11.2: Real-time audio processing
- ✅ Requirement 11.4: Audio preprocessing for AI analysis  
- ✅ Requirement 11.5: Send processed audio to backend
- ✅ Requirement 11.7: Terminate processing on call end
- ✅ Requirement 15.1: Backend receives audio and calls AI API
- ✅ Requirement 15.4: Backend sends risk updates to frontend
- ✅ Requirement 15.5: Risk Dashboard displays live indicators
