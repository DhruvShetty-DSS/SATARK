from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    is_active: bool

# Project Schemas
class RiskDetailsSchema(BaseModel):
    overall_score: float
    risk_level: str
    anomaly_score: float
    financial_anomaly_contrib: float
    delay_contrib: float
    cost_variance_contrib: float
    payment_pattern_contrib: float
    duplicate_contrib: float
    compliance_contrib: float
    explanation_text: Optional[str] = None
    recommended_actions_json: Optional[List[str]] = None

class ProjectResponse(BaseModel):
    id: int
    work_id: str
    project_name: str
    work_category: str
    house_type: str
    state_name: str
    district_name: str
    constituency_name: str
    mp_name: str
    implementing_agency: Optional[str] = None
    sanctioned_amount: float
    estimated_cost: float
    actual_expenditure: float
    remaining_amount: float
    utilization_pct: float
    sanction_date: Optional[str] = None
    start_date: Optional[str] = None
    expected_completion: Optional[str] = None
    actual_completion: Optional[str] = None
    physical_progress_pct: float
    financial_progress_pct: float
    status: str
    delay_days: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_score: float
    risk_level: str
    anomaly_score: float
    is_demo_data: bool
    risk_details: Optional[RiskDetailsSchema] = None

    class Config:
        from_attributes = True

class ProjectPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    projects: List[ProjectResponse]

# Dashboard Summary Schema
class DashboardSummaryResponse(BaseModel):
    total_projects: int
    total_sanctioned_amount: float
    total_expenditure: float
    overall_utilization_pct: float
    completed_projects: int
    delayed_projects: int
    high_risk_projects: int
    anomalies_detected: int
    risk_distribution: Dict[str, int]
    status_distribution: Dict[str, int]

# Alert Schemas
class AlertUpdateSchema(BaseModel):
    status: str # New, Under Review, Resolved, False Positive
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    alert_code: str
    project_id: int
    project_name: str
    state_name: str
    district_name: str
    alert_type: str
    risk_level: str
    risk_score: float
    detected_date: str
    reason: str
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Duplicate Schemas
class DuplicateReviewUpdate(BaseModel):
    review_status: str # Valid Separate Projects, Potential Duplicate, Confirmed Duplicate
    notes: Optional[str] = None

class DuplicateCandidateResponse(BaseModel):
    id: int
    project_a_id: int
    project_b_id: int
    project_a_name: str
    project_b_name: str
    state_name: str
    district_name: str
    text_similarity_pct: float
    location_distance_km: Optional[float]
    amount_similarity_pct: float
    overall_similarity_pct: float
    risk_level: str
    review_status: str
    reviewed_by: Optional[str]
    reviewed_at: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True

# Assistant Query Schema
class AssistantQueryRequest(BaseModel):
    query: str

class AssistantQueryResponse(BaseModel):
    query: str
    intent: str
    answer: str
    data: Optional[List[Dict[str, Any]]] = None
    sql_equivalent: Optional[str] = None

# Audit Log Response
class AuditLogResponse(BaseModel):
    id: int
    user_email: str
    role: str
    action: str
    entity: str
    previous_state: Optional[str]
    new_state: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
