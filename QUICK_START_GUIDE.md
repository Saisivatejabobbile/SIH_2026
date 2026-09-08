# VoiceShield - Quick Start Guide

## ✅ What's Been Fixed

The call error **"Local stream or peer connection not initialized"** has been resolved by:
- Changed `VITE_MOCK_MODE=false` in `frontend/.env`
- This enables real WebRTC connections instead of mock mode

---

## 🚀 How to Start the Application

### Step 1: Start the Backend Server

Open a terminal in the backend directory and run:

```bash
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Backend URL:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

---

### Step 2: Start the Frontend Server

Open a **NEW** terminal in the frontend directory and run:

```bash
cd SIH_2026/frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Frontend URL:** http://localhost:5173/ (or 5174/5175 if port is in use)

---

## 🧪 Testing the Complete System

### 1. Create Test Users

In the backend directory, create test data:

```bash
cd SIH_2026/backend
python create_test_data.py
```

**This creates 6 test users:**
- john@test.com / password123
- jane@test.com / password123
- bob@test.com / password123
- alice@test.com / password123
- charlie@test.com / password123
- diana@test.com / password123

---

### 2. Test User Registration & Login

1. **Open browser:** http://localhost:5173/
2. **Click "Get Started"** on landing page
3. **Register a new user** or use test credentials:
   - Email: `john@test.com`
   - Password: `password123`
4. **Verify you're redirected to Dashboard**

---

### 3. Test WebRTC Call (TWO BROWSERS REQUIRED)

#### Browser 1 (Caller):
1. Login as `john@test.com`
2. Go to **Contacts** page
3. You should see other online users

#### Browser 2 (Receiver):
1. Open **Incognito/Private window**
2. Login as `jane@test.com`
3. Go to **Dashboard** (stay on this page)

#### Make the Call:
1. In **Browser 1** (John), go to Contacts
2. Click the **Call** button next to Jane
3. In **Browser 2** (Jane), an **Incoming Call Modal** should appear
4. Click **Accept Call**

#### During the Call:
- ✅ Both users redirected to Active Call page
- ✅ Audio connection established (you can speak and hear)
- ✅ Waveform animation shows audio activity
- ✅ Risk analysis runs in real-time
- ✅ Risk level displays (LOW/MEDIUM/HIGH)
- ✅ Mute/Speaker controls work
- ✅ Hangup button ends call

---

## 🔍 Troubleshooting

### Issue: "Failed to start call"

**Check browser console** (F12 → Console):

1. **Microphone Permission Denied**
   ```
   Failed to get local stream: Microphone access denied
   ```
   **Solution:** Allow microphone access in browser settings

2. **WebSocket Connection Failed**
   ```
   WebSocket error: Connection refused
   ```
   **Solution:** Ensure backend is running on port 8000

3. **CORS Error**
   ```
   Access to XMLHttpRequest blocked by CORS
   ```
   **Solution:** Backend already configured for CORS, restart backend

4. **Still in Mock Mode**
   ```
   [Mock WebSocket] Simulating connection
   ```
   **Solution:** 
   - Stop frontend: Press Ctrl+C in terminal
   - Restart: `npm run dev`
   - Hard refresh browser: Ctrl+Shift+R

---

### Issue: No audio during call

**Check:**
1. Microphone is not muted in browser/OS
2. Correct microphone selected in browser settings
3. Browser console shows: `"Remote stream received"`
4. Try a different browser (Chrome/Edge recommended)

---

### Issue: Users don't see each other as online

**Check:**
1. Both users logged in successfully (JWT token saved)
2. WebSocket connection established (check browser console)
3. Backend logs show: `"WebSocket connected: user_id=X"`

---

## 📊 Verify System is Working

### Backend Health Check

Visit: http://localhost:8000/docs

You should see:
- ✅ FastAPI Swagger UI
- ✅ 14 API endpoints listed
- ✅ Try "GET /api/users/me" with authentication

### Frontend Health Check

Visit: http://localhost:5173/

You should see:
- ✅ Landing page with hero section
- ✅ "Real-time AI Voice Analysis" heading
- ✅ Dark cybersecurity theme
- ✅ No console errors (F12)

### WebSocket Health Check

**Browser Console Log** (when logged in):
```
WebSocket connected: /ws/signaling
Signaling WebSocket ready
```

---

## 🎯 Feature Checklist

### ✅ Authentication
- [x] User registration
- [x] User login
- [x] JWT token storage
- [x] Protected routes
- [x] Logout

### ✅ User Management
- [x] View online users
- [x] View contacts list
- [x] User profiles
- [x] Online/offline status

### ✅ Call System
- [x] Initiate call
- [x] Accept/reject incoming call
- [x] WebRTC peer connection
- [x] Audio streaming
- [x] Call controls (mute/speaker)
- [x] Hangup call

### ✅ AI Voice Analysis
- [x] Real-time audio processing
- [x] Risk level detection (LOW/MEDIUM/HIGH)
- [x] Confidence scores
- [x] Acoustic indicators
- [x] Visual feedback (waveform)

### ✅ Call History
- [x] View past calls
- [x] Filter by risk level
- [x] Call details
- [x] Statistics dashboard

---

## 🌐 Browser Requirements

**Recommended Browsers:**
- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (latest)
- ✅ Firefox (latest)

**Required Browser Features:**
- WebRTC support
- WebSocket support
- Microphone access
- localStorage

**Not Supported:**
- ❌ Internet Explorer
- ❌ Safari (may have WebRTC issues)

---

## 📝 Important Notes

1. **Two Different Browsers/Users Required for Testing Calls**
   - Use normal + incognito mode, OR
   - Use different browsers (Chrome + Firefox), OR
   - Use different devices

2. **HTTPS Not Required for localhost**
   - WebRTC works on localhost without HTTPS
   - For production, HTTPS is required

3. **Mock AI Analysis**
   - Current AI analyzer generates mock results
   - Replace with real model in production
   - See: `backend/app/services/ai_analyzer.py`

4. **Privacy-First Design**
   - No audio data stored on server
   - Only metadata saved to database
   - Audio processed in real-time only

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend shows: "Application startup complete"
✅ Frontend shows: "VITE ready"
✅ Login successful → Dashboard loads
✅ Contacts page shows online users
✅ Incoming call modal appears
✅ Active call page displays with waveform
✅ Risk analysis updates in real-time
✅ Call ends gracefully

---

## 🆘 Still Having Issues?

1. **Check both terminals** for error messages
2. **Check browser console** (F12 → Console)
3. **Verify environment variables**:
   - `backend/.env` exists
   - `frontend/.env` has `VITE_MOCK_MODE=false`
4. **Restart everything**:
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start backend first
   - Start frontend second
   - Hard refresh browser (Ctrl+Shift+R)

---

## 📚 Additional Documentation

- **Architecture:** `ARCHITECTURE.md`
- **API Contract:** `API_CONTRACT.md`
- **Backend Details:** `backend/BACKEND_COMPLETE.md`
- **Frontend Details:** `frontend/COMPLETION_SUMMARY.md`
- **WebRTC Integration:** `frontend/WEBRTC_INTEGRATION.md`

---

**VoiceShield Project - SIH 2026**
**Privacy-First Real-Time Voice Integrity Security**
