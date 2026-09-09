import { IconSearch } from "@tabler/icons-react";

/**
 * SearchBar — controlled text input with search icon.
 * Props: value, onChange, placeholder
 */
export default function SearchBar({ value, onChange, placeholder = "Search works, districts…" }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <IconSearch
        size={14}
        style={{
          position: "absolute",
          left: "0.6rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none",
        }}
      />
      <input
        id="search-works"
        type="text"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: "2rem" }}
        aria-label={placeholder}
      />
    </div>
  );
}
