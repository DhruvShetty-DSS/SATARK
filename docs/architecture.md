# MPLADS AI Sentinel - System Architecture Documentation

## Architecture Diagram

```
                    MPLADS OFFICIAL DATA (CSVs)
                                 |
                                 v
                     DATA INGESTION & CLEANING
                                 |
                                 v
                     FEATURE ENGINEERING MATRIX
                                 |
               +-----------------+-----------------+
               |                                   |
               v                                   v
      ML ISOLATION FOREST                  RULE-BASED ENGINE
     ANOMALY SCORE (0-100)               (10 Compliance Rules)
               |                                   |
               +-----------------+-----------------+
                                 |
                                 v
                     INTEGRATED RISK ENGINE
                         (0-100 Score)
                                 |
                                 v
                    EXPLAINABLE AI GENERATOR (XAI)
                                 |
                                 v
                    PostgreSQL / SQLite Database
                                 |
                                 v
                     FastAPI REST Backend API
                                 |
                                 v
                   Vite + React + TypeScript Dashboard
```

## System Modules

1. **Ingestion & Data Quality Pipeline**: Reads raw Lok Sabha and Rajya Sabha CSV datasets from `/Data`, standardizes column headers, parses amounts and dates, handles missing values, and enriches data into a unified 16,000+ record dataset.
2. **Isolation Forest Anomaly Model**: Unsupervised ML model (`scikit-learn`) trained on expenditure velocity, progress ratios, cost variance ratios, and log-delay factors to detect structural anomalies.
3. **Business Risk Engine**: Combines ML anomaly scores (30%) with 10 business compliance rules (70%) to compute an overall 0-100 Risk Score.
4. **TF-IDF NLP Duplicate Work Engine**: Computes pairwise cosine similarity over project titles and descriptions, filtered by district and distance proximity.
5. **Explainable AI (XAI) Module**: Translates model feature weights and rule triggers into human-readable bullet points and actionable recommended next steps for government officials.
6. **FastAPI Backend & Security**: Provides role-based JWT authentication (`MP`, `District Authority`, `State Nodal Authority`, `Ministry Admin`), REST endpoints, CSV streaming export, and database transaction handling.
7. **Command Center UI**: Responsive Vite + React 18 + Tailwind CSS frontend featuring Leaflet interactive maps, Recharts visualizations, interactive data tables, and the MPLADS Intelligence Assistant.

## Multi-Factor Risk Score Formula

$$\text{Risk Score} = 0.30 \cdot S_{\text{ML}} + 0.20 \cdot S_{\text{Delay}} + 0.15 \cdot S_{\text{Overrun}} + 0.15 \cdot S_{\text{Mismatch}} + 0.10 \cdot S_{\text{Duplicate}} + 0.10 \cdot S_{\text{Compliance}}$$

- **Low**: 0 - 24.9
- **Medium**: 25 - 49.9
- **High**: 50 - 74.9
- **Critical**: 75 - 100
