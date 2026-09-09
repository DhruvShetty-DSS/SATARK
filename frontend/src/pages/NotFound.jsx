import { Link } from "react-router-dom";
import { IconShieldOff } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        background: "var(--bg-base)",
      }}
    >
      <IconShieldOff size={36} strokeWidth={1.4} />
      <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>Page not found</p>
      <Link
        to="/"
        style={{ fontSize: "0.867rem", color: "var(--color-link)", textDecoration: "none" }}
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
