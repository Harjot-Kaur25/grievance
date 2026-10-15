import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { api } from "../api";
import type {
  ComplaintInput,
  PredictionResult,
  SystemOptions,
  PriorityLevel,
} from "../types";
import { PriorityBadge } from "../components/PriorityBadge";

interface PriorityAssessmentPageProps {
  options: SystemOptions | null;
  initialValues?: Partial<ComplaintInput> | null;
  onClearInitialValues?: () => void;
}

const PRESETS = [
  {
    label: "Overflowing Garbage Dump (Hotspot Ward)",
    sub_category: "Garbage dump",
    ward: "Horamavu",
    status: "Registered",
    staff_remarks: "1st Assigned",
    designation: "AE",
    age_hours: 48,
  },
  {
    label: "Burst Water Main / Health Hazard",
    sub_category: "Drainage Overflow",
    ward: "Thanisandra",
    status: "Registered",
    staff_remarks: "Urgent site inspection requested",
    designation: "AEE",
    age_hours: 12,
  },
  {
    label: "Street Light Outage (Low Recurrence)",
    sub_category: "Street Light Not Working",
    ward: "Domlur",
    status: "Registered",
    staff_remarks: "Inspection scheduled",
    designation: "Lineman",
    age_hours: 6,
  },
];

export const PriorityAssessmentPage: React.FC<PriorityAssessmentPageProps> = ({
  options,
  initialValues,
  onClearInitialValues,
}) => {
  const [formData, setFormData] = useState<ComplaintInput>({
    sub_category: "Garbage dump",
    ward: "Horamavu",
    status: "Registered",
    staff_remarks: "1st Assigned",
    staff_name: "Durga Prasad/AE",
    designation: "AE",
    age_hours: 12,
    save: true,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Load initial values if passed from register
  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        save: true,
      }));
      if (onClearInitialValues) onClearInitialValues();
    }
  }, [initialValues]);

  // Set initial default options once loaded
  useEffect(() => {
    if (options && !initialValues) {
      if (options.sub_categories?.length && !options.sub_categories.includes(formData.sub_category)) {
        setFormData((prev) => ({ ...prev, sub_category: options.sub_categories[0] }));
      }
      if (options.wards?.length && !options.wards.includes(formData.ward)) {
        setFormData((prev) => ({ ...prev, ward: options.wards[0] }));
      }
    }
  }, [options]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sub_category || !formData.ward) {
      setError("Sub-category and Municipal Ward are mandatory inputs.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.predict(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute priority prediction.");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      sub_category: preset.sub_category,
      ward: preset.ward,
      status: preset.status,
      staff_remarks: preset.staff_remarks,
      designation: preset.designation,
      staff_name: `${preset.staff_remarks ? "Field Officer" : "Staff"}/${preset.designation}`,
      age_hours: preset.age_hours,
    }));
  };

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case "Critical":
        return {
          glow: "shadow-[0_0_30px_rgba(244,63,94,0.3)]",
          border: "border-rose-600/70",
          text: "text-rose-400",
          badgeBg: "bg-rose-950/60",
          accentBar: "bg-rose-500",
        };
      case "High":
        return {
          glow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
          border: "border-amber-600/70",
          text: "text-amber-400",
          badgeBg: "bg-amber-950/60",
          accentBar: "bg-amber-500",
        };
      case "Medium":
        return {
          glow: "shadow-[0_0_20px_rgba(14,165,233,0.2)]",
          border: "border-sky-600/70",
          text: "text-sky-400",
          badgeBg: "bg-sky-950/60",
          accentBar: "bg-sky-500",
        };
      case "Low":
      default:
        return {
          glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
          border: "border-emerald-600/70",
          text: "text-emerald-400",
          badgeBg: "bg-emerald-950/60",
          accentBar: "bg-emerald-500",
        };
    }
  };

  // Find max impact factor to normalize bars
  const maxFactorImpact = result?.factors?.length
    ? Math.max(...result.factors.map((f) => f.impact), 0.001)
    : 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-metro-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              REAL-TIME PRIORITY INFERENCE & EXPLAINABILITY
            </h1>
          </div>
          <p className="text-xs text-metro-400">
            Submit grievance parameters to compute LightGBM model priority tier, confidence calibration, and SHAP decision factors.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-metro-400 font-mono">PRESETS:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 bg-metro-900 hover:bg-metro-800 border border-metro-800 hover:border-emerald-500/40 text-metro-300 hover:text-white rounded text-xs font-mono transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-metro-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-metro-850">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Grievance Input Parameters
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                LIGHTGBM INPUT
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form id="assessment-form" onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* Sub-Category */}
              <div>
                <label className="block text-metro-300 mb-1 font-semibold uppercase text-[11px]">
                  Sub-Category <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  className="w-full px-3 py-2 bg-metro-950 border border-metro-800 rounded-lg text-white outline-none focus:border-emerald-500 transition-colors"
                  required
                >
                  {options?.sub_categories?.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-metro-500 mt-1 block">
                  Captures nominal operational grievance classification
                </span>
              </div>

              {/* Municipal Ward */}
              <div>
                <label className="block text-metro-300 mb-1 font-semibold uppercase text-[11px]">
                  Municipal Ward <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full px-3 py-2 bg-metro-950 border border-metro-800 rounded-lg text-white outline-none focus:border-emerald-500 transition-colors"
                  required
                >
                  {options?.wards?.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-metro-300 mb-1 font-semibold uppercase text-[11px]">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-metro-950 border border-metro-800 rounded-lg text-white outline-none focus:border-emerald-500 transition-colors"
                  >
                    {options?.statuses?.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-metro-300 mb-1 font-semibold uppercase text-[11px]">
                    Designation
                  </label>
                  <select
                    value={formData.designation || ""}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-metro-950 border border-metro-800 rounded-lg text-white outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="">(None / Auto)</option>
                    {options?.designations?.map((des) => (
                      <option key={des} value={des}>
                        {des}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Remarks */}
              <div>
                <label className="block text-metro-300 mb-1 font-semibold uppercase text-[11px]">
                  Staff Remarks
                </label>
                <input
                  type="text"
                  value={formData.staff_remarks || ""}
                  onChange={(e) => setFormData({ ...formData, staff_remarks: e.target.value })}
                  placeholder="e.g. 1st Assigned, Under Inspection, Site Visited"
                  className="w-full px-3 py-2 bg-metro-950 border border-metro-800 rounded-lg text-white placeholder-metro-600 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Grievance Age in Hours */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-metro-300 font-semibold uppercase text-[11px]">
                    Grievance Age (Hours)
                  </label>
                  <span className="text-emerald-400 font-bold">
                    {formData.age_hours ?? 0} hrs
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.age_hours ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, age_hours: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-metro-950 border border-metro-800 rounded-lg text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Save to DB checkbox */}
              <div className="pt-2 border-t border-metro-850 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-metro-300 select-none">
                  <input
                    id="save_db"
                    type="checkbox"
                    checked={formData.save}
                    onChange={(e) => setFormData({ ...formData, save: e.target.checked })}
                    className="w-4 h-4 rounded bg-metro-950 border border-metro-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Persist assessed record into SQLite DB</span>
                </label>
              </div>
            </form>
          </div>

          <div className="pt-5 mt-4 border-t border-metro-850 flex items-center gap-3">
            <button
              form="assessment-form"
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-metro-950 font-bold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-mint-glow"
            >
              <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "EVALUATING MODEL..." : "EVALUATE PRIORITY"}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({
                  sub_category: "Garbage dump",
                  ward: "Horamavu",
                  status: "Registered",
                  staff_remarks: "1st Assigned",
                  staff_name: "Durga Prasad/AE",
                  designation: "AE",
                  age_hours: 12,
                  save: true,
                });
                setResult(null);
                setError(null);
              }}
              title="Reset input fields"
              className="p-2.5 bg-metro-900 hover:bg-metro-850 border border-metro-800 text-metro-400 hover:text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prediction Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div
              className={`glass-panel p-6 rounded-xl border ${
                getPriorityStyle(result.priority).border
              } ${getPriorityStyle(result.priority).glow} transition-all space-y-6`}
            >
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-metro-850">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-metro-400 block mb-1">
                    MODEL TIER CLASSIFICATION
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      data-testid="predicted-priority-text"
                      className={`text-3xl font-black font-mono tracking-tight ${
                        getPriorityStyle(result.priority).text
                      }`}
                    >
                      {result.priority.toUpperCase()}
                    </span>
                    <PriorityBadge priority={result.priority} size="md" />
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-metro-400 block mb-1">
                    CALIBRATED CONFIDENCE
                  </span>
                  <div data-testid="predicted-confidence-text" className="text-2xl font-bold font-mono text-white">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  {/* Confidence bar meter */}
                  <div className="w-32 h-1.5 rounded-full bg-metro-950 mt-1 border border-metro-800 overflow-hidden sm:ml-auto">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                    />
                  </div>
                  {result.id && (
                    <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                      Stored as DB Record #{result.id}
                    </span>
                  )}
                </div>
              </div>

              {/* Class Probability Distribution */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase font-bold text-metro-300">
                    Probability Distribution Across Tiers
                  </span>
                  <span className="text-[10px] font-mono text-metro-500">Softmax Outputs</span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(result.probabilities).map(([tier, prob]) => {
                    const pct = (prob * 100).toFixed(1);
                    const isSelected = tier === result.priority;
                    return (
                      <div
                        key={tier}
                        className={`p-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-metro-950 border-metro-750 shadow-inner"
                            : "bg-metro-950/40 border-metro-850/60"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span
                              className={
                                isSelected ? "text-white font-bold" : "text-metro-400"
                              }
                            >
                              {tier}
                            </span>
                          </div>
                          <span
                            className={
                              isSelected ? "text-emerald-400 font-bold" : "text-metro-400"
                            }
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-metro-900 overflow-hidden border border-metro-850">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              tier === "Critical"
                                ? "bg-rose-500"
                                : tier === "High"
                                ? "bg-amber-500"
                                : tier === "Medium"
                                ? "bg-sky-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plain-English SHAP Reason */}
              {result.reason && (
                <div className="p-4 rounded-xl bg-metro-950/90 border border-metro-800">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-emerald-400 font-bold uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    Explainability Decision Rationale
                  </div>
                  <p className="text-xs text-metro-100 font-mono leading-relaxed italic">
                    "{result.reason}"
                  </p>
                </div>
              )}

              {/* SHAP Impact Breakdown */}
              {result.factors && result.factors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase font-bold text-metro-300">
                      SHAP Feature Impact Attribution (Top Decision Drivers)
                    </span>
                    <span className="text-[10px] font-mono text-metro-500">
                      TreeExplainer Attributions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {result.factors.map((factor, idx) => {
                      const relativeWidth = Math.min(
                        100,
                        Math.max(15, (factor.impact / maxFactorImpact) * 100)
                      );
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-metro-950 border border-metro-850 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 h-5 rounded bg-metro-900 border border-metro-800 flex items-center justify-center text-[10px] font-mono text-metro-400 font-bold">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-mono font-semibold text-white block truncate">
                                {factor.feature}
                              </span>
                              <span className="text-[10px] text-metro-400 font-mono">
                                Positive contribution toward {result.priority}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-28 h-2 rounded-full bg-metro-900 overflow-hidden border border-metro-850">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                style={{ width: `${relativeWidth}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 min-w-[65px] text-right">
                              +{factor.impact.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-xl border border-metro-800/80 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-metro-900 border border-metro-800 flex items-center justify-center text-metro-500 mb-4 shadow-mint-glow">
                <Cpu className="w-8 h-8 text-emerald-500/60" />
              </div>
              <h3 className="text-base font-bold text-white font-mono uppercase mb-2">
                Awaiting Assessment Parameters
              </h3>
              <p className="text-xs text-metro-400 max-w-md mb-6 leading-relaxed">
                Fill in the municipal parameters on the left or click one of the quick presets to compute instantaneous classification and SHAP tree impact drivers.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-metro-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400/50 animate-pulse" />
                Integrated with LightGBM & SHAP TreeExplainer
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
