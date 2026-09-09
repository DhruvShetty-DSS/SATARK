import { getRiskColor } from "../../utils/riskColors";

/**
 * DistrictConcentrationBar — horizontal progress bars for each district.
 * Props:
 *   districts: Array<{ district: string, percentage: number }>
 *   threshold: number (default 50) — bar turns danger color above this
 */
export default function DistrictConcentrationBar({ districts, threshold = 50 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {districts.map(({ district, percentage }) => {
        const isHigh = percentage >= threshold;
        const color = isHigh
          ? "var(--color-danger)"
          : percentage >= 30
          ? "var(--color-warning)"
          : "var(--text-muted)";

        return (
          <div key={district}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.35rem",
                fontSize: "0.867rem",
              }}
            >
              <span style={{ color: "var(--text-primary)" }}>{district}</span>
              <span style={{ color, fontWeight: "var(--fw-medium)" }}>{percentage}%</span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div
                className="progress-fill"
                style={{ width: `${percentage}%`, background: color }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemax={100}
                aria-label={`${district} concentration`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
