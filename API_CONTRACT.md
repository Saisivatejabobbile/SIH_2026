# VoiceShield API Contract

**Version:** 1.0  
**Last Updated:** September 6, 2026

This document defines all REST and WebSocket API contracts for VoiceShield.

---

## Table of Contents

1. [REST APIs](#rest-apis)
   - [Authentication](#authentication)
   - [Users](#users)
   - [Contacts](#contacts)
   - [Calls](#calls)
2. [WebSocket APIs](#websocket-apis)
   - [Signaling WebSocket](#signaling-websocket)
   - [Analysis WebSocket](#analysis-websocket)
3. [Data Models](#data-models)
4. [Error Codes](#error-codes)

---

## Base URLs

```
Backend API:  http://localhost:8000
Frontend:     http://localhost:5173
```

**Production:** Use HTTPS only

---

## REST APIs

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2026-09-06T12:00:00Z"
}
```

**Errors:**
- `400` - Validation error (invalid email, weak password)
- `409` - Email already exists

---

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Validation error

---

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2026-09-06T12:00:00Z",
  "last_seen": "2026-09-06T14:30:00Z"
}
```

**Errors:**
- `401` - Invalid or expired token

---

### Users

#### Get Online Users

```http
GET /api/users/online
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "alice@example.com",
      "full_name": "Alice Smith",
      "status": "online",
      "last_seen": "2026-09-06T14:35:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "email": "bob@example.com",
      "full_name": "Bob Johnson",
      "status": "online",
      "last_seen": "2026-09-06T14:34:00Z"
    }
  ]
}
```

---

#### Get User by ID

```http
GET /api/users/{user_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "alice@example.com",
  "full_name": "Alice Smith",
  "status": "online",
  "last_seen": "2026-09-06T14:35:00Z"
}
```

**Errors:**
- `404` - User not found

---

### Contacts

#### Get Contacts

```http
GET /api/contacts
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "contacts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "alice@example.com",
      "full_name": "Alice Smith",
      "status": "online"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "email": "bob@example.com",
      "full_name": "Bob Johnson",
      "status": "offline"
    }
  ]
}
```

---

#### Add Contact

```http
POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (201 Created):**
```json
{
  "message": "Contact added",
  "contact": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "alice@example.com",
    "full_name": "Alice Smith"
  }
}
```

**Errors:**
- `404` - User not found
- `409` - Contact already exists

---

### Calls

#### Get Call History

```http
GET /api/calls/history
Authorization: Bearer <token>
Query Parameters:
  - limit: integer (default: 50, max: 100)
  - offset: integer (default: 0)
```

**Response (200 OK):**
```json
{
  "calls": [
    {
      "id": "call-550e8400-e29b-41d4-a716-446655440000",
      "caller_id": "550e8400-e29b-41d4-a716-446655440000",
      "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
      "started_at": "2026-09-06T14:00:00Z",
      "ended_at": "2026-09-06T14:15:00Z",
      "duration_seconds": 900,
      "status": "completed"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

#### Get Call Session

```http
GET /api/calls/{call_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "call-550e8400-e29b-41d4-a716-446655440000",
  "caller_id": "550e8400-e29b-41d4-a716-446655440000",
  "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
  "started_at": "2026-09-06T14:00:00Z",
  "ended_at": "2026-09-06T14:15:00Z",
  "duration_seconds": 900,
  "status": "completed"
}
```

**Errors:**
- `404` - Call not found
- `403` - Not authorized to view this call

---

## WebSocket APIs

### Signaling WebSocket

**Endpoint:** `ws://localhost:8000/ws/signaling?token=<jwt_token>`

**Purpose:** WebRTC signaling (offer, answer, ICE candidates) and call state management

#### Connection

```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/ws/signaling?token=${token}`);

ws.onopen = () => {
  console.log('Signaling WebSocket connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleSignalingMessage(message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};
```

#### Message Types

##### 1. Presence Update

**Server → Client:**
```json
{
  "type": "presence_update",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "online",
  "timestamp": "2026-09-06T14:30:00Z"
}
```

**Status values:** `online`, `offline`, `busy`, `in_call`

---

##### 2. Initiate Call

**Client → Server:**
```json
{
  "type": "call",
  "to": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Server → Receiver:**
```json
{
  "type": "incoming_call",
  "call_id": "call-123456",
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "caller_name": "John Doe",
  "timestamp": "2026-09-06T14:30:00Z"
}
```

---

##### 3. Accept Call

**Client → Server:**
```json
{
  "type": "call_accept",
  "call_id": "call-123456"
}
```

**Server → Caller:**
```json
{
  "type": "call_accepted",
  "call_id": "call-123456",
  "by": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

##### 4. Reject Call

**Client → Server:**
```json
{
  "type": "call_reject",
  "call_id": "call-123456"
}
```

**Server → Caller:**
```json
{
  "type": "call_rejected",
  "call_id": "call-123456",
  "by": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

##### 5. WebRTC Offer

**Client → Server:**
```json
{
  "type": "offer",
  "call_id": "call-123456",
  "to": "550e8400-e29b-41d4-a716-446655440001",
  "sdp": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

**Server → Receiver:**
```json
{
  "type": "offer",
  "call_id": "call-123456",
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "sdp": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

---

##### 6. WebRTC Answer

**Client → Server:**
```json
{
  "type": "answer",
  "call_id": "call-123456",
  "to": "550e8400-e29b-41d4-a716-446655440000",
  "sdp": {
    "type": "answer",
    "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

**Server → Caller:**
```json
{
  "type": "answer",
  "call_id": "call-123456",
  "from": "550e8400-e29b-41d4-a716-446655440001",
  "sdp": {
    "type": "answer",
    "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

---

##### 7. ICE Candidate

**Client → Server:**
```json
{
  "type": "ice_candidate",
  "call_id": "call-123456",
  "to": "550e8400-e29b-41d4-a716-446655440001",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

**Server → Peer:**
```json
{
  "type": "ice_candidate",
  "call_id": "call-123456",
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

---

##### 8. Hangup

**Client → Server:**
```json
{
  "type": "hangup",
  "call_id": "call-123456"
}
```

**Server → Peer:**
```json
{
  "type": "hangup",
  "call_id": "call-123456",
  "from": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

##### 9. Error

**Server → Client:**
```json
{
  "type": "error",
  "code": "INVALID_CALL_ID",
  "message": "Call session not found",
  "timestamp": "2026-09-06T14:30:00Z"
}
```

---

### Analysis WebSocket

**Endpoint:** `ws://localhost:8000/ws/analyze?token=<jwt_token>&call_id=<call_id>`

**Purpose:** Real-time audio analysis and risk updates

**IMPORTANT:** This WebSocket is used ONLY for the receiver's analysis session. Audio sent here is the remote caller's audio only.

#### Connection

```javascript
const token = localStorage.getItem('access_token');
const callId = currentCall.id;
const ws = new WebSocket(
  `ws://localhost:8000/ws/analyze?token=${token}&call_id=${callId}`
);

ws.onopen = () => {
  console.log('Analysis WebSocket connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleAnalysisMessage(message);
};
```

#### Message Types

##### 1. Audio Chunk (Client → Server)

```json
{
  "type": "audio_chunk",
  "call_id": "call-123456",
  "pcm": [0, 1024, -512, 2048, ...],
  "sample_rate": 16000,
  "channels": 1,
  "format": "int16",
  "timestamp": "2026-09-06T14:30:15.123Z"
}
```

**Constraints:**
- `pcm`: Array of Int16 values (max 480000 samples)
- `sample_rate`: 16000 (configurable)
- `channels`: 1 (mono)
- `format`: "int16"
- Maximum payload: 1 MB

---

##### 2. Analysis Status (Server → Client)

```json
{
  "type": "analysis_status",
  "call_id": "call-123456",
  "state": "ANALYZING",
  "message": "Processing audio stream",
  "timestamp": "2026-09-06T14:30:15.200Z"
}
```

**States:** `IDLE`, `WAITING`, `ANALYZING`, `RESULT_AVAILABLE`, `ERROR`

---

##### 3. Risk Update (Server → Client)

```json
{
  "type": "risk_update",
  "call_id": "call-123456",
  "synthetic_confidence": 91,
  "model_confidence": 94,
  "risk_score": 87,
  "risk_level": "HIGH",
  "recommendation": "Possible synthetic voice detected. Perform independent caller verification.",
  "acoustic_indicators": {
    "pitch_variance": 0.12,
    "spectral_consistency": 0.89
  },
  "prosody_indicators": {
    "rhythm_naturalness": 0.78,
    "intonation_patterns": "ATYPICAL"
  },
  "timestamp": "2026-09-06T14:30:18.456Z"
}
```

**Fields:**
- `synthetic_confidence`: 0-100 (percentage)
- `model_confidence`: 0-100 (percentage)
- `risk_score`: 0-100 (application-level risk)
- `risk_level`: "LOW" | "MEDIUM" | "HIGH"
- `recommendation`: Human-readable guidance
- `acoustic_indicators`: Optional, only if model provides
- `prosody_indicators`: Optional, only if model provides

---

##### 4. Analysis Error (Server → Client)

```json
{
  "type": "analysis_error",
  "call_id": "call-123456",
  "code": "MODEL_TIMEOUT",
  "message": "External model API timed out",
  "timestamp": "2026-09-06T14:30:20.000Z"
}
```

**Error Codes:**
- `INVALID_CALL_ID` - Call session not found
- `INVALID_AUDIO_FORMAT` - PCM format validation failed
- `PAYLOAD_TOO_LARGE` - Audio chunk exceeds limit
- `MODEL_TIMEOUT` - External model API timeout
- `MODEL_AUTH_ERROR` - Model API authentication failed
- `MODEL_UNAVAILABLE` - Model API unreachable
- `INTERNAL_ERROR` - Server processing error

---

##### 5. Analysis Complete (Server → Client)

```json
{
  "type": "analysis_complete",
  "call_id": "call-123456",
  "message": "Analysis session ended",
  "total_chunks_processed": 245,
  "timestamp": "2026-09-06T14:45:00.000Z"
}
```

---

## Data Models

### User

```typescript
interface User {
  id: string;              // UUID
  email: string;           // Valid email
  full_name: string;       // Display name
  created_at: string;      // ISO 8601 timestamp
  last_seen: string;       // ISO 8601 timestamp
}
```

---

### Call Session

```typescript
interface CallSession {
  id: string;              // UUID prefixed with "call-"
  caller_id: string;       // User UUID
  receiver_id: string;     // User UUID
  started_at: string;      // ISO 8601 timestamp
  ended_at: string | null; // ISO 8601 timestamp or null
  duration_seconds: number | null;
  status: CallStatus;
}

enum CallStatus {
  INITIATED = "initiated",
  RINGING = "ringing",
  ACCEPTED = "accepted",
  CONNECTED = "connected",
  ENDED = "ended",
  REJECTED = "rejected",
  FAILED = "failed"
}
```

---

### Risk Result

```typescript
interface RiskResult {
  synthetic_confidence: number;    // 0-100
  model_confidence: number;        // 0-100
  risk_score: number;              // 0-100
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  acoustic_indicators?: object;    // Optional
  prosody_indicators?: object;     // Optional
  timestamp: string;               // ISO 8601
}
```

---

## Error Codes

### HTTP Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Validation error |
| `401` | Unauthorized - Invalid or missing token |
| `403` | Forbidden - Not authorized |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Semantic error |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |
| `503` | Service Unavailable - External dependency failed |

---

### WebSocket Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | JWT token invalid or expired |
| `INVALID_CALL_ID` | Call session not found |
| `CALL_ALREADY_ACTIVE` | User already in another call |
| `USER_NOT_FOUND` | Target user doesn't exist |
| `USER_OFFLINE` | Target user is offline |
| `INVALID_AUDIO_FORMAT` | Audio data validation failed |
| `PAYLOAD_TOO_LARGE` | Message exceeds size limit |
| `MODEL_TIMEOUT` | External model API timeout |
| `MODEL_AUTH_ERROR` | Model API authentication failed |
| `MODEL_UNAVAILABLE` | Model API unreachable |
| `INTERNAL_ERROR` | Server processing error |

---

### Error Response Format

**REST API:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

**WebSocket:**
```json
{
  "type": "error",
  "code": "INVALID_CALL_ID",
  "message": "Call session not found",
  "timestamp": "2026-09-06T14:30:00Z"
}
```

---

## Rate Limiting

**Recommended Limits (Production):**

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/login` | 5 per minute |
| `POST /api/auth/register` | 3 per hour |
| `GET /api/users/online` | 30 per minute |
| `WebSocket /ws/signaling` | 1 connection per user |
| `WebSocket /ws/analyze` | 1 connection per active call |
| Audio chunks | 100 per second per call |

---

## Pagination

**Query Parameters:**
- `limit`: Number of items (default: 50, max: 100)
- `offset`: Starting position (default: 0)

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "limit": 50,
  "offset": 0,
  "has_more": true
}
```

---

## Authentication

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**WebSocket Format:**
```
ws://localhost:8000/ws/signaling?token=<jwt_token>
```

**Token Expiration:**
- Default: 24 hours
- Refresh: Re-login required

---

## CORS Configuration

**Allowed Origins (Development):**
```
http://localhost:5173
http://localhost:3000
```

**Allowed Methods:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers:**
```
Content-Type, Authorization
```

---

## WebSocket Connection Lifecycle

```
1. Client initiates connection with JWT token
   ├─> Server validates token
   ├─> Server associates connection with user_id
   └─> Server sends connection confirmation

2. Client sends/receives messages
   ├─> Signaling: call control, WebRTC negotiation
   └─> Analysis: audio chunks, risk updates

3. Client closes connection OR server detects disconnect
   ├─> Server cleans up connection state
   ├─> Server updates user presence (offline)
   └─> Server clears any active call state
```

---

## Testing Endpoints

### Health Check

```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-09-06T14:30:00Z"
}
```

---

### Model Mode Status

```http
GET /api/config/model-mode
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "model_mode": "mock",
  "model_api_url": "https://api.example.com/predict",
  "model_api_configured": true
}
```

**Note:** `MODEL_API_KEY` is never exposed in responses.

---

## Versioning

**Current Version:** `v1`

**Endpoint Prefix:** `/api/v1/...` (optional, currently using `/api/`)

**Breaking Changes:** Will increment version (`v2`, `v3`, etc.)

---

**Document Version:** 1.0  
**Last Updated:** September 6, 2026  
**Maintained By:** VoiceShield Team
