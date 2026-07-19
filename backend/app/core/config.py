import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, BeforeValidator
from typing_extensions import Annotated

def parse_cors(v: Union[str, List[str]]) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Disaster Response Assistant"
    
    # CORS setup
    BACKEND_CORS_ORIGINS: Annotated[
        List[str], BeforeValidator(parse_cors)
    ] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]

    # Supabase Secrets
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://placeholder.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "placeholder_anon_key")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "placeholder_service_key")
    # FIX HIGH #14: Added missing SUPABASE_JWT_SECRET used by security.py for JWT verification
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "placeholder_jwt_secret")

    # IBM watsonx AI Settings
    WATSONX_API_KEY: str = os.getenv("WATSONX_API_KEY", "placeholder_watsonx_key")
    WATSONX_PROJECT_ID: str = os.getenv("WATSONX_PROJECT_ID", "placeholder_project_id")
    WATSONX_ENDPOINT_URL: str = os.getenv("WATSONX_ENDPOINT_URL", "https://us-south.ml.cloud.ibm.com")
    WATSONX_GRANITE_MODEL_ID: str = "ibm/granite-13b-instruct-v2"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
