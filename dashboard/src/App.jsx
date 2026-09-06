import React, { useState } from "react";
import StatCard from "./components/StatCard.jsx";
import { DifficultyPie, CategoryBar } from "./components/Charts.jsx";
import ActivityFeed from "./components/ActivityFeed.jsx";
import { useStats, triggerBulkSync } from "./hooks/useStats.js";

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  layout: { minHeight: "100vh", display: "flex", flexDirection: "column" },

  topbar: {
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    fontSize: 16,
    color: "var(--accent)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
  },

  main: { flex: 1, padding: "32px", maxWidth: 1100, margin: "0 auto", width: "100%" },

  section: { marginBottom: 36 },
  sectionTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  hr: { flex: 1, height: 1, background: "var(--border)", border: "none" },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: 16,
  },
  chartCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "20px 20px 12px",
  },
  chartTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--muted)",
    marginBottom: 16,
  },

  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    borderRadius: 7,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "opacity .15s, transform .1s",
  },

  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "12px 18px",
    fontSize: 13,
    boxShadow: "0 8px 24px #00000060",
    zIndex: 100,
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function App() {
  const { stats, loading, error, refetch } = useStats();
  const [bulkState, setBulkState] = useState("idle"); // idle | loading | done | error
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleBulkSync() {
    setBulkState("loading");
    try {
      const result = await triggerBulkSync(20);
      showToast(`✅ Bulk sync: ${result.synced} synced, ${result.errors} errors`, "success");
      setBulkState("done");
      refetch();
    } catch (e) {
      showToast(`❌ Bulk sync failed: ${e.message}`, "error");
      setBulkState("error");
    } finally {
      setTimeout(() => setBulkState("idle"), 3000);
    }
  }

  const diff = stats?.difficulty || {};
  const cats = stats?.categories || {};

  return (
    <div style={s.layout}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.brand}>
          <span>⚡ LEETSYNC PRO</span>
          {!error && <div style={s.dot} title="Backend online" />}
          {error && <div style={{ ...s.dot, background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} title="Backend offline" />}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ ...s.btn, background: "#1a2233", color: "var(--text)", border: "1px solid var(--border)" }}
            onClick={refetch}
          >
            ↻ Refresh
          </button>
          <button
            style={{ ...s.btn, background: bulkState === "loading" ? "#374151" : "#16a34a", color: "#fff", opacity: bulkState === "loading" ? 0.7 : 1 }}
            onClick={handleBulkSync}
            disabled={bulkState === "loading"}
          >
            {bulkState === "loading" ? "⏳ Syncing…" : "⬆ Bulk Sync"}
          </button>
        </div>
      </div>

      {/* Main */}
      <main style={s.main}>

        {error && (
          <div style={{ background: "#1c0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "12px 16px", marginBottom: 24, color: "#fca5a5", fontSize: 13 }}>
            ⚠ Cannot reach backend at <code>localhost:8000</code> — make sure <code>uvicorn app.main:app --reload</code> is running.
          </div>
        )}

        {/* Stats */}
        <div style={s.section}>
          <div style={s.sectionTitle}><span>Overview</span><hr style={s.hr} /></div>
          <div style={s.statsGrid}>
            <StatCard label="Total Solved" value={loading ? "…" : stats?.total} color="var(--accent)" sub="unique problems" />
            <StatCard label="Easy" value={loading ? "…" : diff.Easy} color="var(--easy)" />
            <StatCard label="Medium" value={loading ? "…" : diff.Medium} color="var(--medium)" />
            <StatCard label="Hard" value={loading ? "…" : diff.Hard} color="var(--hard)" />
            <StatCard label="Categories" value={loading ? "…" : Object.keys(cats).length} color="var(--blue)" sub="distinct topics" />
          </div>
        </div>

        {/* Charts */}
        <div style={s.section}>
          <div style={s.sectionTitle}><span>Breakdown</span><hr style={s.hr} /></div>
          <div style={s.chartsGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>BY DIFFICULTY</div>
              <DifficultyPie data={diff} />
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>BY CATEGORY</div>
              <CategoryBar data={cats} />
            </div>
          </div>
        </div>

        {/* Activity */}
        <div style={s.section}>
          <div style={s.sectionTitle}><span>Recent Activity</span><hr style={s.hr} /></div>
          <ActivityFeed history={stats?.history || []} />
        </div>

      </main>

      {/* Toast */}
      {toast && (
        <div style={s.toast}>
          <span>{toast.msg}</span>
          <span style={{ cursor: "pointer", color: "var(--muted)" }} onClick={() => setToast(null)}>✕</span>
        </div>
      )}
    </div>
  );
}
