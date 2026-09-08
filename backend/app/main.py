"""
VoiceShield Backend - Main Application
FastAPI application with WebRTC signaling and AI voice analysis
"""

from fastapi import FastAPI, Request, Response
from contextlib import asynccontextmanager
import logging

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    from app.database import create_tables
    # Import models to ensure they're registered with SQLAlchemy
    from app.models.user import User
    from app.models.contact import Contact
    
    # Startup
    logger.info("Starting VoiceShield v1.0.0")
    logger.info("Environment: development")
    
    # Create database tables
    create_tables()
    logger.info("Database tables created")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title="VoiceShield",
    version="1.0.0",
    description="Privacy-first real-time voice integrity security layer",
    lifespan=lifespan,
)


# Handle OPTIONS requests BEFORE middleware
@app.options("/{full_path:path}")
async def handle_options(request: Request, full_path: str):
    logger.info(f"OPTIONS request received for: {full_path}")
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )


# Custom middleware to add CORS headers to ALL responses
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # For OPTIONS, let it pass through to the handler above
    if request.method == "OPTIONS":
        response = await call_next(request)
    else:
        response = await call_next(request)
    
    # Add CORS headers to response
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    logger.info(f"Response status: {response.status_code}")
    return response


logger.info("CORS configured with logging")


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "app": "VoiceShield",
        "version": "1.0.0",
        "status": "running",
        "environment": "development",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": "VoiceShield",
        "version": "1.0.0",
    }


# Import and include routers
from app.routers import auth, users, calls
from app.websockets import signaling, analysis

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(calls.router, prefix="/api/calls", tags=["Calls"])
app.include_router(signaling.router, tags=["WebRTC Signaling"])
app.include_router(analysis.router, tags=["Audio Analysis"])

logger.info("All routers registered")
