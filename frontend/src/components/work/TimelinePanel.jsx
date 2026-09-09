import { motion } from "framer-motion";

/**
 * TimelinePanel — expected vs actual duration cards.
 * Props: expectedDays, actualDays (integers)
 */
export default function TimelinePanel({ expectedDays, actualDays }) {
  const isDelayed = actualDays > expectedDays;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
      <motion.div whileHover={{ y: -2 }} className="card card-alt">
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
          Expected
        </p>
        <p style={{ fontSize: "1.45rem", fontFamily: "var(--font-head)", fontWeight: "var(--fw-bold)", color: "var(--deep)", letterSpacing: "-0.02em" }}>
          {expectedDays} days
        </p>
      </motion.div>
      <motion.div whileHover={{ y: -2 }} className="card card-alt">
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
          Actual
        </p>
        <p
          style={{
            fontSize: "1.45rem",
            fontFamily: "var(--font-head)",
            fontWeight: "var(--fw-bold)",
            letterSpacing: "-0.02em",
            color: isDelayed ? "var(--color-danger)" : "var(--color-success)",
          }}
        >
          {actualDays} days
        </p>
      </motion.div>
    </div>
  );
}
