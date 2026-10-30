import React, { useState } from "react";
import { SubmissionItem } from "../types";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const styles: Record<string, React.CSSProperties> = {
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
  left: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  title: {
    fontWeight: 500,
    fontSize: 13,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  meta: {
    fontSize: 11,
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    padding: "2px 8px",
    borderRadius: 4,
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  link: { fontSize: 11, color: "var(--blue)", whiteSpace: "nowrap" },
  inspectBtn: {
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    fontSize: 11,
    cursor: "pointer",
    padding: "2px 4px",
    textDecoration: "underline",
  },
  codePreview: {
    marginTop: 8,
    padding: 10,
    background: "#080b11",
    border: "1px solid var(--border)",
    borderRadius: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "#a5b4fc",
    maxHeight: 180,
    overflowY: "auto",
    whiteSpace: "pre-wrap",
  },
};

interface ActivityFeedProps {
  history?: SubmissionItem[];
}

export default function ActivityFeed({ history = [] }: ActivityFeedProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const recent = [...history].reverse().slice(0, 20);

  if (!recent.length) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "28px 16px",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        No submissions yet — trigger a sync or run a test submission above!
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {recent.map((item, i) => {
        const color = DIFF_COLOR[item.difficulty] || "#64748b";
        let date = "";
        try {
          if (item.synced_at) {
            date = new Date(item.synced_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        } catch {
          date = item.synced_at || "";
        }

        const isExpanded = expandedIndex === i;

        return (
          <div
            key={`${item.title}-${item.synced_at || i}`}
            style={{
              ...styles.item,
              flexDirection: isExpanded ? "column" : "row",
              alignItems: isExpanded ? "stretch" : "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 12 }}>
              <div style={styles.left}>
                <span style={styles.title} title={item.title}>
                  {item.title}
                </span>
                <span style={styles.meta}>
                  <span>{item.language}</span>
                  <span>·</span>
                  <span>{item.category}</span>
                  {date && (
                    <>
                      <span>·</span>
                      <span>{date}</span>
                    </>
                  )}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {item.code && (
                  <button
                    style={styles.inspectBtn}
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  >
                    {isExpanded ? "Hide Code" : "View Code"}
                  </button>
                )}
                <span style={{ ...styles.tag, color, borderColor: color }}>
                  {item.difficulty}
                </span>
                {item.github_url && (
                  <a
                    href={item.github_url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                    title="View file on GitHub"
                  >
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>

            {isExpanded && item.code && (
              <div style={styles.codePreview}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--muted)", fontSize: 10 }}>
                  <span>Source ({item.language})</span>
                  <span>Target: solutions/{item.difficulty}/{item.title.replace(/\s+/g, "_")}.{item.language === "python3" ? "py" : item.language}</span>
                </div>
                <code>{item.code}</code>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
