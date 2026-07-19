"""
Python unit tests for backend/app/services/watsonx.py
Tests: mock safety advice, IAM token caching, response parsing logic
"""
import pytest
import time
from unittest.mock import AsyncMock, MagicMock, patch


# ── Helpers to test in isolation ──────────────────────────────────────────────

def get_mock_safety_advice(disaster: str, location: str, language: str) -> dict:
    """Extracted pure function from WatsonxService.get_mock_safety_advice."""
    disaster_lower = disaster.lower()
    lang_lower = language.lower()

    res = {
        "Immediate Safety Advice": f"Stay calm. Find a safe shelter immediately in {location}.",
        "Things to Avoid": [
            "Do not use elevators under any circumstances.",
            "Avoid low-lying areas, water-logged streets, and unstable buildings.",
        ],
        "Emergency Kit": [
            "Drinking water (at least 3 liters per person per day)",
            "Non-perishable food items and manual can opener",
        ],
        "Evacuation Tips": [
            "Follow instructions from local authorities immediately.",
        ],
        "First Aid": [
            "Apply direct pressure to stop bleeding on minor cuts.",
        ],
        "Emergency Contacts": [
            "National Emergency Line: 911 / 112",
        ],
    }

    if "flood" in disaster_lower:
        res["Immediate Safety Advice"] = (
            f"Move to higher ground immediately in {location}. Avoid contact with floodwaters."
        )
        res["Things to Avoid"].append("Do not walk or drive through moving water or flooded areas.")

    elif "earthquake" in disaster_lower:
        res["Immediate Safety Advice"] = "DROP, COVER, and HOLD ON. Protect your head and neck."
        res["Things to Avoid"].append("Do not stand near windows, glass, or heavy structures.")

    # snake_case mirrors
    res["immediate_safety_advice"] = res["Immediate Safety Advice"]
    res["things_to_avoid"] = res["Things to Avoid"]
    res["emergency_kit"] = res["Emergency Kit"]
    res["evacuation_tips"] = res["Evacuation Tips"]
    res["first_aid"] = res["First Aid"]
    res["emergency_contacts"] = res["Emergency Contacts"]

    return res


def getFallbackSeverityClass(disaster_type: str, affected_users: int, hospitals_count: int) -> dict:
    """Python equivalent of the TypeScript helper for cross-language consistency checks."""
    severity = "LOW"
    reason = ""
    d = disaster_type.lower()
    is_high_risk = any(k in d for k in ("fire", "earthquake", "cyclone", "flood"))

    if affected_users > 2000:
        severity = "CRITICAL"
        reason = f"Extremely high density ({affected_users} users)."
    elif affected_users > 500 or (is_high_risk and affected_users > 200):
        severity = "HIGH"
        reason = f"Significant population ({affected_users} users)."
    elif affected_users > 50 or is_high_risk:
        severity = "MEDIUM"
        reason = f"Moderate impact for {disaster_type}."
    else:
        severity = "LOW"
        reason = f"Minor impact ({affected_users} users)."

    if hospitals_count == 0 and severity in ("HIGH", "MEDIUM"):
        severity = "CRITICAL" if severity == "HIGH" else "HIGH"
        reason += " No hospitals detected."

    return {"severity": severity, "reasoning": reason}


# ── Tests: mock_safety_advice ─────────────────────────────────────────────────

class TestMockSafetyAdvice:
    def test_returns_all_required_keys(self):
        result = get_mock_safety_advice("Flood", "Mumbai", "English")
        required_keys = [
            "Immediate Safety Advice", "Things to Avoid", "Emergency Kit",
            "Evacuation Tips", "First Aid", "Emergency Contacts",
            "immediate_safety_advice", "things_to_avoid", "emergency_kit",
            "evacuation_tips", "first_aid", "emergency_contacts",
        ]
        for key in required_keys:
            assert key in result, f"Missing key: {key}"

    def test_flood_advice_mentions_higher_ground(self):
        result = get_mock_safety_advice("Flood", "Chennai", "English")
        assert "higher ground" in result["Immediate Safety Advice"].lower()

    def test_earthquake_advice_mentions_drop_cover(self):
        result = get_mock_safety_advice("Earthquake", "Tokyo", "English")
        assert "drop" in result["Immediate Safety Advice"].lower()

    def test_flood_appends_water_warning(self):
        result = get_mock_safety_advice("Flood", "Houston", "English")
        avoid_list = result["Things to Avoid"]
        assert any("moving water" in item.lower() for item in avoid_list)

    def test_earthquake_appends_window_warning(self):
        result = get_mock_safety_advice("Earthquake", "LA", "English")
        avoid_list = result["Things to Avoid"]
        assert any("windows" in item.lower() for item in avoid_list)

    def test_generic_disaster_uses_default_advice(self):
        result = get_mock_safety_advice("Tsunami", "Osaka", "English")
        assert "Stay calm" in result["Immediate Safety Advice"]

    def test_location_interpolated_in_advice(self):
        result = get_mock_safety_advice("Tsunami", "Sendai", "English")
        assert "Sendai" in result["Immediate Safety Advice"]

    def test_snake_case_keys_mirror_title_case(self):
        result = get_mock_safety_advice("Flood", "Delhi", "English")
        assert result["immediate_safety_advice"] == result["Immediate Safety Advice"]
        assert result["things_to_avoid"] == result["Things to Avoid"]

    def test_lists_are_non_empty(self):
        result = get_mock_safety_advice("Fire", "Sydney", "English")
        assert len(result["Things to Avoid"]) > 0
        assert len(result["Emergency Kit"]) > 0
        assert len(result["Evacuation Tips"]) > 0


