# 🛡️ VoiceShield - Quick Start

> **Privacy-first real-time voice integrity security layer with AI voice detection**

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start Backend
```bash
# Windows: Double-click
start_backend.bat

# OR manually:
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 2️⃣ Start Frontend
```bash
# Windows: Double-click
start_frontend.bat

# OR manually:
cd frontend
npm run dev
```

### 3️⃣ Open Browser
```
http://localhost:5173/
```

**Login:** john@test.com / password123

---

## 📚 Documentation Guide

Choose your path:

### 🆘 Having Issues?
1. **FIX_NOW.md** - Fix "Failed to fetch" error
2. **DIAGNOSE.md** - Diagnostic commands
3. **VISUAL_GUIDE.md** - Visual troubleshooting

### 📖 Complete Setup
1. **FINAL_INSTRUCTIONS.md** - Everything in one place
2. **QUICK_START_GUIDE.md** - Comprehensive setup
3. **START_HERE.md** - Simple 3-step guide

### 🔧 Technical Details
1. **SERVERS_STARTED.md** - Server configuration
2. **CURRENT_ISSUE_SUMMARY.md** - Known issues
3. **ARCHITECTURE.md** - System architecture

---

## ✅ Quick Verification

### Is Backend Running?
```bash
curl http://localhost:8001/
```
**Should return:** JSON with "VoiceShield"

### Is Frontend Running?
**Open:** http://localhost:5173/
**Should see:** Landing page

---

## 🎯 Test Accounts

After running `python backend/create_test_data.py`:

| Email | Password |
|-------|----------|
| john@test.com | password123 |
| jane@test.com | password123 |
| bob@test.com | password123 |

---

## 🐛 Common Issues

### "Failed to fetch"
→ Backend not running. Start it with `start_backend.bat`

### "Module not found"
```bash
cd backend
pip install -r requirements_minimal.txt
```

### "Port already in use"
→ Use different port or kill existing process

---

## 📊 Project Status

- ✅ Frontend: 100% Complete
- ✅ Backend: 100% Complete
- ✅ Integration: Configured
- 🎯 Next: Start servers and test!

---

## 🚀 Tech Stack

### Frontend:
- React + Vite
- Tailwind CSS v4
- React Router
- WebRTC

### Backend:
- FastAPI
- SQLAlchemy
- JWT Authentication
- WebSockets
- SQLite

---

## 📁 Project Structure

```
SIH_2026/
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   ├── requirements_minimal.txt
│   └── create_test_data.py
├── frontend/            # React frontend
│   ├── src/            # Source code
│   └── .env            # Configuration
├── start_backend.bat   # Start backend
├── start_frontend.bat  # Start frontend
└── Documentation files
```

---

## 🎬 Features

- ✅ User authentication (JWT)
- ✅ Real-time voice calls (WebRTC)
- ✅ AI voice analysis (mock)
- ✅ Risk level detection
- ✅ Call history
- ✅ Contact management
- ✅ Dark cybersecurity theme

---

## 📞 Support

**Read these if stuck:**
1. FIX_NOW.md
2. FINAL_INSTRUCTIONS.md  
3. VISUAL_GUIDE.md

**Still stuck?** Check:
- Backend terminal output
- Frontend terminal output
- Browser console (F12)

---

## ⚠️ Important Notes

1. **Both servers must run simultaneously**
2. **Keep terminal windows open**
3. **Backend on port 8001, frontend on 5173**
4. **Create test data before first login**
5. **Hard refresh browser after changes**

---

## 🎉 Success Indicators

You'll know it works when:
- ✅ Both terminals show servers running
- ✅ localhost:8001/ shows JSON
- ✅ localhost:5173/ shows landing page
- ✅ Login redirects to dashboard
- ✅ No "Failed to fetch" errors

---

**Made for Smart India Hackathon 2026**

🛡️ **VoiceShield - Secure Your Voice, Secure Your Trust**
