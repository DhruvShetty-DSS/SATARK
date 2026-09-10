from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.domain import Project, Alert
from backend.app.schemas.domain import AssistantQueryRequest, AssistantQueryResponse

router = APIRouter(prefix="/assistant", tags=["Intelligence Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
def handle_assistant_query(payload: AssistantQueryRequest, db: Session = Depends(get_db)):
    q = payload.query.lower().strip()
    
    # Pre-built Intent Matcher (Offline Deterministic Engine)
    if "highest risk" in q or "top risk" in q or "most risky" in q:
        projects = db.query(Project).order_by(Project.risk_score.desc()).limit(5).all()
        data = [{
            "work_id": p.work_id,
            "project_name": p.project_name,
            "state_name": p.state_name,
            "district_name": p.district_name,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level
        } for p in projects]
        
        return {
            "query": payload.query,
            "intent": "Top High Risk Projects Query",
            "answer": f"Identified {len(data)} critical projects with highest multi-factor risk scores across India. Top project is '{data[0]['project_name']}' in {data[0]['district_name']} with risk score {data[0]['risk_score']}.",
            "data": data,
            "sql_equivalent": "SELECT work_id, project_name, state_name, risk_score FROM projects ORDER BY risk_score DESC LIMIT 5;"
        }

    elif "delayed" in q or "behind schedule" in q or "delay" in q:
        query = db.query(Project).filter(Project.delay_days > 0)
        if "maharashtra" in q:
            query = query.filter(Project.state_name.ilike("%Maharashtra%"))
            state_label = "in Maharashtra"
        elif "karnataka" in q:
            query = query.filter(Project.state_name.ilike("%Karnataka%"))
            state_label = "in Karnataka"
        else:
            state_label = "nationwide"

        projects = query.order_by(Project.delay_days.desc()).limit(5).all()
        data = [{
            "work_id": p.work_id,
            "project_name": p.project_name,
            "state_name": p.state_name,
            "delay_days": p.delay_days,
            "status": p.status
        } for p in projects]

        return {
            "query": payload.query,
            "intent": "Delayed Projects Query",
            "answer": f"Found {len(projects)} major delayed projects {state_label}. Longest delay is {data[0]['delay_days']} days for '{data[0]['project_name']}'.",
            "data": data,
            "sql_equivalent": f"SELECT work_id, project_name, delay_days FROM projects WHERE delay_days > 0 AND state_name ILIKE '%{state_label}%' ORDER BY delay_days DESC LIMIT 5;"
        }

    elif "cost overrun" in q or "over cost" in q or "budget overrun" in q:
        projects = db.query(Project).filter(Project.actual_expenditure > Project.estimated_cost).order_by(Project.actual_expenditure.desc()).limit(5).all()
        data = [{
            "work_id": p.work_id,
            "project_name": p.project_name,
            "estimated_cost": p.estimated_cost,
            "actual_expenditure": p.actual_expenditure,
            "overrun_amount": round(p.actual_expenditure - p.estimated_cost, 2)
        } for p in projects]

        return {
            "query": payload.query,
            "intent": "Cost Overrun Projects Query",
            "answer": f"Found projects exceeding their initial estimated budget. Highest cost overrun observed is ₹{data[0]['overrun_amount']:,.2f} for project '{data[0]['project_name']}'.",
            "data": data,
            "sql_equivalent": "SELECT work_id, project_name, estimated_cost, actual_expenditure FROM projects WHERE actual_expenditure > estimated_cost LIMIT 5;"
        }

    elif "financial progress" in q or "progress mismatch" in q or "physical progress" in q:
        projects = db.query(Project).filter(Project.financial_progress_pct > Project.physical_progress_pct + 25).order_by(Project.risk_score.desc()).limit(5).all()
        data = [{
            "work_id": p.work_id,
            "project_name": p.project_name,
            "financial_progress_pct": p.financial_progress_pct,
            "physical_progress_pct": p.physical_progress_pct,
            "mismatch_pct": round(p.financial_progress_pct - p.physical_progress_pct, 1)
        } for p in projects]

        return {
            "query": payload.query,
            "intent": "Progress Discrepancy Query",
            "answer": f"Identified {len(data)} projects where financial disbursement is significantly ahead of physical ground progress. Top discrepancy is {data[0]['mismatch_pct']}% mismatch.",
            "data": data,
            "sql_equivalent": "SELECT work_id, project_name, financial_progress_pct, physical_progress_pct FROM projects WHERE financial_progress_pct > physical_progress_pct + 25 LIMIT 5;"
        }

    else:
        # Default Summary Intent
        total_projects = db.query(Project).count()
        high_risk_cnt = db.query(Project).filter(Project.risk_level.in_(["High", "Critical"])).count()
        return {
            "query": payload.query,
            "intent": "General System Intelligence Query",
            "answer": f"MPLADS AI Sentinel is currently monitoring {total_projects:,} active works across India. There are {high_risk_cnt} projects categorized under High or Critical risk requiring administrative verification.",
            "data": [
                {"metric": "Total Monitored Projects", "value": total_projects},
                {"metric": "High & Critical Risk Projects", "value": high_risk_cnt}
            ],
            "sql_equivalent": "SELECT COUNT(*) FROM projects WHERE risk_level IN ('High', 'Critical');"
        }
