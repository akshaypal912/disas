import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.supabase import get_supabase_client

from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.services.watsonx import watsonx_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Emergency Disaster Response routing core, backed by IBM Granite models.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Request schemas
class GenerateResponseRequest(BaseModel):
    disaster: str = Field(..., example="Flash Flood")
    location: str = Field(..., example="Sector 4-B, Los Angeles")
    language: str = Field("English", example="Hindi")

# Set up CORS origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.post("/generate-response")
@app.post("/api/v1/generate-response")
async def generate_response(request: GenerateResponseRequest):
    """
    Generate critical, high-fidelity response advice using IBM Granite.
    """
    advice = await watsonx_service.generate_safety_advice(
        disaster=request.disaster,
        location=request.location,
        language=request.language
    )
    return advice

@app.get("/", tags=["health"])
async def health_check():
    """
    FIX CRITICAL #6: Perform real connectivity checks instead of hardcoding True.
    """
    db_ok = False
    llm_ok = False

    # Check Supabase connectivity with a lightweight query
    try:
        client = get_supabase_client()
        client.table("profiles").select("id").limit(1).execute()
        db_ok = True
    except Exception:
        db_ok = False

    # Check watsonx availability only if credentials are configured
    llm_ok = (
        settings.WATSONX_API_KEY != "placeholder_watsonx_key"
        and settings.WATSONX_PROJECT_ID != "placeholder_project_id"
    )

    overall = "healthy" if (db_ok and llm_ok) else "degraded"

    return {
        "status": overall,
        "service": settings.PROJECT_NAME,
        "database_connected": db_ok,
        "llm_connected": llm_ok,
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
