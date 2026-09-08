# VoiceShield Project Structure

This document provides an overview of the VoiceShield project organization.

```
voiceshield/
│
├── README.md                    # Project overview, quick start, features
├── ARCHITECTURE.md              # Complete system architecture and data flow
├── API_CONTRACT.md              # REST and WebSocket API documentation
├── PRIVACY.md                   # Privacy policy and audio handling details
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules (secrets, audio files, etc.)
│
├── frontend/                    # React + JavaScript + Vite frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── auth/            # Login, Register, Logout
│   │   │   ├── call/            # Call UI, Active Call, Incoming Call
│   │   │   ├── dashboard/       # Dashboard, Risk Display
│   │   │   ├── contacts/        # Contact List, Online Users
│   │   │   └── common/          # Reusable components
│   │   ├── services/            # Business logic
│   │   │   ├── CallManager.js   # WebRTC call orchestration
│   │   │   ├── AudioProcessor.js # AudioWorklet wrapper
│   │   │   ├── WebSocketClient.js # WebSocket management
│   │   │   └── api.js           # REST API client
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React Context (auth, call state)
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # Entry point
│   ├── audioProcessor.js        # AudioWorklet processor (PCM extraction)
│   ├── package.json             # NPM dependencies
│   ├── vite.config.js           # Vite configuration
│   └── .env.example             # Frontend environment variables
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Configuration and environment variables
│   │   ├── database.py          # Database connection and session
│   │   ├── models/              # SQLAlchemy database models
│   │   │   ├── user.py          # User model
│   │   │   └── call_session.py  # Call session model
│   │   ├── schemas/             # Pydantic schemas (request/response)
│   │   │   ├── auth.py          # Auth schemas
│   │   │   ├── user.py          # User schemas
│   │   │   └── call.py          # Call schemas
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── users.py         # User management endpoints
│   │   │   ├── contacts.py      # Contact management
│   │   │   └── calls.py         # Call history endpoints
│   │   ├── websockets/          # WebSocket handlers
│   │   │   ├── signaling.py     # WebRTC signaling WebSocket
│   │   │   └── analysis.py      # Audio analysis WebSocket
│   │   ├── services/            # Business logic services
│   │   │   ├── auth_service.py  # Authentication, JWT
│   │   │   ├── presence_service.py # Online/offline tracking
│   │   │   ├── call_service.py  # Call session management
│   │   │   ├── analysis_service.py # Audio analysis orchestration
│   │   │   ├── model_client.py  # External model API client
│   │   │   └── risk_engine.py   # Risk score calculation
│   │   ├── utils/               # Utility functions
│   │   │   ├── security.py      # Password hashing, JWT
│   │   │   ├── validators.py    # Input validation
│   │   │   └── audio_utils.py   # Audio processing utilities
│   │   └── middleware/          # Custom middleware
│   │       ├── cors.py          # CORS configuration
│   │       └── auth.py          # JWT authentication middleware
│   ├── alembic/                 # Database migrations
│   │   ├── versions/            # Migration scripts
│   │   └── env.py               # Alembic configuration
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment variables
│   └── Dockerfile               # Backend Docker image
│
├── tests/                       # Test suite
│   ├── unit/                    # Unit tests
│   │   ├── test_auth.py         # Auth service tests
│   │   ├── test_call_manager.py # CallManager tests
│   │   └── test_risk_engine.py  # Risk engine tests
│   ├── integration/             # Integration tests
│   │   ├── test_call_flow.py    # Complete call flow test
│   │   ├── test_websockets.py   # WebSocket tests
│   │   └── test_privacy.py      # Privacy guarantee tests
│   ├── conftest.py              # Pytest configuration and fixtures
│   └── README.md                # Testing documentation
│
├── docs/                        # Additional documentation
│   ├── DEMO_GUIDE.md            # How to demo the application
│   ├── CONTRIBUTING.md          # Contribution guidelines
│   ├── MODEL_INTEGRATION.md     # External model integration guide
│   ├── DEPLOYMENT.md            # Deployment instructions
│   └── API_EXAMPLES.md          # API usage examples
│
└── infra/                       # Infrastructure and deployment
    ├── docker-compose.yml       # Docker Compose for local development
    ├── docker-compose.prod.yml  # Docker Compose for production
    ├── nginx/                   # Nginx reverse proxy configuration
    │   └── nginx.conf
    ├── coturn/                  # TURN server configuration (optional)
    │   └── turnserver.conf
    ├── postgresql/              # PostgreSQL initialization scripts
    │   └── init.sql
    └── k8s/                     # Kubernetes manifests (optional)
        ├── deployment.yaml
        ├── service.yaml
        └── ingress.yaml
```

