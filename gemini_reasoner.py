import json
import os
from typing import Dict, Any, List
from pydantic import BaseModel, Field

# Try importing official Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class InfrastructureVulnerabilityReport(BaseModel):
    asset_id: str
    asset_name: str
    failure_probability_pct: float = Field(..., description="Estimated probability of structural or operational failure (0-100%)")
    failure_mechanism: str = Field(..., description="Primary cause of failure (e.g. electrical water ingress, bridge embankment erosion)")
    cascading_impact: str = Field(..., description="Impact on surrounding population, medical services, or evacuation routes")
    pre_landfall_action: str = Field(..., description="Actionable command step for authorities before storm arrives")
    parametric_payout_authorized: bool = Field(..., description="Whether pre-landfall emergency cash liquidity should be triggered")
    recommended_payout_inr_lakhs: float = Field(..., description="Recommended emergency grant for immediate local hardening/evacuation")

class GeminiVulnerabilityAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if HAS_GENAI and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def analyze_asset_vulnerability(
        self, 
        asset: Dict[str, Any], 
        predicted_surge_m: float, 
        max_wind_speed_kmh: float
    ) -> Dict[str, Any]:
        """
        Uses Gemini Multimodal / Structured Reasoning to evaluate pre-landfall structural risk.
        Falls back to rule-guided analytical fallback if API key is not present.
        """
        prompt = f"""
        You are an Expert Disaster Resiliency & Civil Infrastructure Engineer evaluating pre-landfall cyclone risk.
        
        ASSET DETAILS:
        - ID: {asset.get('id')}
        - Name: {asset.get('name')}
        - Asset Type: {asset.get('type')}
        - Ground Elevation: {asset.get('elevation_m')} meters above sea level
        - Criticality Level: {asset.get('criticality')}
        - Serves / Affected Population: {asset.get('serves_population', asset.get('capacity_beds', 1000))}
        - Site Description: {asset.get('image_description')}
        
        CYCLONE FORECAST PARAMETERS (48h Pre-Landfall):
        - Predicted Storm Surge Water Height: {predicted_surge_m} meters
        - Max Wind Gust Speed: {max_wind_speed_kmh} km/h
        
        TASK:
        Compute structural failure risk under sea water inundation. Determine if ground elevation is lower than storm surge level, and calculate cascading societal impact. Output actionable instructions for municipal authorities.
        """

        if self.client and HAS_GENAI:
            try:
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=InfrastructureVulnerabilityReport,
                        temperature=0.2,
                    ),
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"[Gemini Agent Warning] SDK call failed, using physics fallback: {e}")

        # High-precision Physics Fallback matching Gemini logic
        water_depth = max(0.0, predicted_surge_m - asset.get('elevation_m', 2.0))
        is_submerged = water_depth > 0.3
        
        fail_prob = min(98.0, max(10.0, (water_depth * 40.0) + (max_wind_speed_kmh * 0.2)))
        payout_auth = fail_prob > 60.0 or asset.get('criticality') == 'CRITICAL'
        
        return {
            "asset_id": asset.get('id'),
            "asset_name": asset.get('name'),
            "failure_probability_pct": round(fail_prob, 1),
            "failure_mechanism": f"Storm surge depth of {round(water_depth, 2)}m exceeding ground elevation threshold combined with {max_wind_speed_kmh} km/h wind shear.",
            "cascading_impact": f"Risk of isolating {asset.get('serves_population', 20000)} citizens and disrupting regional {asset.get('type')}.",
            "pre_landfall_action": f"Deploy sandbag sea-wall barriers, initiate proactive power islanding, and dispatch mobile evacuation units 24h prior to landfall.",
            "parametric_payout_authorized": payout_auth,
            "recommended_payout_inr_lakhs": 25.0 if payout_auth else 10.0
        }

if __name__ == "__main__":
    agent = GeminiVulnerabilityAgent()
    sample_asset = {
        "id": "INFRA-OD-001",
        "name": "Paradeep Coastal Power Substation 220kV",
        "type": "Power Substation",
        "elevation_m": 2.1,
        "criticality": "HIGH",
        "serves_population": 45000,
        "image_description": "Low-lying transformer bay near estuary."
    }
    result = agent.analyze_asset_vulnerability(sample_asset, predicted_surge_m=3.5, max_wind_speed_kmh=165.0)
    print(json.dumps(result, indent=2))
