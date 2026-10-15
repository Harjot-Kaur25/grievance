import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  Layers,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Flame,
  ShieldAlert,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { api } from "../api";
import type { PlatformStats, WardHotspot } from "../types";

interface OverviewPageProps {
  onNavigate: (page: any) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#F43F5E",
  High: "#F59E0B",
  Medium: "#0EA5E9",
  Low: "#10B981",
};

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [hotspots, setHotspots] = useState<WardHotspot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, hotspotsRes] = await Promise.all([
        api.getStats(),
        api.getHotspots(6, 1),
      ]);
      setStats(statsRes);
      setHotspots(hotspotsRes);
    } catch (err: any) {
      setError(err.message || "Failed to load platform statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-metro-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-mono tracking-wider uppercase">Loading urban telemetry...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 rounded-xl bg-metro-900 border border-rose-800/60 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2 font-mono">Telemetry Service Unavailable</h3>
        <p className="text-sm text-metro-300 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-metro-950 font-bold rounded-lg text-xs font-mono transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  // Process data for charts
  const priorityChartData = stats?.by_priority
    ? Object.entries(stats.by_priority).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const categoryChartData = stats?.by_category
    ? Object.entries(stats.by_category)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, count]) => ({
          name,
          count,
        }))
    : [];

  const ageByCategoryData = stats?.avg_age_hours_by_category
    ? Object.entries(stats.avg_age_hours_by_category)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([category, avgHours]) => ({
          category,
          avgHours,
        }))
    : [];

  const topSubcats = stats?.top_sub_categories
    ? Object.entries(stats.top_sub_categories)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    : [];

  const totalComplaints = stats?.total ?? 0;
  const openComplaints = stats?.open ?? 0;
  const openRatePercent = stats ? (stats.open_rate * 100).toFixed(1) : "0.0";
  const criticalCount = stats?.by_priority?.Critical ?? 0;
  const highCount = stats?.by_priority?.High ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-metro-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              METROPOLITAN INTELLIGENCE OVERVIEW
            </h1>
          </div>
          <p className="text-xs text-metro-400">
            Real-time municipal telemetry across 199 wards, LightGBM multi-tier priority distribution, and operational load metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("assessment")}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-metro-950 font-bold text-xs rounded-lg transition-all shadow-mint-glow font-mono uppercase tracking-wider"
          >
            <ShieldAlert className="w-4 h-4" />
            Assess Grievance
          </button>
          <button
            onClick={loadData}
            title="Refresh statistics"
            className="p-2 bg-metro-900 hover:bg-metro-800 border border-metro-800 text-metro-300 rounded-lg text-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="glass-panel p-5 rounded-xl border border-metro-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span>Total Ingest</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {totalComplaints.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-metro-400 flex items-center gap-1.5 font-mono">
            <span className="text-emerald-400 font-semibold">100%</span>
            <span>Recorded grievances</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
        </div>

        {/* Card 2: Open Backlog */}
        <div className="glass-panel p-5 rounded-xl border border-metro-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span>Active Backlog</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {openComplaints.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-metro-400 flex items-center gap-1.5 font-mono">
            <span className="text-sky-400 font-semibold">{openRatePercent}%</span>
            <span>Unresolved complaint rate</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
        </div>

        {/* Card 3: Critical Tier */}
        <div className="glass-panel p-5 rounded-xl border border-metro-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span>Critical Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
            {criticalCount.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-metro-400 flex items-center gap-1.5 font-mono">
            <span className="text-rose-400 font-semibold">
              {totalComplaints > 0 ? ((criticalCount / totalComplaints) * 100).toFixed(1) : "0.0"}%
            </span>
            <span>Immediate dispatch SLA</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-colors pointer-events-none" />
        </div>

        {/* Card 4: High Tier */}
        <div className="glass-panel p-5 rounded-xl border border-metro-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-metro-400 text-xs font-mono uppercase mb-2">
            <span>High Priority</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {highCount.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-metro-400 flex items-center gap-1.5 font-mono">
            <span className="text-amber-400 font-semibold">
              {totalComplaints > 0 ? ((highCount / totalComplaints) * 100).toFixed(1) : "0.0"}%
            </span>
            <span>Elevated monitoring tier</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
        </div>
      </div>

      {/* Row 2: Charts (Priority Donut + Category Breakdown in readable horizontal format) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Priority Distribution Donut */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-metro-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Priority Tier Distribution
                </h3>
                <p className="text-xs text-metro-400">LightGBM Model Class Assignments</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-metro-900 text-metro-300 border border-metro-800">
                4 CLASSES
              </span>
            </div>

            <div className="h-60 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={PRIORITY_COLORS[entry.name] || "#64748B"}
                        stroke="#070B0E"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const pct = totalComplaints > 0 ? ((data.value / totalComplaints) * 100).toFixed(1) : "0.0";
                        return (
                          <div className="bg-metro-900/95 border border-metro-750 p-2.5 rounded-lg text-xs font-mono shadow-2xl pointer-events-none">
                            <p className="text-white font-bold">{data.name}</p>
                            <p className="text-metro-300">
                              {data.value.toLocaleString()} rows ({pct}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center metric */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] text-metro-400 uppercase font-mono block">Ingest Total</span>
                <span className="text-xl font-black text-white font-mono">
                  {totalComplaints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-metro-850">
            {priorityChartData.map((item) => {
              const pct = totalComplaints > 0 ? ((item.value / totalComplaints) * 100).toFixed(1) : "0.0";
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-metro-900/60 border border-metro-850 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PRIORITY_COLORS[item.name] || "#64748B" }}
                    />
                    <span className="font-medium text-metro-200">{item.name}</span>
                  </div>
                  <span className="font-mono text-metro-400 text-[11px]">
                    {item.value.toLocaleString()} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Intake Volume - Clean Horizontal Bars (No Text Clipping) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-xl border border-metro-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Intake Volume by Functional Category
              </h3>
              <p className="text-xs text-metro-400">Highest volume municipal operational sectors</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2633" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#4B6382"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#CBD8E7"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <Tooltip
                  cursor={{ fill: "rgba(28, 41, 54, 0.4)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = totalComplaints > 0 ? ((data.count / totalComplaints) * 100).toFixed(1) : "0.0";
                      return (
                        <div className="bg-metro-900/95 border border-metro-750 p-2.5 rounded-lg text-xs font-mono shadow-2xl pointer-events-none">
                          <p className="text-emerald-400 font-bold">{data.name}</p>
                          <p className="text-white">
                            {data.count.toLocaleString()} complaints ({pct}% of total)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-metro-850 flex items-center justify-between text-[11px] font-mono text-metro-400">
            <span>Primary Driver: Solid Waste & Road Infrastructure</span>
            <span>Excludes Category from ML Features</span>
          </div>
        </div>
      </div>

      {/* Row 3: Age by Category + Ward Hotspots + Top Subcategories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Average Grievance Age (Hours) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl border border-metro-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Average Age (Hours)
                </h3>
                <p className="text-xs text-metro-400">Mean time since registration</p>
              </div>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageByCategoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C2633" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#4B6382"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    unit="h"
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#CBD8E7"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(28, 41, 54, 0.4)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-metro-900/95 border border-metro-750 p-2.5 rounded-lg text-xs font-mono shadow-2xl pointer-events-none">
                            <p className="text-white font-bold">{data.category}</p>
                            <p className="text-sky-400">{data.avgHours} hours average age</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgHours" fill="#38BDF8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-metro-850 text-[11px] font-mono text-metro-400 flex items-center justify-between">
            <span>Clipped at IQR upper fence</span>
            <span className="text-sky-400">Hours scale</span>
          </div>
        </div>

        {/* Priority Ward Hotspot Leaderboard */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl border border-metro-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Top Ward Hotspots
                </h3>
                <p className="text-xs text-metro-400">Score = Open + 2×Critical + High</p>
              </div>
              <button
                onClick={() => onNavigate("wards")}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
              >
                Full Matrix <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 mt-2">
              {hotspots.slice(0, 4).map((w, index) => (
                <div
                  key={w.ward}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-metro-900/60 border border-metro-850 hover:border-metro-750 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded bg-metro-800 text-metro-300 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{w.ward}</h4>
                      <p className="text-[10px] text-metro-400 font-mono">
                        {w.total.toLocaleString()} cases • {w.open} open ({((w.open_rate || 0) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-rose-400">
                      {w.critical} Crit
                    </div>
                    <div className="text-[10px] font-mono text-metro-400">
                      Score: {w.hotspot_score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-metro-850 flex items-center justify-between text-xs text-metro-400 font-mono">
            <span className="text-[11px]">199 Wards Ingested</span>
            <button
              onClick={() => onNavigate("wards")}
              className="text-emerald-400 hover:underline text-[11px]"
            >
              Explore Hotspots →
            </button>
          </div>
        </div>

        {/* Top Escalated Sub-Categories */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl border border-metro-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Top Sub-Categories
                </h3>
                <p className="text-xs text-metro-400">Dominant complaint sub-categories</p>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {topSubcats.map((sc, index) => (
                <div
                  key={sc.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-metro-900/60 border border-metro-850"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs text-metro-500 font-mono">#{index + 1}</span>
                    <span className="text-xs text-metro-200 truncate font-medium">{sc.name}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold ml-2">
                    {sc.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-metro-850 flex items-center justify-between text-xs text-metro-400 font-mono">
            <span className="text-[11px]">Categorical Encoding</span>
            <button
              onClick={() => onNavigate("register")}
              className="text-emerald-400 hover:underline text-[11px]"
            >
              Filter Register →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