## Directory Purposes

### Root Level
- **Core documentation files** that define the project's architecture, API contracts, and privacy guarantees
- **Configuration files** for environment setup and Git

### `frontend/`
- **React application** with JavaScript (no TypeScript)
- **WebRTC integration** for peer-to-peer calls
- **AudioWorklet** for remote audio stream processing
- **WebSocket clients** for signaling and analysis

### `backend/`
- **FastAPI application** with Python
- **REST API endpoints** for authentication, users, contacts, calls
- **WebSocket handlers** for real-time signaling and analysis
- **External model client** for AI voice detection integration
- **Risk engine** for application-level risk scoring
- **Database models** (users, call sessions - NO AUDIO)

### `tests/`
- **Unit tests** for individual components
- **Integration tests** for complete workflows
- **Privacy tests** to verify no audio persistence

### `docs/`
- **Additional documentation** for demos, deployment, and integration
- **Guides** for contributors and users

### `infra/`
- **Docker configurations** for containerization
- **Nginx** for reverse proxy (production)
- **coturn** for TURN server (optional)
- **Kubernetes** manifests for orchestration (optional)

## Key Architectural Boundaries

### Audio Flow (Privacy-First)
```
Remote WebRTC Stream (Browser)
    ↓ [transient]
AudioWorklet (Browser)
    ↓ [transient]
Analysis WebSocket (Network)
    ↓ [transient]
Backend Bounded Buffer (Memory)
    ↓ [transient]
External Model API
    ↓ [result only]
Risk Engine (Backend)
    ↓ [metadata only]
Database (PostgreSQL)
```

### Module Separation
- **Auth** - Standalone authentication service
- **Presence** - Online/offline tracking
- **Signaling** - WebRTC negotiation
- **Calls** - Call session management
- **Analysis** - Audio analysis orchestration
- **Model Client** - External API integration
- **Risk Engine** - Risk calculation logic

## File Naming Conventions

### Frontend (JavaScript)
- **Components:** PascalCase (e.g., `CallManager.jsx`)
- **Services:** PascalCase (e.g., `AudioProcessor.js`)
- **Utilities:** camelCase (e.g., `formatDuration.js`)
- **Hooks:** camelCase with `use` prefix (e.g., `useCallState.js`)

### Backend (Python)
- **Modules:** snake_case (e.g., `auth_service.py`)
- **Classes:** PascalCase (e.g., `CallManager`)
- **Functions:** snake_case (e.g., `calculate_risk()`)

### Tests
- **Test files:** `test_*.py` prefix
- **Test functions:** `test_*` prefix

## Environment Variables

Each subsystem has its own `.env.example`:
- **Root:** Shared configuration
- **Backend:** Backend-specific (DATABASE_URL, MODEL_API_KEY)
- **Frontend:** Frontend-specific (VITE_API_URL)

**CRITICAL:** `MODEL_API_KEY` must ONLY be in backend `.env`, never frontend!

## What's NOT in This Repository

As per the project specification, the following are **explicitly excluded**:

### ❌ Model Training/Deployment
- Training notebooks
- Model weights/checkpoints
- Training datasets
- GPU training code
- Model deployment scripts

### ❌ Audio Persistence
- Audio files (WAV, MP3, etc.)
- Audio databases
- Recording functionality
- Audio playback from storage

### ❌ Production Secrets
- Actual API keys
- Production database credentials
- SSL certificates
- TURN server credentials

## Getting Started

1. **Read the documentation:**
   - Start with `README.md`
   - Understand `ARCHITECTURE.md`
   - Review `API_CONTRACT.md`
   - Read `PRIVACY.md` carefully

2. **Set up environment:**
   - Copy `.env.example` to `.env`
   - Configure database
   - Set up external model API (or use mock mode)

3. **Run backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. **Run frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Run tests:**
   ```bash
   cd tests
   pytest
   ```

## Next Steps

Now that the project structure is established:

1. **Backend Implementation:**
   - Set up FastAPI application
   - Implement authentication
   - Create database models
   - Build WebSocket handlers
   - Integrate external model API
   - Implement risk engine

2. **Frontend Implementation:**
   - Set up React + Vite
   - Build authentication UI
   - Implement CallManager
   - Create AudioWorklet processor
   - Build dashboard with risk visualization

3. **Testing:**
   - Write unit tests
   - Create integration tests
   - Verify privacy guarantees

4. **Documentation:**
   - Complete DEMO_GUIDE.md
   - Write MODEL_INTEGRATION.md
   - Create deployment guide

---

**This structure provides clear separation of concerns while maintaining the privacy-first architecture that is core to VoiceShield.**
