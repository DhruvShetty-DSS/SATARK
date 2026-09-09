# SATARK


## Project Flow

SATARK ingests real, public MPLADS (eSAKSHI) data, screens it for statistically unusual patterns, and surfaces an explainable, prioritized risk worklist for officials — instead of manual, random auditing.

```
┌─────────────────────────┐
│   1. Data Ingestion      │
│   Load raw MPLADS        │
│   vendor-spend dataset   │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│   2. Data Cleaning       │
│   Standardize names,     │
│   handle nulls/dupes     │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│   3. Feature Engineering │
│   Cost per work-type,    │
│   vendor frequency,      │
│   district spend stats   │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│   4. Anomaly Detection   │
│   Z-score / percentile   │
│   checks on each signal  │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│   5. Risk Scoring        │
│   Composite score (0–1)  │
│   + explainable reasons  │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│   6. Derived Features    │
│   Progress bar,          │
│   proof-of-completion    │
│   confidence score        │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│   7. Dashboard            │
│   Filterable, risk-       │
│   scored worklist with    │
│   drill-down explanations │
└───────────────────────────┘
```

### Step-by-step

1. **Data Ingestion**
   Load the MPLADS vendor-wise spend dataset (state, constituency, district, MP name, work name, vendor name, amount spent) from the public dataset source.

2. **Data Cleaning**
   Standardize MP/district/vendor name formatting, remove duplicates, handle missing values. No source data is modified — only derived fields are added.

3. **Feature Engineering**
   Compute per-record features: cost relative to the median cost for similar work types, vendor frequency within a district, district-level spend deviation.

4. **Anomaly Detection**
   Apply statistical checks (z-score / percentile thresholds) to each feature to flag statistically unusual values — e.g. cost far above the median, one vendor winning a disproportionate share of works in a district.

5. **Risk Scoring**
   Combine the individual signal flags into a single composite risk score (0–1) per work, with a human-readable reason attached to every flag (e.g. "cost 3.2x above district median").

6. **Derived Features**
   From the same underlying signals, compute two secondary outputs: an inferred progress indicator (stage-based or spend-ratio-based) and a proof-of-completion confidence score (based on image-upload status, spend-to-sanction ratio, and timeline plausibility).

7. **Dashboard**
   Present all works in a filterable, searchable table ranked by risk score, with a drill-down view explaining exactly why each work was flagged — built for human review, not as an automated fraud verdict.

### Design principle

At every stage, the system flags **statistically unusual patterns for human review** — it does not claim to detect fraud or corruption directly. This keeps the tool legally defensible and realistically deployable as an inspection-prioritization aid for MoSPI and District Authorities.
