# Grievance: Urban Intelligence & Prioritization Platform

Grievance: An EDA with SHAP project which helps prioritise Government Complaints according to their urgeny

## Overview

**CIVIC — Urban Intelligence Platform** combines a high-throughput **FastAPI** backend, a gradient boosted decision tree classifier (**LightGBM**), **SHAP TreeExplainer** decision attribution, and an interactive **React + TypeScript + Vite** frontend.

The platform provides city administrators, municipal commissioners, and field engineers with:
- **Metropolitan Overview:** Key performance indicators, multi-tier grievance volume, ward intake rankings, and resolution velocities.
- **Grievance Register:** Searchable, filterable municipal grievance records with full pagination, criteria filtering, and inspection modals.
- **Priority Assessment:** Real-time ML inference computing calibrated multi-class probabilities across 4 urgency tiers (*Critical*, *High*, *Medium*, *Low*) alongside plain-English SHAP decision drivers.
- **Ward Intelligence:** Ward-level hotspot prioritizing matrix using the operational formula:  
  $$\text{Hotspot Score} = \text{Open} + 2 \times \text{Critical} + \text{High}$$
- **Bulk Ingestion & Analysis:** CSV and Excel batch upload for bulk inference with plain-English explainability and results export.
- **Model Methodology:** Architectural specifications covering stratified cross-validation, feature normalization, and data leakage safeguards.

---

## Quick Start

### 1. Backend (FastAPI + LightGBM + SQLite)

```bash
# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs: **http://127.0.0.1:8000/docs**

### 2. Frontend (React + TypeScript + Vite)

```bash
cd frontend
npm install
npm run dev
```
Web Application: **http://127.0.0.1:5173/**

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server and LightGBM model status check |
| `GET` | `/options` | System dropdown options (sub-categories, wards, designations, statuses) |
| `GET` | `/stats` | Platform metrics, priority distributions, and intake aggregates |
| `GET` | `/hotspots` | Ward hotspot ranking table (`limit`, `min_complaints`) |
| `GET` | `/complaints` | Paginated complaint register (`limit`, `offset`, `priority`, `ward`, `status`, `search`) with `X-Total-Count` |
| `POST` | `/predict` | Single grievance priority inference with calibrated confidence & SHAP factors |
| `POST` | `/predict/batch` | Batch CSV/Excel prediction with SHAP explanations and optional SQLite persistence |
