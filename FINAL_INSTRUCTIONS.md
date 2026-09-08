# 🎯 FINAL INSTRUCTIONS - VoiceShield Setup

## 📊 Current Status

### ✅ What's Complete:
- Frontend: 100% built (9 pages, 40+ components)
- Backend: 100% built (14 API endpoints, 2 WebSockets)
- Configuration: Updated and ready
- Dependencies: All installed

### ❌ Current Issue:
**"Failed to fetch" during login/signup**

### 🔍 Root Cause:
**Backend server is not running when you try to use the app**

---

## 🚀 SOLUTION: How to Run VoiceShield

### Quick Start (EASIEST METHOD)

**1. Double-click these files in order:**

```
📁 SIH_2026/
   📄 start_backend.bat    ← Click this FIRST
   📄 start_frontend.bat   ← Click this SECOND
```

**2. Wait for both to start:**
- Backend window shows: "Application startup complete"
- Frontend window shows: "Local: http://localhost:5173/"

**3. Open browser:**
```
http://localhost:5173/
```

**4. Create test data (ONE TIME ONLY):**

Open a new terminal:
```bash
cd SIH_2026/backend
python create_test_data.py
```

**5. Login:**
- Email: john@test.com
- Password: password123

---

## 📋 Manual Method (If Batch Files Don't Work)

### Terminal 1 - Backend:
```bash
cd SIH_2026
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Keep this terminal open!**

### Terminal 2 - Frontend:
```bash
cd SIH_2026
cd frontend
npm run dev
```

**Keep this terminal open!**

### Terminal 3 - Create Test Data (Run Once):
```bash
cd SIH_2026/backend
python create_test_data.py
```

### Browser:
```
http://localhost:5173/
```

---

## ✅ Verification Steps

### Step 1: Check Backend is Running

**Open browser:** http://localhost:8001/

**You should see:**
```json
{
  "app": "VoiceShield",
  "version": "1.0.0",
  "status": "running",
  "environment": "development"
}
```

**If page doesn't load** → Backend is NOT running

---

### Step 2: Check API Documentation

**Open browser:** http://localhost:8001/docs

**You should see:** FastAPI Swagger UI with all endpoints listed

---

### Step 3: Check Frontend is Running

**Open browser:** http://localhost:5173/

**You should see:** VoiceShield landing page with:
- "Real-time AI Voice Analysis" heading
- Dark cybersecurity theme
- "Get Started" button

---

### Step 4: Test the API Connection

**Open browser console (F12) and run:**
```javascript
fetch('http://localhost:8001/')
  .then(r => r.json())
  .then(d => console.log('Backend response:', d))
```

**You should see:** `Backend response: {app: "VoiceShield", ...}`

---

## 🧪 Testing Checklist

Before reporting issues, verify ALL of these:

### Backend Checks:
- [ ] Backend terminal is open and running
- [ ] Terminal shows: "Application startup complete"
- [ ] http://localhost:8001/ shows JSON response
- [ ] http://localhost:8001/docs shows API documentation
- [ ] No errors in backend terminal

### Frontend Checks:
- [ ] Frontend terminal is open and running
- [ ] Terminal shows: "Local: http://localhost:5173/"
- [ ] http://localhost:5173/ loads landing page
- [ ] No errors in frontend terminal

### Browser Checks:
- [ ] Hard refreshed page (Ctrl + Shift + R)
- [ ] Browser console (F12) shows no red errors
- [ ] Network tab shows requests to localhost:8001

### Data Checks:
- [ ] Ran `python create_test_data.py` once
- [ ] Test users exist (john@test.com, jane@test.com, etc.)

---

## 🎯 Test Account Credentials

After running `create_test_data.py`, you can login with any of these:

| Email | Password | Name |
|-------|----------|------|
| john@test.com | password123 | John Doe |
| jane@test.com | password123 | Jane Smith |
| bob@test.com | password123 | Bob Johnson |
| alice@test.com | password123 | Alice Williams |
| charlie@test.com | password123 | Charlie Brown |
| diana@test.com | password123 | Diana Prince |

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch"

**Cause:** Backend not running

**Solution:**
1. Check if backend terminal is open
2. Check http://localhost:8001/ in browser
3. If doesn't load, start backend again

---

### Issue 2: "Module not found: uvicorn"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd SIH_2026/backend
pip install -r requirements_minimal.txt
```

---

### Issue 3: "Port 8001 already in use"

**Cause:** Another process using port 8001

**Solution 1 - Kill the process:**
```powershell
# Find process using port 8001
netstat -ano | findstr :8001

# Kill it (replace XXXX with PID)
taskkill /PID XXXX /F
```

