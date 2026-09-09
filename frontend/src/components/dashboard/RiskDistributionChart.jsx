import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--deep)",
        border: "none",
        borderRadius: "var(--radius-md)",
        padding: "0.65rem 0.9rem",
        fontSize: "0.8rem",
        color: "var(--text-on-deep)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        minWidth: 140,
      }}
    >
      <p style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: "0.4rem", color: "#fff" }}>
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "2px" }}
        >
          <span style={{ color: p.fill === "#E2DDD6" ? "var(--text-on-deep-2)" : p.fill }}>
            {p.name}
          </span>
          <span style={{ fontWeight: 600, color: "#fff" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * RiskDistributionChart — stacked bar chart by district.
 * Props: data=[{district, high, medium, low}]
 */
export default function RiskDistributionChart({ data }) {
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap="30%"
          barGap={1}
          margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
        >
          <XAxis
            dataKey="district"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-body)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
          <Bar dataKey="high"   stackId="a" fill="#DC2626" name="High"   radius={[0,0,0,0]} />
          <Bar dataKey="medium" stackId="a" fill="#D97706" name="Medium" />
          <Bar dataKey="low"    stackId="a" fill="#E2DDD6" name="Low"    radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
