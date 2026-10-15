import pandas as pd
from .config import DATA_DIR, SEED_EXTS
from .cleaning import clean_raw
from .db import engine, SessionLocal, Complaint


def find_seed_file():
    for p in sorted(DATA_DIR.iterdir()):
        if p.suffix.lower() in SEED_EXTS: return p
    return None


def load_seed_frame():
    p = find_seed_file()
    if p is None: return None
    raw = pd.read_excel(p) if p.suffix.lower() in (".xlsx", ".xls") else pd.read_csv(p)
    return clean_raw(raw)


def seed_if_empty(predictor):
    df = load_seed_frame()
    if df is None:
        print("[info] no dataset in data/, stats will use API-created complaints only"); return
    if predictor is not None: predictor.set_age_stats(df["age_hours"])
    with SessionLocal() as db:
        if db.query(Complaint).count() > 0: return
    if predictor is not None:
        preds = predictor.predict(df, explain=False)
        df["priority"] = [p["priority"] for p in preds]
        df["confidence"] = [p["confidence"] for p in preds]
    df["source"] = "dataset"
    df["created_at"] = pd.Timestamp.utcnow().tz_localize(None)
    df.to_sql("complaints", engine, if_exists="append", index=False)
    print(f"[info] seeded {len(df)} complaints from dataset")
