# Grievance Priority API

FastAPI backend for the grievance priority model (LightGBM + SHAP reasons).

## Setup
```bash
pip install -r requirements.txt
```
1. Run `notebooks/grievance_priority_full.ipynb` on your data. It creates `priority_model.joblib`.
2. Copy `priority_model.joblib` into `models/`.
3. Copy your dataset (.xlsx or .csv, same 8 columns as the notebook) into `data/`. It seeds the database on first start.
4. Start the server:
```bash
uvicorn app.main:app --reload
```
Open **http://127.0.0.1:8000/docs** for interactive Swagger docs. The frontend should be built against that page.

To reseed after changing the dataset, delete `data/complaints.db` and restart.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Server and model status |
| GET | `/options` | Dropdown values (sub-categories, wards, statuses, remarks, designations) |
| POST | `/predict` | One complaint -> priority, confidence, class probabilities, plain-English reason |
| POST | `/predict/batch` | CSV/XLSX upload. Query: `explain` (default false, max 500 rows), `save` (default false) |
| GET | `/stats` | Aggregates for dashboard charts |
| GET | `/hotspots` | Ward-level counts. Query: `limit`, `min_complaints` |
| GET | `/complaints` | Stored complaints. Query: `limit`, `priority`, `ward` |

### Example: POST /predict
```json
{
  "sub_category": "Garbage dump",
  "ward": "Jogupalya",
  "status": "Registered",
  "staff_remarks": "1st Assigned",
  "staff_name": "Durga Prasad/AE",
  "age_hours": 12
}
```
Response:
```json
{
  "id": 901, "priority": "Medium", "confidence": 0.80,
  "probabilities": {"Low": 0.17, "Medium": 0.80, "High": 0.004, "Critical": 0.019},
  "reason": "Medium: ward = Ward8, complaint age",
  "factors": [{"feature": "ward = Ward8", "impact": 2.44}]
}
```
Only `sub_category` and `ward` are required. Unseen values are accepted.

### Batch CSV format
Either a CSV with columns `sub_category, ward` (optional `status, staff_remarks, designation, age_hours`), or the raw 8-column grievance export, which is cleaned automatically.

## Priority values
`Low`, `Medium`, `High`, `Critical`. Hotspot score = open complaints + 2 x Critical + High.

## Limitations
- The priority label comes from a documented scoring rule (category severity, recurrence, ward load), so the model learns that rule, not ground-truth urgency.
- There is no date column, so there is no seasonal or time-trend data.
- The `/predict` input has no `category`, because the model deliberately excludes it. Sub-category still carries some of that information.
- CORS is open (`*`) for development. Restrict `allow_origins` in `app/main.py` before deploying.

## Layout
```
app/        main.py (routes), ml.py (model + SHAP), cleaning.py, seed.py, db.py, schemas.py, config.py
models/     priority_model.joblib (you add)
data/       dataset (you add), complaints.db (auto-created)
notebooks/  grievance_priority_full.ipynb
```
