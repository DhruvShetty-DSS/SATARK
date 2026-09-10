import os
import sys
import pandas as pd
from datetime import datetime, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.core.database import SessionLocal
from backend.app.models.domain import Project, RiskScore, ModelRun, AuditLog
from backend.app.ml.anomaly_engine import AnomalyRiskEngine
from backend.app.ml.duplicate_detector import DuplicateDetector

def execute_ml_pipeline():
    print("=" * 60)
    print("MPLADS AI SENTINEL - ML ANOMALY & RISK PIPELINE RUNNER")
    print("=" * 60)
    
    db = SessionLocal()
    start_time = datetime.now()

    projects = db.query(Project).all()
    print(f"Loaded {len(projects)} project records from database.")

    project_dicts = [
        {
            "id": p.id,
            "work_id": p.work_id,
            "project_name": p.project_name,
            "work_category": p.work_category,
            "state_name": p.state_name,
            "district_name": p.district_name,
            "constituency_name": p.constituency_name,
            "sanctioned_amount": p.sanctioned_amount,
            "estimated_cost": p.estimated_cost,
            "actual_expenditure": p.actual_expenditure,
            "delay_days": p.delay_days,
            "physical_progress_pct": p.physical_progress_pct,
            "financial_progress_pct": p.financial_progress_pct,
            "status": p.status,
            "implementing_agency": p.implementing_agency,
            "latitude": p.latitude,
            "longitude": p.longitude
        }
        for p in projects
    ]

    print("\n[Step 1/3] Extracting features & running Isolation Forest ML model...")
    df_projects = pd.DataFrame(project_dicts)
    engine = AnomalyRiskEngine(contamination=0.08)
    anomaly_scores = engine.fit_predict_anomaly_scores(df_projects)
    print(f"Computed anomaly scores for {len(anomaly_scores)} records.")

    print("\n[Step 2/3] Evaluating 10 Business Risk Rules & XAI Factor Attribution...")
    high_risk_count = 0
    for idx, p in enumerate(projects):
        p_dict = project_dicts[idx]
        anom_score = float(anomaly_scores[idx]) if idx < len(anomaly_scores) else 20.0
        
        overall_risk, risk_lvl, contribs, reasons, actions = engine.calculate_project_risk(
            p_dict, anom_score
        )

        p.risk_score = overall_risk
        p.risk_level = risk_lvl
        p.anomaly_score = anom_score

        if risk_lvl in ['High', 'Critical']:
            high_risk_count += 1

        # Update RiskScore table
        r_score = db.query(RiskScore).filter(RiskScore.project_id == p.id).first()
        if r_score:
            r_score.overall_score = overall_risk
            r_score.risk_level = risk_lvl
            r_score.anomaly_score = anom_score
            r_score.financial_anomaly_contrib = contribs['financial_anomaly']
            r_score.delay_contrib = contribs['delay']
            r_score.cost_variance_contrib = contribs['cost_variance']
            r_score.payment_pattern_contrib = contribs['payment_pattern']
            r_score.duplicate_contrib = contribs['duplicate_similarity']
            r_score.compliance_contrib = contribs['compliance_risk']
            r_score.explanation_text = "; ".join(reasons)
            r_score.recommended_actions_json = actions

    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n[Step 3/3] Execution completed in {elapsed:.2f} seconds.")
    print(f"Summary: {len(projects)} records processed | {high_risk_count} High/Critical Risk Projects Identified.")

    # Record ModelRun entry
    model_run = ModelRun(
        records_processed=len(projects),
        anomalies_detected=high_risk_count,
        average_risk_score=round(float(df_projects['sanctioned_amount'].mean() if not df_projects.empty else 25.0), 1),
        execution_time_sec=round(elapsed, 2),
        triggered_by="CLI run_ml_pipeline.py",
        status="Success"
    )
    db.add(model_run)

    audit = AuditLog(
        user_email="system@mplads.gov.in",
        role="CLI Automation",
        action="Run ML Pipeline",
        entity="Isolation Forest + Risk Engine",
        previous_state="Prior state",
        new_state=f"Processed {len(projects)} records in {elapsed:.2f}s."
    )
    db.add(audit)

    db.commit()
    db.close()
    print("\nML Pipeline successfully executed and DB updated!")

if __name__ == "__main__":
    execute_ml_pipeline()
