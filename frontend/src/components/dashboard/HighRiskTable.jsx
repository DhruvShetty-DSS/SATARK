import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RiskBadge from "../work/RiskBadge";
import EmptyState from "../common/EmptyState";

/**
 * HighRiskTable — priority worklist of works sorted by risk_score desc.
 * Props: works=[work objects], limit (optional max to show)
 */
export default function HighRiskTable({ works, limit }) {
  const items = limit ? works.slice(0, limit) : works;

  if (!items.length) return <EmptyState message="No works to display." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {items.map((work, idx) => (
        <motion.div
          key={work.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={`/works/${work.id}`}
            className="work-row"
            aria-label={`${work.name} — ${work.district}, risk score ${work.riskScore}`}
          >
            <div style={{ minWidth: 0 }}>
              <p
                className="fw-semi"
                style={{
                  fontSize: "0.95rem",
                  color: "var(--deep)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "-0.01em",
                }}
              >
                {work.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "4px" }}>
                <span className="tag" style={{ background: "var(--bg-base)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  {work.district}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>•</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {work.summary}
                </span>
              </div>
            </div>
            <div style={{ flexShrink: 0, marginLeft: "1rem" }}>
              <RiskBadge score={work.riskScore} />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
