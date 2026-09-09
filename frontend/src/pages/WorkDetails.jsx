import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { IconArrowLeft, IconFlag } from "@tabler/icons-react";
import PageContainer from "../components/layout/PageContainer";
import RiskGauge from "../components/work/RiskGauge";
import FinancialPanel from "../components/work/FinancialPanel";
import TimelinePanel from "../components/work/TimelinePanel";
import RiskReasonsList from "../components/work/RiskReasonsList";
import { getWork, flagWork } from "../services/api";

export default function WorkDetails() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flagged, setFlagged] = useState(false);
  const [flagging, setFlagging] = useState(false);

  useEffect(() => {
    setLoading(true);
    getWork(id)
      .then(setWork)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleFlag() {
    setFlagging(true);
    try {
      await flagWork(id);
      setFlagged(true);
    } finally {
      setFlagging(false);
    }
  }

  if (loading)
    return (
      <PageContainer>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </PageContainer>
    );
  if (error || !work)
    return (
      <PageContainer>
        <p style={{ color: "var(--color-danger)" }}>Work not found.</p>
        <Link to="/" style={{ color: "var(--color-link)", fontSize: "0.867rem" }}>
          ← Back to dashboard
        </Link>
      </PageContainer>
    );

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
        Back to worklist
      </Link>

      {/* Work header */}
      <h1
        style={{
          fontSize: "1.3rem",
          fontWeight: "var(--fw-medium)",
          marginBottom: "0.25rem",
        }}
      >
        {work.name}
      </h1>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
        {work.district}, {work.state} · Work ID {work.id}
      </p>

      {/* Risk gauge */}
      <div className="card" style={{ marginBottom: "0.75rem" }}>
        <RiskGauge score={work.riskScore} />
      </div>

      {/* Financial metrics */}
      <FinancialPanel sanctioned={work.sanctioned} spent={work.spent} />

      {/* Timeline metrics */}
      <div style={{ marginTop: "0.75rem" }}>
        <TimelinePanel expectedDays={work.expectedDays} actualDays={work.actualDays} />
      </div>

      {/* Vendor reference */}
      <div
        className="card"
        style={{
          marginTop: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
            Vendor
          </p>
          <p style={{ fontSize: "0.9rem", fontWeight: "var(--fw-medium)" }}>{work.vendor.name}</p>
        </div>
        <Link
          to={`/vendors/${work.vendor.id}`}
          style={{
            fontSize: "0.8rem",
            color: "var(--color-link)",
            textDecoration: "none",
          }}
        >
          View vendor →
        </Link>
      </div>

      {/* Why flagged */}
      <div style={{ marginTop: "1.25rem" }}>
        <p className="section-heading">Why this was flagged</p>
        <RiskReasonsList factors={work.reasons} />
      </div>

      <hr className="divider" style={{ margin: "1.5rem 0" }} />

      {/* Flag for inspection CTA */}
      <button
        id="btn-flag-inspection"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}
        onClick={handleFlag}
        disabled={flagged || flagging}
      >
        <IconFlag size={16} />
        {flagged ? "Flagged for inspection" : flagging ? "Flagging…" : "Flag for inspection"}
      </button>
    </PageContainer>
  );
}
