import React, { useState, useMemo } from "react";
import { Difficulty, ProblemStatus, SubmissionItem } from "../types";
import { triggerCSVDownload } from "../utils/csvExport";

const DIFF_COLORS: Record<string, string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

interface ProblemLibraryProps {
  problems: SubmissionItem[];
  onUpdateProblem: (id: string, updates: Partial<SubmissionItem>) => void;
  onDeleteProblem: (id: string) => void;
}

export default function ProblemLibrary({
  problems,
  onUpdateProblem,
  onDeleteProblem,
}: ProblemLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeProblem, setActiveProblem] = useState<SubmissionItem | null>(null);

  // Notes edit state inside detail view
  const [editingNotes, setEditingNotes] = useState("");
  const [editingTimeComplexity, setEditingTimeComplexity] = useState("");
  const [editingSpaceComplexity, setEditingSpaceComplexity] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedDifficulty !== "All" && p.difficulty !== selectedDifficulty) return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedStatus !== "All" && (p.status || "Solved") !== selectedStatus) return false;
      if (onlyFavorites && !p.isFavorite) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(query);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(query));
        const notesMatch = p.notes?.toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        if (!titleMatch && !tagMatch && !notesMatch && !catMatch) return false;
      }
      return true;
    });
  }, [problems, selectedDifficulty, selectedCategory, selectedStatus, onlyFavorites, searchTerm]);

  function openDetail(p: SubmissionItem) {
    setActiveProblem(p);
    setEditingNotes(p.notes || "");
    setEditingTimeComplexity(p.timeComplexity || "");
    setEditingSpaceComplexity(p.spaceComplexity || "");
  }

  function saveDetail() {
    if (!activeProblem) return;
    onUpdateProblem(activeProblem.id, {
      notes: editingNotes,
      timeComplexity: editingTimeComplexity,
      spaceComplexity: editingSpaceComplexity,
    });
    setActiveProblem((prev) =>
      prev
        ? {
            ...prev,
            notes: editingNotes,
            timeComplexity: editingTimeComplexity,
            spaceComplexity: editingSpaceComplexity,
          }
        : null
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px",
      }}
    >
      {/* Controls & Filter Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10, flex: "1 1 260px", minWidth: 220 }}>
          <input
            type="text"
            placeholder="🔍 Search problems, tags, complexity, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "7px 12px",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 10px",
              color: "var(--text)",
              fontSize: 12,
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 10px",
              color: "var(--text)",
              fontSize: 12,
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 10px",
              color: "var(--text)",
              fontSize: 12,
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Solved">Solved</option>
            <option value="Review">Needs Review</option>
            <option value="Mastered">Mastered</option>
          </select>

          {/* Star filter */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            style={{
              background: onlyFavorites ? "#f89f1b22" : "var(--surface2)",
              border: `1px solid ${onlyFavorites ? "#f89f1b" : "var(--border)"}`,
              color: onlyFavorites ? "#f89f1b" : "var(--muted)",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ★ Starred
          </button>
        </div>
      </div>

      {/* Problem Count Summary */}
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--muted)",
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>
            Showing {filteredProblems.length} of {problems.length} solved problems
          </span>
          <button
            onClick={() => triggerCSVDownload(filteredProblems)}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "#38bdf8",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
            }}
            title="Download CSV for currently filtered problem submissions"
            aria-label="Download Filtered Sync Logs"
          >
            📥 Export CSV
          </button>
        </div>
        {searchTerm && (
          <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => setSearchTerm("")}>
            Clear search ✕
          </span>
        )}
      </div>

      {/* Table */}
      {filteredProblems.length === 0 ? (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 13,
            background: "var(--surface2)",
            borderRadius: 8,
          }}
        >
          No problems found matching the selected filters.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "8px 10px", width: 36 }}>★</th>
                <th style={{ padding: "8px 10px" }}>Problem</th>
                <th style={{ padding: "8px 10px", width: 90 }}>Difficulty</th>
                <th style={{ padding: "8px 10px", width: 140 }}>Category</th>
                <th style={{ padding: "8px 10px", width: 90 }}>Lang</th>
                <th style={{ padding: "8px 10px", width: 110 }}>Complexity</th>
                <th style={{ padding: "8px 10px", width: 120 }}>Status</th>
                <th style={{ padding: "8px 10px", textAlign: "right", width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((p) => {
                const diffColor = DIFF_COLORS[p.difficulty] || "#64748b";
                const isFavorite = !!p.isFavorite;
                const status = p.status || "Solved";

                return (
                  <tr
                    key={p.id || p.title}
                    style={{
                      borderBottom: "1px solid #16202f",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {/* Favorite star */}
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => onUpdateProblem(p.id, { isFavorite: !isFavorite })}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: isFavorite ? "#f89f1b" : "#475569",
                          fontSize: 15,
                          padding: 0,
                        }}
                        title={isFavorite ? "Unstar problem" : "Star problem"}
                      >
                        {isFavorite ? "★" : "☆"}
                      </button>
                    </td>

                    {/* Problem Title & Tags */}
                    <td style={{ padding: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text)",
                            cursor: "pointer",
                          }}
                          onClick={() => openDetail(p)}
                        >
                          {p.title}
                        </span>
                        {p.notes && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--muted)",
                              fontStyle: "italic",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 320,
                            }}
                          >
                            📝 {p.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          padding: "2px 7px",
                          borderRadius: 4,
                          border: `1px solid ${diffColor}`,
                          color: diffColor,
                          fontWeight: 600,
                        }}
                      >
                        {p.difficulty}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "10px", color: "#94a3b8", fontSize: 12 }}>
                      {p.category}
                    </td>

                    {/* Language */}
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                      {p.language}
                    </td>

                    {/* Complexity */}
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#60a5fa" }}>
                      {p.timeComplexity || "—"}
                    </td>

                    {/* Status dropdown */}
                    <td style={{ padding: "10px" }}>
                      <select
                        value={status}
                        onChange={(e) =>
                          onUpdateProblem(p.id, { status: e.target.value as ProblemStatus })
                        }
                        style={{
                          background:
                            status === "Mastered"
                              ? "#14532d"
                              : status === "Review"
                              ? "#78350f"
                              : "var(--surface2)",
                          border: "1px solid var(--border)",
                          borderRadius: 4,
                          padding: "3px 6px",
                          color: "#f1f5f9",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        <option value="Solved">✓ Solved</option>
                        <option value="Review">⏳ Review</option>
                        <option value="Mastered">★ Mastered</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <button
                          onClick={() => openDetail(p)}
                          style={{
                            background: "var(--surface2)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            borderRadius: 4,
                            padding: "3px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                          title="View code and edit notes"
                        >
                          Code & Notes
                        </button>
                        {p.github_url && (
                          <a
                            href={p.github_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "var(--blue)",
                              fontSize: 11,
                              padding: "3px 4px",
                            }}
                            title="Open on GitHub"
                          >
                            ↗
                          </a>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${p.title}" from your tracker?`)) {
                              onDeleteProblem(p.id);
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#64748b",
                            cursor: "pointer",
                            fontSize: 12,
                            padding: "3px",
                          }}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Problem Code & Notes Modal */}
      {activeProblem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: "var(--text)" }}>
                    {activeProblem.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: `1px solid ${DIFF_COLORS[activeProblem.difficulty]}`,
                      color: DIFF_COLORS[activeProblem.difficulty],
                    }}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--blue)",
                      background: "#1f6feb22",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {activeProblem.category}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12 }}>
                  {activeProblem.url && (
                    <a href={activeProblem.url} target="_blank" rel="noreferrer" style={{ color: "var(--blue)" }}>
                      LeetCode Problem ↗
                    </a>
                  )}
                  {activeProblem.github_url && (
                    <a href={activeProblem.github_url} target="_blank" rel="noreferrer" style={{ color: "#a5b4fc" }}>
                      GitHub File ↗
                    </a>
                  )}
                  <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    Synced: {new Date(activeProblem.synced_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveProblem(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Complexity & Status Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                    TIME COMPLEXITY
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O(n log n)"
                    value={editingTimeComplexity}
                    onChange={(e) => setEditingTimeComplexity(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: "var(--text)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                    SPACE COMPLEXITY
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O(1)"
                    value={editingSpaceComplexity}
                    onChange={(e) => setEditingSpaceComplexity(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: "var(--text)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                    PRACTICE STATUS
                  </label>
                  <select
                    value={activeProblem.status || "Solved"}
                    onChange={(e) => {
                      const newStatus = e.target.value as ProblemStatus;
                      onUpdateProblem(activeProblem.id, { status: newStatus });
                      setActiveProblem((p) => (p ? { ...p, status: newStatus } : null));
                    }}
                    style={{
                      width: "100%",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: "var(--text)",
                      fontSize: 12,
                    }}
                  >
                    <option value="Solved">✓ Solved</option>
                    <option value="Review">⏳ Needs Review</option>
                    <option value="Mastered">★ Mastered</option>
                  </select>
                </div>
              </div>

              {/* Personal Notes / Interview Insights */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                  REVISION NOTES & INTUITION
                </label>
                <textarea
                  rows={3}
                  placeholder="Key observations, edge cases to watch out for, alternative solutions..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "var(--text)",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Code Box */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                    SAVED CODE ({activeProblem.language})
                  </label>
                  <button
                    onClick={() => {
                      if (activeProblem.code) {
                        navigator.clipboard.writeText(activeProblem.code);
                        alert("Code copied to clipboard!");
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--blue)",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Copy Code
                  </button>
                </div>
                <pre
                  style={{
                    background: "#080b11",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: 12,
                    color: "#e2e8f0",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    maxHeight: 280,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                >
                  <code>{activeProblem.code || "// No code saved for this problem"}</code>
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setActiveProblem(null)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={saveDetail}
                style={{
                  padding: "6px 18px",
                  borderRadius: 6,
                  background: "#16a34a",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
