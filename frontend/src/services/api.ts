import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mplads_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Project {
  id: number;
  work_id: string;
  project_name: string;
  work_category: string;
  house_type: string;
  state_name: string;
  district_name: string;
  constituency_name: string;
  mp_name: string;
  implementing_agency?: string;
  sanctioned_amount: number;
  estimated_cost: number;
  actual_expenditure: number;
  remaining_amount: number;
  utilization_pct: number;
  sanction_date?: string;
  start_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  physical_progress_pct: number;
  financial_progress_pct: number;
  status: string;
  delay_days: number;
  latitude?: number;
  longitude?: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  anomaly_score: number;
  is_demo_data: boolean;
  risk_details?: {
    overall_score: number;
    risk_level: string;
    anomaly_score: number;
    financial_anomaly_contrib: number;
    delay_contrib: number;
    cost_variance_contrib: number;
    payment_pattern_contrib: number;
    duplicate_contrib: number;
    compliance_contrib: number;
    explanation_text?: string;
    recommended_actions_json?: string[];
  };
}

export interface DashboardSummary {
  total_projects: number;
  total_sanctioned_amount: number;
  total_expenditure: number;
  overall_utilization_pct: number;
  completed_projects: number;
  delayed_projects: number;
  high_risk_projects: number;
  anomalies_detected: number;
  risk_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
}
