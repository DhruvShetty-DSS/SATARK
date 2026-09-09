import { formatCurrency } from "../../utils/riskColors";
import { motion } from "framer-motion";

/**
 * FinancialPanel — sanctioned vs spent metric cards.
 * Props: sanctioned, spent (both in rupees)
 */
export default function FinancialPanel({ sanctioned, spent }) {
  const isOverspent = spent > sanctioned;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
      <motion.div whileHover={{ y: -2 }} className="card card-alt">
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
          Sanctioned
        </p>
        <p style={{ fontSize: "1.45rem", fontFamily: "var(--font-head)", fontWeight: "var(--fw-bold)", color: "var(--deep)", letterSpacing: "-0.02em" }}>
          {formatCurrency(sanctioned)}
        </p>
      </motion.div>
      <motion.div whileHover={{ y: -2 }} className="card card-alt">
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
          Spent
        </p>
        <p
          style={{
            fontSize: "1.45rem",
            fontFamily: "var(--font-head)",
            fontWeight: "var(--fw-bold)",
            letterSpacing: "-0.02em",
            color: isOverspent ? "var(--color-danger)" : "var(--deep)",
          }}
        >
          {formatCurrency(spent)}
        </p>
      </motion.div>
    </div>
  );
}
