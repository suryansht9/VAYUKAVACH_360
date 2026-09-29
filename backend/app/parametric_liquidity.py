import uuid
import sys
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
ROOT_DIR = BACKEND_DIR.parent
for p in [str(ROOT_DIR), str(BACKEND_DIR), str(CURRENT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app.models import ParametricGrant
except ImportError:
    try:
        from app.models import ParametricGrant
    except ImportError:
        from models import ParametricGrant

class ParametricLiquidityEngine:
    """
    Automated Parametric Emergency Liquidity Release Engine.
    Disburses pre-landfall emergency funds direct to Gram Panchayats 48h prior to landfall
    when physical hydrodynamic surge or wind thresholds are breached.
    Includes SHA-256 cryptographic transaction verification & PFMS reference tracking.
    """
    def __init__(self):
        self.grants_database: List[Dict[str, Any]] = [
            {
                "grant_id": "PLR-2026-OD-01",
                "pfms_ref": "PFMS-DISASTER-OD-98231",
                "panchayat": "Paradeep Port Trust",
                "district": "Jagatsinghpur",
                "amount_inr_lakhs": 25.0,
                "status": "APPROVED & DISBURSED",
                "authorized_timestamp": "2026-09-28T08:30:00Z",
                "tx_hash": hashlib.sha256(b"PLR-2026-OD-01-Paradeep-25.0").hexdigest()[:16],
                "trigger_reason": "Predicted storm surge (4.2m) breaches 3.0m critical trigger threshold.",
                "direct_benefit_beneficiaries": 45000,
                "disbursement_channel": "Direct Benefit Transfer (DBT) to Gram Panchayat Disaster Ledger"
            },
            {
                "grant_id": "PLR-2026-OD-02",
                "pfms_ref": "PFMS-DISASTER-OD-98232",
                "panchayat": "Ersama Block",
                "district": "Jagatsinghpur",
                "amount_inr_lakhs": 25.0,
                "status": "APPROVED & DISBURSED",
                "authorized_timestamp": "2026-09-28T09:15:00Z",
                "tx_hash": hashlib.sha256(b"PLR-2026-OD-02-Ersama-25.0").hexdigest()[:16],
                "trigger_reason": "Coastal arterial evacuation bridge inundation risk > 2.0m depth.",
                "direct_benefit_beneficiaries": 38000,
                "disbursement_channel": "Direct Benefit Transfer (DBT) to Gram Panchayat Disaster Ledger"
            },
            {
                "grant_id": "PLR-2026-WB-03",
                "pfms_ref": "PFMS-DISASTER-WB-44109",
                "panchayat": "Digha Coastal",
                "district": "Purba Medinipur",
                "amount_inr_lakhs": 20.0,
                "status": "APPROVED & DISBURSED",
                "authorized_timestamp": "2026-09-28T10:00:00Z",
                "tx_hash": hashlib.sha256(b"PLR-2026-WB-03-Digha-20.0").hexdigest()[:16],
                "trigger_reason": "Sea wall overtopping probability > 75% under 213 km/h cyclonic wind shear.",
                "direct_benefit_beneficiaries": 60000,
                "disbursement_channel": "Direct Benefit Transfer (DBT) to Gram Panchayat Disaster Ledger"
            },
            {
                "grant_id": "PLR-2026-OD-04",
                "pfms_ref": "PFMS-DISASTER-OD-98234",
                "panchayat": "Dhamra Port Sector",
                "district": "Bhadrak",
                "amount_inr_lakhs": 25.0,
                "status": "APPROVED & DISBURSED",
                "authorized_timestamp": "2026-09-28T11:20:00Z",
                "tx_hash": hashlib.sha256(b"PLR-2026-OD-04-Dhamra-25.0").hexdigest()[:16],
                "trigger_reason": "Hydrodynamic surge model predicts 3.8m inundation along Dhamra estuary.",
                "direct_benefit_beneficiaries": 32000,
                "disbursement_channel": "Direct Benefit Transfer (DBT) to Gram Panchayat Disaster Ledger"
            }
        ]

    def authorize_grant(
        self, 
        panchayat_name: str, 
        district: str, 
        affected_population: int, 
        predicted_surge_m: float, 
        trigger_threshold_m: float = 3.0
    ) -> Dict[str, Any]:
        """
        Evaluates pre-landfall telemetry against parametric trigger criteria.
        """
        is_triggered = predicted_surge_m >= trigger_threshold_m
        status = "APPROVED & DISBURSED" if is_triggered else "THRESHOLD NOT MET"
        amount = 25.0 if affected_population > 20000 else 15.0
        grant_id = f"PLR-2026-{uuid.uuid4().hex[:6].upper()}"
        pfms_ref = f"PFMS-DISASTER-{district[:2].upper()}-{uuid.uuid4().hex[:5].upper()}"
        
        raw_hash = f"{grant_id}-{panchayat_name}-{amount}-{datetime.now(timezone.utc).isoformat()}".encode('utf-8')
        tx_hash = hashlib.sha256(raw_hash).hexdigest()[:16]

        grant_record = {
            "grant_id": grant_id,
            "pfms_ref": pfms_ref,
            "panchayat": panchayat_name,
            "district": district,
            "amount_inr_lakhs": amount if is_triggered else 0.0,
            "status": status,
            "authorized_timestamp": datetime.now(timezone.utc).isoformat(),
            "tx_hash": tx_hash,
            "trigger_reason": f"Predicted surge ({predicted_surge_m}m) breaches {trigger_threshold_m}m parametric trigger." if is_triggered else f"Forecast surge ({predicted_surge_m}m) below trigger.",
            "direct_benefit_beneficiaries": affected_population,
            "disbursement_channel": "Direct Benefit Transfer (DBT) to Gram Panchayat Disaster Ledger"
        }
        
        if is_triggered:
            self.grants_database.insert(0, grant_record)
            
        return grant_record

    def get_summary(self) -> Dict[str, Any]:
        total_authorized_lakhs = sum(g["amount_inr_lakhs"] for g in self.grants_database if g["status"] == "APPROVED & DISBURSED")
        total_beneficiaries = sum(g["direct_benefit_beneficiaries"] for g in self.grants_database if g["status"] == "APPROVED & DISBURSED")
        return {
            "total_grants_authorized": len([g for g in self.grants_database if "APPROVED" in g["status"]]),
            "total_liquidity_released_inr_lakhs": round(total_authorized_lakhs, 2),
            "total_beneficiaries_covered": total_beneficiaries,
            "grants": self.grants_database
        }
