/**
 * FilterDropdown — select element for filtering.
 * Props: value, onChange, options=[{value, label}], label, id
 */
export default function FilterDropdown({ value, onChange, options, label, id }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          {label}
        </label>
      )}
      <select
        id={id}
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{ minWidth: "140px" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
