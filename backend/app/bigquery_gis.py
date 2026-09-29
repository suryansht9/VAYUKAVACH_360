import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

class BigQueryGISConnector:
    """
    BigQuery Spatial GIS Service.
    Executes ST_DWithin and ST_Contains spatial SQL queries on coastal infrastructure assets and cyclone tracks.
    """
    def __init__(self):
        self.project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "vayukavach-360-dpg")
        
    def query_vulnerable_assets_in_radius(self, eye_lat: float, eye_lon: float, radius_km: float = 150.0) -> List[Dict[str, Any]]:
        """
        Simulates:
        SELECT id, name, type, ST_DISTANCE(ST_GEOGPOINT(longitude, latitude), ST_GEOGPOINT(@lon, @lat)) as distance_m
        FROM `vayukavach.gis.coastal_assets`
        WHERE ST_DWithin(ST_GEOGPOINT(longitude, latitude), ST_GEOGPOINT(@lon, @lat), @radius_m)
        ORDER BY distance_m ASC
        """
        possible_paths = [
            BACKEND_DIR / "data" / "coastal_infrastructure.json",
            ROOT_DIR / "backend" / "data" / "coastal_infrastructure.json",
            ROOT_DIR / "data" / "coastal_infrastructure.json",
        ]
        infrastructure_file = None
        for p in possible_paths:
            if p.exists():
                infrastructure_file = str(p)
                break
                
        if not infrastructure_file or not os.path.exists(infrastructure_file):
            return []
            
        with open(infrastructure_file, "r", encoding="utf-8") as f:
            assets = json.load(f)
            
        result = []
        for asset in assets:
            # Approximate haversine distance
            lat_diff = (asset["latitude"] - eye_lat) * 111.0
            lon_diff = (asset["longitude"] - eye_lon) * 111.0 * 0.95
            dist_km = (lat_diff**2 + lon_diff**2)**0.5
            
            if dist_km <= radius_km:
                asset_copy = dict(asset)
                asset_copy["distance_to_cyclone_eye_km"] = round(dist_km, 1)
                result.append(asset_copy)
                
        result.sort(key=lambda x: x["distance_to_cyclone_eye_km"])
        return result
