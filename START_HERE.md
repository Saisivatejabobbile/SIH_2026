# 🚀 START HERE - VoiceShield Quick Start

## ✅ Everything is Ready!

I've set up everything for you. Just follow these 3 steps:

---

## Step 1: Start Backend (Terminal 1)

```bash
cd SIH_2026/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Wait for this message:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

✅ Backend is now running on **http://localhost:8001**

---

## Step 2: Start Frontend (Terminal 2)

```bash
cd SIH_2026/frontend
npm run dev
```

**Wait for this message:**
```
➜  Local:   http://localhost:5173/
```

✅ Frontend is now running on **http://localhost:5173**

---

## Step 3: Open Browser

```
http://localhost:5173/
```

---

## 🧪 Test It!

### First Time? Create Test Users:
```bash
# In a new terminal:
cd SIH_2026/backend
python create_test_data.py
```

### Login:
- Go to: http://localhost:5173/
- Click "Get Started" → "Login"
- Email: `john@test.com`
- Password: `password123`
- Click "Login"

**Expected:** Dashboard loads ✅

---

## ⚡ Quick Verification

### Is Backend Running?
```bash
curl http://localhost:8001/
```
**Should return:** `{"app":"VoiceShield","version":"1.0.0","status":"running"}`

### Is Frontend Running?
Open: http://localhost:5173/
**Should see:** Landing page with "Real-time AI Voice Analysis"

---

## 🎯 Important Notes

1. **Port Changed:** Backend runs on **8001** (not 8000)
2. **Two Terminals:** Keep both open while testing
3. **Test Data:** Run `python create_test_data.py` once
4. **Hard Refresh:** Press `Ctrl+Shift+R` after login

---

## 🐛 Common Issues

### "Unable to fetch"
→ Backend not running. Start it with the command above.

### "Port already in use"
→ Use a different port: `--port 8002` and update frontend/.env

### Login fails
→ Create test data first: `python create_test_data.py`

---

## 📚 More Help?

- `SERVERS_STARTED.md` - Detailed setup info
- `CURRENT_ISSUE_SUMMARY.md` - Current status
- `FIX_UNABLE_TO_FETCH.md` - Troubleshooting
- `QUICK_START_GUIDE.md` - Complete guide

---

**Ready to test!** 🎉

Just run the two commands above and open your browser!
