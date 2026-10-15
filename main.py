import io
from contextlib import asynccontextmanager
import pandas as pd
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import MODEL_PATH, MAX_EXPLAIN_ROWS
from .db import Base, engine, get_db, Complaint
from .ml import Predictor
from .schemas import ComplaintIn, PredictionOut
from .seed import seed_if_empty
from .cleaning import clean_raw

PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    app.state.predictor = Predictor.load_or_none(MODEL_PATH)      # loaded once
    seed_if_empty(app.state.predictor)
    yield


app = FastAPI(title="Grievance Priority API", version="1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def get_predictor(request: Request) -> Predictor:
    p = request.app.state.predictor
    if p is None:
        raise HTTPException(503, "Model not loaded. Copy priority_model.joblib into models/ and restart.")
    return p


def df_from_db() -> pd.DataFrame:
    return pd.read_sql("SELECT * FROM complaints", engine)


def counts(s: pd.Series, top=None):
    vc = s.dropna().value_counts()
    return {str(k): int(v) for k, v in (vc.head(top) if top else vc).items()}


@app.get("/health")
def health(request: Request):
    return {"status": "ok", "model_loaded": request.app.state.predictor is not None}


@app.get("/options")
def options():
    """Dropdown values for the frontend form."""
    d = df_from_db()
    f = lambda c: sorted(d[c].dropna().astype(str).unique().tolist()) if c in d and len(d) else []
    return {"sub_categories": f("sub_category"), "wards": f("ward"), "statuses": f("status"),
            "staff_remarks": f("staff_remarks"), "designations": f("designation")}


@app.post("/predict", response_model=PredictionOut)
def predict(c: ComplaintIn, db: Session = Depends(get_db), pred: Predictor = Depends(get_predictor)):
    desig = c.designation or (c.staff_name.rsplit("/", 1)[1].strip() if c.staff_name and "/" in c.staff_name else None)
    row = pd.DataFrame([{"sub_category": c.sub_category, "ward": c.ward, "status": c.status,
                         "staff_remarks": c.staff_remarks, "designation": desig, "age_hours": c.age_hours}])
    r = pred.predict(row, explain=True)[0]
    if c.save:
        rec = Complaint(source="api", sub_category=c.sub_category, ward=c.ward, status=c.status,
                        staff_remarks=c.staff_remarks, designation=desig, age_hours=c.age_hours,
                        priority=r["priority"], confidence=r["confidence"], reason=r["reason"])
        db.add(rec); db.commit(); r["id"] = rec.id
    return r


def _read_upload(file: UploadFile) -> pd.DataFrame:
    data = file.file.read()
    name = (file.filename or "").lower()
    try:
        raw = pd.read_excel(io.BytesIO(data)) if name.endswith((".xlsx", ".xls")) else pd.read_csv(io.BytesIO(data))
    except Exception as e:
        raise HTTPException(400, f"Could not read file: {e}")
    norm = raw.rename(columns=lambda c: str(c).strip().lower().replace(" ", "_"))
    if {"sub_category", "ward"}.issubset(norm.columns):
        if "age_hours" not in norm and "grievance_age" in norm:
            from .cleaning import to_hours
            norm["age_hours"] = norm["grievance_age"].apply(to_hours)
        return norm
    try:
        return clean_raw(raw)                      # raw 8-column export
    except ValueError:
        raise HTTPException(400, "CSV needs columns sub_category and ward (optional: status, staff_remarks, designation, age_hours) "
                                 "or the raw 8-column grievance export.")


@app.post("/predict/batch")
def predict_batch(file: UploadFile = File(...), explain: bool = Query(False), save: bool = Query(False),
                  db: Session = Depends(get_db), pred: Predictor = Depends(get_predictor)):
    df = _read_upload(file)
    if explain and len(df) > MAX_EXPLAIN_ROWS:
        raise HTTPException(400, f"explain=true is limited to {MAX_EXPLAIN_ROWS} rows (got {len(df)}). Use explain=false.")
    res = pred.predict(df, explain=explain)
    out = df.reset_index(drop=True).copy()
    out["priority"] = [r["priority"] for r in res]; out["confidence"] = [r["confidence"] for r in res]
    if explain: out["reason"] = [r["reason"] for r in res]
    if save:
        for _, r in out.iterrows():
            g = lambda k: (None if k not in out or pd.isna(r[k]) else r[k])
            db.add(Complaint(source="api", category=g("category"), sub_category=g("sub_category"), ward=g("ward"),
                             status=g("status"), staff_remarks=g("staff_remarks"), designation=g("designation"),
                             age_hours=g("age_hours"), priority=r["priority"], confidence=float(r["confidence"]),
                             reason=g("reason")))
        db.commit()
    out = out.astype(object).where(out.notna(), None)
    return {"count": len(out), "summary": counts(pd.Series([r["priority"] for r in res])),
            "results": out.to_dict(orient="records")}


@app.get("/stats")
def stats():
    d = df_from_db()
    if d.empty: return {"total": 0}
    open_mask = d["status"].astype(str) != "Closed"
    out = {"total": len(d), "open": int(open_mask.sum()), "open_rate": round(float(open_mask.mean()), 4),
           "by_priority": {k: v for k, v in sorted(counts(d["priority"]).items(), key=lambda kv: PRIORITY_ORDER.index(kv[0]) if kv[0] in PRIORITY_ORDER else 9)},
           "by_status": counts(d["status"]), "by_category": counts(d["category"]),
           "top_sub_categories": counts(d["sub_category"], 15), "top_wards": counts(d["ward"], 15),
           "top_designations": counts(d["designation"], 10)}
    if d["category"].notna().any():
        out["avg_age_hours_by_category"] = {str(k): round(float(v), 2) for k, v in
                                            d.groupby("category")["age_hours"].mean().dropna().items()}
        out["priority_by_category"] = {str(k): {p: int(n) for p, n in g["priority"].value_counts().items()}
                                       for k, g in d.groupby("category")}
    return out


@app.get("/hotspots")
def hotspots(limit: int = Query(20, ge=1, le=200), min_complaints: int = Query(1, ge=1)):
    d = df_from_db()
    if d.empty: return []
    d["is_open"] = (d["status"].astype(str) != "Closed").astype(int)
    d["is_critical"] = (d["priority"] == "Critical").astype(int)
    d["is_high"] = (d["priority"] == "High").astype(int)
    g = d.groupby("ward").agg(total=("id", "count"), open=("is_open", "sum"),
                              critical=("is_critical", "sum"), high=("is_high", "sum"),
                              avg_age_hours=("age_hours", "mean")).reset_index()
    g = g[g["total"] >= min_complaints]
    g["open_rate"] = (g["open"] / g["total"]).round(4)
    g["hotspot_score"] = g["open"] + 2 * g["critical"] + g["high"]       # simple, documented
    g["avg_age_hours"] = g["avg_age_hours"].round(2)
    g = g.sort_values(["hotspot_score", "total"], ascending=False).head(limit)
    return g.astype(object).where(g.notna(), None).to_dict(orient="records")


@app.get("/complaints")
def complaints(limit: int = Query(50, ge=1, le=500), priority: str | None = None, ward: str | None = None,
               db: Session = Depends(get_db)):
    q = db.query(Complaint)
    if priority: q = q.filter(Complaint.priority == priority)
    if ward: q = q.filter(Complaint.ward == ward)
    rows = q.order_by(Complaint.id.desc()).limit(limit).all()
    return [{c.name: getattr(r, c.name) for c in Complaint.__table__.columns} for r in rows]
