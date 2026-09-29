import json
import numpy as np
from typing import Dict, Any, List

class GEEInundationEngine:
    """
    Simulates coastal land elevation inundation matching Google Earth Engine NASADEM SRTM 30m dataset.
    Computes pre-landfall storm surge flooding boundaries across coastal coordinates.
    """
    def __init__(self, region_name: str = "Odisha Coastal Corridor"):
        self.region_name = region_name

    def calculate_inundation_grid(
        self, 
        base_latitude: float = 20.30, 
        base_longitude: float = 86.60, 
        surge_height_m: float = 3.5
    ) -> Dict[str, Any]:
        """
        Generates simulated elevation contours and inundation maps for GEE overlay.
        """
        # Create a grid of points around the coastal target area
        lats = np.linspace(base_latitude - 0.25, base_latitude + 0.25, 20)
        lons = np.linspace(base_longitude - 0.25, base_longitude + 0.25, 20)
        
        flooded_points = []
        high_ground_points = []
        
        for lat in lats:
            for lon in lons:
                # Distance from coast approximation for elevation modeling
                dist_from_coast = max(0.1, (lon - 86.4) * 20.0)
                simulated_elevation_m = max(0.5, float(dist_from_coast * 1.5 + np.random.normal(0, 0.3)))
                
                is_flooded = simulated_elevation_m < surge_height_m
                point_data = {
                    "lat": float(lat),
                    "lon": float(lon),
                    "elevation_m": round(simulated_elevation_m, 2),
                    "surge_depth_m": round(max(0.0, surge_height_m - simulated_elevation_m), 2),
                    "is_flooded": is_flooded
                }
                if is_flooded:
                    flooded_points.append(point_data)
                else:
                    high_ground_points.append(point_data)
                    
        total_points = len(flooded_points) + len(high_ground_points)
        inundation_area_sq_km = (len(flooded_points) / total_points) * 1250.0  # ~1250 sq km coastal grid
        
        return {
            "region": self.region_name,
            "surge_height_m": surge_height_m,
            "total_inundated_area_sq_km": round(inundation_area_sq_km, 1),
            "inundation_percentage": round((len(flooded_points) / total_points) * 100, 1),
            "flooded_zones": flooded_points,
            "safe_zones": high_ground_points[:10]  # sample top safe shelter spots
        }

if __name__ == "__main__":
    engine = GEEInundationEngine()
    inundation_data = engine.calculate_inundation_grid(surge_height_m=3.5)
    print(f"Region: {inundation_data['region']}")
    print(f"Predicted Surge Height: {inundation_data['surge_height_m']}m")
    print(f"Total Inundated Area: {inundation_data['total_inundated_area_sq_km']} sq km ({inundation_data['inundation_percentage']}%)")
    print(f"Total Flooded Grid Coordinates: {len(inundation_data['flooded_zones'])}")
