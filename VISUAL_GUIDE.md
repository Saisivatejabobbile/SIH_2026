# 🎨 VoiceShield - Visual Setup Guide

## 🎯 The Big Picture

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                         │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   Terminal 1 │         │   Terminal 2 │             │
│  │              │         │              │             │
│  │   BACKEND    │         │   FRONTEND   │             │
│  │  Port 8001   │         │  Port 5173   │             │
│  └──────┬───────┘         └──────┬───────┘             │
│         │                        │                      │
│         └────────┬───────────────┘                      │
│                  │                                      │
│         ┌────────▼─────────┐                           │
│         │     Browser      │                           │
│         │ localhost:5173   │                           │
│         └──────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

**Both terminals must be open and running!**

---

## 📊 Step-by-Step Visual Flow

### Step 1: Start Backend

```
┌─────────────────────────────────────────┐
│  Terminal 1                             │
│  ─────────────────────────────────      │
│  $ cd SIH_2026/backend                  │
│  $ python -m uvicorn app.main:app \     │
│    --reload --host 0.0.0.0 --port 8001  │
│                                         │
│  INFO: Application startup complete.   │
│  INFO: Uvicorn running on               │
│        http://0.0.0.0:8001              │
│                                         │
│  ✅ Backend is RUNNING                  │
│  🚨 KEEP THIS WINDOW OPEN!              │
└─────────────────────────────────────────┘
```

### Step 2: Start Frontend

```
┌─────────────────────────────────────────┐
│  Terminal 2                             │
│  ─────────────────────────────────────  │
│  $ cd SIH_2026/frontend                 │
│  $ npm run dev                          │
│                                         │
│  VITE v5.x.x  ready in 234ms            │
│                                         │
│  ➜  Local:   http://localhost:5173/    │
│  ➜  Network: use --host to expose      │
│                                         │
│  ✅ Frontend is RUNNING                 │
│  🚨 KEEP THIS WINDOW OPEN!              │
└─────────────────────────────────────────┘
```

### Step 3: Open Browser

```
┌─────────────────────────────────────────┐
│  Browser                                │
│  ───────────────────────────────────    │
│  🌐 http://localhost:5173/              │
│                                         │
│  ┌───────────────────────────────┐     │
│  │   VoiceShield                 │     │
│  │   Real-time AI Voice Analysis │     │
│  │                               │     │
│  │   [Get Started]               │     │
│  └───────────────────────────────┘     │
│                                         │
│  ✅ App is LOADING                      │
└─────────────────────────────────────────┘
```

---

## 🔄 Communication Flow

### Successful Signup/Login:

```
Browser                  Frontend                Backend
   │                        │                       │
   │  1. User clicks Login  │                       │
   ├───────────────────────►│                       │
   │                        │                       │
   │                        │  2. POST /api/auth/   │
   │                        │     login             │
   │                        ├──────────────────────►│
   │                        │                       │
   │                        │  3. JWT Token         │
   │                        │◄──────────────────────┤
   │                        │                       │
   │  4. Redirect Dashboard │                       │
   │◄───────────────────────┤                       │
   │                        │                       │
   
✅ SUCCESS!
```

### Failed Signup/Login (Current Issue):

```
Browser                  Frontend                Backend
   │                        │                       │
   │  1. User clicks Login  │                       │
   ├───────────────────────►│                       │
   │                        │                       │
   │                        │  2. POST /api/auth/   │
   │                        │     login             │
   │                        ├──────────────────────►X
   │                        │                   NOT RUNNING!
   │                        │  ❌ Connection        │
   │                        │     Refused            │
   │  "Failed to fetch"     │                       │
   │◄───────────────────────┤                       │
   │                        │                       │
   
❌ FAILED - Backend not running!
```

---

## 🎬 Timeline View

### What Should Happen:

```
Time    Action                          Result
────────────────────────────────────────────────────────
0:00    Start backend terminal          Terminal opens
0:05    Backend starts up               "startup complete"
0:10    Start frontend terminal         Terminal opens
0:15    Frontend starts up              "ready in XXms"
0:20    Open browser                    Page loads
0:25    Try login                       ✅ SUCCESS!
```

### What's Happening Now:

```
Time    Action                          Result
────────────────────────────────────────────────────────
0:00    Backend started                 ❓ Unknown
0:05    Backend stopped?                ❌ Not running
0:10    Frontend running                ✅ OK
0:15    Open browser                    ✅ Page loads
0:20    Try login                       ❌ "Failed to fetch"
                                        (Backend not there)
```

---

## 🧪 Testing Flowchart

```
┌──────────────────┐
│  Start Backend   │
│  (Terminal 1)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      NO    ┌──────────────────┐
│  Did it start?   ├───────────►│  Check errors    │
│  (see "startup   │            │  Install deps?   │
│   complete")     │            └──────────────────┘
└────────┬─────────┘
         │ YES
         ▼
┌──────────────────┐
│  Test: Open      │
│  localhost:8001  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      NO    ┌──────────────────┐
│  Shows JSON?     ├───────────►│  Backend not     │
│  (VoiceShield)   │            │  running! Retry  │
└────────┬─────────┘            └──────────────────┘
         │ YES
         ▼
┌──────────────────┐
│  Start Frontend  │
│  (Terminal 2)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Open            │
│  localhost:5173  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      NO    ┌──────────────────┐
│  Try Login       ├───────────►│  Check browser   │
│  Works?          │            │  console (F12)   │
└────────┬─────────┘            └──────────────────┘
         │ YES
         ▼
┌──────────────────┐
│   ✅ SUCCESS!    │
│  App is working  │
└──────────────────┘
```

