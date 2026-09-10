from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.domain import DuplicateCandidate, AuditLog
from backend.app.schemas.domain import DuplicateCandidateResponse, DuplicateReviewUpdate

router = APIRouter(prefix="/duplicates", tags=["Duplicates"])

@router.get("", response_model=List[DuplicateCandidateResponse])
def get_duplicate_candidates(
    review_status: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DuplicateCandidate)
    if review_status and review_status != "All":
        query = query.filter(DuplicateCandidate.review_status == review_status)
    if state and state != "All":
        query = query.filter(DuplicateCandidate.state_name == state)

    return query.order_by(DuplicateCandidate.overall_similarity_pct.desc()).all()

@router.put("/{candidate_id}", response_model=DuplicateCandidateResponse)
def review_duplicate_candidate(
    candidate_id: int,
    payload: DuplicateReviewUpdate,
    db: Session = Depends(get_db)
):
    cand = db.query(DuplicateCandidate).filter(DuplicateCandidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Duplicate candidate record not found")

    old_status = cand.review_status
    cand.review_status = payload.review_status
    cand.reviewed_by = "Ministry Inspector"
    cand.reviewed_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    if payload.notes:
        cand.notes = payload.notes

    audit = AuditLog(
        user_email="admin@mplads.gov.in",
        role="Ministry Admin",
        action="Duplicate Work Review",
        entity=f"Duplicate Pair #{cand.id} ({cand.project_a_name[:20]} vs {cand.project_b_name[:20]})",
        previous_state=f"Status: {old_status}",
        new_state=f"Status: {payload.review_status}"
    )
    db.add(audit)
    db.commit()
    db.refresh(cand)
    return cand
