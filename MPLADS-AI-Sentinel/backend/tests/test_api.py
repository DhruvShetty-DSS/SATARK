import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.anomaly_engine import AnomalyRiskEngine
from backend.app.ml.duplicate_detector import DuplicateDetector

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_login_demo_admin():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@mplads.gov.in",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Ministry Admin"

def test_dashboard_summary_endpoint():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_projects" in data
    assert data["total_projects"] > 0
    assert "high_risk_projects" in data

def test_projects_list_endpoint():
    response = client.get("/api/v1/projects?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert len(data["projects"]) == 10

def test_alerts_list_endpoint():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_duplicates_list_endpoint():
    response = client.get("/api/v1/duplicates")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_anomaly_risk_engine_calculation():
    sample_project = {
        "sanctioned_amount": 1000000.0,
        "estimated_cost": 1000000.0,
        "actual_expenditure": 1450000.0, # Cost overrun
        "delay_days": 120,               # Delayed
        "physical_progress_pct": 30.0,
        "financial_progress_pct": 95.0, # Progress mismatch
        "status": "Ongoing"
    }
    score, risk_lvl, contribs, reasons, actions = AnomalyRiskEngine.calculate_project_risk(
        sample_project, anomaly_score=85.0
    )
    assert score >= 50.0 # High or Critical
    assert risk_lvl in ["High", "Critical"]
    assert len(reasons) > 0
    assert len(actions) > 0

def test_assistant_query():
    response = client.post("/api/v1/assistant/query", json={"query": "Which projects have highest risk?"})
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) > 0
