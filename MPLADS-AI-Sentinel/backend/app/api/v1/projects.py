import io
import csv
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
from backend.app.core.database import get_db
from backend.app.models.domain import Project, RiskScore
from backend.app.schemas.domain import ProjectPaginatedResponse, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=ProjectPaginatedResponse)
def get_projects(
    search: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    sort_by: str = "risk_score",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Project)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Project.project_name.ilike(search_pattern),
                Project.work_id.ilike(search_pattern),
                Project.mp_name.ilike(search_pattern),
                Project.district_name.ilike(search_pattern),
                Project.state_name.ilike(search_pattern)
            )
        )

    if state and state != "All":
        query = query.filter(Project.state_name == state)
    if district and district != "All":
        query = query.filter(Project.district_name == district)
    if constituency and constituency != "All":
        query = query.filter(Project.constituency_name == constituency)
    if category and category != "All":
        query = query.filter(Project.work_category == category)
    if status and status != "All":
        query = query.filter(Project.status == status)
    if risk_level and risk_level != "All":
        query = query.filter(Project.risk_level == risk_level)

    # Sorting
    sort_attr = getattr(Project, sort_by, Project.risk_score)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_attr))
    else:
        query = query.order_by(asc(sort_attr))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    projects = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "projects": projects
    }

@router.get("/export/csv")
def export_projects_csv(
    state: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if state and state != "All":
        query = query.filter(Project.state_name == state)
    if risk_level and risk_level != "All":
        query = query.filter(Project.risk_level == risk_level)

    projects = query.limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Project ID", "State", "District", "Constituency", "Project Name", "Category",
        "Sanctioned Amount", "Actual Expenditure", "Utilization %", "Status",
        "Delay Days", "Risk Score", "Risk Level"
    ])

    for p in projects:
        writer.writerow([
            p.work_id, p.state_name, p.district_name, p.constituency_name,
            p.project_name, p.work_category, p.sanctioned_amount, p.actual_expenditure,
            p.utilization_pct, p.status, p.delay_days, p.risk_score, p.risk_level
        ])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mplads_projects_export.csv"}
    )

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_by_id(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
