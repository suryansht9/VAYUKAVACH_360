from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AssetVulnerabilityRequest(BaseModel):
    asset_id: str
    predicted_surge_m: Optional[float] = 4.2
    max_wind_speed_kmh: Optional[float] = 213.0

class InfrastructureVulnerabilityReport(BaseModel):
    asset_id: str
    asset_name: str
    failure_probability_pct: float = Field(..., description="Estimated probability of structural failure (0-100%)")
    failure_mechanism: str = Field(..., description="Primary cause of failure")
    cascading_impact: str = Field(..., description="Impact on surrounding population and services")
    pre_landfall_action: str = Field(..., description="Actionable command step for authorities before storm arrives")
    parametric_payout_authorized: bool = Field(..., description="Whether pre-landfall emergency cash liquidity should be triggered")
    recommended_payout_inr_lakhs: float = Field(..., description="Recommended emergency grant in INR Lakhs")

class InundationRequest(BaseModel):
    latitude: float = 20.2684
    longitude: float = 86.6715
    surge_height_m: float = 4.2
    region_name: str = "Odisha Coastal Corridor"

class ParametricReleaseRequest(BaseModel):
    panchayat_name: str
    district: str
    affected_population: int
    predicted_surge_m: float
    trigger_threshold_m: float = 3.0

class ParametricGrant(BaseModel):
    grant_id: str
    panchayat: str
    district: str
    amount_inr_lakhs: float
    status: str
    authorized_timestamp: str
    trigger_reason: str
    direct_benefit_beneficiaries: int

class FieldPhotoInspectionRequest(BaseModel):
    image_base64: str
    asset_context: Optional[str] = "Coastal Power Substation / Evacuation Infrastructure"

class EvacuationRouteRequest(BaseModel):
    origin_panchayat: Optional[str] = "Paradeep Coastal Village #4"
    origin_lat: Optional[float] = 20.2684
    origin_lon: Optional[float] = 86.6715
    surge_height_m: Optional[float] = 4.2

class VoiceQueryRequest(BaseModel):
    user_text: str
    language_code: Optional[str] = "or" # 'or', 'bn', 'te', 'hi', 'gu'

class TTSRequest(BaseModel):
    language: str
    alert_text: Optional[str] = None

class WeatherLocationRequest(BaseModel):
    location_query: Optional[str] = None # e.g. "Paradeep", "Kendrapara", "Puri", "Digha", "Kolkata"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    surge_height_m: Optional[float] = 4.2
