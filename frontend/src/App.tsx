import { useState, useEffect } from "react";
import { Navbar, type NavPage } from "./components/Navbar";
import { OverviewPage } from "./pages/OverviewPage";
import { GrievanceRegisterPage } from "./pages/GrievanceRegisterPage";
import { PriorityAssessmentPage } from "./pages/PriorityAssessmentPage";
import { WardIntelligencePage } from "./pages/WardIntelligencePage";
import { BulkAnalysisPage } from "./pages/BulkAnalysisPage";
import { ModelMethodologyPage } from "./pages/ModelMethodologyPage";
import { api } from "./api";
import type { HealthStatus, SystemOptions, ComplaintRecord, ComplaintInput } from "./types";
import { AlertCircle } from "lucide-react";

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>("overview");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<SystemOptions | null>(null);

  // Cross-page state transfers
  const [assessmentPreset, setAssessmentPreset] = useState<Partial<ComplaintInput> | null>(null);
  const [registerWardFilter, setRegisterWardFilter] = useState<string>("");

  const fetchHealthStatus = async () => {
    try {
      setHealthLoading(true);
      const res = await api.getHealth();
      setHealth(res);
    } catch {
      setHealth({ status: "error", model_loaded: false });
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchSystemOptions = async () => {
    try {
      const res = await api.getOptions();
      setOptions(res);
    } catch (e) {
      console.error("Failed to load options from backend:", e);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    fetchSystemOptions();

    // Check health every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInspectWard = (wardName: string) => {
    setRegisterWardFilter(wardName);
    setCurrentPage("register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssessSimilar = (complaint: Partial<ComplaintRecord>) => {
    setAssessmentPreset({
      sub_category: complaint.sub_category,
      ward: complaint.ward,
      status: complaint.status || "Registered",
      staff_remarks: complaint.staff_remarks,
      designation: complaint.designation,
      age_hours: complaint.age_hours,
    });
    setCurrentPage("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-metro-950 text-metro-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onPageChange={handleNavigate}
        health={health}
        healthLoading={healthLoading}
        onRefreshHealth={fetchHealthStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {health && !health.model_loaded && health.status === "ok" && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-center justify-between text-xs text-amber-300 font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>
                LightGBM model not loaded in backend. Inferences may fall back or fail until priority_model.joblib is loaded.
              </span>
            </div>
            <button
              onClick={fetchHealthStatus}
              className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 border border-amber-700 rounded text-white"
            >
              Re-check Status
            </button>
          </div>
        )}

        {currentPage === "overview" && <OverviewPage onNavigate={handleNavigate} />}

        {currentPage === "register" && (
          <GrievanceRegisterPage
            options={options}
            initialWard={registerWardFilter}
            onClearInitialWard={() => setRegisterWardFilter("")}
            onAssessSimilar={handleAssessSimilar}
          />
        )}

        {currentPage === "assessment" && (
          <PriorityAssessmentPage
            options={options}
            initialValues={assessmentPreset}
            onClearInitialValues={() => setAssessmentPreset(null)}
          />
        )}

        {currentPage === "wards" && (
          <WardIntelligencePage onInspectWard={handleInspectWard} />
        )}

        {currentPage === "bulk" && <BulkAnalysisPage />}

        {currentPage === "methodology" && <ModelMethodologyPage />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-metro-850 bg-metro-950/80 py-6 text-xs text-metro-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-metro-200">CIVIC</span>
            <span>— Urban Intelligence Platform</span>
            <span className="text-metro-500">• Powered by LightGBM + SHAP TreeExplainer</span>
          </div>

          <div className="flex items-center gap-4 text-metro-500">
            <span>FastAPI Backend: http://127.0.0.1:8000</span>
            <span>•</span>
            <span>Vite Frontend: http://localhost:5173</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
