# VoiceShield Backend - API Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
cd SIH_2026/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create Test Data
```bash
python create_test_data.py
```

### 3. Start Server
```bash
python run.py
```

Server will be running at: **http://localhost:8000**

---

## API Documentation

**Interactive API Docs**: http://localhost:8000/docs  
**Alternative Docs**: http://localhost:8000/redoc

---

## Test Users

| Email | Password | Status |
|-------|----------|--------|
| demo@voiceshield.com | Demo123! | Online |
| john.doe@example.com | Test123! | Online |
| jane.smith@example.com | Test123! | Offline |
| alice.johnson@example.com | Test123! | Online |
| bob.wilson@example.com | Test123! | Offline |
| charlie.brown@example.com | Test123! | Online |

---

## API Endpoints Testing

### Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "app": "VoiceShield",
  "version": "1.0.0"
}
```

---

### 1. Register New User

**POST** `/api/auth/register`

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected Response (201):**
```json
{
  "id": 7,
  "email": "test@example.com",
  "full_name": "Test User",
  "phone": null,
  "avatar_url": null,
  "is_active": true,
  "is_verified": false,
  "is_online": false,
  "created_at": "2025-01-15T10:30:00Z",
  "last_seen": null
}
```

---

### 2. Login

**POST** `/api/auth/login`

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@voiceshield.com",
    "password": "Demo123!"
  }'
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Save the access_token** for subsequent requests!

---

### 3. Get Current User

**GET** `/api/auth/me`

```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "id": 1,
  "email": "demo@voiceshield.com",
  "full_name": "Demo User",
  "phone": null,
  "avatar_url": null,
  "is_active": true,
  "is_verified": true,
  "is_online": true,
  "created_at": "2025-01-15T10:00:00Z",
  "last_seen": null
}
```

---

### 4. Get Online Users

**GET** `/api/users/online`

```bash
curl http://localhost:8000/api/users/online \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "id": 2,
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "is_online": true,
    ...
  },
  {
    "id": 4,
    "email": "alice.johnson@example.com",
    "full_name": "Alice Johnson",
    "is_online": true,
    ...
  }
]
```

---

### 5. Get Contacts

**GET** `/api/users/contacts`

```bash
curl http://localhost:8000/api/users/contacts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "id": 2,
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "is_online": true,
    ...
  },
  ...
]
```

---

### 6. Get Call History

**GET** `/api/calls/history`

```bash
curl http://localhost:8000/api/calls/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**With filters:**
```bash
# Filter by risk level
curl http://localhost:8000/api/calls/history?risk_level=HIGH \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Pagination
curl "http://localhost:8000/api/calls/history?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "call_id": "call-1234567890-1",
    "caller_id": 1,
    "callee_id": 2,
    "started_at": "2025-01-15T09:30:00Z",
    "connected_at": "2025-01-15T09:30:05Z",
    "ended_at": "2025-01-15T09:32:30Z",
    "duration": 145,
    "final_state": "ended",
    "risk_level": "LOW",
    "risk_score": 15.5,
    "synthetic_confidence": 10.2,
    "model_confidence": 95.8,
    "recommendation": "This voice appears to be human.",
    "acoustic_indicators": {...},
    "prosody_indicators": {...},
    "created_at": "2025-01-15T09:32:30Z"
  }
]
```

---

### 7. Get Call by ID

**GET** `/api/calls/{call_id}`

```bash
curl http://localhost:8000/api/calls/call-1234567890-1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8. Get Call Statistics

**GET** `/api/calls/stats/summary`

```bash
curl http://localhost:8000/api/calls/stats/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "total_calls": 10,
  "by_risk_level": {
    "LOW": 4,
    "MEDIUM": 3,
    "HIGH": 3
  },
  "average_duration": 245
}
```

---

### 9. Update Profile

**PUT** `/api/users/me`

```bash
curl -X PUT "http://localhost:8000/api/users/me?full_name=New%20Name&phone=1234567890" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 10. Logout

**POST** `/api/auth/logout`

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

---

## Testing with Python Requests

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Register
response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "Test123!"
    }
)
print(response.json())

# 2. Login
response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "email": "demo@voiceshield.com",
        "password": "Demo123!"
    }
)
token = response.json()["access_token"]
print(f"Token: {token}")

# 3. Get current user
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
print(response.json())

# 4. Get call history
response = requests.get(f"{BASE_URL}/api/calls/history", headers=headers)
print(response.json())
```

---

## Testing with Frontend

Once backend is running, update frontend `.env`:

```env
VITE_MOCK_MODE=false
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Then start frontend:
```bash
cd ../frontend
npm run dev
```

Frontend will connect to real backend!

---

## Common Issues

### Issue 1: "Email already registered"
**Solution**: Use a different email or delete the database file:
```bash
rm voiceshield.db
python create_test_data.py
```

### Issue 2: "Invalid email or password"
**Solution**: Check credentials, default password is `Demo123!` or `Test123!`

### Issue 3: "Could not validate credentials"
**Solution**: Token expired or invalid, login again to get new token

### Issue 4: Port already in use
**Solution**: Kill process on port 8000:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

---

## Next Steps

1. ✅ API Routes working
2. 🚧 Next: WebRTC Signaling WebSocket
3. 🚧 Next: Audio Analysis WebSocket
4. 🚧 Next: AI Model Integration

---

**Status**: API Routes Complete ✅  
**Test with**: Postman, curl, or Swagger UI at /docs
