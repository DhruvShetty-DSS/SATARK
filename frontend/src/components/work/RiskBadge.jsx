import { getRiskColor, getRiskBg, getRiskLabel, getRiskLevel, getRiskBorder } from "../../utils/riskColors";

/**
 * RiskBadge — compact numeric badge colored by risk level.
 * Props: score (number)  OR  level ('critical'|'high'|'medium'|'low')
 */
export default function RiskBadge({ score, level }) {
  const resolvedLevel = level ?? getRiskLevel(score);
  const color = getRiskColor(resolvedLevel);
  const bg = getRiskBg(resolvedLevel);
  const border = getRiskBorder(resolvedLevel);
  const display = score !== undefined ? score : getRiskLabel(resolvedLevel);

  return (
    <span
      className="risk-badge"
      style={{ 
        color, 
        background: bg,
        border: `1px solid ${border}`
      }}
      title={`Risk level: ${getRiskLabel(resolvedLevel)}`}
    >
      {display}
    </span>
  );
}