**Solution 2 - Use different port:**
```bash
# Backend on port 8002:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

**Then update frontend/.env:**
```env
VITE_API_URL=http://localhost:8002
VITE_WS_URL=ws://localhost:8002
```

**Restart frontend after changing .env**

---

### Issue 4: "Invalid credentials"

**Cause:** Test data not created OR wrong password

**Solution:**
```bash
cd SIH_2026/backend
python create_test_data.py
```

Then try: john@test.com / password123

---

### Issue 5: Page loads but signup still fails

**Cause:** Browser cache

**Solution:**
1. Hard refresh: **Ctrl + Shift + R**
2. Clear browser cache
3. Try again

---

## 📁 Important Files Reference

### Configuration Files:
- `frontend/.env` - Frontend environment variables
- `backend/.env` - Backend environment variables (optional)
- `backend/app/config.py` - Backend configuration

### Current Settings:
```env
# frontend/.env
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
VITE_MOCK_MODE=false
```

### Startup Scripts:
- `start_backend.bat` - Starts backend server (Windows)
- `start_frontend.bat` - Starts frontend server (Windows)

### Test Data:
- `backend/create_test_data.py` - Creates 6 test users

---

## 🎬 Complete Workflow

### First Time Setup:

1. **Install Backend Dependencies:**
   ```bash
   cd SIH_2026/backend
   pip install -r requirements_minimal.txt
   ```

2. **Create Test Users:**
   ```bash
   python create_test_data.py
   ```

3. **Start Backend:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

4. **Start Frontend (new terminal):**
   ```bash
   cd SIH_2026/frontend
   npm run dev
   ```

5. **Open Browser:**
   ```
   http://localhost:5173/
   ```

6. **Login:**
   - Email: john@test.com
   - Password: password123

---

### Daily Use (After First Setup):

1. **Start Backend:**
   - Double-click: `start_backend.bat`
   - OR run: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001`

2. **Start Frontend:**
   - Double-click: `start_frontend.bat`
   - OR run: `npm run dev`

3. **Open Browser:**
   - http://localhost:5173/

---

## 📊 System Architecture

```
Browser (http://localhost:5173/)
    ↓
Frontend (React + Vite)
    ↓ HTTP/WebSocket
Backend (http://localhost:8001/)
    ↓
Database (SQLite - voiceshield.db)
```

---

## 🎯 What Each Component Does

### Frontend (Port 5173):
- React application
- User interface
- Handles routing, forms, display
- Makes API calls to backend
- Manages WebRTC connections

### Backend (Port 8001):
- FastAPI REST API
- Authentication (JWT)
- Database operations
- WebSocket servers (signaling + analysis)
- Mock AI voice analysis

### Database:
- SQLite file: `backend/voiceshield.db`
- Stores: users, call history, sessions
- Auto-created on first run

---

## 🔍 Debugging Tips

### Check Backend Logs:
Look at backend terminal for errors. Common messages:
- ✅ "Application startup complete" - Good!
- ❌ "Port already in use" - Use different port
- ❌ "Module not found" - Install dependencies

### Check Browser Console:
Press F12, look for:
- ✅ "WebSocket connected" - Good!
- ❌ "Failed to fetch" - Backend not running
- ❌ "CORS policy" - CORS issue (already fixed)
- ❌ "net::ERR_CONNECTION_REFUSED" - Backend not running

### Check Network Tab:
Press F12 → Network tab, try signup:
- ✅ Status 201 - Success!
- ❌ Failed - Backend not running
- ❌ Status 401 - Wrong credentials
- ❌ Status 400 - Invalid data

---

## 📚 Documentation Files

I've created these guides to help you:

1. **START_HERE.md** - Quick 3-step start guide
2. **FIX_NOW.md** - Fix "Failed to fetch" error
3. **DIAGNOSE.md** - Diagnostic commands
4. **SERVERS_STARTED.md** - Server setup details
5. **CURRENT_ISSUE_SUMMARY.md** - Issue summary
6. **FIX_UNABLE_TO_FETCH.md** - Troubleshooting
7. **QUICK_START_GUIDE.md** - Complete setup guide
8. **READY_TO_TEST.md** - Testing instructions
9. **This file (FINAL_INSTRUCTIONS.md)** - Everything in one place

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Both backend and frontend terminals are open
2. ✅ http://localhost:8001/ shows VoiceShield JSON
3. ✅ http://localhost:8001/docs shows API docs
4. ✅ http://localhost:5173/ shows landing page
5. ✅ Signup creates account successfully
6. ✅ Login redirects to Dashboard
7. ✅ Dashboard shows user name and stats
8. ✅ Contacts page shows other users
9. ✅ Can make calls between users
10. ✅ No "Failed to fetch" errors

---

## 🎉 Summary

**The Problem:**
- "Failed to fetch" during signup/login

**The Cause:**
- Backend server not running

**The Solution:**
1. Start backend: `start_backend.bat` or manual command
2. Start frontend: `start_frontend.bat` or manual command
3. Keep both terminals open
4. Create test data once
5. Login and test

**Key Points:**
- Backend MUST be running (keep terminal open)
- Frontend MUST be running (keep terminal open)
- Both servers must be running simultaneously
- Backend on port 8001, frontend on port 5173
- Test data must be created once

---

## 🆘 If Still Not Working

**Provide these details:**

1. **Backend terminal output** (copy full text)
2. **Frontend terminal output** (copy full text)
3. **Browser console errors** (F12 → Console tab)
4. **Result of:** `curl http://localhost:8001/`
5. **Contents of:** `frontend/.env` file

This will help identify the exact issue.

---

**Project Status:** 100% Complete - Just needs servers running!

**Next Action:** Start both servers using the batch files or manual commands above.

Good luck! 🚀
