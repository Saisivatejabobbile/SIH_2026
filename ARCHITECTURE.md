# VoiceShield Architecture

**Version:** 1.0  
**Last Updated:** September 6, 2026

## Table of Contents
1. [Overview](#overview)
2. [System Components](#system-components)
3. [Data Flow](#data-flow)
4. [Audio Processing Pipeline](#audio-processing-pipeline)
5. [WebRTC Architecture](#webrtc-architecture)
6. [Model Integration](#model-integration)
7. [Risk Scoring](#risk-scoring)
8. [Database Schema](#database-schema)
9. [Security Model](#security-model)
10. [Privacy Architecture](#privacy-architecture)

---

## Overview

VoiceShield is a **privacy-first real-time voice integrity security layer** that sits on top of browser-based one-to-one WebRTC calls. The system analyzes the remote caller's audio stream to detect potential synthetic voice characteristics and provides real-time risk assessment.

### Key Principles
- **Privacy-First:** No audio persistence, transient processing only
- **Receiver-Side Analysis:** Only the remote caller's audio is analyzed
- **External Model:** Integrates with already-deployed AI model via API
- **Real-Time:** Live risk updates during active calls
- **Configurable:** Application-level risk thresholds

---

## System Components

### 1. Frontend (React + JavaScript + Vite)

**Modules:**
- **AuthModule:** Registration, login, logout
- **ContactsModule:** Contact list, online presence
- **CallManager:** WebRTC call orchestration
- **AudioProcessor:** AudioWorklet for remote stream analysis
- **DashboardModule:** Real-time risk visualization
- **WebSocketClient:** Signaling and analysis connections

**Key Responsibilities:**
- User interface and authentication
- WebRTC peer connection management
- Remote audio stream isolation
- PCM extraction via AudioWorklet
- Real-time risk display

### 2. Backend (FastAPI)

**Modules:**
- **AuthService:** JWT authentication, user management
- **PresenceService:** Online/offline tracking
- **SignalingService:** WebRTC signaling (offer/answer/ICE)
- **AnalysisService:** Audio analysis orchestration
- **ModelClient:** External model API integration
- **RiskEngine:** Application-level risk calculation
- **DatabaseService:** PostgreSQL operations

**Key Responsibilities:**
- Authentication and authorization
- WebRTC signaling coordination
- Transient audio buffering
- External model API calls
- Risk score calculation
- Real-time result broadcasting

### 3. Database (PostgreSQL)

**Stored Data:**
- User accounts (id, email, password_hash)
- Call sessions metadata (caller_id, receiver_id, timestamps)
- **NO AUDIO DATA**

### 4. External Model API

**Not Part of This Project:**
- Deployed independently on external infrastructure
- Accessed via `MODEL_API_URL` + `MODEL_API_KEY`
- Returns synthetic voice predictions

---

## Data Flow

### Complete Call Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: AUTHENTICATION & PRESENCE                               │
└──────────────────────────────────────────────────────────────────┘

User A (Browser)                Backend                 User B (Browser)
      │                            │                            │
      ├─── POST /api/auth/login ──>│                            │
      │<── JWT token ──────────────┤                            │
      │                            │                            │
      ├─── WS /ws/signaling ──────>│<─── WS /ws/signaling ─────┤
      │    (authenticated)          │    (authenticated)         │
      │                            │                            │
      │<── presence_update ─────────┤──── presence_update ──────>│
      │    {user_b: online}         │    {user_a: online}        │


┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: CALL INITIATION                                         │
└──────────────────────────────────────────────────────────────────┘

User A (Caller)                Backend                 User B (Receiver)
      │                            │                            │
      ├─── {type: "call"} ────────>│                            │
      │    {to: user_b}             │                            │
      │                            │──── {type: "incoming"} ───>│
      │                            │     {from: user_a}          │
      │                            │                            │
      │                            │<─── {type: "call_accept"} ─┤
      │<── {type: "call_accepted"} ┤                            │


┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: WebRTC NEGOTIATION (via Signaling WebSocket)           │
└──────────────────────────────────────────────────────────────────┘

User A                         Backend                 User B
      │                            │                            │
      ├─── {type: "offer"} ───────>│──── {type: "offer"} ──────>│
      │    {sdp: ...}               │     {sdp: ...}             │
      │                            │                            │
      │<─── {type: "answer"} ───────┤<─── {type: "answer"} ─────┤
      │     {sdp: ...}              │     {sdp: ...}             │
      │                            │                            │
      ├─── {type: "ice"} ─────────>│──── {type: "ice"} ────────>│
      │    {candidate: ...}         │     {candidate: ...}       │


┌──────────────────────────────────────────────────────────────────┐
│ PHASE 4: WebRTC MEDIA CONNECTION (Peer-to-Peer)                 │
└──────────────────────────────────────────────────────────────────┘

User A (Caller)                                     User B (Receiver)
      │                                                     │
      │<═══════════════ WebRTC Audio Stream ══════════════>│
      │              (microphone → remote)                  │
      │                                                     │
      │                                            [Remote MediaStream]
      │                                                     │
      │                                            Only Remote Audio
      │                                                     ▼


┌──────────────────────────────────────────────────────────────────┐
│ PHASE 5: AUDIO ANALYSIS (Receiver Side Only)                    │
└──────────────────────────────────────────────────────────────────┘

User B (Receiver Browser)          Backend              External Model
         │                            │                       │
         │                            │                       │
    [Remote Stream]                   │                       │
         │                            │                       │
         ▼                            │                       │
   [AudioContext]                     │                       │
         │                            │                       │
         ▼                            │                       │
   [AudioWorklet]                     │                       │
    • Convert to Mono                 │                       │
    • Resample (16kHz)                │                       │
    • Extract PCM                     │                       │
         │                            │                       │
         ▼                            │                       │
   [Analysis WebSocket]               │                       │
         │                            │                       │
         ├──── PCM chunks ───────────>│                       │
         │    (bounded buffer)         │                       │
         │                            │                       │
         │                      [Validate Audio]              │
         │                      [Apply VAD]                   │
         │                      [Buffer Management]           │
         │                            │                       │
         │                            ├─── predict(audio) ───>│
         │                            │    + MODEL_API_KEY     │
         │                            │                       │
         │                            │<─── prediction ───────┤
         │                            │    {synthetic: 0.91,   │
         │                            │     confidence: 0.94}  │
         │                            │                       │
         │                      [Risk Engine]                 │
         │                      • Calculate risk_score        │
         │                      • Determine risk_level        │
         │                      • Generate recommendation     │
         │                            │                       │
         │<──── risk_update ──────────┤                       │
         │    {synthetic: 91,          │                       │
         │     risk_score: 87,         │                       │
         │     risk_level: "HIGH"}     │                       │
         │                            │                       │
         ▼                            │                       │
    [Dashboard]                       │                       │
    Display Live Risk                 │                       │


┌──────────────────────────────────────────────────────────────────┐
│ PHASE 6: CALL TERMINATION                                        │
└──────────────────────────────────────────────────────────────────┘

User A/B                       Backend                 User A/B
      │                            │                            │
      ├─── {type: "hangup"} ──────>│──── {type: "hangup"} ────>│
      │                            │                            │
      │                      [Stop Analysis]                    │
      │                      [Clear Buffers]                    │
      │                      [Close WS]                         │
      │                            │                            │
      ▼                            ▼                            ▼
[Release Resources]         [No Audio Stored]          [Release Resources]
• Close PeerConnection                                 • Close PeerConnection
• Stop AudioWorklet                                    • Stop AudioWorklet
• Close AudioContext                                   • Close AudioContext
• Clear Buffers                                        • Clear Buffers
```

---

## Audio Processing Pipeline

### Receiver-Side Audio Flow

```javascript
// 1. Get Remote Stream from WebRTC
peerConnection.ontrack = (event) => {
  const remoteStream = event.streams[0];
  
  // 2. Create AudioContext
  const audioContext = new AudioContext({ sampleRate: 16000 });
  
  // 3. Create Source from Remote Stream
  const source = audioContext.createMediaStreamSource(remoteStream);
  
  // 4. Load AudioWorklet
  await audioContext.audioWorklet.addModule('/audioProcessor.js');
  
  // 5. Create Processor Node
  const processorNode = new AudioWorkletNode(audioContext, 'audio-processor');
  
  // 6. Connect Pipeline
  source.connect(processorNode);
  processorNode.connect(audioContext.destination);
  
  // 7. Handle PCM Output
  processorNode.port.onmessage = (event) => {
    const pcmData = event.data.pcm;
    
    // Send to backend via WebSocket
    analysisWebSocket.send(JSON.stringify({
      type: 'audio_chunk',
      call_id: currentCallId,
      pcm: Array.from(pcmData),
      sample_rate: 16000,
      channels: 1
    }));
  };
};
```

### AudioWorklet Processor

```javascript
// audioProcessor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    
    const samples = input[0]; // Mono channel
    
    for (let i = 0; i < samples.length; i++) {
      this.buffer[this.bufferIndex++] = samples[i];
      
      if (this.bufferIndex >= this.bufferSize) {
        // Convert Float32 to Int16 PCM
        const pcm = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          pcm[j] = Math.max(-32768, Math.min(32767, this.buffer[j] * 32768));
        }
        
        // Send to main thread
        this.port.postMessage({ pcm });
        
        this.bufferIndex = 0;
      }
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);
```

### Backend Audio Handler

```python
# backend/services/analysis_service.py
class AnalysisService:
    def __init__(self):
        self.active_buffers = {}  # call_id -> bounded buffer
        self.max_buffer_size = 480000  # 30 seconds at 16kHz
    
    async def process_audio_chunk(self, call_id: str, pcm_data: list):
        # Validate call session
        if not self.validate_active_call(call_id):
            raise InvalidCallError()
        
        # Get or create bounded buffer
        if call_id not in self.active_buffers:
            self.active_buffers[call_id] = BoundedBuffer(self.max_buffer_size)
        
        buffer = self.active_buffers[call_id]
        buffer.append(pcm_data)
        
        # Apply Voice Activity Detection
        if not self.has_speech(pcm_data):
            return  # Skip silence
        
        # Get analysis window (3 seconds)
        audio_window = buffer.get_window(sample_rate=16000, duration=3.0)
        
        # Call external model
        prediction = await self.model_client.predict(audio_window)
        
        # Calculate risk
        risk_result = self.risk_engine.calculate_risk(prediction)
        
        # Send to client
        await self.broadcast_risk_update(call_id, risk_result)
        
        # IMPORTANT: No audio persistence
        # Buffer is automatically cleared when call ends
    
    async def end_call_analysis(self, call_id: str):
        # Clear buffer immediately
        if call_id in self.active_buffers:
            del self.active_buffers[call_id]
        
        # No audio saved to disk
```

---

## WebRTC Architecture

### CallManager Interface

```javascript
// frontend/src/services/CallManager.js
class CallManager {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callState = 'IDLE';
    this.callbacks = {
      onRemoteStream: [],
      onStateChange: []
    };
  }
  
  async call(userId) {
    this.callState = 'CALLING';
    this.notifyStateChange();
    
    // Get local microphone
    this.localStream = await navigator.mediaDevices.getUserMedia({ 
      audio: true 
    });
    
    // Create peer connection
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: STUN_SERVER_URL },
        { 
          urls: TURN_SERVER_URL,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD
        }
      ]
    });
    
    // Add local tracks
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.notifyRemoteStream(this.remoteStream);
    };
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        signalingSocket.send({
          type: 'ice_candidate',
          candidate: event.candidate
        });
      }
    };
    
    // Create offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    signalingSocket.send({
      type: 'offer',
      to: userId,
      sdp: offer
    });
  }
  
  async accept() {
    this.callState = 'ACCEPTED';
    this.notifyStateChange();
    
    // Similar setup for answerer
  }
  
  async reject() {
    this.callState = 'REJECTED';
    this.cleanup();
  }
  
  async hangup() {
    this.callState = 'ENDED';
    this.cleanup();
  }
  
  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
    this.callState = 'IDLE';
    this.notifyStateChange();
  }
  
  onRemoteStream(callback) {
    this.callbacks.onRemoteStream.push(callback);
  }
  
  onStateChange(callback) {
    this.callbacks.onStateChange.push(callback);
  }
  
  getCallState() {
    return this.callState;
  }
  
  notifyRemoteStream(stream) {
    this.callbacks.onRemoteStream.forEach(cb => cb(stream));
  }
  
  notifyStateChange() {
    this.callbacks.onStateChange.forEach(cb => cb(this.callState));
  }
}
```

### Call States

```
IDLE → CALLING → RINGING → ACCEPTED → CONNECTING → CONNECTED
                     ↓
                 REJECTED
                     
