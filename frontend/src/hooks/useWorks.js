import { useState, useEffect } from "react";
import { getWorks } from "../services/api";

/**
 * useWorks — fetches the work list with optional filtering.
 * @param {Object} params  { district?, riskLevel?, search? }
 */
export function useWorks(params = {}) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWorks(params)
      .then(setWorks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { works, loading, error };
}