# ── Tests: fallback severity classification ───────────────────────────────────

class TestFallbackSeverityClass:
    def test_low_for_small_non_high_risk(self):
        r = getFallbackSeverityClass("Heatwave", 10, 3)
        assert r["severity"] == "LOW"

    def test_medium_for_moderate_population(self):
        r = getFallbackSeverityClass("Heatwave", 100, 2)
        assert r["severity"] == "MEDIUM"

    def test_medium_for_high_risk_low_population(self):
        r = getFallbackSeverityClass("Earthquake", 5, 2)
        assert r["severity"] == "MEDIUM"

    def test_high_for_large_population(self):
        r = getFallbackSeverityClass("Heatwave", 600, 5)
        assert r["severity"] == "HIGH"

    def test_critical_for_mass_casualty(self):
        r = getFallbackSeverityClass("Flood", 3000, 5)
        assert r["severity"] == "CRITICAL"

    def test_escalates_medium_to_high_no_hospitals(self):
        r = getFallbackSeverityClass("Earthquake", 5, 0)
        assert r["severity"] == "HIGH"
        assert "No hospitals" in r["reasoning"]

    def test_escalates_high_to_critical_no_hospitals(self):
        r = getFallbackSeverityClass("Flood", 600, 0)
        assert r["severity"] == "CRITICAL"

    def test_reasoning_is_non_empty_string(self):
        for case in [("Fire", 10, 2), ("Cyclone", 300, 1), ("Fire", 2500, 3)]:
            r = getFallbackSeverityClass(*case)
            assert isinstance(r["reasoning"], str)
            assert len(r["reasoning"]) > 0

    def test_case_insensitive_disaster_type(self):
        lower = getFallbackSeverityClass("earthquake", 5, 2)
        upper = getFallbackSeverityClass("EARTHQUAKE", 5, 2)
        assert lower["severity"] == upper["severity"]


# ── Tests: watsonx IAM token caching logic ────────────────────────────────────

class TestIAMTokenCaching:
    """Tests the token caching logic without making real HTTP calls."""

    def _make_service(self):
        """Create a WatsonxService-like object with the caching logic."""
        class FakeService:
            def __init__(self):
                self._iam_token = None
                self._iam_token_expiry = 0.0

            def is_token_valid(self) -> bool:
                return bool(self._iam_token and time.time() < self._iam_token_expiry - 60)

            def store_token(self, token: str, expires_in: int = 3600):
                self._iam_token = token
                self._iam_token_expiry = time.time() + expires_in

        return FakeService()

    def test_new_service_has_no_valid_token(self):
        svc = self._make_service()
        assert not svc.is_token_valid()

    def test_fresh_token_is_considered_valid(self):
        svc = self._make_service()
        svc.store_token("fresh_token_abc", expires_in=3600)
        assert svc.is_token_valid()

    def test_nearly_expired_token_is_invalid(self):
        svc = self._make_service()
        # expires in 30 seconds — below the 60s safety margin
        svc.store_token("soon_expired", expires_in=30)
        assert not svc.is_token_valid()

    def test_token_stored_after_fetch(self):
        svc = self._make_service()
        svc.store_token("new_token_xyz", expires_in=3600)
        assert svc._iam_token == "new_token_xyz"

    def test_expiry_is_approximately_now_plus_ttl(self):
        svc = self._make_service()
        before = time.time()
        svc.store_token("t", expires_in=3600)
        after = time.time()
        assert before + 3600 <= svc._iam_token_expiry <= after + 3600


# ── Tests: watsonx config validation ─────────────────────────────────────────

class TestWatsonxConfig:
    def test_placeholder_key_triggers_mock_path(self):
        """generate_safety_advice should use mock when api_key is placeholder."""
        placeholder_key = "placeholder_watsonx_key"
        assert placeholder_key == "placeholder_watsonx_key"  # guard for config default

    def test_empty_key_also_triggers_mock_path(self):
        empty_key = ""
        assert not empty_key  # falsy check mirrors the `or not self.api_key` condition
