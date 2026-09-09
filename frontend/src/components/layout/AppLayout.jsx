import { NavLink, Outlet } from "react-router-dom";
import {
  IconShieldCheck,
  IconLayoutDashboard,
  IconBuilding,
  IconEye,
  IconBell,
  IconChartBar,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: IconLayoutDashboard, end: true },
  { to: "/vendors/VC-2291", label: "Vendor analysis", icon: IconBuilding },
  { to: "/public", label: "Public view", icon: IconEye },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">
            <IconShieldCheck size={17} strokeWidth={2} />
          </span>
          <span className="sidebar-logo-name">Satark</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section">Navigation</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <Icon size={15} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          style={{
            padding: "0.9rem 1rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.35rem",
            }}
          >
            <IconChartBar size={12} color="var(--text-on-deep-2)" />
            <span style={{ fontSize: "0.65rem", color: "var(--text-on-deep-2)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              MPLADS monitor
            </span>
          </div>
          <p style={{ fontSize: "0.67rem", color: "var(--text-on-deep-2)", lineHeight: 1.5, opacity: 0.6 }}>
            Data current as of Sep 2026
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            All constituencies — FY 2025-26
          </span>
          <button
            className="btn btn-ghost"
            style={{ padding: "0.38rem 0.55rem" }}
            aria-label="Notifications"
          >
            <IconBell size={16} strokeWidth={1.8} />
          </button>
        </header>

        {/* Page outlet */}
        <motion.div
          key="outlet"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </div>

      {/* ── Bottom tab bar (mobile) ── */}
      <nav className="bottom-tabs">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => "tab-btn" + (isActive ? " active" : "")}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
