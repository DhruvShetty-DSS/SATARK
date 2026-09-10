import math
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in km."""
    if any(v is None for v in [lat1, lon1, lat2, lon2]):
        return 0.0
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

class DuplicateDetector:
    """
    NLP & Spatial similarity matching to flag potential duplicate project proposals
    across districts and constituencies.
    """

    def __init__(self, text_threshold: float = 0.65):
        self.text_threshold = text_threshold

    def find_duplicate_candidates(self, projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if len(projects) < 2:
            return []

        df = pd.DataFrame(projects)
        df['clean_text'] = df['project_name'].fillna('') + ' ' + df['work_category'].fillna('') + ' ' + df['constituency_name'].fillna('')
        
        # TF-IDF Vectorizer over work text
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = vectorizer.fit_transform(df['clean_text'])
        
        sim_matrix = cosine_similarity(tfidf_matrix)
        candidates = []
        n = len(df)

        for i in range(n):
            for j in range(i + 1, n):
                text_sim = float(sim_matrix[i, j])
                
                proj_a = df.iloc[i]
                proj_b = df.iloc[j]
                
                # Check if same state or district to narrow search
                same_district = (proj_a.get('district_name') == proj_b.get('district_name'))
                same_state = (proj_a.get('state_name') == proj_b.get('state_name'))
                
                if not (same_district or same_state or text_sim > 0.85):
                    continue

                # Calculate Amount Similarity
                amt_a = float(proj_a.get('sanctioned_amount') or 0.0)
                amt_b = float(proj_b.get('sanctioned_amount') or 0.0)
                if amt_a > 0 and amt_b > 0:
                    amount_sim = 1.0 - (abs(amt_a - amt_b) / max(amt_a, amt_b))
                else:
                    amount_sim = 0.5
                amount_sim_pct = round(max(0.0, amount_sim) * 100.0, 1)
                text_sim_pct = round(text_sim * 100.0, 1)

                # Geographic distance
                dist_km = haversine_distance(
                    proj_a.get('latitude'), proj_a.get('longitude'),
                    proj_b.get('latitude'), proj_b.get('longitude')
                )

                # Overall similarity score weighted
                overall_sim = (text_sim * 0.60) + (amount_sim * 0.40)
                overall_sim_pct = round(overall_sim * 100.0, 1)

                if overall_sim_pct >= 60.0 or (same_district and text_sim_pct >= 55.0):
                    risk_level = "Critical" if overall_sim_pct >= 85.0 else ("High" if overall_sim_pct >= 70.0 else "Medium")
                    candidates.append({
                        "project_a_id": int(proj_a['id']),
                        "project_b_id": int(proj_b['id']),
                        "project_a_name": str(proj_a['project_name']),
                        "project_b_name": str(proj_b['project_name']),
                        "state_name": str(proj_a['state_name']),
                        "district_name": str(proj_a['district_name']),
                        "text_similarity_pct": text_sim_pct,
                        "location_distance_km": dist_km,
                        "amount_similarity_pct": amount_sim_pct,
                        "overall_similarity_pct": overall_sim_pct,
                        "risk_level": risk_level,
                        "review_status": "Unreviewed"
                    })

        return sorted(candidates, key=lambda x: x['overall_similarity_pct'], reverse=True)
