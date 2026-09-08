# Current Issue: "Unable to Fetch" During Login/Signup

## 🐛 Problem Description
When trying to login or signup, you're getting an **"unable to fetch"** error.

## 🔍 Diagnosis
This error means the frontend (browser) cannot connect to the backend API at `http://localhost:8000`.

## ✅ What I Fixed

### 1. Mock Mode Disabled ✅
- Changed `VITE_MOCK_MODE=false` in `frontend/.env`
- Frontend now connects to real backend instead of using mocks

### 2. CORS Configuration Updated ✅
- Updated `backend/app/config.py`
- Now allows ports: 5173, 5174, 5175, 3000
- **Before:** Only allowed 5175
- **After:** Allows all common Vite ports

```python
# backend/app/config.py
ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
```

### 3. Created Troubleshooting Guides ✅
- `FIX_UNABLE_TO_FETCH.md` - Complete troubleshooting guide
- `test_connection.py` - Backend connection test script

## 🚀 What You Need to Do

### Step 1: Start Backend
```bash
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Wait for this message:**
```
INFO:     Application startup complete.
```

### Step 2: Test Backend (Optional but Recommended)
```bash
# In another terminal:
cd SIH_2026/backend
python test_connection.py
```

This will verify:
- ✅ Backend is running
- ✅ API endpoints work
- ✅ CORS is configured
- ✅ Registration works

### Step 3: Start Frontend
```bash
# In another terminal:
cd SIH_2026/frontend
npm run dev
```

**Note the port number shown:**
```
Local: http://localhost:5173/  ← Your port
```

### Step 4: Open Browser
```
http://localhost:5173/
```

### Step 5: Test Login
**Try logging in with:**
- Email: `john@test.com`
- Password: `password123`

**If you see "user not found", create test data first:**
```bash
cd SIH_2026/backend
python create_test_data.py
```

## 🔍 Troubleshooting

### Still Getting "Unable to Fetch"?

**Check 1: Is backend running?**
```bash
curl http://localhost:8000/
```

**Should return:**
```json
{"app":"VoiceShield","version":"1.0.0","status":"running"}
```

**If "Connection refused":** Backend is not running - Start it!

---

**Check 2: Is frontend connecting to correct URL?**

Open browser console (F12), you should see:
```
Trying to connect to: http://localhost:8000/api/auth/login
```

**If you see a different URL:** Check `frontend/.env` file

---

**Check 3: CORS errors in console?**

If you see:
```
blocked by CORS policy
```

**Solution:** The CORS fix should have resolved this. If still occurring:
1. Stop backend (Ctrl+C)
2. Verify `backend/app/config.py` has your frontend port in ALLOWED_ORIGINS
3. Restart backend

---

**Check 4: Network tab in browser**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for request to `/api/auth/login`
5. Check the status:
   - **Failed** = Backend not running
   - **CORS error** = CORS issue
   - **401/400** = Backend working but wrong credentials

## 📋 Quick Checklist

Run through these:

### Backend Status:
- [ ] Terminal shows: "Application startup complete"
- [ ] Can access: http://localhost:8000/ in browser
- [ ] Test script passes: `python test_connection.py`

### Frontend Status:
- [ ] Terminal shows: "Local: http://localhost:XXXX/"
- [ ] Landing page loads in browser
- [ ] Console shows no errors (F12)
- [ ] `.env` has `VITE_MOCK_MODE=false`

### Connection Test:
- [ ] Browser console shows network request to backend
- [ ] No "Failed to fetch" errors
- [ ] No CORS policy errors

## 🎯 Expected Behavior

When everything is working:

1. **Type email/password** → Click Login
2. **Browser sends request** to `http://localhost:8000/api/auth/login`
3. **Backend responds** with JWT token
4. **Frontend saves token** to localStorage
5. **Redirect to Dashboard** ✅

## 📚 Documentation Created

For detailed help, see:

1. **`FIX_UNABLE_TO_FETCH.md`** - Complete troubleshooting guide
2. **`READY_TO_TEST.md`** - Quick start testing guide
3. **`QUICK_START_GUIDE.md`** - Comprehensive setup guide
4. **`START_COMMANDS.md`** - Command reference

## 💡 Most Common Solutions

### Solution 1: Backend Not Started (90% of cases)
```bash
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Solution 2: Wrong Port in Frontend
```bash
# Check frontend port, then verify backend CORS allows it
# Already fixed in backend/app/config.py!
```

### Solution 3: Need Test Data
```bash
cd SIH_2026/backend
python create_test_data.py
```

### Solution 4: Browser Cache
```
Hard refresh: Ctrl + Shift + R
```

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ Login page loads without console errors
2. ✅ Can type email/password
3. ✅ Click "Login" button
4. ✅ See loading state briefly
5. ✅ Redirect to Dashboard page
6. ✅ Dashboard shows your name and data

## 🆘 If Still Not Working

1. **Read:** `FIX_UNABLE_TO_FETCH.md` for detailed troubleshooting
2. **Run:** `python test_connection.py` to diagnose backend
3. **Check:** Browser console (F12) for specific error messages
4. **Verify:** Both terminals show servers are running

---

**Status:** Configuration fixed, ready to test
**Action Required:** Start backend → Start frontend → Test login
**Expected Result:** Login works successfully! ✅
