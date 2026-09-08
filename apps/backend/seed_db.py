import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
import os
from dotenv import load_dotenv

from db import Base, engine
from models import Collector, ScrapTransaction, Batch, BatchStatus, EprLedger

load_dotenv()

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_database():
    print("[*] Resetting and initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db.query(EprLedger).delete()
    db.query(Batch).delete()
    db.query(ScrapTransaction).delete()
    db.query(Collector).delete()
    db.commit()

    print("[+] Seeding Informal Collectors with GPS Coordinates...")
    collectors_data = [
        {"name": "Ramesh Kumar", "phone": "+919876543210", "lat": 28.6139, "lng": 77.2090},
        {"name": "Suresh Patel", "phone": "+919876543211", "lat": 19.0760, "lng": 72.8777},
        {"name": "Mukesh Sharma", "phone": "+919876543212", "lat": 12.9716, "lng": 77.5946},
        {"name": "Anil Verma", "phone": "+919876543213", "lat": 23.1815, "lng": 79.9864},
        {"name": "Deepak Yadav", "phone": "+919876543214", "lat": 22.5726, "lng": 88.3639},
    ]

    collector_objects = []
    for c in collectors_data:
        point_geom = from_shape(Point(c["lng"], c["lat"]), srid=4326)
        collector = Collector(name=c["name"], phone=c["phone"], geo_location=point_geom)
        db.add(collector)
        collector_objects.append(collector)
    
    db.commit()

    print("[+] Seeding Scrap Transactions (Critical Minerals)...")
    transactions_data = [
        {"collector_idx": 0, "material_type": "Copper", "weight_kg": 45.5, "price": 34125.0},
        {"collector_idx": 1, "material_type": "E-waste PCBs", "weight_kg": 120.0, "price": 18000.0},
        {"collector_idx": 2, "material_type": "Lithium-ion Batteries", "weight_kg": 85.0, "price": 25500.0},
        {"collector_idx": 3, "material_type": "Brass", "weight_kg": 60.0, "price": 31200.0},
        {"collector_idx": 4, "material_type": "Aluminium", "weight_kg": 210.0, "price": 44100.0},
        {"collector_idx": 0, "material_type": "Copper", "weight_kg": 95.0, "price": 71250.0},
        {"collector_idx": 3, "material_type": "Copper", "weight_kg": 150.0, "price": 112500.0},
    ]

    for t in transactions_data:
        tx = ScrapTransaction(
            collector_id=collector_objects[t["collector_idx"]].id,
            material_type=t["material_type"],
            weight_kg=t["weight_kg"],
            price=t["price"],
            audio_transcript="Voice logged transaction via Kabadi Sathi"
        )
        db.add(tx)

    db.commit()

    print("[+] Creating Dispatched Batches & QR Hashes...")
    raw_payload = "BATCH-COPPER-500KG-AGG-001"
    batch_hash_1 = hashlib.sha256(raw_payload.encode()).hexdigest()
    
    batch_1 = Batch(
        aggregator_id=1,
        total_weight=500.0,
        batch_hash=batch_hash_1,
        status=BatchStatus.VERIFIED
    )
    db.add(batch_1)
    db.commit()

    print("[+] Creating EPR Compliance Ledgers...")
    epr_1 = EprLedger(
        batch_id=batch_1.id,
        smelter_id=101,
        verified_weight=498.5,
        pdf_url="http://127.0.0.1:8000/api/v1/epr/download?file=certificates/sample_epr.pdf"
    )
    db.add(epr_1)
    db.commit()

    print("[SUCCESS] Database successfully seeded with Urban Mining DPI test data!")

if __name__ == "__main__":
    seed_database()