import { getRiskColor } from "../../utils/riskColors";
import { motion } from "framer-motion";

/**
 * RiskReasonsList — labeled progress bars for each risk factor.
 */
export default function RiskReasonsList({ factors }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {factors.map((factor, idx) => {
        const pct = Math.min(100, (factor.value / factor.max) * 100);
        // Score factor out of 100 for color threshold
        const scoredPct = (factor.value / factor.max) * 100;
        const color = getRiskColor(scoredPct >= 85 ? 85 : scoredPct >= 65 ? 65 : scoredPct >= 40 ? 55 : 20);

        return (
          <div key={factor.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: "var(--deep)", fontWeight: "var(--fw-medium)" }}>
                {factor.label}
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-head)",
                  fontWeight: "var(--fw-bold)",
                  color,
                }}
              >
                {factor.value} / {factor.max}
              </span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: color }}
                role="progressbar"
                aria-valuenow={factor.value}
                aria-valuemax={factor.max}
                aria-label={factor.label}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
