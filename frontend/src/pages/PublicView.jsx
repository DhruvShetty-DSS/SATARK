import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconShieldCheck, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { getPublicView } from "../services/api";
import { formatCurrency } from "../utils/riskColors";

export default function PublicView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicView().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data)
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading…
      </div>
    );

  const utilPct = Math.round((data.fundSpent / data.fundEntitlement) * 100);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-warning)",
            }}
          >
            <IconShieldCheck size={16} />
          </div>
          <span style={{ fontWeight: "var(--fw-medium)" }}>Satark</span>
        </div>
        <Link
          to="/"
          style={{ fontSize: "0.867rem", color: "var(--color-link)", textDecoration: "none" }}
        >
          Audit view
        </Link>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
        {/* Constituency */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
            Constituency
          </p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "var(--fw-medium)", marginBottom: "0.25rem" }}>
            {data.constituency}
          </h1>
          <p style={{ fontSize: "0.867rem", color: "var(--text-secondary)" }}>
            MP: {data.mp} · {data.lokSabha}
          </p>
        </div>

        {/* Fund utilization */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.6rem",
              fontSize: "0.867rem",
            }}
          >
            <span>Fund utilised</span>
            <span style={{ fontWeight: "var(--fw-medium)" }}>
              {formatCurrency(data.fundSpent)} of {formatCurrency(data.fundEntitlement)}
            </span>
          </div>
          <div className="progress-track" style={{ height: 8, marginBottom: "0.5rem" }}>
            <div
              className="progress-fill"
              style={{
                width: `${utilPct}%`,
                background: utilPct >= 80 ? "var(--color-success)" : "var(--color-link)",
              }}
            />
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            {utilPct}% of annual entitlement utilised
          </p>
        </div>

        {/* Stat pair */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}
        >
          <div className="card">
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
              Works completed
            </p>
            <p style={{ fontSize: "1.7rem", fontWeight: "var(--fw-medium)" }}>
              {data.worksCompleted}
            </p>
          </div>
          <div className="card">
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
              Flagged for review
            </p>
            <p
              style={{
                fontSize: "1.7rem",
                fontWeight: "var(--fw-medium)",
                color: "var(--color-danger)",
              }}
            >
              {data.flaggedForReview}
            </p>
          </div>
        </div>

        {/* Works near you */}
        <p className="section-heading">Works near you</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
          {data.nearbyWorks.map((work) => {
            const isComplete = work.status === "completed";
            const isReview = work.status === "under_review";
            return (
              <div
                key={work.id}
                className="work-row"
                style={{ cursor: "default" }}
                role="listitem"
              >
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: "var(--fw-medium)" }}>{work.name}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {isComplete
                      ? `Completed · ${formatCurrency(work.value)}`
                      : isReview
                      ? "Under review"
                      : `Ongoing · ${formatCurrency(work.value)}`}
                  </p>
                </div>
                <div style={{ flexShrink: 0, marginLeft: "0.75rem" }}>
                  {isComplete && <IconCheck size={18} color="var(--color-success)" />}
                  {isReview && <IconAlertTriangle size={18} color="var(--color-danger)" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.6,
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
          }}
        >
          Financial data only. Flags indicate patterns for review, not confirmed findings.
        </p>
      </div>
    </div>
  );
}
