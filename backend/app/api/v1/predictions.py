from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.domain import Project
from backend.app.ml.predictive_engine import PredictiveEngine

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("")
def get_predictive_overview(limit: int = 15, db: Session = Depends(get_db)):
    """Fetch predictive completion delay and cost overrun forecasts for active projects."""
    projects = (
        db.query(Project)
        .filter(Project.status != "Completed")
        .order_by(Project.risk_score.desc())
        .limit(limit)
        .all()
    )

    predictions = []
    for p in projects:
        p_dict = {
            "id": p.id,
            "work_id": p.work_id,
            "project_name": p.project_name,
            "sanctioned_amount": p.sanctioned_amount,
            "estimated_cost": p.estimated_cost,
            "actual_expenditure": p.actual_expenditure,
            "physical_progress_pct": p.physical_progress_pct,
            "financial_progress_pct": p.financial_progress_pct,
            "delay_days": p.delay_days,
            "expected_completion": p.expected_completion,
            "status": p.status
        }
        res = PredictiveEngine.predict_project_outcomes(p_dict)
        res["project_name"] = p.project_name
        res["state_name"] = p.state_name
        res["district_name"] = p.district_name
        predictions.append(res)

    return predictions

@router.get("/{project_id}")
def get_project_prediction(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    p_dict = {
        "id": p.id,
        "work_id": p.work_id,
        "project_name": p.project_name,
        "sanctioned_amount": p.sanctioned_amount,
        "estimated_cost": p.estimated_cost,
        "actual_expenditure": p.actual_expenditure,
        "physical_progress_pct": p.physical_progress_pct,
        "financial_progress_pct": p.financial_progress_pct,
        "delay_days": p.delay_days,
        "expected_completion": p.expected_completion,
        "status": p.status
    }
    return PredictiveEngine.predict_project_outcomes(p_dict)
