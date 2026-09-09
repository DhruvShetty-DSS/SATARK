import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import StatCard from "../components/dashboard/StatCard";
import RiskDistributionChart from "../components/dashboard/RiskDistributionChart";
import HighRiskTable from "../components/dashboard/HighRiskTable";
import SearchBar from "../components/common/SearchBar";
import FilterDropdown from "../components/common/FilterDropdown";
import { getDashboard } from "../services/api";
import { useWorks } from "../hooks/useWorks";

const DISTRICT_OPTIONS = [
  { value: "", label: "All districts" },
  { value: "Pune", label: "Pune" },
  { value: "Nashik", label: "Nashik" },
  { value: "Nagpur", label: "Nagpur" },
];

const RISK_OPTIONS = [
  { value: "", label: "All risk levels" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { works, loading } = useWorks({ search, district, riskLevel });

  useEffect(() => {
    getDashboard().then(setStats);
  }, []);

  return (
    <PageContainer>
      <h1 style={{ fontSize: "1.1rem", fontWeight: "var(--fw-medium)", marginBottom: "1rem" }}>
        Overview
      </h1>

      {/* ── Stat cards ── */}
      {stats && (
        <div className="stat-grid" style={{ marginBottom: "1.5rem" }}>
          <StatCard label="Total works" value={stats.totalWorks} />
          <StatCard label="High risk" value={stats.highRisk} accent="danger" />
          <StatCard label="Medium risk" value={stats.mediumRisk} accent="warning" />
          <StatCard label="Low risk" value={stats.lowRisk} accent="success" />
        </div>
      )}

      {/* ── Risk distribution chart ── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <p className="section-heading" style={{ margin: 0 }}>
            Risk distribution
          </p>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>by district</span>
        </div>
        {stats && <RiskDistributionChart data={stats.districtRisk} />}
      </div>

      {/* ── Priority worklist ── */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <p className="section-heading" style={{ margin: 0 }}>
            Priority worklist
          </p>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.8rem", padding: "0.3rem 0.65rem", color: "var(--color-link)" }}
            onClick={() => setShowAll((s) => !s)}
            id="toggle-view-all"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.65rem",
            marginBottom: "0.85rem",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <SearchBar value={search} onChange={setSearch} />
          <FilterDropdown
            id="filter-district"
            value={district}
            onChange={setDistrict}
            options={DISTRICT_OPTIONS}
            label="District"
          />
          <FilterDropdown
            id="filter-risk"
            value={riskLevel}
            onChange={setRiskLevel}
            options={RISK_OPTIONS}
            label="Risk level"
          />
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.867rem" }}>Loading…</p>
        ) : (
          <HighRiskTable works={works} limit={showAll ? undefined : 6} />
        )}
      </div>
    </PageContainer>
  );
}