CONNECTED → ENDED
           ↓
         FAILED
```

---

## Model Integration

### External Model Client

```python
# backend/services/model_client.py
from abc import ABC, abstractmethod
import httpx
from config import settings

class VoiceDetectionModel(ABC):
    @abstractmethod
    async def predict(self, audio_data: bytes) -> dict:
        pass

class ExternalVoiceDetectionModel(VoiceDetectionModel):
    def __init__(self):
        self.api_url = settings.MODEL_API_URL
        self.api_key = settings.MODEL_API_KEY
        self.timeout = settings.MODEL_TIMEOUT_SECONDS
    
    async def predict(self, audio_data: bytes) -> dict:
        """
        Call externally deployed model API.
        
        Expected Response:
        {
          "synthetic_probability": 0.91,
          "model_confidence": 0.94,
          "acoustic_indicators": {...},  # optional
          "prosody_indicators": {...}    # optional
        }
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/octet-stream"
                    },
                    content=audio_data,
                    timeout=self.timeout
                )
                
                response.raise_for_status()
                return response.json()
                
            except httpx.TimeoutException:
                raise ModelTimeoutError()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise ModelAuthError()
                raise ModelAPIError(str(e))

class MockVoiceDetectionModel(VoiceDetectionModel):
    """Mock model for development and testing."""
    
    async def predict(self, audio_data: bytes) -> dict:
        import random
        return {
            "synthetic_probability": random.uniform(0.1, 0.95),
            "model_confidence": random.uniform(0.85, 0.99)
        }
```

### Model Factory

```python
# backend/services/model_factory.py
def create_model() -> VoiceDetectionModel:
    if settings.MODEL_MODE == "mock":
        return MockVoiceDetectionModel()
    elif settings.MODEL_MODE == "real":
        return ExternalVoiceDetectionModel()
    else:
        raise ValueError(f"Invalid MODEL_MODE: {settings.MODEL_MODE}")
```

---

## Risk Scoring

### Risk Engine

```python
# backend/services/risk_engine.py
class RiskEngine:
    def __init__(self):
        self.low_threshold = settings.RISK_LOW_THRESHOLD  # 30
        self.high_threshold = settings.RISK_HIGH_THRESHOLD  # 70
    
    def calculate_risk(self, model_prediction: dict) -> dict:
        """
        Convert model's synthetic probability into application-level risk.
        
        IMPORTANT: This is application policy, not scientific threshold.
        """
        synthetic_prob = model_prediction.get("synthetic_probability", 0.0)
        model_confidence = model_prediction.get("model_confidence", 0.0)
        
        # Convert to percentage
        synthetic_confidence = int(synthetic_prob * 100)
        
        # Calculate application-level risk score
        # Weight by model confidence
        risk_score = int(synthetic_confidence * model_confidence)
        
        # Determine risk level
        if risk_score < self.low_threshold:
            risk_level = "LOW"
            recommendation = "Voice appears natural. Continue call normally."
        elif risk_score < self.high_threshold:
            risk_level = "MEDIUM"
            recommendation = "Moderate synthetic indicators detected. Stay alert."
        else:
            risk_level = "HIGH"
            recommendation = "Possible synthetic voice detected. Perform independent caller verification."
        
        return {
            "synthetic_confidence": synthetic_confidence,
            "model_confidence": int(model_confidence * 100),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "acoustic_indicators": model_prediction.get("acoustic_indicators"),
            "prosody_indicators": model_prediction.get("prosody_indicators"),
            "timestamp": datetime.utcnow().isoformat()
        }
```

### Risk Levels

| Level | Score Range | Meaning | Action |
|-------|-------------|---------|--------|
| **LOW** | 0-30 | Voice appears natural | Continue normally |
| **MEDIUM** | 31-70 | Moderate synthetic indicators | Stay alert, consider additional verification |
| **HIGH** | 71-100 | Strong synthetic indicators | Perform independent verification |

**Note:** These are configurable application policy thresholds, not universal scientific standards.

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_seen ON users(last_seen);
```

### Call Sessions Table

```sql
CREATE TABLE call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    status VARCHAR(50),
    
    -- NO AUDIO DATA
    
    CONSTRAINT valid_duration CHECK (duration_seconds >= 0)
);

CREATE INDEX idx_call_sessions_caller ON call_sessions(caller_id);
CREATE INDEX idx_call_sessions_receiver ON call_sessions(receiver_id);
CREATE INDEX idx_call_sessions_started ON call_sessions(started_at);
```

### What Is NOT Stored

```
❌ audio_file
❌ audio_blob
❌ recording_path
❌ pcm_data
❌ wav_file
❌ transcription
❌ voice_embedding
❌ raw_audio
```

---

## Security Model

### Authentication Flow

```
1. User registers: POST /api/auth/register
   ├─> Validate email format
   ├─> Check email uniqueness
   ├─> Hash password (bcrypt)
   └─> Create user record

2. User logs in: POST /api/auth/login
   ├─> Validate credentials
   ├─> Verify password hash
   ├─> Generate JWT token
   └─> Return {access_token, user_info}

3. Access protected endpoints
   ├─> Extract JWT from Authorization header
   ├─> Verify JWT signature
   ├─> Extract user_id from claims
   └─> Attach user to request context

4. WebSocket authentication
   ├─> Send JWT in connection query param
   ├─> Verify before accepting connection
   └─> Associate connection with user_id
```

### JWT Claims

```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "exp": 1725723600,
  "iat": 1725637200
}
```

### Security Best Practices

- ✅ HTTPS in production
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token expiration
- ✅ CORS configuration
- ✅ Payload size limits
- ✅ Rate limiting (recommended)
- ✅ WebSocket authentication
- ✅ No sensitive data logging

### What Is NOT Logged

```
❌ passwords
❌ JWT tokens
❌ MODEL_API_KEY
❌ raw audio
❌ base64 audio
❌ PCM data
❌ audio buffers
```

---

## Privacy Architecture

### Audio Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO NEVER PERSISTED                    │
└─────────────────────────────────────────────────────────────┘

1. CAPTURE (Browser)
   ├─> Remote MediaStream from WebRTC
   └─> In-memory only

2. PROCESS (Browser AudioWorklet)
   ├─> Float32Array buffer (bounded)
   ├─> Convert to Int16 PCM
   └─> Clear after sending

3. TRANSMIT (WebSocket)
   ├─> JSON with PCM array
   └─> Transient network data

4. BUFFER (Backend)
   ├─> Bounded in-memory buffer
   ├─> Maximum 30 seconds
   └─> Ring buffer (old data discarded)

5. ANALYZE (External Model)
   ├─> Send to model API
   ├─> Model processes transiently
   └─> Return prediction only

6. RESULT (Backend to Client)
   ├─> Risk score + metadata
   └─> No audio included

7. CLEANUP (Call End)
   ├─> Clear all buffers
   ├─> Close WebSockets
   ├─> Release AudioContext
   └─> Stop all tracks

✅ RESULT: Zero audio persistence
```

### Privacy Guarantees

| Storage Location | Audio Stored? |
|------------------|---------------|
| Browser localStorage | ❌ No |
| Browser IndexedDB | ❌ No |
| Browser Cache | ❌ No |
| Frontend Memory | ⚠️ Temporary only |
| WebSocket Messages | ⚠️ Transient only |
| Backend Memory | ⚠️ Bounded buffer only |
| Backend Disk | ❌ No |
| PostgreSQL | ❌ No |
| Redis | ❌ No |
| Log Files | ❌ No |
| Error Tracking | ❌ No |
| Analytics | ❌ No |
| Model API | ⚠️ External policy |

### Privacy UI Indicators

```javascript
// Always displayed on dashboard
<PrivacyStatus>
  <StatusBadge color="green">
    🔒 Privacy Protected
  </StatusBadge>
  <StatusText>
    Raw Audio Retention: OFF
  </StatusText>
  <StatusText>
    Analysis Mode: Real-time Transient
  </StatusText>
</PrivacyStatus>
```

---

## Technology Stack

### Frontend
- **Framework:** React 18
- **Language:** JavaScript (ES6+)
- **Build Tool:** Vite
- **WebRTC:** Native Browser APIs
- **Audio:** Web Audio API, AudioWorklet
- **WebSocket:** Native WebSocket API
- **Styling:** CSS Modules / Tailwind CSS
- **State:** React Context / Zustand

### Backend
- **Framework:** FastAPI 0.104+
- **Language:** Python 3.10+
- **WebSocket:** FastAPI WebSockets
- **Database:** PostgreSQL 14+
- **ORM:** SQLAlchemy
- **Migration:** Alembic
- **Auth:** JWT (python-jose)
- **Password:** bcrypt
- **HTTP Client:** httpx

### Infrastructure
- **Database:** PostgreSQL
- **Cache:** Redis (optional)
- **TURN Server:** coturn (optional)
- **Container:** Docker & Docker Compose
- **Reverse Proxy:** Nginx (production)

---

## Deployment Considerations

### Environment Variables

See `.env.example` for complete list.

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set real `MODEL_API_URL` and `MODEL_API_KEY`
- [ ] Configure TURN server for NAT traversal
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set up CORS for production domain
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging (no audio!)
- [ ] Review privacy policy
- [ ] Test complete flow end-to-end

### Scalability Notes

**Current Architecture:**
- Single-server deployment
- In-memory buffers per call
- Suitable for hackathon/prototype

**Production Scaling:**
- Horizontal scaling: Use Redis for presence
- Load balancing: Nginx + multiple backend instances
- WebSocket: Sticky sessions or Redis pub/sub
- Database: Connection pooling, read replicas
- TURN: Dedicated TURN server cluster

---

## Known Limitations

### Prototype Constraints
- Single-server architecture
- In-memory call state
- No audio recording/playback
- Basic error recovery
- Limited monitoring

### Not Implemented
- Multi-party calls
- Screen sharing
- File transfer
- Call recording (by design)
- Advanced analytics
- Mobile apps

### Future Enhancements
- VoIP integration
- Enterprise telephony adapter
- Advanced model ensembles
- Configurable risk policies
- Audit logs (metadata only)
- Admin dashboard

---

## Glossary

- **Synthetic Voice:** Audio generated or manipulated by AI/ML models
- **Risk Score:** Application-level impersonation risk (0-100)
- **Transient Processing:** Audio exists only in bounded memory, never persisted
- **Remote Stream:** WebRTC audio from the other user (not local microphone)
- **AudioWorklet:** Browser API for low-latency audio processing
- **PCM:** Pulse Code Modulation (raw audio format)
- **VAD:** Voice Activity Detection (detects speech vs silence)
- **Mock Mode:** Development mode with simulated model responses

---

**Document Version:** 1.0  
**Last Updated:** September 6, 2026  
**Maintained By:** VoiceShield Team
