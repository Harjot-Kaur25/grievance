from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE / "models" / "priority_model.joblib"
DATA_DIR = BASE / "data"
DB_URL = f"sqlite:///{(DATA_DIR / 'complaints.db').as_posix()}"
SEED_EXTS = (".xlsx", ".xls", ".csv")      # first dataset file found in data/ seeds the DB
MAX_EXPLAIN_ROWS = 500                      # SHAP is slow; cap for batch
