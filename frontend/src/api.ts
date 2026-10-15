import type {
  HealthStatus,
  SystemOptions,
  ComplaintInput,
  PredictionResult,
  BatchPredictionResponse,
  PlatformStats,
  WardHotspot,
  ComplaintRecord,
  ComplaintFilterParams,
  ComplaintsResponse,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "Network request failed";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") {
        errorDetail = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorDetail = data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
      } else if (data.message) {
        errorDetail = data.message;
      }
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthStatus>(res);
  },

  async getOptions(): Promise<SystemOptions> {
    const res = await fetch(`${API_BASE}/options`);
    return handleResponse<SystemOptions>(res);
  },

  async getStats(): Promise<PlatformStats> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse<PlatformStats>(res);
  },

  async getHotspots(limit = 20, minComplaints = 1): Promise<WardHotspot[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      min_complaints: minComplaints.toString(),
    });
    const res = await fetch(`${API_BASE}/hotspots?${params.toString()}`);
    return handleResponse<WardHotspot[]>(res);
  },

  async getComplaints(filterParams: ComplaintFilterParams = {}): Promise<ComplaintsResponse> {
    const params = new URLSearchParams();
    if (filterParams.limit !== undefined) params.append("limit", filterParams.limit.toString());
    if (filterParams.offset !== undefined) params.append("offset", filterParams.offset.toString());
    if (filterParams.priority) params.append("priority", filterParams.priority);
    if (filterParams.ward) params.append("ward", filterParams.ward);
    if (filterParams.status) params.append("status", filterParams.status);
    if (filterParams.search) params.append("search", filterParams.search);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/complaints${queryStr}`);
    const records = await handleResponse<ComplaintRecord[]>(res);
    const countHdr = res.headers.get("X-Total-Count");
    const totalCount = countHdr ? parseInt(countHdr, 10) : records.length;
    return { records, totalCount };
  },

  async predict(complaint: ComplaintInput): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(complaint),
    });
    return handleResponse<PredictionResult>(res);
  },

  async predictBatch(
    file: File,
    explain = true,
    save = false
  ): Promise<BatchPredictionResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams({
      explain: explain.toString(),
      save: save.toString(),
    });

    const res = await fetch(`${API_BASE}/predict/batch?${params.toString()}`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<BatchPredictionResponse>(res);
  },
};
