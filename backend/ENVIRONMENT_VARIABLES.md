# Backend Environment Variables Documentation

## WebRTC Voice Calling Configuration

This document describes the environment variables added for the WebRTC voice calling feature with AI-powered voice analysis.

## New Environment Variables (Task 11.1)

### AI Model API Configuration

#### `MODEL_API_URL`
- **Type**: String (URL)
- **Default**: `https://api.voicemodel.example.com/predict`
- **Purpose**: URL endpoint for the external AI voice analysis service
- **Requirements**: Requirement 12.1 (Backend AI Model Integration)
- **Security**: This endpoint should be HTTPS in production
- **Example**: `https://api.deepfake-detector.com/v1/analyze`

#### `MODEL_API_KEY`
- **Type**: String (Secret)
- **Default**: Empty string (must be set)
- **Purpose**: API key for authenticating with the AI model service
- **Requirements**: Requirement 12.1 (Backend AI Model Integration)
- **Security**: 
  - ⚠️ **KEEP SECRET** - Never commit to version control
  - Never expose to frontend
  - Store in backend environment only
  - Rotate regularly in production
- **Example**: `your_api_key_here_12345`

#### `MODEL_TIMEOUT_SECONDS`
- **Type**: Integer
- **Default**: `10`
- **Purpose**: Timeout for AI model API calls in seconds
- **Requirements**: Requirement 12.7 (Error handling for AI failures)
- **Recommended Values**:
  - Development: 10 seconds
  - Production: 5-15 seconds (depending on API SLA)
- **Behavior**: If timeout is exceeded, the system will return a fallback risk assessment

### Risk Analysis Configuration

#### `RISK_LOW_THRESHOLD`
- **Type**: Integer (0-100)
- **Default**: `30`
- **Purpose**: Risk scores below this threshold are categorized as LOW
- **Requirements**: Requirement 15.2 (Risk categorization)
- **Risk Levels**:
  - **LOW (0-30)**: Voice appears natural, continue normally
  - **MEDIUM (31-70)**: Some synthetic indicators detected
  - **HIGH (71-100)**: Possible synthetic voice detected
- **Customization**: Adjust based on your organization's risk tolerance

#### `RISK_HIGH_THRESHOLD`
- **Type**: Integer (0-100)
- **Default**: `70`
- **Purpose**: Risk scores above this threshold are categorized as HIGH
- **Requirements**: Requirement 15.2 (Risk categorization)
- **Note**: Scores between `RISK_LOW_THRESHOLD` and `RISK_HIGH_THRESHOLD` are MEDIUM

### WebRTC Configuration (Already Existed)

#### `STUN_SERVER_URL`
- **Type**: String (URL)
- **Default**: `stun:stun.l.google.com:19302`
- **Purpose**: STUN server for NAT traversal in WebRTC connections
- **Requirements**: Requirement 10.1 (NAT Traversal)
- **Note**: Google's public STUN server is used by default

## Configuration Files Updated

### 1. `.env` (Development)
```env
# AI Model API (External)
MODEL_API_URL=https://api.voicemodel.example.com/predict
MODEL_API_KEY=sk_test_placeholder_change_in_production
MODEL_TIMEOUT_SECONDS=10

# Risk Analysis
RISK_LOW_THRESHOLD=30
RISK_HIGH_THRESHOLD=70
```

### 2. `.env.example` (Template with Documentation)
```env
# AI Model API (External - Required for WebRTC Voice Analysis)
# URL endpoint for the external AI voice analysis service
MODEL_API_URL=https://api.voicemodel.example.com/predict
# API key for authenticating with the AI model service (KEEP SECRET!)
MODEL_API_KEY=your-api-key-here
# Timeout for AI model API calls in seconds (default: 10)
MODEL_TIMEOUT_SECONDS=10

# Risk Analysis Thresholds
# Risk scores below this threshold are considered LOW (0-30)
RISK_LOW_THRESHOLD=30
# Risk scores above this threshold are considered HIGH (70-100)
# Scores between low and high are considered MEDIUM
RISK_HIGH_THRESHOLD=70
```

### 3. `app/config.py` (Settings Class)
```python
# AI Model API (External - Required for WebRTC Voice Analysis)
MODEL_API_URL: str = "https://api.voicemodel.example.com/predict"
MODEL_API_KEY: str = ""
MODEL_TIMEOUT_SECONDS: int = 10

# Risk Analysis Thresholds
RISK_LOW_THRESHOLD: int = 30
RISK_HIGH_THRESHOLD: int = 70
```

## Usage in Code

