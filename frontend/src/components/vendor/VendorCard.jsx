import { IconBuilding } from "@tabler/icons-react";
import { formatCurrency } from "../../utils/riskColors";

/**
 * VendorCard — header identity card for a vendor.
 * Props: vendor: { id, name, worksAwarded, totalValue }
 */
export default function VendorCard({ vendor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
      <div
        style={{
          width: 52,
          height: 52,
          background: "#1e3a5f",
          border: "1px solid #1d4ed8",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconBuilding size={22} color="#60a5fa" strokeWidth={1.6} />
      </div>
      <div>
        <h1
          style={{
            fontSize: "1.1rem",
            fontWeight: "var(--fw-medium)",
            color: "var(--text-primary)",
          }}
        >
          {vendor.name}
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          Vendor ID {vendor.id}
        </p>
      </div>
    </div>
  );
}
