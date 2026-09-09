import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react";
import PageContainer from "../components/layout/PageContainer";
import VendorCard from "../components/vendor/VendorCard";
import DistrictConcentrationBar from "../components/vendor/DistrictConcentrationBar";
import RiskBadge from "../components/work/RiskBadge";
import { getVendor } from "../services/api";
import { formatCurrency } from "../utils/riskColors";

export default function VendorAnalysis() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getVendor(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <PageContainer>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </PageContainer>
    );
  if (error || !data)
    return (
      <PageContainer>
        <p style={{ color: "var(--color-danger)" }}>Vendor not found.</p>
        <Link to="/" style={{ color: "var(--color-link)", fontSize: "0.867rem" }}>
          ← Back to dashboard
        </Link>
      </PageContainer>
    );

  const maxConc = Math.max(...data.districtConcentration.map((d) => d.percentage));
  const topDistrict = data.districtConcentration.find((d) => d.percentage === maxConc);

  return (
    <PageContainer>
      {/* Back nav */}
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "var(--text-secondary)",
          fontSize: "0.867rem",
          textDecoration: "none",
          marginBottom: "1.25rem",
        }}
      >
        <IconArrowLeft size={14} />
        Back to dashboard
      </Link>

      {/* Vendor identity */}
      <VendorCard vendor={data} />

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="card">
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
            Works awarded
          </p>
          <p style={{ fontSize: "1.7rem", fontWeight: "var(--fw-medium)" }}>{data.worksAwarded}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
            Total value
          </p>
          <p style={{ fontSize: "1.7rem", fontWeight: "var(--fw-medium)" }}>
            {formatCurrency(data.totalValue)}
          </p>
        </div>
      </div>

      {/* District concentration */}
      <div className="card" style={{ marginBottom: "0.75rem" }}>
        <p className="section-heading">District concentration</p>
        <DistrictConcentrationBar districts={data.districtConcentration} threshold={50} />
      </div>

      {/* Warning banner if any district > 50% */}
      {maxConc > 50 && (
        <div className="warn-banner" style={{ marginBottom: "1.25rem" }}>
          <IconAlertTriangle size={16} />
          {maxConc}% of works in a single district
        </div>
      )}

      {/* Associated works */}
      <div>
        <p className="section-heading">Associated works</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {data.worksDetail.map((work) => (
            <Link
              key={work.id}
              to={`/works/${work.id}`}
              className="work-row"
              aria-label={`${work.name} — ${work.district}`}
            >
              <span style={{ fontSize: "0.9rem" }}>
                {work.name} — {work.district}
              </span>
              <RiskBadge score={work.riskScore} />
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