### Accessing Configuration
```python
from app.config import settings

# AI Model API
api_url = settings.MODEL_API_URL
api_key = settings.MODEL_API_KEY
timeout = settings.MODEL_TIMEOUT_SECONDS

# Risk Thresholds
low_threshold = settings.RISK_LOW_THRESHOLD
high_threshold = settings.RISK_HIGH_THRESHOLD
```

### Example: AI Model Client
```python
class AIModelClient:
    def __init__(self):
        self.api_url = settings.MODEL_API_URL
        self.api_key = settings.MODEL_API_KEY
        self.timeout = settings.MODEL_TIMEOUT_SECONDS
        
    async def predict(self, audio_data: bytes):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.api_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                content=audio_data,
                timeout=self.timeout
            )
            return response.json()
```

### Example: Risk Engine
```python
class RiskEngine:
    def __init__(self):
        self.low_threshold = settings.RISK_LOW_THRESHOLD
        self.high_threshold = settings.RISK_HIGH_THRESHOLD
        
    def calculate_risk_level(self, risk_score: int) -> str:
        if risk_score < self.low_threshold:
            return "LOW"
        elif risk_score < self.high_threshold:
            return "MEDIUM"
        else:
            return "HIGH"
```

## Security Best Practices

### 1. API Key Management
- ✅ Store `MODEL_API_KEY` in backend `.env` file only
- ✅ Add `.env` to `.gitignore`
- ✅ Use different keys for development and production
- ✅ Rotate keys periodically
- ❌ Never commit API keys to version control
- ❌ Never expose keys in frontend code
- ❌ Never log API keys

### 2. Production Configuration
```env
# Production .env
MODEL_API_URL=https://api.production-voice-service.com/v1/analyze
MODEL_API_KEY=sk_live_secure_production_key_xxxxxxxxxxxx
MODEL_TIMEOUT_SECONDS=8
RISK_LOW_THRESHOLD=25
RISK_HIGH_THRESHOLD=75
```

### 3. Environment-Specific Settings
- **Development**: Use test API keys, relaxed thresholds
- **Staging**: Use staging API keys, production-like thresholds
- **Production**: Use production API keys, strict thresholds

## Troubleshooting

### Missing Environment Variables
If you see errors about missing variables:
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your actual API key
nano .env
```

### API Key Not Working
1. Verify the key is correctly set in `.env`
2. Ensure no extra spaces or quotes around the key
3. Check that the key has not expired
4. Verify the key has appropriate permissions

### Risk Levels Not Categorizing Correctly
1. Check `RISK_LOW_THRESHOLD` < `RISK_HIGH_THRESHOLD`
2. Ensure both values are between 0 and 100
3. Review the risk score calculation logic

## Testing

### Mock Configuration for Testing
```python
# tests/conftest.py
@pytest.fixture
def mock_settings():
    return Settings(
        MODEL_API_URL="http://mock-api.test/predict",
        MODEL_API_KEY="test_key_12345",
        MODEL_TIMEOUT_SECONDS=5,
        RISK_LOW_THRESHOLD=30,
        RISK_HIGH_THRESHOLD=70
    )
```

### Integration Testing
```python
# Test with real API (integration tests only)
def test_ai_client_real():
    client = AIModelClient()
    assert client.api_url == settings.MODEL_API_URL
    assert client.timeout == settings.MODEL_TIMEOUT_SECONDS
```

## Related Documentation

- **Design Document**: `.kiro/specs/webrtc-voice-calling/design.md`
- **Requirements**: `.kiro/specs/webrtc-voice-calling/requirements.md`
- **Backend Configuration**: `backend/app/config.py`
- **Environment Template**: `backend/.env.example`

## Task Completion

✅ **Task 11.1: Add backend environment variables**
- ✅ Added `MODEL_API_URL` to `.env` and `config.py`
- ✅ Added `MODEL_API_KEY` to `.env` and `config.py`
- ✅ Added `MODEL_TIMEOUT_SECONDS` to `.env` and `config.py` (default: 10)
- ✅ Added `RISK_LOW_THRESHOLD` to `.env` and `config.py` (default: 30)
- ✅ Added `RISK_HIGH_THRESHOLD` to `.env` and `config.py` (default: 70)
- ✅ Verified `STUN_SERVER_URL` exists in `.env` and `config.py`
- ✅ Documented all variables in `.env.example`
- ✅ Meets requirements: 10.1, 12.1, 15.2

---

**Last Updated**: 2024-01-15
**Task**: 11.1 - Backend Environment Variables
**Status**: ✅ Complete
