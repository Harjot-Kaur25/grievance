import joblib, numpy as np, pandas as pd, shap
from scipy import sparse
import sklearn.compose._column_transformer as _ct
if not hasattr(_ct, "_RemainderColsList"):
    class _RemainderColsList(list): pass
    _ct._RemainderColsList = _RemainderColsList


class Predictor:
    def __init__(self, path):
        m = joblib.load(path)
        self.model, self.labels, self.cat, self.num = m["model"], m["labels"], m["cat"], m["num"]
        self.pre = self.model.named_steps["pre"]
        self.clf = self.model.named_steps["clf"]
        self.fn = self.pre.get_feature_names_out()
        self.explainer = shap.TreeExplainer(self.clf)
        self.age_default, self.age_hi = 0.0, None

    @classmethod
    def load_or_none(cls, path):
        try:
            return cls(path)
        except FileNotFoundError:
            print(f"[warn] model not found at {path}. Run the notebook and copy priority_model.joblib into models/.")
            return None

    def set_age_stats(self, ages: pd.Series):
        ages = ages.dropna()
        if len(ages):
            q1, q3 = ages.quantile([.25, .75]); self.age_default = float(ages.median())
            self.age_hi = float(q3 + 1.5 * (q3 - q1))      # same IQR upper fence as the notebook

    def prepare(self, df: pd.DataFrame) -> pd.DataFrame:
        d = df.copy()
        for c in ["sub_category", "ward", "status", "staff_remarks", "designation", "age_hours"]:
            if c not in d: d[c] = np.nan
        d["remarks_missing"] = d["staff_remarks"].isna().astype(int)
        d["staff_remarks"] = d["staff_remarks"].fillna("None")
        for c in ["sub_category", "ward", "status", "designation"]:
            d[c] = d[c].fillna("Unknown").astype(str)
        age = pd.to_numeric(d["age_hours"], errors="coerce").fillna(self.age_default).clip(lower=0)
        d["age_clipped"] = age.clip(upper=self.age_hi) if self.age_hi is not None else age
        return d[self.cat + self.num]

    def _readable(self, f):
        f = f.replace("cat__", "").replace("num__", "")
        for c in self.cat:
            if f.startswith(c + "_"): return f"{c.replace('_', ' ')} = {f[len(c) + 1:]}"
        return {"age_clipped": "complaint age", "remarks_missing": "no staff remark yet"}.get(f, f)

    def predict(self, df: pd.DataFrame, explain=False, k=3):
        X = self.prepare(df)
        prob = self.model.predict_proba(X)
        pred = prob.argmax(1)
        out = []
        sv = Xt = None
        if explain:
            Xt = self.pre.transform(X); Xt = Xt.toarray() if sparse.issparse(Xt) else np.asarray(Xt)
            sv = self.explainer.shap_values(Xt)
            sv = np.stack(sv, axis=2) if isinstance(sv, list) else sv     # (n, features, classes)
        for i in range(len(X)):
            r = {"priority": self.labels[pred[i]], "confidence": round(float(prob[i, pred[i]]), 4),
                 "probabilities": {l: round(float(prob[i, j]), 4) for j, l in enumerate(self.labels)}}
            if explain:
                contrib = pd.Series(sv[i, :, pred[i]], index=self.fn)
                has_remark = X["remarks_missing"].iloc[i] == 0
                active = np.array([(Xt[i, j] > 0.5 if f.startswith("cat__") else
                                    not (f.endswith("remarks_missing") and has_remark))      # only say "no remark" if true
                                   for j, f in enumerate(self.fn)])
                contrib = contrib[active].sort_values(ascending=False)
                top = [(self._readable(f), float(v)) for f, v in contrib.head(k).items() if v > 0]
                r["reason"] = f"{r['priority']}: " + (", ".join(t[0] for t in top) if top else "no single dominant factor")
                r["factors"] = [{"feature": n, "impact": round(v, 4)} for n, v in top]
            out.append(r)
        return out
