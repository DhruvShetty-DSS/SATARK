import os
import sys
import glob
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone

# Add parent directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.core.database import engine, Base, SessionLocal
from backend.app.models.domain import (
    User, Project, RiskScore, Alert, DuplicateCandidate, AuditLog, ModelRun, DataUpload
)
from backend.app.core.security import get_password_hash
from backend.app.ml.anomaly_engine import AnomalyRiskEngine
from backend.app.ml.duplicate_detector import DuplicateDetector

INDIAN_STATES_COORDS = {
    "Maharashtra": (19.7515, 75.7139),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Karnataka": (15.3173, 75.7139),
    "Kerala": (10.8505, 76.2711),
    "Bihar": (25.0961, 85.3131),
    "West Bengal": (22.9868, 87.8550),
    "Gujarat": (22.2587, 71.1924),
    "Tamil Nadu": (11.1271, 78.6569),
    "Rajasthan": (27.0238, 74.2179),
    "Madhya Pradesh": (22.9734, 78.6569),
    "Odisha": (20.9517, 85.0985),
    "Punjab": (31.1471, 75.3412),
    "Assam": (26.2006, 92.9376),
    "Telangana": (18.1124, 79.0193),
    "Andhra Pradesh": (15.9129, 79.7400),
    "Haryana": (29.0588, 76.0856),
    "Delhi": (28.7041, 77.1025)
}

def clean_amount(val):
    if pd.isna(val) or val is None:
        return 0.0
    val_str = str(val).replace(',', '').replace('₹', '').replace(' ', '').strip()
    try:
        return float(val_str)
    except Exception:
        return 0.0

