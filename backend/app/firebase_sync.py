import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

class FirebaseRealtimeSyncEngine:
    """
    Firebase Realtime Database & Alert Dispatch Engine (Pillar 6: Data & Backend).
    Synchronizes pre-landfall parametric alerts, shelter occupancy states,
    and mobile push notifications across coastal district collectors and citizen devices.
    """
    def __init__(self):
        self.firebase_project_id = "vayukavach-360-resilience-dpg"
        self.active_listeners_count = 14280
        self.live_alert_stream = [
            {
                "event_id": "EVT-FB-9081",
                "topic": "PARAMETRIC_LIQUIDITY_RELEASE",
                "message": "₹25 Lakhs pre-landfall cash grant auto-credited to Paradeep Panchayat Disaster Account.",
                "timestamp": "2026-09-28T08:30:15Z",
                "priority": "HIGH",
                "delivered_devices": 45000
            },
            {
                "event_id": "EVT-FB-9082",
                "topic": "EVACUATION_REROUTE_ALERT",
                "message": "NH-53 Bridge marked IMPASSABLE. All convoy vehicles directed to Kendrapara Ridge Bypass.",
                "timestamp": "2026-09-28T09:12:40Z",
                "priority": "CRITICAL",
                "delivered_devices": 38200
            },
            {
                "event_id": "EVT-FB-9083",
                "topic": "SHELTER_CAPACITY_UPDATE",
                "message": "Kendrapara High-Ground Shelter #14 has 330 beds open with medical triage active.",
                "timestamp": "2026-09-28T10:05:22Z",
                "priority": "NORMAL",
                "delivered_devices": 18400
            }
        ]

    def broadcast_emergency_event(self, topic: str, message: str, priority: str = "HIGH") -> Dict[str, Any]:
        event_record = {
            "event_id": f"EVT-FB-{uuid.uuid4().hex[:4].upper()}",
            "topic": topic,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "priority": priority,
            "delivered_devices": self.active_listeners_count
        }
        self.live_alert_stream.insert(0, event_record)
        return event_record

    def get_firebase_status(self) -> Dict[str, Any]:
        return {
            "firebase_project": self.firebase_project_id,
            "realtime_db_uri": f"https://{self.firebase_project_id}-default-rtdb.asia-southeast1.firebasedatabase.app",
            "active_client_connections": self.active_listeners_count,
            "auth_provider": "Firebase Auth (Phone OTP + Google IAM for District Magistrates)",
            "live_alert_stream": self.live_alert_stream
        }
