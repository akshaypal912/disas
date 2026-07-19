"""
Python unit tests for backend/app/core/config.py and backend/app/core/security.py
Tests: settings defaults, SUPABASE_JWT_SECRET presence, JWT error handling
"""
import pytest
import os


# ── Tests: config defaults ────────────────────────────────────────────────────

class TestSettingsDefaults:
    """Verify all required settings have safe placeholder defaults."""

    def test_supabase_url_has_default(self):
        from app.core.config import settings
        assert settings.SUPABASE_URL is not None
        assert len(settings.SUPABASE_URL) > 0

    def test_supabase_key_has_default(self):
        from app.core.config import settings
        assert settings.SUPABASE_KEY is not None

    def test_supabase_jwt_secret_present(self):
        """FIX HIGH #14: SUPABASE_JWT_SECRET must exist in settings (was missing before)."""
        from app.core.config import settings
        assert hasattr(settings, "SUPABASE_JWT_SECRET"), (
            "SUPABASE_JWT_SECRET must be defined in Settings class"
        )
        assert settings.SUPABASE_JWT_SECRET is not None

    def test_watsonx_api_key_has_default(self):
        from app.core.config import settings
        assert settings.WATSONX_API_KEY is not None

    def test_watsonx_project_id_has_default(self):
        from app.core.config import settings
        assert settings.WATSONX_PROJECT_ID is not None

    def test_watsonx_endpoint_url_is_valid_url(self):
        from app.core.config import settings
        assert settings.WATSONX_ENDPOINT_URL.startswith("https://")

    def test_granite_model_id_set(self):
        from app.core.config import settings
        assert settings.WATSONX_GRANITE_MODEL_ID == "ibm/granite-13b-instruct-v2"

    def test_cors_origins_is_list(self):
        from app.core.config import settings
        assert isinstance(settings.BACKEND_CORS_ORIGINS, list)
        assert len(settings.BACKEND_CORS_ORIGINS) > 0

    def test_api_v1_str(self):
        from app.core.config import settings
        assert settings.API_V1_STR == "/api/v1"


# ── Tests: JWT security error handling ───────────────────────────────────────

class TestJWTSecurity:
    """
    Test the security module's JWT error handling without needing a real Supabase token.
    """

    def test_expired_token_raises_401(self):
        import jwt
        from fastapi import HTTPException
        from app.core.config import settings

        # Create a token that is already expired
        expired_token = jwt.encode(
            {"sub": "user_123", "exp": 1},  # exp=1 is in the distant past
            settings.SUPABASE_JWT_SECRET,
            algorithm="HS256",
        )

        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.security import get_current_user

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired_token)
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == 401
        assert "expired" in exc_info.value.detail.lower()

    def test_invalid_token_raises_401(self):
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.security import get_current_user

        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="this.is.not.a.valid.jwt"
        )
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(credentials)

        assert exc_info.value.status_code == 401

    def test_valid_token_returns_payload(self):
        import jwt
        from app.core.config import settings
        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.security import get_current_user

        payload = {"sub": "user_abc", "aud": "authenticated", "role": "coordinator"}
        token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        result = get_current_user(credentials)

        assert result["sub"] == "user_abc"
        assert result["role"] == "coordinator"


# ── Tests: CORS origins parsing ───────────────────────────────────────────────

class TestCORSParsing:
    def test_parse_cors_from_string(self):
        from app.core.config import parse_cors
        result = parse_cors("http://localhost:3000,http://localhost:5173")
        assert result == ["http://localhost:3000", "http://localhost:5173"]

    def test_parse_cors_strips_whitespace(self):
        from app.core.config import parse_cors
        result = parse_cors("http://localhost:3000 , http://localhost:5173")
        assert result == ["http://localhost:3000", "http://localhost:5173"]

    def test_parse_cors_passes_list_through(self):
        from app.core.config import parse_cors
        lst = ["http://localhost:3000"]
        result = parse_cors(lst)
        assert result == lst

    def test_parse_cors_raises_on_invalid(self):
        from app.core.config import parse_cors
        with pytest.raises(ValueError):
            parse_cors(12345)  # type: ignore
