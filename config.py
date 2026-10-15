from pathlib import Path

# Resolve base directory (handles both root repository layout and app/ subfolder layout)
_THIS_DIR = Path(__file__).resolve().parent
if (_THIS_DIR / "priority_model.joblib").exists():
    BASE = _THIS_DIR
    MODEL_PATH = _THIS_DIR / "priority_model.joblib"
    DATA_DIR = _THIS_DIR
elif (_THIS_DIR.parent / "models" / "priority_model.joblib").exists():
    BASE = _THIS_DIR.parent
    MODEL_PATH = BASE / "models" / "priority_model.joblib"
    DATA_DIR = BASE / "data"
elif (_THIS_DIR / "models" / "priority_model.joblib").exists():
    BASE = _THIS_DIR
    MODEL_PATH = BASE / "models" / "priority_model.joblib"
    DATA_DIR = BASE / "data"
else:
    BASE = _THIS_DIR
    MODEL_PATH = BASE / "priority_model.joblib"
    DATA_DIR = BASE

DB_URL = f"sqlite:///{(DATA_DIR / 'complaints.db').as_posix()}"
SEED_EXTS = (".xlsx", ".xls", ".csv")      # first dataset file found in data/ seeds the DB
MAX_EXPLAIN_ROWS = 500                      # SHAP is slow; cap for batch
