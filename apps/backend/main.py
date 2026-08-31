from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <-- Make sure this is imported
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import shutil
from fastapi.responses import FileResponse # <-- Needed for Step 4
from fpdf import FPDF                      # <-- Needed for Step 4
import uuid                                # <-- Needed for Step 4
from db import engine, Base
import models
from routers import admin
load_dotenv()

# Create tables in PostgreSQL/PostGIS if they do not exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kabadiwala Connect API", version="1.0")

# --- CORS MIDDLEWARE MUST GO DIRECTLY HERE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client (It automatically picks up GEMINI_API_KEY from .env)
client = genai.Client()

# Define the strict JSON schema we want Gemini to return
class ExtractedScrapData(BaseModel):
    material_type: str = Field(description="The type of secondary metal/mineral (e.g., Copper, Brass, Aluminium, E-waste PCBs, Lithium-ion)")
    weight_kg: float = Field(description="The weight of the material in kilograms. Convert from grams if necessary.")
    price: float = Field(description="The total agreed price in Indian Rupees (INR)")

@app.get("/")
def read_root():
    return {"status": "Backend is running with Gemini!"}

@app.post("/api/v1/transactions/voice-log")
async def voice_to_transaction(audio: UploadFile = File(...)):
    # 1. Validate file format
    if not audio.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid audio format. Use wav, mp3, m4a, or ogg.")

    temp_file_path = f"temp_{audio.filename}"
    uploaded_file = None
    
    try:
        # 2. Save the uploaded audio temporarily to disk
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # 3. Upload the audio file directly to Gemini's File API
        uploaded_file = client.files.upload(file=temp_file_path)

        # 4. Use Gemini Multimodal capabilities to analyze audio AND extract structured JSON in one shot
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

        # 5. Extract the validated Pydantic object and convert it to a standard dictionary
        extracted_data = response.parsed.model_dump() if response.parsed else {}

        # Persist transaction to PostgreSQL if material_type was recognized
        if extracted_data.get("material_type"):
            try:
                db_session = SessionLocal()
                # Use first collector or fallback to id=1
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
        # 6. Cleanup: Delete the local temporary file and the remote Gemini file to save space
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if uploaded_file:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass

# --- OFFLINE SYNC ENDPOINT (Step 6 / Persona A) ---
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

# --- STEP 4: SMELTER VERIFICATION & EPR GENERATION ---

class VerifyBatchRequest(BaseModel):
    batch_hash: str = Field(description="The SHA-256 hash from the QR code")
    received_weight_kg: float = Field(description="Actual physical weight received at the smelter")

@app.post("/api/v1/epr/verify")
async def verify_batch_and_generate_epr(request: VerifyBatchRequest):
    # In a full database integration, you would query the 'batches' table using the hash.
    # We will simulate the dispatched weight here for the logic flow.
    dispatched_weight = 350.0 
    variance = request.received_weight_kg - dispatched_weight
    
    try:
        # Generate the EPR PDF Certificate
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, "Extended Producer Responsibility (EPR) Certificate", ln=True, align="C")
        
        pdf.set_font("helvetica", "", 12)
        pdf.ln(10)
        pdf.cell(0, 10, f"Batch Hash: {request.batch_hash}", ln=True)
        pdf.cell(0, 10, f"Dispatched Weight: {dispatched_weight} kg", ln=True)
        pdf.cell(0, 10, f"Received Verified Weight: {request.received_weight_kg} kg", ln=True)
        
        # Highlight variance
        variance_text = f"Variance: {variance} kg"
        pdf.set_text_color(200, 0, 0) if variance < 0 else pdf.set_text_color(0, 150, 0)
        pdf.cell(0, 10, variance_text, ln=True)
        
        pdf.set_text_color(0, 0, 0)
        pdf.ln(10)
        pdf.cell(0, 10, "Authorized by: Ministry of Mines - Urban Mining DPI", ln=True)
        
        # Save PDF locally to a certificates folder
        os.makedirs("certificates", exist_ok=True)
        file_name = f"certificates/EPR_{uuid.uuid4().hex[:8]}.pdf"
        pdf.output(file_name)
        
        return {
            "status": "success",
            "message": "Batch verified and EPR Certificate generated.",
            "variance_kg": variance,
            "certificate_url": f"http://127.0.0.1:8000/api/v1/epr/download?file={file_name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation Error: {str(e)}")

@app.get("/api/v1/epr/download")
async def download_certificate(file: str):
    if os.path.exists(file):
        return FileResponse(file, media_type="application/pdf", filename="EPR_Compliance_Certificate.pdf")
    raise HTTPException(status_code=404, detail="Certificate not found")

# --- STEP 5: MOUNT MINISTRY ANALYTICS ROUTER ---
app.include_router(admin.router)