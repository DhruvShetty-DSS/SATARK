/**
 * getRiskLevel — maps a numeric risk score to a semantic level string.
 * Thresholds: 0-39 low | 40-64 medium | 65-84 high | 85+ critical
 */
export function getRiskLevel(score) {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * getRiskColor — foreground color for the given risk level / score.
 */
export function getRiskColor(levelOrScore) {
  const level =
    typeof levelOrScore === "number" ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case "critical": return "#DC2626"; // red-600
    case "high":     return "#EA580C"; // orange-600
    case "medium":   return "#D97706"; // amber-600
    case "low":
    default:         return "#16A34A"; // green-600
  }
}

/**
 * getRiskBg — light background tint for badges / pill labels.
 */
export function getRiskBg(levelOrScore) {
  const level =
    typeof levelOrScore === "number" ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case "critical": return "#FEF2F2";
    case "high":     return "#FFF7ED";
    case "medium":   return "#FFFBEB";
    case "low":
    default:         return "#F0FDF4";
  }
}

/**
 * getRiskBorder — subtle border color for badges.
 */
export function getRiskBorder(levelOrScore) {
  const level =
    typeof levelOrScore === "number" ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case "critical": return "#FECACA";
    case "high":     return "#FED7AA";
    case "medium":   return "#FDE68A";
    case "low":
    default:         return "#BBF7D0";
  }
}

/**
 * getRiskLabel — human-readable label.
 */
export function getRiskLabel(levelOrScore) {
  const level =
    typeof levelOrScore === "number" ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case "critical": return "Critical";
    case "high":     return "High";
    case "medium":   return "Medium";
    case "low":
    default:         return "Low";
  }
}

/**
 * formatCurrency — Indian rupee notation (L / Cr).
 */
export function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

/**
 * formatNumber — Indian-locale number formatting.
 */
export function formatNumber(n) {
  return n.toLocaleString("en-IN");
}
