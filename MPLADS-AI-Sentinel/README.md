# MPLADS AI Sentinel

> **Tagline**: *"AI-powered intelligence for transparent, efficient and accountable MPLADS implementation."*

---

## 📌 Problem Statement Overview

- **Problem Statement ID**: 26102
- **Title**: Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation
- **Organization**: Ministry of Statistics and Programme Implementation (MoSPI)
- **Department**: Data Informatics & Innovation Division (DIID)
- **Category**: Software | **Theme**: Smart Automation
- **Official Dashboard**: [https://mplads.mospi.gov.in/digigov/dashboard.html](https://mplads.mospi.gov.in/digigov/dashboard.html)

---

## 🚀 Key Features

1. **Executive Command Dashboard**: National, State, District, and Constituency monitoring with top KPIs, priority attention alerts, and trend charts.
2. **Isolation Forest ML Anomaly Engine**: Unsupervised machine learning detection for structural expenditure and timeline anomalies.
3. **10-Factor Business Risk Engine**: Combines ML scores with cost overrun, completion delay, progress mismatch, and payment concentration rules into a 0-100 Risk Score.
4. **Explainable AI (XAI)**: Generates human-readable explanations and recommended administrative actions for non-technical officials.
5. **NLP Duplicate Work Detection**: TF-IDF vectorization and spatial distance matching to identify potential duplicate project proposals.
6. **Predictive Analytics Studio**: ML models estimating project completion dates, delay probabilities, and budget overrun risks.
7. **Interactive GIS Map**: Leaflet map visualizing project risk clusters and geographical distribution across India.
8. **Role-Based Access Control (4 Application Roles)**:
   - **MP (Member of Parliament)**: Constituency project tracking and fund utilization.
   - **District Authority**: District investigation, expenditure monitoring, alert resolution.
   - **State Nodal Authority**: State-wide monitoring, district rankings, risk distribution.
   - **Ministry / MoSPI Admin**: National overview, user management, CSV dataset uploads, ML pipeline execution.
9. **MPLADS Intelligence Assistant**: Natural language query interface converting questions into analytical query responses offline.
10. **Data Quality & Audit Trail**: CSV data ingestion pipeline, validation reports, and immutable audit logs.

---

## 🛠️ Technology Stack

- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Recharts, Leaflet, Lucide Icons.
- **Backend**: Python 3.14 / 3.11, FastAPI, Pydantic v2, Async SQLAlchemy (SQLite out-of-the-box zero setup / PostgreSQL compatible).
- **AI/ML**: `scikit-learn` (`IsolationForest`), `pandas`, `numpy`, TF-IDF Vectorizer + Cosine Similarity.
- **Security**: JWT token authentication with PBKDF2 password hashing.
- **DevOps**: Docker, Docker Compose, Pytest test suite.

---

## 🔑 Demo Login Credentials

You can use the role switcher dropdown in the top header or login with these credentials:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Ministry Admin** | `admin@mplads.gov.in` | `admin123` | National (All States & Districts) |
| **State Nodal Authority** | `state@mplads.gov.in` | `state123` | State Level (Maharashtra Focus) |
| **District Authority** | `district@mplads.gov.in` | `district123` | District Level (Pune / Dharwad) |
| **Member of Parliament (MP)** | `mp@mplads.gov.in` | `mp123` | Constituency Level (Dharwad) |

---

## 💻 Quick Start & Installation

### Option 1: Local Development (Instant Zero-Config Spin Up)

#### 1. Backend Setup
```bash
# Navigate to project root
cd c:/Users/acer/Dropbox/MPLADS-AI-Sentinel

# Install Python dependencies
pip install -r backend/requirements.txt

# Seed Database & Run Initial ML Anomaly Detection Pipeline
python scripts/seed_db.py

# Run FastAPI Backend Server
uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000`  
Interactive Swagger Docs: `http://127.0.0.1:8000/api/v1/docs`

#### 2. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

### Option 2: Docker Compose (Full Stack + PostgreSQL)

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🔬 AI/ML Methodology

### 1. Feature Engineering
We extract derived numerical features for each project:
- **Cost Variance Ratio**: $(\text{Actual Expenditure} - \text{Estimated Cost}) / \text{Estimated Cost}$
- **Progress Mismatch Ratio**: $\text{Financial Progress \%} - \text{Physical Progress \%}$
- **Log Delay Factor**: $\ln(1 + \max(0, \text{Delay Days}))$
- **Utilization Velocity**: $\text{Actual Expenditure} / \text{Sanctioned Amount}$

### 2. Isolation Forest Anomaly Detection
An `IsolationForest(n_estimators=100, contamination=0.08)` isolates structural outliers in multi-dimensional feature space, outputting a normalized **Anomaly Score (0-100)**.

### 3. Integrated Multi-Factor Risk Score
$$\text{Risk Score} = 0.30 \cdot S_{\text{ML}} + 0.20 \cdot S_{\text{Delay}} + 0.15 \cdot S_{\text{Cost Overrun}} + 0.15 \cdot S_{\text{Mismatch}} + 0.10 \cdot S_{\text{Duplicate}} + 0.10 \cdot S_{\text{Compliance}}$$

- **Low**: 0–24.9 | **Medium**: 25–49.9 | **High**: 50–74.9 | **Critical**: 75–100

---

## 🏆 5-MINUTE HACKATHON DEMO GUIDE

During your 5-minute presentation, follow this exact click-by-click flow:

### 1. **Login & National Executive Dashboard (1 Min)**
- Log in as **Ministry Admin** (`admin@mplads.gov.in`).
- Highlight the **Top KPI Cards**: Total Monitored Works (16,017), Sanctioned Fund (₹ Cr), Fund Utilization Rate, and Critical Anomalies.
- Point out the **"Priority Attention Required"** banner displaying the top critical projects needing review today.
- Show the **Fund Utilization Trend Line** and **State Risk Index Ranking**.

### 2. **Project Intelligence Profile & Explainable AI (1.5 Mins)**
- Switch to the **Projects Registry** tab.
- Filter by `Critical` risk level.
- Click **"Inspect"** on a high-risk project to open the **Project Intelligence Profile**.
- Demonstrate the **Physical vs Financial Progress mismatch gauge**.
- Scroll to **"Explainable AI (XAI) Risk Rationale"** and explain how the system explicitly details *why* the project received its score (e.g. 120 days delay, cost overrun, payment concentration).
- Show the **Recommended Administrative Actions**.

### 3. **NLP Duplicate Work Detection (1 Min)**
- Navigate to the **Duplicate Detection** tab.
- Show candidate project pairs flagged by TF-IDF text similarity and geographic proximity.
- Click **"Mark Valid Separate"** or **"Confirm Duplicate"** to demonstrate the review workflow.

### 4. **Risk Alert Center & Predictive Analytics (1 Min)**
- Open the **Alert Center** and update an alert status from `New` to `Under Review`.
- Navigate to **Predictive Analytics** to show the ML model's estimated completion dates and delay probabilities.

### 5. **MPLADS Intelligence Assistant & Data Ingestion (0.5 Min)**
- Open **Intelligence Assistant** and click a preset question e.g. *"Which projects have high financial progress but low physical progress?"*. Show the instant query response and equivalent SQL query.
- Briefly show the **Data & ML Management** page where CSV datasets can be uploaded and the ML pipeline can be executed on demand.

---

## ⚠️ Synthetic Demo Data Disclaimer

As per official hackathon principles:
> Official MPLADS CSV datasets from Lok Sabha and Rajya Sabha in `/Data` were ingested and merged with controlled benchmark anomaly records to enable a rich 16,000+ record hackathon demonstration. All synthetic records are clearly tagged with `is_demo_data=True` and flagged in the UI. Output scores represent **"Risk Indicators" / "Requires Verification"** decision-support indicators.

---

## 🧪 Testing

Run backend test suite:
```bash
python -m pytest backend/tests/test_api.py
```
*(All 8 test cases pass cleanly)*
