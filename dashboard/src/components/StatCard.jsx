import React from "react";

const styles = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  value: {
    fontSize: 36,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    lineHeight: 1.1,
  },
  sub: {
    fontSize: 11,
    color: "var(--muted)",
    marginTop: 4,
  },
};

export default function StatCard({ label, value, color, sub }) {
  return (
    <div style={styles.card}>
      <span style={styles.label}>{label}</span>
      <span style={{ ...styles.value, color: color || "var(--text)" }}>{value ?? "—"}</span>
      {sub && <span style={styles.sub}>{sub}</span>}
    </div>
  );
}
