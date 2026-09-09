import { getRiskColor, getRiskLabel, getRiskBg, getRiskBorder } from "../../utils/riskColors";
import { motion } from "framer-motion";

const SIZE = 130;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/**
 * RiskGauge — circular SVG arc showing 0-100 risk score.
 */
export default function RiskGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRC - (clamped / 100) * CIRC;
  const color = getRiskColor(clamped);
  const label = getRiskLabel(clamped);
  const bg = getRiskBg(clamped);
  const border = getRiskBorder(clamped);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* SVG gauge */}
      <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          {/* Fill with framer-motion */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />
        </svg>
        {/* Score label centered */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.2rem",
            fontFamily: "var(--font-head)",
            fontWeight: "var(--fw-bold)",
            color: "var(--deep)",
            letterSpacing: "-0.04em",
          }}
        >
          {clamped}
        </div>
      </div>

      {/* Level + caption */}
      <div>
        <span
          style={{
            display: "inline-block",
            background: bg,
            border: `1px solid ${border}`,
            color,
            padding: "0.2rem 0.65rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            fontFamily: "var(--font-head)",
            fontWeight: "var(--fw-bold)",
            marginBottom: "0.5rem",
            letterSpacing: "-0.01em",
          }}
        >
          {label} Risk
        </span>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
          Flagged for inspection —<br />not a definitive fraud verdict.
        </p>
      </div>
    </div>
  );
}
