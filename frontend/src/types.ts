export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
}

export interface SystemOptions {
  sub_categories: string[];
  wards: string[];
  statuses: string[];
  staff_remarks: string[];
  designations: string[];
}

export interface ComplaintInput {
  sub_category: string;
  ward: string;
  status: string;
  staff_remarks?: string | null;
  staff_name?: string | null;
  designation?: string | null;
  age_hours?: number | null;
  save?: boolean;
}

export interface Factor {
  feature: string;
  impact: number;
}

export interface PredictionResult {
  id?: number | null;
  priority: PriorityLevel;
  confidence: number;
  probabilities: Record<string, number>;
  reason?: string | null;
  factors: Factor[];
}

export interface BatchResultItem {
  id?: number | null;
  complaint_id?: number | null;
  category?: string | null;
  sub_category?: string;
  ward?: string;
  status?: string;
  staff_remarks?: string | null;
  designation?: string | null;
  age_hours?: number | null;
  priority: PriorityLevel;
  confidence: number;
  reason?: string | null;
  [key: string]: any;
}

export interface BatchPredictionResponse {
  count: number;
  summary: Record<string, number>;
  results: BatchResultItem[];
}

export interface PlatformStats {
  total: number;
  open: number;
  open_rate: number;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
  by_category?: Record<string, number>;
  top_sub_categories: Record<string, number>;
  top_wards: Record<string, number>;
  top_designations: Record<string, number>;
  avg_age_hours_by_category?: Record<string, number>;
  priority_by_category?: Record<string, Record<string, number>>;
}

export interface WardHotspot {
  ward: string;
  total: number;
  open: number;
  critical: number;
  high: number;
  avg_age_hours: number | null;
  open_rate: number;
  hotspot_score: number;
}

export interface ComplaintRecord {
  id: number;
  complaint_id?: number | null;
  source: string;
  category?: string | null;
  sub_category: string;
  ward: string;
  status: string;
  staff_remarks?: string | null;
  designation?: string | null;
  age_hours?: number | null;
  priority?: PriorityLevel | string | null;
  confidence?: number | null;
  reason?: string | null;
  created_at?: string;
}

export interface ComplaintFilterParams {
  limit?: number;
  offset?: number;
  priority?: string;
  ward?: string;
  status?: string;
  search?: string;
}

export interface ComplaintsResponse {
  records: ComplaintRecord[];
  totalCount: number;
}

