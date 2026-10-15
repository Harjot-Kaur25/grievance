import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  Info,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { api } from "../api";
import type { ComplaintRecord, SystemOptions } from "../types";
import { PriorityBadge } from "../components/PriorityBadge";

interface GrievanceRegisterPageProps {
  options: SystemOptions | null;
  initialWard?: string;
  onClearInitialWard?: () => void;
  onAssessSimilar?: (complaint: Partial<ComplaintRecord>) => void;
}

export const GrievanceRegisterPage: React.FC<GrievanceRegisterPageProps> = ({
  options,
  initialWard,
  onClearInitialWard,
  onAssessSimilar,
}) => {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [wardFilter, setWardFilter] = useState<string>(initialWard || "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  // Detail Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);

  // Sync wardFilter when initialWard prop changes (e.g., navigated from Ward Intelligence)
  useEffect(() => {
    if (initialWard !== undefined && initialWard !== wardFilter) {
      setWardFilter(initialWard);
      setOffset(0);
    }
  }, [initialWard]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getComplaints({
        limit: pageSize,
        offset: offset,
        priority: priorityFilter || undefined,
        ward: wardFilter || undefined,
        status: statusFilter || undefined,
        search: search ? search.trim() : undefined,
      });
      setComplaints(res.records);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      setError(err.message || "Failed to load stored complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [offset, pageSize, priorityFilter, wardFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    loadComplaints();
  };

  const handleClearFilters = () => {
    setSearch("");
    setPriorityFilter("");
    setWardFilter("");
    setStatusFilter("");
    setOffset(0);
    if (onClearInitialWard) {
      onClearInitialWard();
    }
  };

  const handleNextPage = () => {
    if (offset + pageSize < totalCount) {
      setOffset((prev) => prev + pageSize);
    }
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - pageSize));
  };

  const hasActiveFilters = Boolean(search || priorityFilter || wardFilter || statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-metro-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              GRIEVANCE RECORD REGISTER
            </h1>
          </div>
          <p className="text-xs text-metro-400">
            Query, filter, and inspect municipal complaint records, LightGBM priority scores, and staff assignment history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-metro-950 border border-metro-800 rounded-lg text-xs font-mono text-metro-300">
            Total Records:{" "}
            <span className="text-emerald-400 font-bold">
              {totalCount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={loadComplaints}
            title="Refresh records"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metro-900 hover:bg-metro-850 border border-metro-800 text-metro-300 rounded-lg text-xs font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            REFRESH
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-metro-800/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-metro-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sub-category, remarks, or ward..."
              className="w-full pl-9 pr-4 py-2 bg-metro-950 border border-metro-800 focus:border-emerald-500 rounded-lg text-xs text-white placeholder-metro-500 outline-none transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-metro-950 font-bold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            FILTER
          </button>
        </form>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-metro-850 text-xs">
          <div className="flex items-center gap-1.5 text-metro-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>CRITERIA:</span>
          </div>

          {/* Priority filter */}
          <select
            id="priority_filter"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setOffset(0);
            }}
            className="px-2.5 py-1.5 bg-metro-950 border border-metro-800 rounded-md text-xs text-metro-200 outline-none focus:border-emerald-500 font-mono"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Ward filter */}
          <select
            value={wardFilter}
            onChange={(e) => {
              setWardFilter(e.target.value);
              setOffset(0);
              if (!e.target.value && onClearInitialWard) {
                onClearInitialWard();
              }
            }}
            className={`px-2.5 py-1.5 bg-metro-950 border rounded-md text-xs font-mono max-w-[200px] outline-none ${
              wardFilter ? "border-emerald-500 text-emerald-300" : "border-metro-800 text-metro-200"
            }`}
          >
            <option value="">All Wards ({options?.wards?.length || 199})</option>
            {options?.wards?.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
            className="px-2.5 py-1.5 bg-metro-950 border border-metro-800 rounded-md text-xs text-metro-200 outline-none focus:border-emerald-500 font-mono"
          >
            <option value="">All Statuses</option>
            {options?.statuses?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setOffset(0);
            }}
            className="px-2 py-1.5 bg-metro-950 border border-metro-800 rounded-md text-xs text-metro-200 outline-none focus:border-emerald-500 font-mono ml-auto"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs text-rose-300 font-mono flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        {/* Active Ward Filter Callout Banner */}
        {wardFilter && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Filtering by Ward: <strong>{wardFilter}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setWardFilter("");
                setOffset(0);
                if (onClearInitialWard) onClearInitialWard();
              }}
              className="text-metro-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-xl border border-metro-800/80 overflow-hidden shadow-card-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-metro-950/80 border-b border-metro-800/90 text-metro-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">DB ID</th>
                <th className="py-3 px-4">Sub-Category</th>
                <th className="py-3 px-4">Ward</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Age (Hrs)</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metro-850">
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-metro-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                    <p className="font-mono text-xs">Querying database records...</p>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-metro-400">
                    <Info className="w-6 h-6 text-metro-500 mx-auto mb-2" />
                    <p className="font-mono text-xs">No complaints match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className="hover:bg-metro-900/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono text-metro-400 group-hover:text-emerald-400 font-medium">
                      #{c.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-[200px] truncate" title={c.sub_category}>
                      {c.sub_category}
                    </td>
                    <td className="py-3 px-4 text-metro-300 font-mono">
                      {c.ward}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          c.status === "Closed"
                            ? "bg-metro-850 text-metro-400"
                            : "bg-sky-950/50 text-sky-400 border border-sky-800/40"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-metro-300">
                      {c.age_hours !== null && c.age_hours !== undefined
                        ? `${c.age_hours.toFixed(1)}h`
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-metro-300">
                      {c.confidence !== null && c.confidence !== undefined
                        ? `${(c.confidence * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td
                      className="py-3 px-4 text-metro-400 max-w-[220px] truncate"
                      title={c.staff_remarks || undefined}
                    >
                      {c.staff_remarks || <span className="text-metro-600 italic">None</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(c);
                        }}
                        className="p-1.5 rounded hover:bg-metro-800 text-metro-400 hover:text-emerald-400 transition-colors"
                        title="View Full Record"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-metro-950/90 border-t border-metro-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-metro-400">
          <div>
            Showing{" "}
            <span className="text-white font-bold">
              {totalCount > 0 ? (offset + 1).toLocaleString() : 0}
            </span>{" "}
            -{" "}
            <span className="text-white font-bold">
              {Math.min(offset + complaints.length, totalCount).toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="text-emerald-400 font-bold">
              {totalCount.toLocaleString()}
            </span>{" "}
            records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={offset === 0 || loading}
              className="flex items-center gap-1 px-3 py-1 rounded bg-metro-900 border border-metro-800 text-metro-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <span className="px-2 text-metro-400">
              Page {Math.floor(offset / pageSize) + 1} of{" "}
              {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>

            <button
              onClick={handleNextPage}
              disabled={offset + complaints.length >= totalCount || loading}
              className="flex items-center gap-1 px-3 py-1 rounded bg-metro-900 border border-metro-800 text-metro-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Refined Grievance Detail Modal with Grouped Structure & Scroll Protection */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-metro-900 border border-metro-750 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="p-4 px-5 border-b border-metro-800 flex items-center justify-between bg-metro-950/90 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-metro-800 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-metro-750">
                  #{selectedComplaint.id}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Grievance Record Telemetry
                  </h3>
                  <p className="text-xs text-metro-400 font-mono">
                    Source:{" "}
                    <span className="text-emerald-400 uppercase font-semibold">
                      {selectedComplaint.source}
                    </span>
                    {selectedComplaint.complaint_id && (
                      <span> • Raw Ref: #{selectedComplaint.complaint_id}</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-lg text-metro-400 hover:text-white hover:bg-metro-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Primary Assessment Callout Card */}
              <div className="p-4 rounded-xl bg-metro-950 border border-metro-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-metro-400 uppercase font-mono tracking-wider block mb-1">
                    Assessed Priority Tier
                  </span>
                  <PriorityBadge priority={selectedComplaint.priority} size="lg" />
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] text-metro-400 uppercase font-mono tracking-wider block mb-1">
                    Calibrated Confidence
                  </span>
                  <div className="text-2xl font-bold font-mono text-white">
                    {selectedComplaint.confidence !== null && selectedComplaint.confidence !== undefined
                      ? `${(selectedComplaint.confidence * 100).toFixed(1)}%`
                      : "Uncalibrated"}
                  </div>
                  <span className="text-[10px] text-metro-400 font-mono">
                    Model: LightGBM GBDT
                  </span>
                </div>
              </div>

              {/* Group 1: Geographic & Classification Context */}
              <div>
                <span className="text-[11px] font-mono uppercase text-metro-400 font-semibold block mb-2">
                  Municipal Context
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-metro-950/70 border border-metro-850">
                    <span className="text-metro-400 block text-[10px] uppercase">Functional Category</span>
                    <span className="text-white font-medium text-xs">
                      {selectedComplaint.category || "General Municipal"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-metro-950/70 border border-metro-850">
                    <span className="text-metro-400 block text-[10px] uppercase">Sub-Category</span>
                    <span className="text-white font-medium text-xs truncate block" title={selectedComplaint.sub_category}>
                      {selectedComplaint.sub_category}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-metro-950/70 border border-metro-850">
                    <span className="text-metro-400 block text-[10px] uppercase">Municipal Ward</span>
                    <span className="text-emerald-300 font-medium text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {selectedComplaint.ward}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-metro-950/70 border border-metro-850">
                    <span className="text-metro-400 block text-[10px] uppercase">Grievance Age</span>
                    <span className="text-white font-medium text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-metro-400" />
                      {selectedComplaint.age_hours !== null && selectedComplaint.age_hours !== undefined
                        ? `${selectedComplaint.age_hours.toFixed(1)} hours`
                        : "Not recorded"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 2: Operational Assignment */}
              <div>
                <span className="text-[11px] font-mono uppercase text-metro-400 font-semibold block mb-2">
                  Operational Assignment & Status
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-metro-950/70 border border-metro-850">
                    <span className="text-metro-400 block text-[10px] uppercase">Current Status</span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        selectedComplaint.status === "Closed"
                          ? "bg-metro-850 text-metro-300"
                          : "bg-sky-950/60 text-sky-400 border border-sky-800/50"
                      }`}
                    >
                      {selectedComplaint.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-metro-950/70 border border-metro-850">
                    <span className="text-metro-400 block text-[10px] uppercase">Staff Designation</span>
                    <span className="text-white font-medium text-xs flex items-center gap-1">
                      <User className="w-3 h-3 text-metro-400" />
                      {selectedComplaint.designation || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 3: Field Staff Remarks */}
              <div className="p-3.5 rounded-lg bg-metro-950/70 border border-metro-850 text-xs">
                <span className="text-metro-400 block text-[10px] font-mono uppercase mb-1">
                  Field Staff Remarks
                </span>
                <p className="text-metro-200 italic font-mono bg-metro-900/40 p-2.5 rounded border border-metro-850/60">
                  {selectedComplaint.staff_remarks
                    ? `"${selectedComplaint.staff_remarks}"`
                    : "No remarks entered by field officer."}
                </p>
              </div>

              {/* Group 4: SHAP Explainability Rationale */}
              {selectedComplaint.reason && (
                <div className="p-3.5 rounded-lg bg-emerald-950/25 border border-emerald-800/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>SHAP Explainability Rationale</span>
                  </div>
                  <p className="text-metro-200 font-mono text-[11px] leading-relaxed">
                    {selectedComplaint.reason}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 bg-metro-950/90 border-t border-metro-800 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] text-metro-400 font-mono">
                {selectedComplaint.created_at ? `Ingested: ${selectedComplaint.created_at}` : "Ingested into CIVIC"}
              </span>

              <div className="flex items-center gap-2">
                {onAssessSimilar && (
                  <button
                    onClick={() => {
                      onAssessSimilar({
                        sub_category: selectedComplaint.sub_category,
                        ward: selectedComplaint.ward,
                        status: selectedComplaint.status,
                        staff_remarks: selectedComplaint.staff_remarks,
                        designation: selectedComplaint.designation,
                        age_hours: selectedComplaint.age_hours,
                      });
                      setSelectedComplaint(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-metro-950 font-bold rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Assess Similar Case
                  </button>
                )}
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3.5 py-1.5 bg-metro-800 hover:bg-metro-750 text-metro-200 rounded-lg text-xs font-mono transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
