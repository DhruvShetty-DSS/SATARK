from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'MP', 'District Authority', 'State Nodal Authority', 'Ministry Admin'
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    constituency = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(String, unique=True, index=True, nullable=False)
    project_name = Column(String, nullable=False)
    work_category = Column(String, index=True, nullable=False)
    house_type = Column(String, nullable=False) # 'Lok Sabha' or 'Rajya Sabha'
    state_name = Column(String, index=True, nullable=False)
    district_name = Column(String, index=True, nullable=False)
    constituency_name = Column(String, index=True, nullable=False)
    mp_name = Column(String, nullable=False)
    implementing_agency = Column(String, nullable=True)
    
    sanctioned_amount = Column(Float, default=0.0)
    estimated_cost = Column(Float, default=0.0)
    actual_expenditure = Column(Float, default=0.0)
    remaining_amount = Column(Float, default=0.0)
    utilization_pct = Column(Float, default=0.0)
    
    sanction_date = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    expected_completion = Column(String, nullable=True)
    actual_completion = Column(String, nullable=True)
    
    physical_progress_pct = Column(Float, default=0.0)
    financial_progress_pct = Column(Float, default=0.0)
    status = Column(String, index=True, default="Ongoing") # Completed, Ongoing, Delayed, Pending, Cancelled
    delay_days = Column(Integer, default=0)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    risk_score = Column(Float, index=True, default=0.0) # 0 to 100
    risk_level = Column(String, index=True, default="Low") # Low, Medium, High, Critical
    anomaly_score = Column(Float, default=0.0)
    
    is_demo_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    risk_details = relationship("RiskScore", back_populates="project", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan")

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    overall_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    anomaly_score = Column(Float, default=0.0)
    
    financial_anomaly_contrib = Column(Float, default=0.0)
    delay_contrib = Column(Float, default=0.0)
    cost_variance_contrib = Column(Float, default=0.0)
    payment_pattern_contrib = Column(Float, default=0.0)
    duplicate_contrib = Column(Float, default=0.0)
    compliance_contrib = Column(Float, default=0.0)
    
    explanation_text = Column(Text, nullable=True)
    recommended_actions_json = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="risk_details")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String, unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project_name = Column(String, nullable=False)
    state_name = Column(String, nullable=False)
    district_name = Column(String, nullable=False)
    alert_type = Column(String, index=True, nullable=False) # Financial Anomaly, Cost Overrun, Project Delay, Duplicate Project, Progress Mismatch, etc.
    risk_level = Column(String, index=True, nullable=False)
    risk_score = Column(Float, nullable=False)
    detected_date = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, index=True, default="New") # New, Under Review, Resolved, False Positive
    assigned_to = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="alerts")

class DuplicateCandidate(Base):
    __tablename__ = "duplicate_candidates"

    id = Column(Integer, primary_key=True, index=True)
    project_a_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project_b_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    project_a_name = Column(String, nullable=False)
    project_b_name = Column(String, nullable=False)
    state_name = Column(String, nullable=False)
    district_name = Column(String, nullable=False)
    
    text_similarity_pct = Column(Float, nullable=False)
    location_distance_km = Column(Float, nullable=True)
    amount_similarity_pct = Column(Float, nullable=False)
    overall_similarity_pct = Column(Float, nullable=False)
    
    risk_level = Column(String, default="High")
    review_status = Column(String, index=True, default="Unreviewed") # Unreviewed, Valid Separate Projects, Potential Duplicate, Confirmed Duplicate
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    previous_state = Column(Text, nullable=True)
    new_state = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DataUpload(Base):
    __tablename__ = "data_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    record_count = Column(Integer, default=0)
    valid_count = Column(Integer, default=0)
    invalid_count = Column(Integer, default=0)
    uploaded_by = Column(String, nullable=False)
    status = Column(String, default="Processed")
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    records_processed = Column(Integer, default=0)
    anomalies_detected = Column(Integer, default=0)
    average_risk_score = Column(Float, default=0.0)
    execution_time_sec = Column(Float, default=0.0)
    triggered_by = Column(String, default="System Auto")
    status = Column(String, default="Success")
