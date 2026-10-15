import React from "react";
import {
  BookOpen,
  Cpu,
  AlertTriangle,
  Sparkles,
  Lock,
  Compass,
} from "lucide-react";

export const ModelMethodologyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-3 border-b border-metro-800/80">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            MODEL METHODOLOGY & ARCHITECTURE SPECIFICATION
          </h1>
        </div>
        <p className="text-xs text-metro-400">
          Technical documentation of the CIVIC Machine Learning pipeline, LightGBM classifier, data leakage guardrails, and SHAP explainability.
        </p>
      </div>

      {/* Section 1: Executive Summary */}
      <div className="glass-panel p-6 rounded-xl border border-metro-800/80 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase">
          <Cpu className="w-4 h-4 text-emerald-400" />
          1. System Architecture & Model Stack
        </div>
        <p className="text-xs text-metro-300 leading-relaxed">
          CIVIC utilizes an enterprise-grade gradient boosted decision tree classifier (
          <span className="text-emerald-400 font-semibold font-mono">LightGBM</span>) combined with{" "}
          <span className="text-sky-400 font-semibold font-mono">SHAP (SHapley Additive exPlanations)</span>{" "}
          TreeExplainer. The model automatically ingests heterogeneous municipal grievance parameters, normalizes high-cardinality nominal features, and delivers multi-class probability scores across four operational priority tiers:{" "}
          <strong className="text-emerald-400">Low</strong>, <strong className="text-sky-400">Medium</strong>,{" "}
          <strong className="text-amber-400">High</strong>, and <strong className="text-rose-400">Critical</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-metro-950 border border-metro-850">
            <span className="text-metro-400 block text-[10px] uppercase">Estimator Engine</span>
            <span className="text-white font-bold">LightGBM Classifier</span>
          </div>
          <div className="p-3 rounded-lg bg-metro-950 border border-metro-850">
            <span className="text-metro-400 block text-[10px] uppercase">Cross-Validation</span>
            <span className="text-emerald-400 font-bold">5-Fold Stratified K-Fold</span>
          </div>
          <div className="p-3 rounded-lg bg-metro-950 border border-metro-850">
            <span className="text-metro-400 block text-[10px] uppercase">Optimization Goal</span>
            <span className="text-sky-400 font-bold">Macro F1 Score (Balanced)</span>
          </div>
        </div>
      </div>

      {/* Section 2: Ground Truth Policy & Formula */}
      <div className="glass-panel p-6 rounded-xl border border-metro-800/80 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase">
          <Compass className="w-4 h-4 text-amber-400" />
          2. Ground Truth Target Label Formulation
        </div>
        <p className="text-xs text-metro-300 leading-relaxed">
          Because municipal raw grievance datasets do not inherently contain labeled ground-truth urgency fields, labels were established through a rigorous, documented multi-factor operational scoring policy:
        </p>

        <div className="p-4 rounded-xl bg-metro-950 border border-metro-800 font-mono text-xs text-emerald-400">
          <code>
            score = 0.5 × (category_severity / 4) + 0.3 × (min(recurrence, 10) / 10) + 0.2 × ward_load_percentile
          </code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-metro-950/70 border border-metro-850 space-y-1.5">
            <div className="flex items-center justify-between text-white font-bold">
              <span>Category Severity</span>
              <span className="text-emerald-400">50% Weight</span>
            </div>
            <p className="text-metro-400 text-[11px]">
              Discrete severity weights: Health (4), Solid Waste (3), Road (3), Veterinary (3), Electrical (2), Forest (2), Others (1).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-metro-950/70 border border-metro-850 space-y-1.5">
            <div className="flex items-center justify-between text-white font-bold">
              <span>Recurrence Metric</span>
              <span className="text-sky-400">30% Weight</span>
            </div>
            <p className="text-metro-400 text-[11px]">
              Count of historical prior complaints within the identical municipal ward and sub-category, capped at 10 events.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-metro-950/70 border border-metro-850 space-y-1.5">
            <div className="flex items-center justify-between text-white font-bold">
              <span>Ward Volume Load</span>
              <span className="text-amber-400">20% Weight</span>
            </div>
            <p className="text-metro-400 text-[11px]">
              Percentile rank of the ward's aggregate complaint volume across the entire metropolitan jurisdiction.
            </p>
          </div>
        </div>

        {/* Quantile thresholds */}
        <div className="pt-2">
          <h4 className="text-xs font-mono uppercase text-metro-300 font-bold mb-2">
            Discrete Percentile Class Allocations
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
              <span className="font-bold block">LOW TIER</span>
              <span className="text-[11px] text-metro-400">Percentile [0.0 - 0.50]</span>
            </div>
            <div className="p-2.5 rounded bg-sky-950/30 border border-sky-800/40 text-sky-300">
              <span className="font-bold block">MEDIUM TIER</span>
              <span className="text-[11px] text-metro-400">Percentile [0.50 - 0.80]</span>
            </div>
            <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300">
              <span className="font-bold block">HIGH TIER</span>
              <span className="text-[11px] text-metro-400">Percentile [0.80 - 0.95]</span>
            </div>
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300">
              <span className="font-bold block">CRITICAL TIER</span>
              <span className="text-[11px] text-metro-400">Percentile [0.95 - 1.00]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Data Leakage Prevention */}
      <div className="glass-panel p-6 rounded-xl border border-metro-800/80 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase">
          <Lock className="w-4 h-4 text-emerald-400" />
          3. Strict Data Leakage Prevention Architecture
        </div>
        <p className="text-xs text-metro-300 leading-relaxed">
          A common pitfall in operational ML is target leakage. If the model were supplied with the parent{" "}
          <code className="text-rose-400 font-mono">category</code>, severity score, recurrence counter, or ward load rank, it would trivially learn the arithmetic formula rather than identifying patterns from operational fields.
        </p>

        <div className="p-4 rounded-xl bg-metro-950 border border-metro-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-rose-400 font-bold block mb-2 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                EXCLUDED FROM INGEST (LEAKAGE PREVENTION)
              </span>
              <ul className="space-y-1 text-metro-400 list-disc list-inside text-[11px]">
                <li><strong className="text-metro-200">category</strong> (used directly to compute severity)</li>
                <li><strong className="text-metro-200">severity</strong> (explicit component of ground truth)</li>
                <li><strong className="text-metro-200">recurrence</strong> (explicit cumulative counter)</li>
                <li><strong className="text-metro-200">ward_load</strong> (explicit ranking component)</li>
              </ul>
            </div>

            <div>
              <span className="text-emerald-400 font-bold block mb-2 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                PERMITTED RAW OPERATIONAL SIGNALS
              </span>
              <ul className="space-y-1 text-metro-300 list-disc list-inside text-[11px]">
                <li><strong className="text-white">sub_category</strong> (One-Hot Encoded, min freq 5)</li>
                <li><strong className="text-white">ward</strong> (One-Hot Encoded, 199 municipal zones)</li>
                <li><strong className="text-white">status</strong> (Registered / In Progress / Closed)</li>
                <li><strong className="text-white">staff_remarks</strong> (One-Hot Encoded nominal tokens)</li>
                <li><strong className="text-white">designation</strong> (AE, AEE, EE, JE, Lineman, etc.)</li>
                <li><strong className="text-white">age_clipped</strong> (StandardScaler normalized, IQR fence)</li>
                <li><strong className="text-white">remarks_missing</strong> (Binary indicator for triage stage)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Explainability Engine */}
      <div className="glass-panel p-6 rounded-xl border border-metro-800/80 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-mono uppercase">
          <Sparkles className="w-4 h-4 text-sky-400" />
          4. Explainable AI via SHAP TreeExplainer
        </div>
        <p className="text-xs text-metro-300 leading-relaxed">
          Black-box predictions are inadequate for municipal dispatchers. CIVIC integrates{" "}
          <strong className="text-white">SHAP TreeExplainer</strong> to decompose each individual classification into exact game-theoretic Shapley contributions. For any incoming complaint:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-xs text-metro-300 font-mono">
          <li>
            The tree explainer evaluates feature contributions against the baseline expected value of the predicted class.
          </li>
          <li>
            One-hot encoded categorical masks are filtered so that only features actually present in the complaint (e.g. active ward, active sub-category) are considered.
          </li>
          <li>
            The top positive impact drivers are dynamically mapped into a plain-English explainability narrative (e.g.,{" "}
            <span className="text-emerald-400">
              "Medium: sub category = Garbage dump, ward = Jogupalya, complaint age"
            </span>).
          </li>
        </ol>
      </div>

      {/* Section 5: Real-World Operational Limitations */}
      <div className="glass-panel p-6 rounded-xl border border-amber-800/60 bg-amber-950/10 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400 font-mono uppercase">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          5. Operational Boundaries & Documented Limitations
        </div>
        <div className="space-y-3 text-xs text-metro-300">
          <p>
            <strong className="text-white font-mono">Rule-Learned Ground Truth:</strong> Because labels originate from a documented municipal scoring policy, the model accurately recovers the scoring policy rather than independent ground-truth physical emergency urgency.
          </p>
          <p>
            <strong className="text-white font-mono">Temporal Constraints:</strong> The source dataset contains <code className="text-amber-300 font-mono">grievance_age</code> in hours but omits absolute calendar timestamps (dates, months, days of week), preventing seasonal or holiday trend analysis.
          </p>
          <p>
            <strong className="text-white font-mono">Text Redundancy:</strong> Free-text remarks from field engineers exhibit natural overlaps and informal phrasing, captured through frequency-thresholded nominal tokens.
          </p>
        </div>
      </div>
    </div>
  );
};
