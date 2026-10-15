import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Search,
  RefreshCw,
} from "lucide-react";
import { api } from "../api";
import type { BatchPredictionResponse } from "../types";
import { PriorityBadge } from "../components/PriorityBadge";

export const BulkAnalysisPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [explain, setExplain] = useState<boolean>(true);
  const [saveToDb, setSaveToDb] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchPredictionResponse | null>(null);

  // Table filter
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a CSV or Excel (.xlsx) file to upload.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.predictBatch(file, explain, saveToDb);
      setBatchResult(res);
    } catch (err: any) {
      setError(err.message || "Bulk prediction process failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      "sub_category,ward,status,staff_remarks,designation,age_hours\n" +
      "Garbage dump,Horamavu,Registered,1st Assigned,AE,24\n" +
      "Street Light Not Working,Domlur,Registered,Inspection pending,Lineman,6\n" +
      "Drainage Overflow,Thanisandra,Registered,Field team alerted,AEE,48\n" +
      "Pot hole,Jogupalya,Registered,Under repair,JE,18\n" +
      "Stray Dog Menace,Koramangala,Registered,Assigned to vet dept,VO,72\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "civic_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportResultsCsv = () => {
    if (!batchResult || !batchResult.results.length) return;

    const headers = Object.keys(batchResult.results[0]);
    const csvRows = [
      headers.join(","),
      ...batchResult.results.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return "";
            const strVal = String(val).replace(/"/g, '""');
            return `"${strVal}"`;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `civic_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter batch results
  const filteredResults = batchResult?.results.filter((item) => {
    const matchesPriority = filterPriority ? item.priority === filterPriority : true;
    const matchesSearch = searchTerm
      ? (item.sub_category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ward || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.reason || "").toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-metro-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              BULK INTAKE & BATCH CLASSIFICATION
            </h1>
          </div>
          <p className="text-xs text-metro-400">
            Upload CSV or Excel exports to run high-throughput LightGBM classification and SHAP decision tree explainability.
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-metro-900 hover:bg-metro-850 border border-metro-800 text-emerald-400 rounded-lg text-xs font-mono transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          SAMPLE CSV TEMPLATE
        </button>
      </div>

      {/* Upload Zone & Config Card */}
      <div className="glass-panel p-6 rounded-xl border border-metro-800/80 space-y-6">
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-metro-750 hover:border-emerald-500/60 rounded-xl p-8 text-center transition-colors bg-metro-950/40 relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-metro-900 border border-metro-800 flex items-center justify-center text-emerald-400 mb-3 shadow-mint-glow">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono mb-1">
                {file ? file.name : "Select or Drop Grievance Dataset File"}
              </h4>
              <p className="text-xs text-metro-400 max-w-sm mb-2">
                Accepts comma-separated (.csv) with headers{" "}
                <code className="text-emerald-400 font-mono">sub_category, ward</code> or standard 8-column raw municipal exports.
              </p>
              {file && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono">
                  {(file.size / 1024).toFixed(1)} KB ready for dispatch
                </span>
              )}
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Explain Toggle */}
            <div className="p-3 rounded-lg bg-metro-950/60 border border-metro-850 flex items-start gap-3">
              <input
                type="checkbox"
                id="batch_explain"
                checked={explain}
                onChange={(e) => setExplain(e.target.checked)}
                className="w-4 h-4 rounded bg-metro-900 border-metro-750 text-emerald-500 mt-0.5"
              />
              <div>
                <label htmlFor="batch_explain" className="text-white font-semibold block cursor-pointer">
                  Generate SHAP Explainability Reasons
                </label>
                <span className="text-[11px] text-metro-400 block mt-0.5">
                  Computes plain-English decision factors. Capped at 500 rows for memory safety.
                </span>
              </div>
            </div>

            {/* Save to DB Toggle */}
            <div className="p-3 rounded-lg bg-metro-950/60 border border-metro-850 flex items-start gap-3">
              <input
                type="checkbox"
                id="batch_save"
                checked={saveToDb}
                onChange={(e) => setSaveToDb(e.target.checked)}
                className="w-4 h-4 rounded bg-metro-900 border-metro-750 text-emerald-500 mt-0.5"
              />
              <div>
                <label htmlFor="batch_save" className="text-white font-semibold block cursor-pointer">
                  Commit Predictions to Database
                </label>
                <span className="text-[11px] text-metro-400 block mt-0.5">
                  Inserts classified records into the permanent complaints database with API source tag.
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-metro-950 font-bold rounded-lg transition-all shadow-mint-glow flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Batch Model Processing...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Dispatch Batch Analysis
              </>
            )}
          </button>
        </form>
      </div>

      {/* Batch Results View */}
      {batchResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
            <div className="glass-panel p-4 rounded-xl border border-metro-800">
              <span className="text-[10px] text-metro-400 uppercase block">Total Classified</span>
              <span className="text-2xl font-black text-white">{batchResult.count}</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-rose-800/40 bg-rose-950/20">
              <span className="text-[10px] text-rose-400 uppercase block">Critical Tier</span>
              <span className="text-2xl font-black text-rose-400">
                {batchResult.summary?.Critical || 0}
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-amber-800/40 bg-amber-950/20">
              <span className="text-[10px] text-amber-400 uppercase block">High Tier</span>
              <span className="text-2xl font-black text-amber-400">
                {batchResult.summary?.High || 0}
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-sky-800/40 bg-sky-950/20">
              <span className="text-[10px] text-sky-400 uppercase block">Medium Tier</span>
              <span className="text-2xl font-black text-sky-400">
                {batchResult.summary?.Medium || 0}
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20">
              <span className="text-[10px] text-emerald-400 uppercase block">Low Tier</span>
              <span className="text-2xl font-black text-emerald-400">
                {batchResult.summary?.Low || 0}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel rounded-xl border border-metro-800/80 overflow-hidden shadow-card-subtle">
            <div className="p-4 border-b border-metro-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative max-w-xs flex-1">
                  <Search className="w-3.5 h-3.5 text-metro-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search predictions..."
                    className="w-full pl-8 pr-3 py-1.5 bg-metro-950 border border-metro-800 rounded-lg text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2.5 py-1.5 bg-metro-950 border border-metro-800 rounded-md text-xs text-metro-200 font-mono outline-none focus:border-emerald-500"
                >
                  <option value="">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button
                onClick={handleExportResultsCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-metro-900 hover:bg-metro-800 border border-metro-800 text-emerald-400 rounded-lg text-xs font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                EXPORT RESULTS CSV
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-metro-950/80 border-b border-metro-800/90 text-metro-400 font-mono uppercase text-[11px] sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Sub-Category</th>
                    <th className="py-3 px-4">Ward</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Explainability Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-metro-850">
                  {filteredResults?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-metro-900/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-metro-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate">
                        {row.sub_category || "—"}
                      </td>
                      <td className="py-3 px-4 text-metro-300 font-mono">
                        {row.ward || "—"}
                      </td>
                      <td className="py-3 px-4 text-metro-300 font-mono">
                        {row.status || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={row.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-mono text-metro-300 font-bold">
                        {row.confidence ? `${(row.confidence * 100).toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-3 px-4 text-metro-400 max-w-[300px] font-mono text-[11px]">
                        {row.reason || <span className="text-metro-600 italic">No explanation generated</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