---

## 🎯 Checklist with Visual Indicators

### Before Starting:

```
┌─────────────────────────────────────────┐
│  Pre-flight Checklist                   │
├─────────────────────────────────────────┤
│  [ ] Backend dependencies installed     │
│  [ ] Frontend dependencies installed    │
│  [ ] No process using port 8001         │
│  [ ] No process using port 5173         │
└─────────────────────────────────────────┘
```

### During Startup:

```
┌─────────────────────────────────────────┐
│  Startup Checklist                      │
├─────────────────────────────────────────┤
│  [ ] Terminal 1 open                    │
│  [ ] Backend command executed           │
│  [ ] Backend shows "startup complete"   │
│  [ ] Terminal 2 open                    │
│  [ ] Frontend command executed          │
│  [ ] Frontend shows "ready"             │
│  [ ] Both terminals still open          │
└─────────────────────────────────────────┘
```

### Testing:

```
┌─────────────────────────────────────────┐
│  Testing Checklist                      │
├─────────────────────────────────────────┤
│  [ ] localhost:8001/ shows JSON         │
│  [ ] localhost:8001/docs shows API      │
│  [ ] localhost:5173/ shows landing page │
│  [ ] Test data created                  │
│  [ ] Can signup new user                │
│  [ ] Can login existing user            │
│  [ ] Dashboard loads after login        │
└─────────────────────────────────────────┘
```

---

## 🔴 Error Indicators

### "Failed to fetch" - Visual Debug:

```
        Browser Tries to Connect
               │
               ▼
        Frontend (5173)
               │
               │ Sends request to:
               │ http://localhost:8001
               ▼
        Backend (8001)
               │
               X  ← NOT RUNNING!
               
Result: ❌ "Failed to fetch"
```

### Solution:

```
        Browser Tries to Connect
               │
               ▼
        Frontend (5173)
               │
               │ Sends request to:
               │ http://localhost:8001
               ▼
        Backend (8001)
               │
               ✓  ← RUNNING!
               │
               ▼
        Returns: JWT Token
               
Result: ✅ Login successful!
```

---

## 📱 Port Map

```
Port 8001  ←  Backend Server
   │
   ├── /                 Root endpoint
   ├── /health          Health check
   ├── /docs            API documentation
   ├── /api/auth/...    Authentication endpoints
   ├── /api/users/...   User endpoints
   ├── /api/calls/...   Call endpoints
   ├── /ws/signaling    WebSocket signaling
   └── /ws/analyze      WebSocket analysis


Port 5173  ←  Frontend Server
   │
   ├── /                Landing page
   ├── /signup          Signup page
   ├── /login           Login page
   ├── /dashboard       Dashboard page
   ├── /contacts        Contacts page
   ├── /call/:id        Active call page
   ├── /history         Call history page
   ├── /settings        Settings page
   └── /about           About page
```

---

## 🎨 Status Indicators

### Backend Status:

```
✅ GOOD:
Terminal shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFO: Application startup complete.
INFO: Uvicorn running on http://0.0.0.0:8001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
❌ BAD:
Terminal shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR: [Errno 10048] Port already in use
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution: Use different port or kill process
```

```
❌ BAD:
Terminal is closed or shows nothing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(no output)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution: Start the backend!
```

### Frontend Status:

```
✅ GOOD:
Terminal shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VITE v5.x.x  ready in 234ms

➜  Local:   http://localhost:5173/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
❌ BAD:
Terminal is closed or shows errors
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution: npm install or restart
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 Quick Reference Card

```
╔════════════════════════════════════════╗
║     VOICESHIELD QUICK REFERENCE        ║
╠════════════════════════════════════════╣
║ Backend Port:      8001                ║
║ Frontend Port:     5173                ║
║                                        ║
║ Backend URL:       localhost:8001      ║
║ Frontend URL:      localhost:5173      ║
║ API Docs:          localhost:8001/docs ║
║                                        ║
║ Test User:         john@test.com       ║
║ Test Password:     password123         ║
║                                        ║
║ Start Backend:     start_backend.bat   ║
║ Start Frontend:    start_frontend.bat  ║
║ Create Test Data:  create_test_data.py ║
╚════════════════════════════════════════╝
```

---

## ✅ Final Checklist

```
Before reporting "not working", verify ALL:

✓  Backend terminal is open
✓  Backend shows "Application startup complete"
✓  Frontend terminal is open
✓  Frontend shows "ready in XXms"
✓  localhost:8001/ returns JSON
✓  localhost:8001/docs shows Swagger UI
✓  localhost:5173/ shows landing page
✓  Browser console (F12) has no red errors
✓  Test data created (ran create_test_data.py)
✓  Both terminals still open (didn't close them)
✓  Hard refreshed browser (Ctrl+Shift+R)
```

---

**Remember: The servers only run while terminals are open!**

**Close terminal = server stops = "Failed to fetch"**

🚀 Keep both terminals open and you're good to go!
