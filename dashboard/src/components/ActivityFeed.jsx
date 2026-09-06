import React from "react";

const DIFF_COLOR = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

const styles = {
  list: { display: "flex", flexDirection: "column", gap: 8 },
  item: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  left: { display: "flex", flexDirection: "column", gap: 2 },
  title: { fontWeight: 500, fontSize: 13 },
  meta: { fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" },
  tag: {
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    padding: "2px 8px",
    borderRadius: 4,
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  link: { fontSize: 11, color: "var(--blue)", whiteSpace: "nowrap" },
};

export default function ActivityFeed({ history = [] }) {
  const recent = [...history].reverse().slice(0, 20);

  if (!recent.length)
    return <p style={{ color: "var(--muted)", fontSize: 13 }}>No submissions yet.</p>;

  return (
    <div style={styles.list}>
      {recent.map((item, i) => {
        const color = DIFF_COLOR[item.difficulty] || "#64748b";
        const date = item.synced_at
          ? new Date(item.synced_at).toLocaleString()
          : "";
        return (
          <div key={i} style={styles.item}>
            <div style={styles.left}>
              <span style={styles.title}>{item.title}</span>
              <span style={styles.meta}>
                {item.language} · {item.category} · {date}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ ...styles.tag, color, borderColor: color }}>
                {item.difficulty}
              </span>
              {item.github_url && (
                <a href={item.github_url} target="_blank" rel="noreferrer" style={styles.link}>
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
