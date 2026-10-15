"""Same cleaning as the notebook, so API data matches training data."""
import datetime, re
import numpy as np, pandas as pd


def to_hours(v):
    if pd.isna(v): return np.nan
    if isinstance(v, pd.Timedelta): return v.total_seconds() / 3600
    if isinstance(v, (datetime.datetime, pd.Timestamp, datetime.time)):
        return v.hour + v.minute / 60 + v.second / 3600
    if isinstance(v, (int, float, np.number)): return float(v) * 24
    s = str(v).strip()
    m = re.search(r"(\d+):(\d+(?:\.\d+)?)(?::(\d+(?:\.\d+)?))?", s)
    if m:
        a, b, c = m.groups()
        if c is not None: return int(a) + float(b) / 60 + float(c) / 3600
        return float(a) / 60 + float(b) / 3600
    try: return float(s)
    except Exception: return np.nan


def clean_raw(df: pd.DataFrame) -> pd.DataFrame:
    """Raw 8-column grievance export -> tidy frame."""
    names = ["complaint_id", "category", "sub_category", "grievance_age", "ward", "status", "staff_remarks", "staff_name"]
    if df.shape[1] < 8:
        raise ValueError("Raw export needs at least 8 columns")
    df = df.iloc[:, :8].copy(); df.columns = names
    df = df.replace("\\N", np.nan)
    for c in ["category", "sub_category", "ward", "status", "staff_remarks", "staff_name"]:
        df[c] = df[c].astype("string").str.strip()
    df["category"] = df["category"].str.title()
    sp = df["staff_name"].str.rsplit("/", n=1, expand=True)
    df["designation"] = sp[1].str.strip() if sp.shape[1] > 1 else pd.NA
    df["complaint_id"] = pd.to_numeric(df["complaint_id"], errors="coerce")
    df = df.dropna(subset=["complaint_id"]).drop_duplicates("complaint_id").sort_values("complaint_id")
    df["age_hours"] = df["grievance_age"].apply(to_hours)
    for c in ["sub_category", "ward", "status", "designation"]:
        df[c] = df[c].fillna(df[c].mode()[0] if df[c].notna().any() else "Unknown")
    return df.reset_index(drop=True)[["complaint_id", "category", "sub_category", "ward", "status",
                                      "staff_remarks", "designation", "age_hours"]]
