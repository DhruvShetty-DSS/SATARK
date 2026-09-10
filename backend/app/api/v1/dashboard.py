from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from backend.app.core.database import get_db
from backend.app.models.domain import Project, Alert, DuplicateCandidate
from backend.app.schemas.domain import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if state and state != "All":
        query = query.filter(Project.state_name == state)
    if district and district != "All":
        query = query.filter(Project.district_name == district)
    if constituency and constituency != "All":
        query = query.filter(Project.constituency_name == constituency)

    projects = query.all()
    total_projects = len(projects)
    
    total_sanctioned = sum(p.sanctioned_amount for p in projects)
    total_expenditure = sum(p.actual_expenditure for p in projects)
    utilization_pct = round((total_expenditure / max(1.0, total_sanctioned)) * 100.0, 1)

    completed = sum(1 for p in projects if p.status == "Completed")
    delayed = sum(1 for p in projects if p.status == "Delayed" or p.delay_days > 0)
    high_risk = sum(1 for p in projects if p.risk_level in ["High", "Critical"])
    anomalies = sum(1 for p in projects if p.anomaly_score >= 60.0)

    risk_dist = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    status_dist = {"Completed": 0, "Ongoing": 0, "Delayed": 0, "Pending": 0}

    for p in projects:
        risk_dist[p.risk_level] = risk_dist.get(p.risk_level, 0) + 1
        status_dist[p.status] = status_dist.get(p.status, 0) + 1

    return {
        "total_projects": total_projects,
        "total_sanctioned_amount": round(total_sanctioned, 2),
        "total_expenditure": round(total_expenditure, 2),
        "overall_utilization_pct": utilization_pct,
        "completed_projects": completed,
        "delayed_projects": delayed,
        "high_risk_projects": high_risk,
        "anomalies_detected": anomalies,
        "risk_distribution": risk_dist,
        "status_distribution": status_dist
    }

@router.get("/attention")
def get_attention_required_projects(limit: int = 5, db: Session = Depends(get_db)):
    """Fetch top priority high-risk projects requiring human review today."""
    projects = (
        db.query(Project)
        .order_by(Project.risk_score.desc())
        .limit(limit)
        .all()
    )
    results = []
    for p in projects:
        reasons = []
        if p.delay_days > 0:
            reasons.append(f"{p.delay_days} days delay")
        if p.actual_expenditure > p.estimated_cost and p.estimated_cost > 0:
            reasons.append(f"₹{p.actual_expenditure - p.estimated_cost:,.0f} cost overrun")
        if p.financial_progress_pct > p.physical_progress_pct + 25:
            reasons.append(f"Progress mismatch ({p.financial_progress_pct:.0f}% fin vs {p.physical_progress_pct:.0f}% phys)")
        if not reasons:
            reasons.append("Structural anomaly flagged by ML Isolation Forest")

        results.append({
            "id": p.id,
            "work_id": p.work_id,
            "project_name": p.project_name,
            "state_name": p.state_name,
            "district_name": p.district_name,
            "sanctioned_amount": p.sanctioned_amount,
            "actual_expenditure": p.actual_expenditure,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "primary_reason": reasons[0]
        })
    return results

@router.get("/trends")
def get_expenditure_trends(db: Session = Depends(get_db)):
    """Mock monthly fund utilization trend line data for UI visualization."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    sanctioned_series = [120, 145, 190, 210, 250, 310, 380, 420, 490, 530, 590, 650]
    expenditure_series = [45, 62, 88, 105, 140, 185, 230, 275, 330, 385, 440, 510]
    
    return [
        {"month": m, "sanctioned": s, "expenditure": e}
        for m, s, e in zip(months, sanctioned_series, expenditure_series)
    ]
