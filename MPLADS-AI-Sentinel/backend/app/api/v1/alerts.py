from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.core.database import get_db
from backend.app.models.domain import Alert, AuditLog
from backend.app.schemas.domain import AlertResponse, AlertUpdateSchema

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status and status != "All":
        query = query.filter(Alert.status == status)
    if risk_level and risk_level != "All":
        query = query.filter(Alert.risk_level == risk_level)
    if state and state != "All":
        query = query.filter(Alert.state_name == state)

    return query.order_by(Alert.risk_score.desc()).all()

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    payload: AlertUpdateSchema,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    old_status = alert.status
    alert.status = payload.status
    if payload.assigned_to:
        alert.assigned_to = payload.assigned_to
    if payload.notes:
        alert.notes = payload.notes

    # Record Audit Log
    audit = AuditLog(
        user_email="admin@mplads.gov.in",
        role="Authority",
        action="Alert Status Change",
        entity=f"Alert {alert.alert_code}",
        previous_state=f"Status: {old_status}",
        new_state=f"Status: {payload.status}, Assigned: {alert.assigned_to}"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert
