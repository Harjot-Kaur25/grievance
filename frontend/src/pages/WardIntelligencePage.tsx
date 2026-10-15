import React, { useState, useEffect } from "react";
import {
  MapPin,
  Flame,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../api";
import type { WardHotspot } from "../types";

interface WardIntelligencePageProps {
  onInspectWard: (wardName: string) => void;
}

export const WardIntelligencePage: React.FC<WardIntelligencePageProps> = ({
  onInspectWard,
}) => {
  const [hotspots, setHotspots] = useState<WardHotspot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [limit, setLimit] = useState<number>(20);
  const [minComplaints, setMinComplaints] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const loadHotspots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getHotspots(limit, minComplaints);
      setHotspots(res);
    } catch (err: any) {
      setError(err.message || "Failed to load ward hotspots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, [limit, minComplaints]);

  const filteredHotspots = hotspots.filter((w) =>
    w.ward.toLowerCase().includes(search.toLowerCase())
  );

  const topHotspot = hotspots[0];
  const mostCriticalWard = [...hotspots].sort((a, b) => b.critical - a.critical)[0];
  const highestOpenRateWard = [...hotspots]
    .filter((w) => w.total >= 50)
    .sort((a, b) => (b.open_rate || 0) - (a.open_rate || 0))[0];

  const chartData = filteredHotspots.slice(0, 10).map((w) => ({
    ward: w.ward,
    hotspot_score: w.hotspot_score,
    critical: w.critical,
    high: w.high,
    open: w.open,
    total: w.total,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-metro-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              WARD INTELLIGENCE & HOTSPOT MATRIX
            </h1>
          </div>
          <p className="text-xs text-metro-400">
            Geographic hotspot prioritization using operational scoring formula:{" "}
            <code className="text-emerald-400 font-mono bg-metro-900 px-1.5 py-0.5 rounded border border-metro-800">
              Hotspot Score = Open + 2×Critical + High
            </code>
          </p>
        </div>

        <button
          onClick={loadHotspots}
          title="Refresh ward telemetry"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-metro-900 hover:bg-metro-850 border border-metro-800 text-metro-300 rounded-lg text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          REFRESH MATRIX
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Hotspot Methodology & Formula Banner */}
      <div className="glass-panel p-4 rounded-xl border border-metro-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-metro-950/60">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 flex-shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Prioritization Formula Specification
            </h3>
            <p className="text-xs text-metro-300 mt-0.5 leading-relaxed">
              Wards are scored by compounding unresolved active grievances with double-weighted Critical cases and single-weighted High tier incidents:{" "}
              <span className="text-emerald-400 font-mono font-bold">Score = Open + 2×Critical + High</span>.
            </p>
          </div>
        </div>

        {topHotspot && (
          <div className="px-3 py-2 rounded-lg bg-metro-900 border border-metro-800 text-xs font-mono text-metro-300 flex-shrink-0">
            <span className="text-metro-400 text-[10px] uppercase block">
              Top Ward Example ({topHotspot.ward}):
            </span>
            <span className="text-white font-semibold">
              {topHotspot.open} + 2×{topHotspot.critical} + {topHotspot.high} ={" "}
              <strong className="text-emerald-400">{topHotspot.hotspot_score}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Top 3 Focus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-xl border border-rose-900/40 bg-gradient-to-b from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span className="text-rose-400 font-bold">#1 Overall Hotspot</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-white font-mono truncate">
            {topHotspot ? topHotspot.ward : "—"}
          </div>
          <div className="mt-3 text-xs font-mono text-metro-400 flex items-center justify-between border-t border-metro-850/80 pt-2">
            <span>
              Score: <strong className="text-rose-400 font-bold text-sm">{topHotspot?.hotspot_score ?? 0}</strong>
            </span>
            <span>{topHotspot?.total.toLocaleString() ?? 0} total cases</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-xl border border-amber-900/40 bg-gradient-to-b from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span className="text-amber-400 font-bold">Critical Incident Cluster</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-white font-mono truncate">
            {mostCriticalWard ? mostCriticalWard.ward : "—"}
          </div>
          <div className="mt-3 text-xs font-mono text-metro-400 flex items-center justify-between border-t border-metro-850/80 pt-2">
            <span>
              Critical: <strong className="text-amber-400 font-bold text-sm">{mostCriticalWard?.critical ?? 0}</strong>
            </span>
            <span>{mostCriticalWard?.open ?? 0} unresolved</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-xl border border-sky-900/40 bg-gradient-to-b from-sky-950/20 to-transparent">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span className="text-sky-400 font-bold">Highest Open Backlog Rate</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono truncate">
            {highestOpenRateWard ? highestOpenRateWard.ward : "—"}
          </div>
          <div className="mt-3 text-xs font-mono text-metro-400 flex items-center justify-between border-t border-metro-850/80 pt-2">
            <span>
              Unresolved:{" "}
              <strong className="text-sky-400 font-bold text-sm">
                {highestOpenRateWard ? ((highestOpenRateWard.open_rate || 0) * 100).toFixed(1) : 0}%
              </strong>
            </span>
            <span>{highestOpenRateWard?.open ?? 0} cases open</span>
          </div>
        </div>
      </div>

      {/* Chart: Comparative Hotspot Breakdown */}
      <div className="glass-panel p-5 rounded-xl border border-metro-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Top Ward Hotspots & Urgency Composition
            </h3>
            <p className="text-xs text-metro-400">
              Comparative view of Hotspot Scores, Open Backlog, and Critical Tiers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-metro-950 border border-metro-800 rounded-md text-xs text-metro-200 font-mono outline-none focus:border-emerald-500"
            >
              <option value={10}>Top 10 Wards</option>
              <option value={20}>Top 20 Wards</option>
              <option value={50}>Top 50 Wards</option>
            </select>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 15, left: 10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2633" vertical={false} />
              <XAxis
                dataKey="ward"
                stroke="#4B6382"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={55}
              />
              <YAxis
                stroke="#4B6382"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-metro-900 border border-metro-750 px-3.5 py-2.5 rounded-lg text-xs font-mono shadow-xl space-y-1.5">
                        <p className="text-emerald-400 font-bold text-sm">{d.ward}</p>
                        <div className="space-y-1 pt-1 border-t border-metro-800">
                          <p className="text-white flex justify-between gap-4">
                            <span>Hotspot Score:</span>{" "}
                            <strong className="text-emerald-400">{d.hotspot_score}</strong>
                          </p>
                          <p className="text-rose-400 flex justify-between gap-4">
                            <span>Critical Cases:</span>{" "}
                            <strong>{d.critical}</strong>
                          </p>
                          <p className="text-sky-400 flex justify-between gap-4">
                            <span>Active Open:</span>{" "}
                            <strong>{d.open}</strong>
                          </p>
                          <p className="text-metro-400 flex justify-between gap-4">
                            <span>Total Ingest:</span>{" "}
                            <strong>{d.total}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 10 }}
              />
              <Bar dataKey="hotspot_score" name="Hotspot Score" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="critical" name="Critical Cases" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="open" name="Active Open" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter & Ward Table */}
      <div className="glass-panel rounded-xl border border-metro-800/80 overflow-hidden shadow-card-subtle">
        <div className="p-4 border-b border-metro-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-metro-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ward name..."
              className="w-full pl-8 pr-3 py-1.5 bg-metro-950 border border-metro-800 rounded-lg text-xs text-white placeholder-metro-500 font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-metro-400">
            <span>Min Complaints Threshold:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={minComplaints}
              onChange={(e) => setMinComplaints(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 bg-metro-950 border border-metro-800 rounded text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-metro-950/80 border-b border-metro-800/90 text-metro-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-4">Hotspot Score</th>
                <th className="py-3 px-4">Total Intake</th>
                <th className="py-3 px-4">Active Open</th>
                <th className="py-3 px-4">Open Rate</th>
                <th className="py-3 px-4">Critical Tier</th>
                <th className="py-3 px-4">High Tier</th>
                <th className="py-3 px-4">Avg Age (Hrs)</th>
                <th className="py-3 px-4 text-right">Register Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metro-850">
              {filteredHotspots.map((w, index) => (
                <tr key={w.ward} className="hover:bg-metro-900/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-metro-400 font-bold">
                    #{index + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white font-mono">
                    {w.ward}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                    {w.hotspot_score}
                  </td>
                  <td className="py-3 px-4 font-mono text-metro-200">
                    {w.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-sky-400 font-semibold">
                    {w.open.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-metro-300">
                    {((w.open_rate || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-400 font-bold">
                    {w.critical}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400">
                    {w.high}
                  </td>
                  <td className="py-3 px-4 font-mono text-metro-300">
                    {w.avg_age_hours !== null && w.avg_age_hours !== undefined
                      ? `${w.avg_age_hours}h`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onInspectWard(w.ward)}
                      title={`Open Grievance Register filtered by ${w.ward}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-metro-900 hover:bg-emerald-950/60 border border-metro-800 hover:border-emerald-500/40 text-emerald-400 text-[11px] font-mono transition-colors"
                    >
                      <span>Filter Cases</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
