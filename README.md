# Kabadiwala Connect
### Digital Public Infrastructure (DPI) for Urban Mining & Secondary Critical Minerals
**Client Mandate:** Ministry of Mines, Government of India

---

## 📌 Project Overview
Kabadiwala Connect is an end-to-end Digital Public Infrastructure (DPI) designed to formalize informal waste collectors ("Kabadiwalas") into the critical minerals and secondary metals recycling supply chain (Copper, Brass, Aluminium, E-waste PCBs, Lithium-ion Batteries).

### Key Pillars & User Personas
1. **Ground Collector (Kabadiwala) Mobile PWA (`apps/collector-pwa`):**
   - **Voice-First Logging:** Large tactile microphone with vernacular Hindi/English voice processing via Google Gemini AI.
   - **Offline-First Mode:** IndexedDB offline storage with automatic synchronization when network connectivity restores.
   - **Digital Collector ID:** QR-based verifiable government digital identity card.

2. **Aggregator Operations Portal (`apps/aggregator-web`):**
   - **Dynamic Pricing:** Real-time benchmark rates for critical metals.
   - **Industrial Batching:** Grouping informal collections into industrial lots.
   - **Tamper-Proof QR Minting:** SHA-256 hash generation for chain-of-custody verification.

3. **Formal Smelter & Recycler Portal (`apps/aggregator-web/smelter`):**
   - **Inward QR Scanner & Reconciliation:** Variance tracking between dispatched weight and verified physical weight.
   - **Automated EPR Certificates:** Extended Producer Responsibility (EPR) compliance PDF certificates.

4. **Ministry of Mines Analytics Dashboard (`apps/aggregator-web/admin/dashboard`):**
   - **PostGIS Geospatial Heatmap:** Real-time spatial clustering of critical mineral recovery across India.
   - **Live National KPIs:** Tonnes recovered, active formalized workers, and avoided carbon emissions (CO₂e).

---

## 🛠️ Tech Stack
- **Backend:** Python (FastAPI), SQLAlchemy, GeoAlchemy2, Google GenAI SDK (Gemini 2.5 Flash), FPDF
- **Database:** PostgreSQL 15 with PostGIS 3.3 spatial extension
- **Frontend Dashboard & Portals:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Mapbox GL JS, Lucide Icons, QR Code SVG
- **Collector PWA:** Next.js 16, React 19, IndexedDB (`idb`), PWA Web Manifest

---

## 🚀 Quickstart Guide

### 1. Database Setup (PostGIS)
Start the PostGIS container with Docker Compose:
```bash
docker compose up -d
```

### 2. Backend Setup
```bash
cd apps/backend
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On Linux/macOS

pip install -r requirements.txt # or install fastapi uvicorn sqlalchemy psycopg2-binary geoalchemy2 shapely google-genai fpdf2 python-dotenv

# Seed realistic Indian urban mining clusters
python seed_db.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Aggregator, Smelter & Ministry Dashboard
```bash
cd apps/aggregator-web
npm install
npm run dev
```
- Aggregator Portal: [http://localhost:3000](http://localhost:3000)
- Smelter Portal: [http://localhost:3000/smelter](http://localhost:3000/smelter)
- Ministry Analytics: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

### 4. Collector Mobile PWA
```bash
cd apps/collector-pwa
npm install
npm run dev
```
- Collector PWA: [http://localhost:3001](http://localhost:3001)

---

## 📄 Authority & Mandate
Developed for Ministry of Mines, Government of India — Urban Mining DPI Initiative.
