import os
from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

app = FastAPI(
    title="Reaching Roots Foundation API",
    description="Backend API for NGO field data collection and management",
    version="1.0.0"
)

# Security scheme for JWT
security = HTTPBearer()

# CORS configuration
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Auth dependency
from app.utils.jwt import decode_access_token

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    token = auth_header.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or not isinstance(payload, dict) or payload == {}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload

# Routers (to be implemented)
from app.routes import forms, pdf, chat, auth, dashboard, report
from app.db.init import initiate_database

@app.on_event("startup")
async def on_startup():
    await initiate_database()

app.include_router(forms.router, prefix="/api/forms")
app.include_router(pdf.router, prefix="/api/upload-pdf")
app.include_router(chat.router, prefix="/api/chat")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(dashboard.router, prefix="/api/dashboard")
app.include_router(report.router, prefix="/api/report") 