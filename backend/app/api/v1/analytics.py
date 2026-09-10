from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.domain import Project

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/states")
def get_state_analytics(db: Session = Depends(get_db)):
    results = (
        db.query(
            Project.state_name,
            func.count(Project.id).label("total_projects"),
            func.sum(Project.sanctioned_amount).label("sanctioned_sum"),
            func.sum(Project.actual_expenditure).label("expenditure_sum"),
            func.avg(Project.risk_score).label("avg_risk_score")
        )
        .group_by(Project.state_name)
        .order_by(func.avg(Project.risk_score).desc())
        .all()
    )

    states_list = []
    for r in results:
        sanct = float(r.sanctioned_sum or 0.0)
        exp = float(r.expenditure_sum or 0.0)
        high_risk_cnt = db.query(Project).filter(
            Project.state_name == r.state_name,
            Project.risk_level.in_(["High", "Critical"])
        ).count()

        states_list.append({
            "state_name": r.state_name,
            "total_projects": r.total_projects,
            "total_sanctioned": round(sanct, 2),
            "total_expenditure": round(exp, 2),
            "utilization_pct": round((exp / max(1.0, sanct)) * 100.0, 1),
            "avg_risk_score": round(float(r.avg_risk_score or 0.0), 1),
            "high_risk_projects": high_risk_cnt
        })

    return states_list

@router.get("/districts")
def get_district_analytics(state: str = None, db: Session = Depends(get_db)):
    query = db.query(
        Project.district_name,
        Project.state_name,
        func.count(Project.id).label("total_projects"),
        func.sum(Project.sanctioned_amount).label("sanctioned_sum"),
        func.sum(Project.actual_expenditure).label("expenditure_sum"),
        func.avg(Project.risk_score).label("avg_risk_score")
    )
    if state and state != "All":
        query = query.filter(Project.state_name == state)

    results = query.group_by(Project.district_name, Project.state_name).order_by(func.avg(Project.risk_score).desc()).limit(20).all()

    districts_list = []
    for r in results:
        sanct = float(r.sanctioned_sum or 0.0)
        exp = float(r.expenditure_sum or 0.0)
        districts_list.append({
            "district_name": r.district_name,
            "state_name": r.state_name,
            "total_projects": r.total_projects,
            "total_sanctioned": round(sanct, 2),
            "total_expenditure": round(exp, 2),
            "utilization_pct": round((exp / max(1.0, sanct)) * 100.0, 1),
            "avg_risk_score": round(float(r.avg_risk_score or 0.0), 1)
        })

    return districts_list

@router.get("/categories")
def get_category_analytics(db: Session = Depends(get_db)):
    results = (
        db.query(
            Project.work_category,
            func.count(Project.id).label("project_count"),
            func.sum(Project.sanctioned_amount).label("sanctioned_sum"),
            func.sum(Project.actual_expenditure).label("expenditure_sum"),
            func.avg(Project.risk_score).label("avg_risk")
        )
        .group_by(Project.work_category)
        .all()
    )

    categories = []
    for r in results:
        sanct = float(r.sanctioned_sum or 0.0)
        exp = float(r.expenditure_sum or 0.0)
        categories.append({
            "category": r.work_category,
            "project_count": r.project_count,
            "sanctioned_amount": round(sanct, 2),
            "actual_expenditure": round(exp, 2),
            "avg_risk_score": round(float(r.avg_risk or 0.0), 1)
        })

    return categories
