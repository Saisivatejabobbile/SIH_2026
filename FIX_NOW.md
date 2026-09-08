# ❌ "Failed to Fetch" - HERE'S THE FIX

## The Problem

Your backend server is **NOT RUNNING**. That's why you see "Failed to fetch".

The frontend is trying to connect to `http://localhost:8001` but nothing is there.

---

## ✅ THE FIX (3 Simple Steps)

### Method 1: Using Batch Files (EASIEST)

1. **Double-click:** `SIH_2026/start_backend.bat`
   - A window opens
   - **DON'T CLOSE IT!**
   - Wait for "Application startup complete"

2. **Double-click:** `SIH_2026/start_frontend.bat`
   - Another window opens
   - **DON'T CLOSE IT!**
   - Wait for "Local: http://localhost:5173/"

3. **Open browser:** http://localhost:5173/
   - Hard refresh: Ctrl + Shift + R
   - Try signup/login again

---

### Method 2: Using Command Line

**Open Terminal 1:**
```bash
cd SIH_2026/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
**LEAVE THIS OPEN!**

**Open Terminal 2:**
```bash
cd SIH_2026/frontend
npm run dev
```
**LEAVE THIS OPEN!**

**Open browser:** http://localhost:5173/

---

## 🧪 Create Test Users First

**Before login, create test data:**

**Open Terminal 3:**
```bash
cd SIH_2026/backend
python create_test_data.py
```

This creates users like:
- john@test.com / password123
- jane@test.com / password123

---

## ✅ Verify Backend is Running

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

**If you see "This site can't be reached"** → Backend NOT running!

---

## 🔍 Check What Went Wrong

### Check 1: Is Backend Running?

```bash
curl http://localhost:8001/
```

**Result:**
- ✅ Shows JSON → Backend is running
- ❌ Connection refused → Backend NOT running

### Check 2: Browser Console

1. Press **F12** in browser
2. Go to **Console** tab
3. Try signup
4. Look for errors

**If you see:**
```
GET http://localhost:8001/api/auth/register net::ERR_CONNECTION_REFUSED
```
→ Backend is NOT running!

---

## 🎯 The Real Issue

The backend process I started earlier **didn't stay running** in the background.

**You need to:**
1. Manually start backend in a terminal
2. **Keep that terminal window open**
3. Backend runs as long as terminal is open
4. Close terminal = backend stops

---

## 📝 Step-by-Step (Can't Fail)

### Step 1: Open PowerShell/CMD

Right-click in `SIH_2026` folder → "Open in Terminal"

### Step 2: Start Backend

Type:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Press **Enter**

**You should see:**
```
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
2026-XX-XX - INFO - Starting VoiceShield v1.0.0
2026-XX-XX - INFO - Environment: development
2026-XX-XX - INFO - Database tables created
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

**DO NOT CLOSE THIS WINDOW!**

### Step 3: Test Backend

**Open new browser tab:** http://localhost:8001/

**If you see JSON with "VoiceShield"** → ✅ Working!

### Step 4: Open NEW Terminal

Right-click in `SIH_2026` folder → "Open in Terminal" (again)

### Step 5: Start Frontend

Type:
```bash
cd frontend
npm run dev
```

Press **Enter**

**You should see:**
```
VITE v5.x.x  ready in XXXms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**DO NOT CLOSE THIS WINDOW!**

### Step 6: Open Application

**Browser:** http://localhost:5173/

**Press:** Ctrl + Shift + R (hard refresh)

### Step 7: Try Signup/Login

- Email: john@test.com
- Password: password123

**Should work now!** ✅

---

## ⚠️ IMPORTANT

**Both terminal windows must stay OPEN!**

- Close backend terminal → backend stops → "Failed to fetch"
- Close frontend terminal → frontend stops → page doesn't load

---

## 🐛 Troubleshooting

### "Module not found: uvicorn"

```bash
cd SIH_2026/backend
pip install -r requirements_minimal.txt
```

### "Port 8001 already in use"

**Use port 8002 instead:**

```bash
# Backend:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002

# Edit frontend/.env:
VITE_API_URL=http://localhost:8002
VITE_WS_URL=ws://localhost:8002

# Restart frontend
```

### Still seeing "Failed to fetch"

1. **Check both terminals are open**
2. **Verify backend URL:** http://localhost:8001/
3. **Hard refresh browser:** Ctrl + Shift + R
4. **Check browser console (F12)** for actual error

---

## ✅ Success Checklist

Before trying signup/login, verify:

- [ ] Backend terminal is OPEN and shows "Application startup complete"
- [ ] Frontend terminal is OPEN and shows "Local: http://localhost:5173/"
- [ ] http://localhost:8001/ shows VoiceShield JSON
- [ ] http://localhost:5173/ shows landing page
- [ ] Browser console (F12) shows NO red errors
- [ ] Created test data: `python create_test_data.py`

---

## 🎉 When It Works

You'll see:
- ✅ Signup creates account successfully
- ✅ Login redirects to Dashboard
- ✅ Dashboard shows your name
- ✅ Contacts page loads
- ✅ No "Failed to fetch" errors

---

**Bottom line: START THE BACKEND SERVER AND KEEP IT RUNNING!** 🚀

The batch files (`start_backend.bat` and `start_frontend.bat`) make this easy!
