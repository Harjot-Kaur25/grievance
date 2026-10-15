import React, { useState } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Cpu,
  MapPin,
  UploadCloud,
  BookOpen,
  Activity,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import type { HealthStatus } from "../types";

export type NavPage =
  | "overview"
  | "register"
  | "assessment"
  | "wards"
  | "bulk"
  | "methodology";

interface NavbarProps {
  currentPage: NavPage;
  onPageChange: (page: NavPage) => void;
  health: HealthStatus | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onPageChange,
  health,
  healthLoading,
  onRefreshHealth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const navItems: { id: NavPage; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "register", label: "Grievance Register", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "assessment", label: "Priority Assessment", icon: <Cpu className="w-4 h-4" /> },
    { id: "wards", label: "Ward Intelligence", icon: <MapPin className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk Analysis", icon: <UploadCloud className="w-4 h-4" /> },
    { id: "methodology", label: "Model Methodology", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const isModelReady = health?.model_loaded === true;
  const isServerOk = health?.status === "ok";

  const handleNavClick = (id: NavPage) => {
    onPageChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-metro-950/95 backdrop-blur-md border-b border-metro-800/80 transition-all">
        {/* Primary Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Dedicated Spacious Brand Area */}
            <div className="flex items-center gap-3.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 flex items-center justify-center shadow-mint-glow text-metro-950 font-black tracking-tighter text-lg font-mono flex-shrink-0">
                CV
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-wider text-white font-mono">
                    CIVIC
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800/70 rounded">
                    ML PLATFORM
                  </span>
                </div>
                <p className="text-[11px] font-medium text-metro-400 tracking-wider uppercase font-sans">
                  Urban Intelligence Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Large Screens) */}
            <nav className="hidden xl:flex items-center gap-1.5 flex-1 justify-center">
              {navItems.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                      active
                        ? "bg-metro-800 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_-3px_rgba(16,185,129,0.25)] font-semibold"
                        : "text-metro-300 hover:text-white hover:bg-metro-900 border border-transparent"
                    }`}
                  >
                    <span className={active ? "text-emerald-400" : "text-metro-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Utility Area: Refined System Telemetry */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Telemetry Indicator Pill with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-metro-900/90 border border-metro-800 hover:border-metro-700 text-xs font-mono transition-all text-metro-300"
                  title="Click to view backend & ML telemetry"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isServerOk && isModelReady
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"
                        : isServerOk
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                  />
                  <span className="hidden sm:inline text-[11px] text-metro-300 font-medium">
                    {isServerOk && isModelReady ? "SYSTEM ONLINE" : isServerOk ? "MODEL INIT" : "OFFLINE"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-metro-400 opacity-70" />
                </button>

                {/* Telemetry Popover */}
                {statusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setStatusDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 p-3.5 bg-metro-900 border border-metro-750 rounded-xl shadow-2xl z-50 text-xs font-mono space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-metro-800 text-[10px] text-metro-400 uppercase tracking-wider">
                        <span>Platform Telemetry</span>
                        <button
                          onClick={() => {
                            onRefreshHealth();
                          }}
                          className="hover:text-emerald-400 flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${healthLoading ? "animate-spin text-emerald-400" : ""}`} />
                          Refresh
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-metro-400 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5" />
                          FastAPI Backend
                        </span>
                        {isServerOk ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> ONLINE (8000)
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3 h-3" /> OFFLINE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-metro-400 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          LightGBM Classifier
                        </span>
                        {isModelReady ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> LOADED
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3 h-3" /> PENDING
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-metro-800/80 text-[10px] text-metro-500 text-center">
                        SQLite Database: 126,976 Records
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile / Tablet Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg bg-metro-900 border border-metro-800 text-metro-300 hover:text-white hover:bg-metro-850 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Medium Screen Secondary Nav Strip (768px to 1279px) */}
        <div className="hidden md:flex xl:hidden border-t border-metro-850/80 bg-metro-950/70 overflow-x-auto py-1 px-4 sm:px-6">
          <div className="flex items-center gap-1 mx-auto max-w-7xl">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-metro-800 text-emerald-400 border border-emerald-500/40 font-semibold shadow-sm"
                      : "text-metro-400 hover:text-white hover:bg-metro-900 border border-transparent"
                  }`}
                >
                  <span className={active ? "text-emerald-400" : "text-metro-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-metro-950 border-l border-metro-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-metro-850">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-metro-950 font-black font-mono flex items-center justify-center text-sm">
                    CV
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-mono">CIVIC</h2>
                    <p className="text-[10px] text-metro-400 uppercase font-sans">Navigation Matrix</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-metro-400 hover:text-white hover:bg-metro-900 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="mt-6 space-y-1.5">
                {navItems.map((item) => {
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all text-left ${
                        active
                          ? "bg-metro-800 text-emerald-400 border border-emerald-500/40 font-bold"
                          : "text-metro-300 hover:text-white hover:bg-metro-900 border border-transparent"
                      }`}
                    >
                      <span className={active ? "text-emerald-400" : "text-metro-400"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Telemetry */}
            <div className="pt-4 border-t border-metro-850 space-y-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-metro-900/80 border border-metro-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-metro-400">Backend:</span>
                  <span className={isServerOk ? "text-emerald-400 font-bold" : "text-rose-400"}>
                    {isServerOk ? "ONLINE (8000)" : "OFFLINE"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metro-400">LightGBM:</span>
                  <span className={isModelReady ? "text-emerald-400 font-bold" : "text-amber-400"}>
                    {isModelReady ? "LOADED" : "PENDING"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onRefreshHealth();
                }}
                className="w-full py-2 bg-metro-900 hover:bg-metro-850 border border-metro-800 text-metro-300 rounded-lg flex items-center justify-center gap-2 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin text-emerald-400" : ""}`} />
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
