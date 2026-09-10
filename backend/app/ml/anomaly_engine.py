import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, List, Tuple, Any

class AnomalyRiskEngine:
    """
    Combines Machine Learning (Isolation Forest) with 10 Business Risk Rules
    to compute explainable multi-factor risk scores (0-100) for MPLADS projects.
    """

    def __init__(self, contamination: float = 0.08, random_state: int = 42):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=random_state
        )
        self.is_fitted = False

    def extract_features(self, projects_df: pd.DataFrame) -> np.ndarray:
        """Extract numerical feature matrix for Isolation Forest anomaly detection."""
        df = projects_df.copy()
        
        # Ensure numerical defaults
        df['sanctioned_amount'] = pd.to_numeric(df['sanctioned_amount'], errors='coerce').fillna(0.0)
        df['estimated_cost'] = pd.to_numeric(df['estimated_cost'], errors='coerce').fillna(df['sanctioned_amount'])
        df['actual_expenditure'] = pd.to_numeric(df['actual_expenditure'], errors='coerce').fillna(0.0)
        df['delay_days'] = pd.to_numeric(df['delay_days'], errors='coerce').fillna(0)
        df['physical_progress_pct'] = pd.to_numeric(df['physical_progress_pct'], errors='coerce').fillna(0.0)
        df['financial_progress_pct'] = pd.to_numeric(df['financial_progress_pct'], errors='coerce').fillna(0.0)

        # Derived Feature Engineering
        # 1. Cost Variance Ratio
        df['cost_variance_ratio'] = np.where(
            df['estimated_cost'] > 0,
            (df['actual_expenditure'] - df['estimated_cost']) / df['estimated_cost'],
            0.0
        )
        
        # 2. Financial vs Physical Mismatch Ratio
        df['progress_mismatch'] = df['financial_progress_pct'] - df['physical_progress_pct']
        
        # 3. Expenditure Utilization Velocity
        df['utilization_ratio'] = np.where(
            df['sanctioned_amount'] > 0,
            df['actual_expenditure'] / df['sanctioned_amount'],
            0.0
        )
        
        # 4. Normalized Delay Ratio
        df['delay_factor'] = np.log1p(np.maximum(0, df['delay_days']))

        features = df[[
            'sanctioned_amount',
            'actual_expenditure',
            'cost_variance_ratio',
            'progress_mismatch',
            'utilization_ratio',
            'delay_factor'
        ]].values

        return features

    def fit_predict_anomaly_scores(self, projects_df: pd.DataFrame) -> np.ndarray:
        """Fit Isolation Forest and transform raw decision scores to 0-100 anomaly index."""
        if projects_df.empty:
            return np.array([])
            
        features = self.extract_features(projects_df)
        self.model.fit(features)
        self.is_fitted = True

        # raw_scores: higher is less anomalous, lower is more anomalous
        raw_scores = self.model.decision_function(features)
        
        # Min-max scale to 0-100 (where 100 = most anomalous)
        min_score = np.min(raw_scores)
        max_score = np.max(raw_scores)
        
        if max_score == min_score:
            normalized_scores = np.full(len(raw_scores), 25.0)
        else:
            normalized_scores = 100.0 * (1.0 - (raw_scores - min_score) / (max_score - min_score))
            
        return np.round(normalized_scores, 2)

    @staticmethod
    def calculate_project_risk(project: Dict[str, Any], anomaly_score: float) -> Tuple[float, str, Dict[str, float], List[str], List[str]]:
        """
        Calculates a multi-factor risk score (0-100) combining ML score and 10 business rules.
        Returns: (overall_risk_score, risk_level, factor_contributions, reasons, recommended_actions)
        """
        sanctioned = float(project.get('sanctioned_amount') or 0.0)
        estimated = float(project.get('estimated_cost') or sanctioned)
        expenditure = float(project.get('actual_expenditure') or 0.0)
        delay_days = int(project.get('delay_days') or 0)
        physical_pct = float(project.get('physical_progress_pct') or 0.0)
        financial_pct = float(project.get('financial_progress_pct') or 0.0)
        status = str(project.get('status') or 'Ongoing')
        has_duplicate = bool(project.get('has_duplicate_flag') or False)

        reasons = []
        actions = []

        # 1. Financial Anomaly Score (Weight: 30%)
        financial_anomaly = min(100.0, anomaly_score * 0.95)
        if anomaly_score > 65:
            reasons.append(f"Machine learning anomaly detector flagged structural expenditure pattern anomaly (score: {anomaly_score:.1f}/100).")

        # 2. Delay Indicator (Weight: 20%)
        delay_score = 0.0
        if delay_days > 180:
            delay_score = 100.0
            reasons.append(f"Project is severely delayed by {delay_days} days beyond target completion date.")
            actions.append("Issue urgent cause notice to implementing agency for timeline delay.")
        elif delay_days > 60:
            delay_score = 70.0
            reasons.append(f"Project is moderately delayed by {delay_days} days.")
            actions.append("Conduct field review with District Planning Officer regarding delay.")
        elif delay_days > 0:
            delay_score = 35.0

        # 3. Cost Overrun / Variance Indicator (Weight: 15%)
        cost_var_score = 0.0
        if estimated > 0 and expenditure > estimated:
            overrun_pct = ((expenditure - estimated) / estimated) * 100.0
            cost_var_score = min(100.0, overrun_pct * 3.0)
            reasons.append(f"Cost overrun detected: Actual expenditure exceeded estimated cost by {overrun_pct:.1f}%.")
            actions.append("Audit revised administrative sanction and vendor invoice breakdown.")
        elif sanctioned > 0 and expenditure > (sanctioned * 1.05):
            cost_var_score = 80.0
            reasons.append("Expenditure has exceeded the total sanctioned amount.")
            actions.append("Verify fund utilization authorization limits.")

        # 4. Progress Mismatch (Payment Concentration / Velocity) Indicator (Weight: 15%)
        payment_pattern_score = 0.0
        mismatch = financial_pct - physical_pct
        if mismatch > 35:
            payment_pattern_score = 95.0
            reasons.append(f"Significant progress mismatch: Financial disbursement ({financial_pct:.0f}%) far exceeds physical progress ({physical_pct:.0f}%).")
            actions.append("Perform physical site verification before releasing remaining funds.")
        elif mismatch > 15:
            payment_pattern_score = 60.0
            reasons.append(f"Moderate mismatch between financial expenditure ({financial_pct:.0f}%) and physical work completed ({physical_pct:.0f}%).")

        # 5. Duplicate Work Similarity Indicator (Weight: 10%)
        duplicate_score = 100.0 if has_duplicate else 0.0
        if has_duplicate:
            reasons.append("High textual and geographic similarity detected with another work recommendation in the same district.")
            actions.append("Review duplicate candidate record in Duplicate Detection page to prevent double sanctioning.")

        # 6. Compliance Indicator (Weight: 10%)
        compliance_score = 0.0
        if not project.get('implementing_agency') or str(project.get('implementing_agency')).strip() == '':
            compliance_score += 50.0
            reasons.append("Implementing agency detail is missing or unassigned.")
            actions.append("Update implementing agency records in project registry.")
        if status.lower() == 'delayed' and delay_days <= 0:
            compliance_score += 40.0

        # Calculate Weighted Final Risk Score
        overall_risk = (
            (financial_anomaly * 0.30) +
            (delay_score * 0.20) +
            (cost_var_score * 0.15) +
            (payment_pattern_score * 0.15) +
            (duplicate_score * 0.10) +
            (compliance_score * 0.10)
        )
        overall_risk = round(min(100.0, max(0.0, overall_risk)), 1)

        # Determine Risk Level Class
        if overall_risk >= 75:
            risk_level = "Critical"
        elif overall_risk >= 50:
            risk_level = "High"
        elif overall_risk >= 25:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        if not reasons:
            reasons.append("Project progress, expenditure, and documentation conform with expected MPLADS guidelines.")
        if not actions:
            actions.append("Continue standard routine monitoring.")

        factor_contributions = {
            "financial_anomaly": round(financial_anomaly, 1),
            "delay": round(delay_score, 1),
            "cost_variance": round(cost_var_score, 1),
            "payment_pattern": round(payment_pattern_score, 1),
            "duplicate_similarity": round(duplicate_score, 1),
            "compliance_risk": round(compliance_score, 1)
        }

        return overall_risk, risk_level, factor_contributions, reasons, actions
