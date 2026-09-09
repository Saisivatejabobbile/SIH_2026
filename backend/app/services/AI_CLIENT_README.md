# AI Model Client Documentation

## Overview

This module provides client interfaces for external AI voice analysis models used in the WebRTC Voice Calling feature. It includes both production and development implementations.

## Components

### AIModelClient (Task 3.1)

Base class for interfacing with external AI model APIs. Handles:
- Secure API key management (backend-only)
- HTTP requests with proper authentication
- Error handling and fallback behavior
- Request timeout management

**Configuration** (in `app/config.py`):
```python
MODEL_API_URL: str = "https://api.voicemodel.example.com/predict"
MODEL_API_KEY: str = "your-api-key-here"
MODEL_TIMEOUT_SECONDS: int = 10
```

**Usage**:
```python
from app.services import AIModelClient

client = AIModelClient()
result = await client.predict(audio_data, sample_rate=16000)
```

**Response Format**:
```python
{
    "synthetic_probability": 0.75,  # 0.0-1.0
    "model_confidence": 0.92,       # 0.0-1.0
    "acoustic_indicators": {        # Optional
        "spectral_anomaly": 0.45,
        "harmonic_distortion": 0.32,
        # ... more indicators
    },
    "prosody_indicators": {         # Optional
        "rhythm_consistency": 0.78,
        "pitch_naturalness": 0.85,
        # ... more indicators
    }
}
```

### MockAIModelClient (Task 3.2)

Development implementation that generates realistic mock predictions without requiring external API access.

**Features**:
- ✓ Random synthetic_probability: 0.05-0.85
- ✓ Random model_confidence: 0.85-0.98
- ✓ Realistic acoustic indicators
- ✓ Realistic prosody indicators
- ✓ Simulated network delay (0.5s)
- ✓ No API key required

**Usage**:
```python
from app.services import MockAIModelClient

client = MockAIModelClient()
result = await client.predict(audio_data, sample_rate=16000)
# Returns realistic random predictions
```

### Factory Function

Use `get_ai_client()` to automatically select the appropriate implementation:

```python
from app.services import get_ai_client

# Development mode (uses mock)
client = get_ai_client(use_mock=True)

# Production mode (uses real API if key available)
client = get_ai_client(use_mock=False)
```

## Requirements Mapping

### Requirement 15.1: Backend AI Model Integration
- ✓ AI model API calls handled exclusively by backend
- ✓ API credentials stored in backend environment
- ✓ Frontend has no access to API keys
- ✓ Backend forwards audio to AI model API

### Requirement 15.2: Risk Analysis Integration
- ✓ Processes audio data received by backend
- ✓ Sends data to AI model API
- ✓ Returns analysis results with confidence scores

## Integration Example

```python
from app.services import get_ai_client
from app.services import RiskEngine

# Initialize clients
ai_client = get_ai_client(use_mock=True)  # Development
risk_engine = RiskEngine()

# Process audio chunk
async def analyze_audio(audio_data: bytes):
    # Get AI prediction
    prediction = await ai_client.predict(audio_data, sample_rate=16000)
    
    # Calculate risk
    risk_result = risk_engine.calculate_risk(prediction)
    
    return risk_result
```

## Error Handling

The AIModelClient includes robust error handling:

1. **Timeout**: Returns fallback prediction if API doesn't respond
2. **HTTP Errors**: Returns fallback prediction on 4xx/5xx errors
3. **Network Errors**: Returns fallback prediction on connection failures

**Fallback Response**:
```python
{
    "synthetic_probability": 0.0,
    "model_confidence": 0.0,
    "error": "Model temporarily unavailable"
}
```

## Security Features

- ✓ API keys never exposed to frontend
- ✓ All credentials stored in backend environment
- ✓ Secure header-based authentication
- ✓ No raw audio data logged or cached

## Testing

Run the test suite:
```bash
python test_ai_client.py
```

Tests validate:
- Correct value ranges for predictions
- Presence of optional indicators
- Network delay simulation
- Fallback behavior
- Factory function behavior

## Production Deployment

For production deployment:

1. Set environment variables:
   ```env
   MODEL_API_URL=https://your-ai-api.com/predict
   MODEL_API_KEY=your-secure-api-key
   MODEL_TIMEOUT_SECONDS=10
   ```

2. Use production client:
   ```python
   client = get_ai_client(use_mock=False)
   ```

3. Ensure API key is kept secure and never committed to version control

## Architecture Notes

This implementation follows the design specification in `.kiro/specs/webrtc-voice-calling/design.md`:

- Backend-only AI integration for security
- Transient audio processing (no persistent storage)
- Modular design for easy testing and mocking
- Clear separation between development and production modes

## Related Files

- `/backend/app/services/ai_model_client.py` - Implementation
- `/backend/app/services/__init__.py` - Exports
- `/backend/app/config.py` - Configuration
- `/backend/test_ai_client.py` - Test suite
- `/.kiro/specs/webrtc-voice-calling/tasks.md` - Task definitions