def parse_date(val_str):
    if pd.isna(val_str) or not val_str:
        return None
    val_str = str(val_str).strip()
    formats = ["%d-%b-%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(val_str, fmt).strftime("%Y-%m-%d")
        except Exception:
            pass
    return None

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Creating Demo Users for all 4 Application Roles...")
    demo_users = [
        User(
            email="admin@mplads.gov.in",
            hashed_password=get_password_hash("admin123"),
            full_name="Rajesh Kumar (Ministry Admin)",
            role="Ministry Admin",
            state="All",
            district="All",
            constituency="All"
        ),
        User(
            email="state@mplads.gov.in",
            hashed_password=get_password_hash("state123"),
            full_name="Priya Sharma (State Nodal Officer)",
            role="State Nodal Authority",
            state="Maharashtra",
            district="All",
            constituency="All"
        ),
        User(
            email="district@mplads.gov.in",
            hashed_password=get_password_hash("district123"),
            full_name="Sanjay Patil (District Collector)",
            role="District Authority",
            state="Maharashtra",
            district="Pune",
            constituency="Pune"
        ),
        User(
            email="mp@mplads.gov.in",
            hashed_password=get_password_hash("mp123"),
            full_name="Pralhad Venkatesh Joshi (Hon'ble MP)",
            role="MP",
            state="Karnataka",
            district="DHARWAD",
            constituency="DHARWAD"
        )
    ]
    for u in demo_users:
        db.add(u)
    db.commit()

    print("Ingesting official CSV datasets from /Data...")
    raw_projects = []
    
    # Load Lok Sabha & Rajya Sabha CSVs
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Data'))
    ls_sanctioned = os.path.join(data_dir, 'lok_sabha', 'Works Sanctioned.csv')
    rs_sanctioned = os.path.join(data_dir, 'rajya_sabha', 'Works Sanctioned.csv')
    
    csv_files = []
    if os.path.exists(ls_sanctioned):
        csv_files.append((ls_sanctioned, 'Lok Sabha'))
    if os.path.exists(rs_sanctioned):
        csv_files.append((rs_sanctioned, 'Rajya Sabha'))

    parsed_count = 0
    for csv_path, house in csv_files:
        try:
            df = pd.read_csv(csv_path)
            print(f"Loaded {len(df)} rows from {os.path.basename(csv_path)} ({house})")
            for _, row in df.iterrows():
                work_text = str(row.get('Work description') or row.get('Work') or 'MPLADS Community Asset Work').strip()
                state = str(row.get('State') or 'Maharashtra').strip()
                mp = str(row.get("Hon'ble Members of Parliament") or 'Member of Parliament').strip()
                constituency = str(row.get('Constituency') or 'Central').strip()
                category = str(row.get('Work category') or 'Normal/Others').strip()
                sanctioned_amt = clean_amount(row.get('Sanction Amount ( ₹ )'))
                
                # Extract district from IDA string if available e.g. "DHARWAD(DEPUTY COMMISSIONER DHARWAR_IDA)"
                ida_str = str(row.get('IDA') or '')
                district = ida_str.split('(')[0].strip() if '(' in ida_str else (constituency or 'District Central')
                if not district or district.isdigit():
                    district = constituency or 'District HQ'

                work_id = f"WS/{house[:2].upper()}/{parsed_count+1001:05d}"
                s_date = parse_date(row.get('Sanction Date')) or '2024-05-15'
                
                raw_projects.append({
                    "work_id": work_id,
                    "project_name": work_text,
                    "work_category": category,
                    "house_type": house,
                    "state_name": state,
                    "district_name": district,
                    "constituency_name": constituency,
                    "mp_name": mp,
                    "implementing_agency": f"{district} Public Works Dept / Zilla Parishad",
                    "sanctioned_amount": sanctioned_amt if sanctioned_amt > 0 else float(random.randint(15, 85) * 10000),
                    "sanction_date": s_date
                })
                parsed_count += 1
        except Exception as e:
            print(f"Error reading {csv_path}: {e}")

    print(f"Parsed {len(raw_projects)} base records from official CSVs.")

    # Target 5,000 total records by synthesizing realistic variations if base CSVs are smaller
    total_target = max(5000, len(raw_projects))
    print(f"Generating realistic synthetic MPLADS records to reach total demo dataset size of {total_target}...")

    categories = [
        "Construction of roads, link roads, pathways",
        "Construction of buildings for community cultural activities",
        "Construction of rooms and halls in school and colleges",
        "Drinking water facilities & Hand pumps",
        "Public health infrastructure & clinics",
        "Irrigation canals and check dams",
        "Street lighting and solar lights installation",
        "Sanitation facilities and public toilets"
    ]

    states = list(INDIAN_STATES_COORDS.keys())

    random.seed(42)
    np.random.seed(42)

    all_project_objs = []
    
    # Track controlled anomaly indices for synthetic insertion
    cost_overrun_indices = set(random.sample(range(total_target), int(total_target * 0.04)))
    delay_indices = set(random.sample(range(total_target), int(total_target * 0.07)))
    mismatch_indices = set(random.sample(range(total_target), int(total_target * 0.05)))
    duplicate_pair_indices = set(random.sample(range(total_target - 1), 15)) # 15 explicit duplicate pairs

    for idx in range(total_target):
        if idx < len(raw_projects):
            base = raw_projects[idx]
            proj_name = base['project_name']
            cat = base['work_category']
            house = base['house_type']
            state = base['state_name']
            dist = base['district_name']
            const = base['constituency_name']
            mp = base['mp_name']
            sanc_amt = base['sanctioned_amount']
            agency = base['implementing_agency']
            is_demo = False
        else:
            state = random.choice(states)
            dist = f"{state} District {random.randint(1, 10)}"
            const = f"{state} Constituency {random.randint(1, 5)}"
            mp = f"Hon'ble MP {random.randint(101, 350)}"
            cat = random.choice(categories)
            house = random.choice(['Lok Sabha', 'Rajya Sabha'])
            agency = f"{dist} Rural Development Agency"
            sanc_amt = float(random.choice([200000, 350000, 500000, 750000, 1000000, 1500000, 2500000]))
            proj_name = f"{cat} at {dist} Village Sector {random.randint(1, 99)}"
            is_demo = True

        est_cost = sanc_amt
        actual_exp = sanc_amt * random.uniform(0.3, 0.95)
        phys_pct = random.uniform(20.0, 95.0)
        fin_pct = min(100.0, (actual_exp / max(1.0, sanc_amt)) * 100.0)
        status = "Ongoing"
        delay_days = 0

        # Inject Controlled Anomaly Behaviors for Demo Verification
        if idx in cost_overrun_indices:
            actual_exp = est_cost * random.uniform(1.22, 1.65)
            fin_pct = 100.0
            phys_pct = random.uniform(60.0, 85.0)
            status = "Ongoing"
            is_demo = True

        if idx in delay_indices:
            delay_days = random.randint(75, 290)
            status = "Delayed"
            phys_pct = random.uniform(30.0, 65.0)
            is_demo = True

        if idx in mismatch_indices:
            actual_exp = est_cost * 0.90
            fin_pct = 90.0
            phys_pct = random.uniform(15.0, 35.0) # High financial, low physical
            status = "Ongoing"
            is_demo = True

        if random.random() < 0.25 and idx not in delay_indices and idx not in cost_overrun_indices:
            status = "Completed"
            phys_pct = 100.0
            fin_pct = 100.0
            actual_exp = est_cost

        # Coordinates with slight random jitter based on state center
        state_lat, state_lon = INDIAN_STATES_COORDS.get(state, (20.5937, 78.9629))
        lat = round(state_lat + random.uniform(-0.8, 0.8), 4)
        lon = round(state_lon + random.uniform(-0.8, 0.8), 4)

        s_date = "2024-03-10"
        exp_comp = "2025-06-30"

        proj_obj = Project(
            work_id=f"WS/MP{idx+10000}/2025-2026/{idx+120000}",
            project_name=proj_name,
            work_category=cat,
            house_type=house,
            state_name=state,
            district_name=dist,
            constituency_name=const,
            mp_name=mp,
            implementing_agency=agency,
            sanctioned_amount=round(sanc_amt, 2),
            estimated_cost=round(est_cost, 2),
            actual_expenditure=round(actual_exp, 2),
            remaining_amount=round(max(0.0, sanc_amt - actual_exp), 2),
            utilization_pct=round(min(100.0, (actual_exp / max(1.0, sanc_amt)) * 100.0), 1),
            sanction_date=s_date,
            start_date="2024-04-01",
            expected_completion=exp_comp,
            actual_completion=exp_comp if status == "Completed" else None,
            physical_progress_pct=round(phys_pct, 1),
            financial_progress_pct=round(fin_pct, 1),
            status=status,
            delay_days=delay_days,
            latitude=lat,
            longitude=lon,
            is_demo_data=is_demo
        )
        all_project_objs.append(proj_obj)

    # Insert explicit Duplicate Pairs for Duplicate Detection Demo
    for d_idx in duplicate_pair_indices:
        orig = all_project_objs[d_idx]
        dup = Project(
            work_id=f"WS/MP{d_idx+90000}/2025-2026/{d_idx+820000}",
            project_name=f"{orig.project_name} - Phase 2 Community Renovation",
            work_category=orig.work_category,
            house_type=orig.house_type,
            state_name=orig.state_name,
            district_name=orig.district_name,
            constituency_name=orig.constituency_name,
            mp_name=orig.mp_name,
            implementing_agency=orig.implementing_agency,
            sanctioned_amount=orig.sanctioned_amount,
            estimated_cost=orig.estimated_cost,
            actual_expenditure=orig.actual_expenditure * 0.8,
            remaining_amount=orig.remaining_amount,
            utilization_pct=orig.utilization_pct,
            sanction_date=orig.sanction_date,
            start_date=orig.start_date,
            expected_completion=orig.expected_completion,
            physical_progress_pct=orig.physical_progress_pct,
            financial_progress_pct=orig.financial_progress_pct,
            status=orig.status,
            delay_days=orig.delay_days,
            latitude=round(orig.latitude + 0.005, 4),
            longitude=round(orig.longitude + 0.005, 4),
            is_demo_data=True
        )
        all_project_objs.append(dup)

    db.add_all(all_project_objs)
    db.commit()

    print(f"Persisted {len(all_project_objs)} project records to database.")

    # Fetch all project records as dicts to pass through ML pipeline
    db_projects = db.query(Project).all()
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
            "longitude": p.longitude,
            "has_duplicate_flag": False
        }
        for p in db_projects
    ]

    print("Running NLP Duplicate Work Detection Engine...")
    dup_detector = DuplicateDetector()
    duplicate_candidates = dup_detector.find_duplicate_candidates(project_dicts[:800]) # Sample for fast demo seed
    
    dup_proj_ids = set()
    for cand in duplicate_candidates:
        dup_proj_ids.add(cand['project_a_id'])
        dup_proj_ids.add(cand['project_b_id'])
        cand_obj = DuplicateCandidate(
            project_a_id=cand['project_a_id'],
            project_b_id=cand['project_b_id'],
            project_a_name=cand['project_a_name'],
            project_b_name=cand['project_b_name'],
            state_name=cand['state_name'],
            district_name=cand['district_name'],
            text_similarity_pct=cand['text_similarity_pct'],
            location_distance_km=cand['location_distance_km'],
            amount_similarity_pct=cand['amount_similarity_pct'],
            overall_similarity_pct=cand['overall_similarity_pct'],
            risk_level=cand['risk_level'],
            review_status="Unreviewed"
        )
        db.add(cand_obj)

    db.commit()
    print(f"Generated {len(duplicate_candidates)} duplicate work candidate pairs.")

    print("Running Isolation Forest ML Anomaly & Risk Engine...")
    df_projects = pd.DataFrame(project_dicts)
    anomaly_engine = AnomalyRiskEngine(contamination=0.08)
    anomaly_scores = anomaly_engine.fit_predict_anomaly_scores(df_projects)

    high_risk_alerts = []
    alert_counter = 101

    for idx, p_obj in enumerate(db_projects):
        p_dict = project_dicts[idx]
        p_dict['has_duplicate_flag'] = (p_obj.id in dup_proj_ids)
        anom_score = float(anomaly_scores[idx]) if idx < len(anomaly_scores) else 20.0
        
        overall_risk, risk_lvl, contribs, reasons, actions = anomaly_engine.calculate_project_risk(
            p_dict, anom_score
        )

        p_obj.risk_score = overall_risk
        p_obj.risk_level = risk_lvl
        p_obj.anomaly_score = anom_score

        # Save RiskScore detail record
        risk_detail = RiskScore(
            project_id=p_obj.id,
            overall_score=overall_risk,
            risk_level=risk_lvl,
            anomaly_score=anom_score,
            financial_anomaly_contrib=contribs['financial_anomaly'],
            delay_contrib=contribs['delay'],
            cost_variance_contrib=contribs['cost_variance'],
            payment_pattern_contrib=contribs['payment_pattern'],
            duplicate_contrib=contribs['duplicate_similarity'],
            compliance_contrib=contribs['compliance_risk'],
            explanation_text="; ".join(reasons),
            recommended_actions_json=actions
        )
        db.add(risk_detail)

        # Create Alert for High & Critical Risk projects
        if risk_lvl in ['High', 'Critical']:
            alert_type = "Cost Overrun" if contribs['cost_variance'] > 50 else (
                "Project Delay" if contribs['delay'] > 50 else (
                    "Progress Mismatch" if contribs['payment_pattern'] > 50 else "Financial Anomaly"
                )
            )
            alert_obj = Alert(
                alert_code=f"ALT-2026-{alert_counter}",
                project_id=p_obj.id,
                project_name=p_obj.project_name,
                state_name=p_obj.state_name,
                district_name=p_obj.district_name,
                alert_type=alert_type,
                risk_level=risk_lvl,
                risk_score=overall_risk,
                detected_date=datetime.now().strftime("%Y-%m-%d"),
                reason=reasons[0] if reasons else "Multi-factor anomaly detected",
                status="New",
                assigned_to="District Collector",
                notes="Automated system alert generated during ML anomaly scan."
            )
            db.add(alert_obj)
            alert_counter += 1

    # Record initial ModelRun
    model_run = ModelRun(
        records_processed=len(db_projects),
        anomalies_detected=len(db.query(Alert).all()),
        average_risk_score=round(float(np.mean([p.risk_score for p in db_projects])), 1),
        execution_time_sec=2.45,
        triggered_by="System Initial Seed",
        status="Success"
    )
    db.add(model_run)

    # Initial Audit Log entry
    audit = AuditLog(
        user_email="system@mplads.gov.in",
        role="System Admin",
        action="Database Seed & ML Execution",
        entity="System",
        previous_state="Empty DB",
        new_state=f"Seeded {len(db_projects)} projects, {len(duplicate_candidates)} duplicate candidates."
    )
    db.add(audit)

    db.commit()
    db.close()
    print("Database seeding and initial ML pipeline successfully completed!")

if __name__ == "__main__":
    seed_database()
