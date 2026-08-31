import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from db import Base

class BatchStatus(enum.Enum):
    PENDING = "PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    VERIFIED = "VERIFIED"

class Collector(Base):
    __tablename__ = 'collectors'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    # PostGIS spatial column for Mapbox Heatmap integration (WGS84 SRID 4326)
    geo_location = Column(Geometry('POINT', srid=4326), nullable=True) 

    transactions = relationship("ScrapTransaction", back_populates="collector")

class ScrapTransaction(Base):
    __tablename__ = 'scrap_transactions'
    
    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey('collectors.id'), nullable=False)
    material_type = Column(String, nullable=False, index=True) 
    weight_kg = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    audio_transcript = Column(String, nullable=True) 

    collector = relationship("Collector", back_populates="transactions")

class Batch(Base):
    __tablename__ = 'batches'
    
    id = Column(Integer, primary_key=True, index=True)
    aggregator_id = Column(Integer, nullable=False, index=True) 
    total_weight = Column(Float, nullable=False)
    batch_hash = Column(String, unique=True, nullable=False) 
    status = Column(Enum(BatchStatus, create_type=False), default=BatchStatus.PENDING, nullable=False)

    epr_ledger = relationship("EprLedger", back_populates="batch", uselist=False)

class EprLedger(Base):
    __tablename__ = 'epr_ledgers'
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey('batches.id'), nullable=False, unique=True)
    smelter_id = Column(Integer, nullable=False, index=True)
    verified_weight = Column(Float, nullable=False)
    pdf_url = Column(String, nullable=True) 

    batch = relationship("Batch", back_populates="epr_ledger")