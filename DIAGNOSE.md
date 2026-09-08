# 🔍 Diagnose "Failed to Fetch" Error

## What the Screenshots Show

Both signup and login show **"Failed to fetch"** - this means:
- ❌ Frontend cannot connect to backend API
- ❌ Backend is not running OR wrong URL

---

## Quick Diagnosis Commands

### 1. Check if Backend is Running

```bash
curl http://localhost:8001/
```

**If you get:**
- `{"app":"VoiceShield"...}` → Backend IS running ✅
- `Connection refused` → Backend NOT running ❌

---

### 2. Check if Port 8001 is in Use

**Windows:**
```powershell
netstat -ano | findstr :8001
```

**If nothing shows** → Port 8001 is free (backend not running)

---

### 3. Check Frontend Configuration

```bash
# Check what URL frontend is using:
cat SIH_2026/frontend/.env
```

**Should show:**
```
VITE_API_URL=http://localhost:8001
VITE_MOCK_MODE=false
```

---

## 🚀 Fix: Start Both Servers

### Step 1: Start Backend (NEW TERMINAL)

```bash
cd SIH_2026/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**KEEP THIS TERMINAL OPEN!** Don't close it.

**You should see:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### Step 2: Start Frontend (NEW TERMINAL)

```bash
cd SIH_2026/frontend
npm run dev
```

**KEEP THIS TERMINAL OPEN!** Don't close it.

**You should see:**
```
VITE ready in XXXms
➜  Local:   http://localhost:5173/
```

### Step 3: Refresh Browser

Press: **Ctrl + Shift + R** (hard refresh)

Then try signup/login again.

---

## 🔍 Browser Console Check

1. Open browser DevTools: **F12**
2. Go to **Console** tab
3. Try to signup/login
4. Look for errors

**You might see:**
```
GET http://localhost:8001/api/auth/register net::ERR_CONNECTION_REFUSED
```

This confirms backend is not running.

---

## ✅ Verification Steps

### Is Backend Running?

**Test 1: Browser**
```
http://localhost:8001/
```
Should show: `{"app":"VoiceShield","version":"1.0.0"...}`

**Test 2: API Docs**
```
http://localhost:8001/docs
```
Should show: FastAPI Swagger UI

**Test 3: Terminal**
```bash
curl http://localhost:8001/
```

### Is Frontend Connected?

1. Open: http://localhost:5173/
2. Press F12 (DevTools)
3. Go to **Network** tab
4. Try to signup
5. Look for request to `http://localhost:8001/api/auth/register`

**Status should be:** `201 Created` (not Failed/CORS/Refused)

---

## 🐛 Common Issues

### Issue 1: Forgot to Start Backend
**Solution:** Run the backend command in a terminal and keep it open

### Issue 2: Backend Started but Closed Terminal
**Solution:** Backend stops when you close terminal. Start it again.

### Issue 3: Wrong Port
**Check frontend/.env has:**
```
VITE_API_URL=http://localhost:8001
```

**Check backend is running on 8001** (not 8000)

### Issue 4: Frontend Not Refreshed
**Solution:** Hard refresh: Ctrl + Shift + R

### Issue 5: Port 8001 Blocked/In Use
**Solution:** Use different port:
```bash
# Backend:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002

# Update frontend/.env:
VITE_API_URL=http://localhost:8002
VITE_WS_URL=ws://localhost:8002

# Restart frontend
```

---

## 📋 Complete Checklist

- [ ] Opened TWO terminals (one for backend, one for frontend)
- [ ] Started backend: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001`
- [ ] Backend terminal shows: "Application startup complete"
- [ ] Can access: http://localhost:8001/ in browser
- [ ] Started frontend: `npm run dev`
- [ ] Frontend terminal shows: "Local: http://localhost:5173/"
- [ ] Hard refreshed browser: Ctrl + Shift + R
- [ ] Created test data: `python create_test_data.py`
- [ ] Both terminals still OPEN (didn't close them)

---

## 🎯 Most Likely Issue

**Backend is not running!**

The "Failed to fetch" error means the browser can't reach the backend API. This happens when:
1. Backend was never started
2. Backend was started but terminal was closed
3. Backend crashed/stopped

**Solution: Start the backend and KEEP THE TERMINAL OPEN!**

---

## 🆘 Still Not Working?

**Take a screenshot of:**
1. Backend terminal (full output)
2. Frontend terminal (full output)
3. Browser console (F12 → Console tab)
4. Browser network tab (F12 → Network tab, try signup again)

This will show exactly where the problem is.

---

## ✅ When It's Working

You'll know it's fixed when:
1. ✅ Backend terminal stays open with "running on http://0.0.0.0:8001"
2. ✅ Frontend terminal stays open with "Local: http://localhost:5173/"
3. ✅ http://localhost:8001/ shows VoiceShield JSON
4. ✅ Signup/Login works without "Failed to fetch"
5. ✅ Browser console shows successful API requests

---

**The fix is simple: Start both servers and keep their terminals open!** 🚀
