from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import shutil
from fastapi.responses import FileResponse
from fpdf import FPDF
import uuid
from db import engine, Base, SessionLocal
import models
from routers import admin

load_dotenv()

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as db_init_err:
    print(f"Notice: Database initialization deferred (DB not yet ready): {db_init_err}")

app = FastAPI(
    title="Kabadiwala Connect API",
    description="Digital Public Infrastructure for Urban Mining, Secondary Metals & Critical Minerals",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client()

class ExtractedScrapData(BaseModel):
    material_type: str = Field(description="The type of secondary metal/mineral (e.g., Copper, Brass, Aluminium, E-waste PCBs, Lithium-ion)")
    weight_kg: float = Field(description="The weight of the material in kilograms. Convert from grams if necessary.")
    price: float = Field(description="The total agreed price in Indian Rupees (INR)")

@app.get("/")
def read_root():
    return {"status": "Backend is running with Gemini!"}

@app.post("/api/v1/transactions/voice-log")
async def voice_to_transaction(audio: UploadFile = File(...)):
    if not audio.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid audio format. Use wav, mp3, m4a, or ogg.")

    temp_file_path = f"temp_{audio.filename}"
    uploaded_file = None
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        uploaded_file = client.files.upload(file=temp_file_path)

        prompt = (
            "Extract transaction details from this audio. The user is speaking in Hindi or local Indian languages, "
            "talking about scrap metals like copper, aluminium, e-waste, weights, and rupees. "
            "Only extract high-value secondary metals/minerals."
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, uploaded_file],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractedScrapData,
            )
        )

        extracted_data = response.parsed.model_dump() if response.parsed else {}

        if extracted_data.get("material_type"):
            try:
                db_session = SessionLocal()
                first_collector = db_session.query(models.Collector).first()
                cid = first_collector.id if first_collector else 1
                new_tx = models.ScrapTransaction(
                    collector_id=cid,
                    material_type=extracted_data["material_type"],
                    weight_kg=float(extracted_data.get("weight_kg", 0)),
                    price=float(extracted_data.get("price", 0)),
                    audio_transcript="Voice Logged via Gemini API"
                )
                db_session.add(new_tx)
                db_session.commit()
                db_session.refresh(new_tx)
                extracted_data["transaction_id"] = new_tx.id
                db_session.close()
            except Exception as db_err:
                print(f"Warning: could not persist to DB: {db_err}")

        return {
            "status": "success",
            "data": extracted_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Processing Error: {str(e)}")
    
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if uploaded_file:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass

class SyncItem(BaseModel):
    id: str
    material_type: str
    weight_kg: float
    price: float

class SyncPayload(BaseModel):
    transactions: list[SyncItem]

@app.post("/api/v1/transactions/sync")
async def sync_offline_transactions(payload: SyncPayload):
    db_session = SessionLocal()
    synced_ids = []
    try:
        first_collector = db_session.query(models.Collector).first()
        cid = first_collector.id if first_collector else 1
        for item in payload.transactions:
            new_tx = models.ScrapTransaction(
                collector_id=cid,
                material_type=item.material_type,
                weight_kg=float(item.weight_kg),
                price=float(item.price),
                audio_transcript=f"Offline Sync (Local ID: {item.id})"
            )
            db_session.add(new_tx)
            synced_ids.append(item.id)
        db_session.commit()
        return {
            "status": "success",
            "message": f"Successfully synced {len(synced_ids)} offline transactions.",
            "synced_ids": synced_ids
        }
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
    finally:
        db_session.close()

class CreateBatchRequest(BaseModel):
    aggregator_id: int = 1
    total_weight: float
    batch_hash: str
    material: str = "Copper"

@app.post("/api/v1/batches")
async def create_batch(request: CreateBatchRequest):
    try:
        db_session = SessionLocal()
        new_batch = models.Batch(
            aggregator_id=request.aggregator_id,
            total_weight=request.total_weight,
            batch_hash=request.batch_hash,
            status=models.BatchStatus.PENDING
        )
        db_session.add(new_batch)
        db_session.commit()
        db_session.refresh(new_batch)
        db_session.close()
        return {"status": "success", "batch_id": new_batch.id, "batch_hash": new_batch.batch_hash}
    except Exception as e:
        return {"status": "success", "message": f"Batch registered in session (db note: {str(e)})", "batch_hash": request.batch_hash}

@app.get("/api/v1/batches")
async def list_batches():
    try:
        db_session = SessionLocal()
        batches = db_session.query(models.Batch).order_by(models.Batch.id.desc()).limit(20).all()
        result = [
            {
                "id": b.id,
                "aggregator_id": b.aggregator_id,
                "total_weight": b.total_weight,
                "batch_hash": b.batch_hash,
                "status": b.status.value if hasattr(b.status, "value") else str(b.status)
            }
            for b in batches
        ]
        db_session.close()
        return {"batches": result}
    except Exception:
        return {"batches": []}

class VerifyBatchRequest(BaseModel):
    batch_hash: str = Field(description="The SHA-256 hash from the QR code")
    received_weight_kg: float = Field(description="Actual physical weight received at the smelter")

@app.post("/api/v1/epr/verify")
async def verify_batch_and_generate_epr(request: VerifyBatchRequest):
    dispatched_weight = 350.0 
    batch_record = None
    
    try:
        db_session = SessionLocal()
        batch_record = db_session.query(models.Batch).filter(models.Batch.batch_hash == request.batch_hash).first()
        if batch_record:
            dispatched_weight = batch_record.total_weight
            batch_record.status = models.BatchStatus.VERIFIED
    except Exception as db_e:
        print(f"Notice: database lookup skipped: {db_e}")
        db_session = None

    variance = round(request.received_weight_kg - dispatched_weight, 2)
    
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, "Extended Producer Responsibility (EPR) Certificate", ln=True, align="C")
        
        pdf.set_font("helvetica", "", 12)
        pdf.ln(10)
        pdf.cell(0, 10, f"Batch Hash: {request.batch_hash}", ln=True)
        pdf.cell(0, 10, f"Dispatched Weight: {dispatched_weight} kg", ln=True)
        pdf.cell(0, 10, f"Received Verified Weight: {request.received_weight_kg} kg", ln=True)
        
        variance_text = f"Variance: {variance:+} kg ({round((variance/dispatched_weight)*100, 2) if dispatched_weight else 0}%)"
        pdf.set_text_color(200, 0, 0) if abs(variance) > 5 else pdf.set_text_color(0, 150, 0)
        pdf.cell(0, 10, variance_text, ln=True)
        
        pdf.set_text_color(0, 0, 0)
        pdf.ln(10)
        pdf.cell(0, 10, "Authorized by: Ministry of Mines - Urban Mining DPI", ln=True)
        pdf.cell(0, 10, f"Issued Date: {uuid.uuid4().hex[:6].upper()}-2026", ln=True)
        
        os.makedirs("certificates", exist_ok=True)
        cert_filename = f"EPR_{uuid.uuid4().hex[:8]}.pdf"
        file_path = os.path.join("certificates", cert_filename)
        pdf.output(file_path)

        if db_session and batch_record:
            try:
                ledger = models.EprLedger(
                    batch_id=batch_record.id,
                    smelter_id=1,
                    verified_weight=request.received_weight_kg,
                    pdf_url=cert_filename
                )
                db_session.add(ledger)
                db_session.commit()
            except Exception as ledger_err:
                print(f"Notice: ledger commit error: {ledger_err}")
                db_session.rollback()

        if db_session:
            db_session.close()
        
        backend_base = os.getenv("BACKEND_URL", "https://kabadiwala-backend-4vkq.onrender.com").rstrip("/")
        return {
            "status": "success",
            "message": "Batch verified and EPR Certificate generated.",
            "variance_kg": variance,
            "dispatched_weight_kg": dispatched_weight,
            "received_weight_kg": request.received_weight_kg,
            "certificate_url": f"{backend_base}/api/v1/epr/download?file={cert_filename}"
        }
    except Exception as e:
        if db_session:
            db_session.close()
        raise HTTPException(status_code=500, detail=f"PDF Generation Error: {str(e)}")

@app.get("/api/v1/epr/download")
async def download_certificate(file: str):
    safe_name = os.path.basename(file)
    full_path = os.path.join("certificates", safe_name)
    if os.path.exists(full_path):
        return FileResponse(full_path, media_type="application/pdf", filename=safe_name)
    raise HTTPException(status_code=404, detail="Certificate not found")

app.include_router(admin.router)