# VoiceShield - Start Commands Reference

## 🚀 Quick Start (Copy & Paste)

### Terminal 1: Backend
```bash
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Frontend
```bash
cd SIH_2026/frontend
npm run dev
```

### Browser
```
http://localhost:5173/
```

---

## 📦 First Time Setup

### Backend Setup
```bash
cd SIH_2026/backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create test data
python create_test_data.py
```

### Frontend Setup
```bash
cd SIH_2026/frontend

# Install dependencies
npm install

# Verify .env file has VITE_MOCK_MODE=false
cat .env
```

---

## 🧪 Test Credentials

**User 1:**
- Email: `john@test.com`
- Password: `password123`

**User 2:**
- Email: `jane@test.com`
- Password: `password123`

**More users:** bob, alice, charlie, diana (all @test.com / password123)

---

## 🔍 Verify Everything is Running

### Check Backend
```bash
# Should return: {"message":"VoiceShield API"}
curl http://localhost:8000/
```

### Check Frontend
```
Open browser: http://localhost:5173/
Should see landing page (no errors)
```

### Check API Docs
```
http://localhost:8000/docs
```

---

## 🛑 Stop Servers

**In each terminal:** Press `Ctrl + C`

---

## 🔄 Restart (If Something Goes Wrong)

### Full Restart
```bash
# Terminal 1: Stop backend (Ctrl+C), then:
cd SIH_2026/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Stop frontend (Ctrl+C), then:
cd SIH_2026/frontend
npm run dev

# Browser: Hard refresh
Ctrl + Shift + R
```

---

## 🐛 Common Issues

### Port Already in Use

**Backend (Port 8000):**
```bash
# Change port:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Then update frontend/.env:
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
```

**Frontend (Port 5173):**
- Vite will automatically try next port (5174, 5175, etc.)
- Use the URL shown in terminal

### Module Not Found

**Backend:**
```bash
cd SIH_2026/backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd SIH_2026/frontend
npm install
```

### Database Issues

**Reset database:**
```bash
cd SIH_2026/backend
rm voiceshield.db
python create_test_data.py
```

---

## 📝 Important Notes

1. **Start backend FIRST**, then frontend
2. **Keep both terminals open** while testing
3. **Use two browsers/windows** to test calls
4. **Allow microphone access** when prompted
5. **Check browser console** (F12) for errors

---

## ✅ Success Checklist

- [ ] Backend shows: "Application startup complete"
- [ ] Frontend shows: "Local: http://localhost:5173/"
- [ ] Browser opens landing page (no errors)
- [ ] Can login with test credentials
- [ ] Dashboard loads successfully
- [ ] Browser console shows: "WebSocket connected"

---

**Ready to test!** 🎉
See `QUICK_START_GUIDE.md` for detailed testing instructions.
