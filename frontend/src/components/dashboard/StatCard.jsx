import { motion } from "framer-motion";

/**
 * StatCard — single numeric stat with semantic accent border and subtle animation.
 * Props: label, value, accent ('danger'|'warning'|'success'|'high'|null), index (for stagger)
 */
export default function StatCard({ label, value, accent, index = 0 }) {
  const colorMap = {
    danger:  "var(--color-danger)",
    high:    "var(--color-high)",
    warning: "var(--color-warning)",
    success: "var(--color-success)",
  };
  const borderMap = {
    danger:  "var(--color-danger)",
    high:    "var(--color-high)",
    warning: "var(--color-warning)",
    success: "var(--color-success)",
  };
  const bgMap = {
    danger:  "var(--color-danger-bg)",
    high:    "var(--color-high-bg)",
    warning: "var(--color-warning-bg)",
    success: "var(--color-success-bg)",
  };

  const color = accent ? colorMap[accent] : "var(--deep)";
  const bg = accent ? bgMap[accent] : "var(--bg-card)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <div
        className="card"
        style={{
          background: bg,
          borderTop: accent ? `3px solid ${borderMap[accent]}` : "3px solid var(--border)",
          height: "100%",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "2.1rem",
            fontWeight: 700,
            fontFamily: "var(--font-head)",
            color,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>
      </div>
    </motion.div>
  );
}
