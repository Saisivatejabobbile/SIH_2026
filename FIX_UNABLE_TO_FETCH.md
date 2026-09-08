# Fix: "Unable to Fetch" Error During Login/Signup

## 🐛 Problem
When trying to login or signup, you get an error: **"unable to fetch"**

## 🔍 Root Causes

### 1. Backend Not Running
The frontend is trying to connect to `http://localhost:8000` but nothing is there.

### 2. CORS Port Mismatch
Backend allows `http://localhost:5175` but Vite is running on `http://localhost:5173`

### 3. Network Error
Browser can't reach backend (firewall, wrong URL, etc.)

---

## ✅ Solutions (Try in Order)

### Solution 1: Start the Backend Server

**Is your backend running?** Check if you see this in a terminal:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**If NOT running, start it:**
```bash
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Test if backend is working:**
Open browser: http://localhost:8000/

You should see:
```json
{
  "app": "VoiceShield",
  "version": "1.0.0",
  "status": "running"
}
```

---

### Solution 2: Fix CORS Port Issue

The backend needs to allow the port your frontend is running on.

**Check what port your frontend is on:**
Look at the frontend terminal, you'll see:
```
Local: http://localhost:5173/  ← Use this port number
```

**Update backend CORS settings:**

**Option A: Edit backend/.env file**
```env
# Add your frontend port (5173, 5174, or 5175)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000
```

**Option B: Edit backend/app/config.py** (if no .env file)
```python
# Change this line:
ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173"
```

**After changing, restart the backend:**
- Stop: Press `Ctrl+C`
- Start: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

---

### Solution 3: Verify Frontend Configuration

**Check frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_MOCK_MODE=false  ← Must be false!
```

**If you changed .env, restart frontend:**
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

**Hard refresh browser:**
```
Ctrl + Shift + R
```

---

### Solution 4: Check Browser Console

1. Open browser DevTools: Press `F12`
2. Go to **Console** tab
3. Try to login/signup again
4. Look for error messages

**Common errors you might see:**

#### "Failed to fetch"
```
TypeError: Failed to fetch
```
**Meaning:** Backend not running or wrong URL
**Fix:** Start backend on port 8000

#### "CORS policy"
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```
**Meaning:** CORS not configured for your frontend port
**Fix:** Add your port to ALLOWED_ORIGINS (see Solution 2)

#### "net::ERR_CONNECTION_REFUSED"
```
GET http://localhost:8000/api/auth/login net::ERR_CONNECTION_REFUSED
```
**Meaning:** Backend not running
**Fix:** Start backend

---

### Solution 5: Test API Directly

**Test backend registration endpoint:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

**Expected response:**
```json
{
  "id": "...",
  "email": "test@example.com",
  "full_name": "Test User",
  "created_at": "..."
}
```

**If this works:** Backend is fine, issue is with frontend connection

**If this fails:** Backend has an issue

---

## 🎯 Complete Fix Checklist

Run through this checklist:

### Backend:
- [ ] Terminal shows: "Application startup complete"
- [ ] Can open: http://localhost:8000/ in browser
- [ ] API docs work: http://localhost:8000/docs
- [ ] CORS includes your frontend port in config

### Frontend:
- [ ] Terminal shows: "Local: http://localhost:XXXX/"
- [ ] Can open: http://localhost:XXXX/ (landing page loads)
- [ ] `.env` has `VITE_MOCK_MODE=false`
- [ ] `.env` has `VITE_API_URL=http://localhost:8000`
- [ ] Did hard refresh after .env changes (Ctrl+Shift+R)

### Browser:
- [ ] No CORS errors in console (F12)
- [ ] No "Failed to fetch" errors
- [ ] Can see network requests in Network tab

---

## 🧪 Step-by-Step Test

### Step 1: Backend Status
```bash
# Terminal 1
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Wait for:**
```
INFO:     Application startup complete.
```

### Step 2: Test Backend
Open browser: http://localhost:8000/

**Should see:**
```json
{"app": "VoiceShield", "version": "1.0.0", "status": "running"}
```

### Step 3: Frontend Status
```bash
# Terminal 2
cd SIH_2026/frontend
npm run dev
```

**Look for port number:**
```
Local: http://localhost:5173/  ← Note this port
```

### Step 4: Update CORS (if needed)
If your frontend port is **NOT** 5175, edit `backend/app/config.py`:

```python
ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
```

**Add your port to the list!**

**Restart backend** after changing.

### Step 5: Test Login
1. Open: http://localhost:5173/ (or your port)
2. Click "Get Started"
3. Click "Already have an account? Login"
4. Enter:
   - Email: `john@test.com`
   - Password: `password123`
5. Click "Login"

**Expected:** Redirect to Dashboard ✅

**If still failing:** Check browser console (F12) for error message

---

## 🔧 Quick Fix Script

Create a file `test_connection.py` in backend folder:

```python
import requests

# Test backend connection
try:
    response = requests.get("http://localhost:8000/")
    print("✅ Backend is running!")
    print(f"Response: {response.json()}")
except Exception as e:
    print("❌ Backend is NOT running!")
    print(f"Error: {e}")

# Test registration
try:
    response = requests.post(
        "http://localhost:8000/api/auth/register",
        json={
            "email": "test123@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    if response.status_code == 201:
        print("✅ Registration endpoint works!")
    elif response.status_code == 400:
        print("⚠️  User already exists (endpoint is working)")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(response.json())
except Exception as e:
    print("❌ Cannot reach registration endpoint!")
    print(f"Error: {e}")
```

**Run it:**
```bash
python test_connection.py
```

---

## 💡 Most Common Issue

**Backend not started!**

90% of "unable to fetch" errors are because the backend isn't running.

**How to know backend is running:**
```bash
# Run this command:
curl http://localhost:8000/

# Should return:
{"app":"VoiceShield","version":"1.0.0","status":"running","environment":"development"}

# If you get "Connection refused" → backend NOT running
```

---

## 🆘 Still Not Working?

### Check These:

1. **Firewall blocking port 8000?**
   - Temporarily disable firewall
   - Or allow port 8000

2. **Another app using port 8000?**
   ```bash
   # Change backend port:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   
   # Update frontend/.env:
   VITE_API_URL=http://localhost:8001
   VITE_WS_URL=ws://localhost:8001
   ```

3. **Virtual environment not activated?**
   ```bash
   # Activate it:
   cd SIH_2026/backend
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   # Should see (venv) in prompt
   ```

4. **Missing dependencies?**
   ```bash
   cd SIH_2026/backend
   pip install -r requirements.txt
   ```

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ Backend terminal shows "Application startup complete"
2. ✅ http://localhost:8000/ shows VoiceShield status
3. ✅ Login page loads without console errors
4. ✅ Login works and redirects to Dashboard
5. ✅ No "Failed to fetch" or CORS errors

---

## 📝 Summary

**Problem:** Frontend can't connect to backend API

**Most Likely Cause:** Backend not running

**Quick Fix:**
1. Start backend: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Verify it's running: http://localhost:8000/
3. Start frontend: `npm run dev`
4. Try login again

**If still failing:** Check CORS settings include your frontend port

---

**Need more help?** Check the browser console (F12) and terminal outputs for specific error messages.
