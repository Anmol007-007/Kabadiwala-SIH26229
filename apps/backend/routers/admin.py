import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.functions import ST_AsGeoJSON

# Fix: Change EPRLedger to EprLedger
from models import Collector, ScrapTransaction, EprLedger
from db import get_db

router = APIRouter(prefix="/api/admin", tags=["Ministry Analytics"])

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    # 1. Total Secondary Metals Recovered (Tonnes)
    total_verified_kg = db.query(func.coalesce(func.sum(EprLedger.verified_weight), 0.0)).scalar()
    total_tonnes_recovered = round(total_verified_kg / 1000.0, 2)

    # 2. Total Registered Informal Collectors
    active_workers = db.query(func.count(Collector.id)).scalar()

    # 3. Estimated Carbon Emissions Avoided (~2.5 kg CO2e saved per kg secondary metal)
    carbon_saved_mt = round((total_verified_kg * 2.5) / 1000.0, 2)

    # 4. Fetch PostGIS Points as GeoJSON Feature Collection
    records = db.query(
        ScrapTransaction.id,
        ScrapTransaction.material_type,
        ScrapTransaction.weight_kg,
        ST_AsGeoJSON(Collector.geo_location).label("geojson")
    ).join(Collector, ScrapTransaction.collector_id == Collector.id).all()

    features = []
    for r in records:
        if r.geojson:
            geometry = json.loads(r.geojson)
            features.append({
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "id": r.id,
                    "material_type": r.material_type,
                    "weight_kg": r.weight_kg
                }
            })

    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }

    return {
        "kpis": {
            "metals_recovered_tonnes": total_tonnes_recovered,
            "active_informal_workers": active_workers,
            "carbon_saved_mt": carbon_saved_mt
        },
        "spatial_data": geojson_data
    }