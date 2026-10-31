import React, { useState, useEffect } from "react";
import StatCard from "./components/StatCard";
import { DifficultyPie, CategoryBar } from "./components/Charts";
import ActivityFeed from "./components/ActivityFeed";
import ActivityHeatmap from "./components/ActivityHeatmap";
import MovingAverageCard from "./components/MovingAverageCard";
import InsightsSection from "./components/InsightsSection";
import InsightsHighlightCard from "./components/InsightsHighlightCard";
import ProblemLibrary from "./components/ProblemLibrary";
import SubmissionTester from "./components/SubmissionTester";
import ExtensionPopupModal from "./components/ExtensionPopupModal";
import SettingsModal from "./components/SettingsModal";
import { StatsService } from "./services/statsService";
import { BulkSyncService } from "./services/bulkSyncService";
import { triggerCSVDownload } from "./utils/csvExport";
import { AppSettings, StatsData, SubmissionItem, SyncResponse } from "./types";

const DEFAULT_SETTINGS: AppSettings = {
  githubRepo: "Ishank2301/LeetSync-Pro",
  githubToken: "",
  branch: "main",
  folderStructure: "difficulty",
  leetcodeUsername: "",
  leetcodeSession: "",
  preferences: {
    submitOnlyNew: false,
    keepMultipleSubmissions: true,
    addSubmissionNote: true,
    lastSyncStatus: {
      success: false,
      message: "You have not logged in to LeetCode. Please log in for syncing problems.",
      timestamp: Date.now() - 41 * 60 * 1000,
    },
  },
};

const SETTINGS_STORAGE_KEY = "leetsync_pro_settings";

export default function App() {
  const [stats, setStats] = useState<StatsData>(() => StatsService.getStats());
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<"overview" | "problems" | "revision" | "insights">("overview");
  const [bulkState, setBulkState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [toast, setToast] = useState<{ msg: string; type: "info" | "success" | "error" } | null>(null);

  // Modals
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  function showToast(msg: string, type: "info" | "success" | "error" = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }

  function handleSaveSettings(newSettings: AppSettings) {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      showToast("⚙ Settings updated", "success");
    } catch (e) {
      console.warn("Failed to save settings", e);
    }
  }

  function refreshStats() {
    const fresh = StatsService.getStats();
    setStats(fresh);
  }

  async function handleBulkSync() {
    setBulkState("loading");
    try {
      const bulkService = new BulkSyncService();
      const result = await bulkService.run(20);
      refreshStats();
      if (result.synced > 0) {
        showToast(
          `✅ Bulk sync completed: ${result.synced} synced, ${result.skipped} skipped`,
          "success"
        );
      } else if (result.skipped > 0) {
        showToast(`ℹ Bulk sync: All ${result.skipped} problems already synced`, "info");
      } else {
        showToast(`✅ Bulk sync checked: 0 new submissions`, "info");
      }
      setBulkState("done");
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      showToast(`❌ Bulk sync notice: ${err}`, "error");
      setBulkState("error");
    } finally {
      setTimeout(() => setBulkState("idle"), 3000);
    }
  }

  function handleTesterSuccess(res: SyncResponse) {
    refreshStats();
    showToast(`⚡ ${res.message} [${res.category}]`, "success");
  }

  function handleUpdateProblem(id: string, updates: Partial<SubmissionItem>) {
    const updated = StatsService.updateProblem(id, updates);
    setStats(updated);
  }

  function handleDeleteProblem(id: string) {
    const updated = StatsService.deleteProblem(id);
    setStats(updated);
    showToast("Problem removed", "info");
  }

  function handleDownloadLogs() {
    try {
      const filename = triggerCSVDownload(stats.history);
      showToast(`📥 Downloaded ${stats.history.length} problem sync logs (${filename})`, "success");
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      showToast(`❌ Failed to export CSV: ${err}`, "error");
    }
  }

  const diff = stats.difficulty;
  const cats = stats.categories;
  const reviewProblems = stats.history.filter((p) => p.status === "Review");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--accent)",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("overview")}
          >
            <span>⚡ LEETSYNC PRO</span>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
              }}
              title="Sync Engine Online"
            />
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: "flex", gap: 4, marginLeft: 16 }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                background: activeTab === "overview" ? "var(--surface2)" : "transparent",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                color: activeTab === "overview" ? "var(--accent)" : "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("problems")}
              style={{
                background: activeTab === "problems" ? "var(--surface2)" : "transparent",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                color: activeTab === "problems" ? "var(--accent)" : "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              All Problems ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("revision")}
              style={{
                background: activeTab === "revision" ? "var(--surface2)" : "transparent",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                color: activeTab === "revision" ? "#f59e0b" : "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>Revision Queue</span>
              {reviewProblems.length > 0 && (
                <span
                  style={{
                    background: "#f59e0b22",
                    border: "1px solid #f59e0b",
                    color: "#f59e0b",
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 10,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {reviewProblems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              style={{
                background: activeTab === "insights" ? "var(--surface2)" : "transparent",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                color: activeTab === "insights" ? "#f59e0b" : "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              title="Circadian rhythm, consistency grading, and peak productivity hours"
            >
              <span>💡 Insights</span>
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setIsExtensionOpen(true)}
            style={{
              background: "#1a2233",
              color: "#38bdf8",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Open interactive Chrome Extension popup view"
          >
            🧩 Extension View
          </button>

          <button
            onClick={() => setIsTesterOpen(true)}
            style={{
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Simulate accepted problem capture and categorize"
          >
            ⚡ Test Sync
          </button>

          <button
            onClick={handleBulkSync}
            disabled={bulkState === "loading"}
            style={{
              background: bulkState === "loading" ? "#374151" : "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: bulkState === "loading" ? "default" : "pointer",
              opacity: bulkState === "loading" ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {bulkState === "loading" ? "⏳ Syncing…" : "⬆ Bulk Sync"}
          </button>

          <button
            onClick={handleDownloadLogs}
            style={{
              background: "#1e293b",
              color: "#38bdf8",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: "7px 13px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Download CSV of all synced problem submissions for personal record-keeping"
            aria-label="Download All Sync Logs"
          >
            📥 Download Sync Logs
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: "#1a2233",
              color: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: "7px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
            title="Settings & Repository Config"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1160, margin: "0 auto", width: "100%" }}>
        {/* TAB 1: OVERVIEW & DASHBOARD */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Stat Cards Section */}
            <section>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Overview</span>
                <hr style={{ flex: 1, height: 1, background: "var(--border)", border: "none" }} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                <StatCard label="Total Solved" value={stats.total} color="var(--accent)" sub="unique problems" />
                <StatCard label="Easy" value={diff.Easy} color="var(--easy)" />
                <StatCard label="Medium" value={diff.Medium} color="var(--medium)" />
                <StatCard label="Hard" value={diff.Hard} color="var(--hard)" />
                <StatCard
                  label="Categories"
                  value={Object.keys(cats).length}
                  color="var(--blue)"
                  sub="distinct topics"
                />
                <StatCard
                  label="Streak"
                  value={`${stats.streak.currentStreak}d`}
                  color="#f89f1b"
                  sub={`Best: ${stats.streak.longestStreak} days`}
                />
              </div>
            </section>

            {/* Submission Heatmap Section */}
            <section>
              <ActivityHeatmap
                dailyActivity={stats.dailyActivity}
                currentStreak={stats.streak.currentStreak}
                longestStreak={stats.streak.longestStreak}
              />
            </section>

            {/* 7-Day Moving Average Productivity Trends Section */}
            <section>
              <MovingAverageCard dailyActivity={stats.dailyActivity} />
            </section>

            {/* Insights Highlight Card */}
            <section>
              <InsightsHighlightCard
                submissions={stats.history}
                dailyActivity={stats.dailyActivity}
                currentStreak={stats.streak.currentStreak}
                longestStreak={stats.streak.longestStreak}
                onOpenFullInsights={() => setActiveTab("insights")}
              />
            </section>

            {/* Breakdown Charts Section */}
            <section>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Breakdown</span>
                <hr style={{ flex: 1, height: 1, background: "var(--border)", border: "none" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "20px 20px 12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 12,
                    }}
                  >
                    BY DIFFICULTY
                  </div>
                  <DifficultyPie data={diff} />
                </div>

                <div
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "20px 20px 12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 12,
                    }}
                  >
                    BY TOPIC CATEGORY
                  </div>
                  <CategoryBar data={cats} />
                </div>
              </div>
            </section>

            {/* Recent Activity Section */}
            <section>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span>Recent Activity</span>
                  <hr style={{ flex: 1, height: 1, background: "var(--border)", border: "none" }} />
                </div>
                <button
                  onClick={() => setActiveTab("problems")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--blue)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  View All in Table →
                </button>
              </div>

              <ActivityFeed history={stats.history} />
            </section>
          </div>
        )}

        {/* TAB 2: PROBLEM LIBRARY TABLE */}
        {activeTab === "problems" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Problem Catalog & Spaced Practice</span>
              <hr style={{ flex: 1, height: 1, background: "var(--border)", border: "none" }} />
            </div>

            <ProblemLibrary
              problems={stats.history}
              onUpdateProblem={handleUpdateProblem}
              onDeleteProblem={handleDeleteProblem}
            />
          </div>
        )}

        {/* TAB 3: REVISION QUEUE */}
        {activeTab === "revision" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Due for Practice & Review</span>
              <hr style={{ flex: 1, height: 1, background: "var(--border)", border: "none" }} />
            </div>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "20px",
              }}
            >
              <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: 13 }}>
                These are problems you have flagged for revision. Regularly practicing problems marked for review prevents memory decay for upcoming technical interviews.
              </p>

              {reviewProblems.length === 0 ? (
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
                  🎉 Great job! You have no problems currently pending review. Mark problems as &quot;Needs Review&quot; in the All Problems table to add them here.
                </div>
              ) : (
                <ProblemLibrary
                  problems={reviewProblems}
                  onUpdateProblem={handleUpdateProblem}
                  onDeleteProblem={handleDeleteProblem}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 4: INSIGHTS & CIRCADIAN FOCUS */}
        {activeTab === "insights" && (
          <InsightsSection
            submissions={stats.history}
            dailyActivity={stats.dailyActivity}
            currentStreak={stats.streak.currentStreak}
            longestStreak={stats.streak.longestStreak}
            onNavigateToProblems={() => setActiveTab("problems")}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div>
          <span>Target Repository: </span>
          <a
            href={`https://github.com/${settings.githubRepo}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--blue)" }}
          >
            {settings.githubRepo}
          </a>
          <span> ({settings.branch})</span>
        </div>

        <div>
          <span>LeetSync Pro · Intelligent Categorizer & Sync Engine</span>
        </div>
      </footer>

      {/* Modals */}
      <SubmissionTester
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        onSuccess={handleTesterSuccess}
      />

      <ExtensionPopupModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
        stats={stats}
        settings={settings}
        onSavePreferences={(prefs) => {
          handleSaveSettings({ ...settings, preferences: prefs });
        }}
        onTriggerBulkSync={handleBulkSync}
        isSyncing={bulkState === "loading"}
        onOpenSettings={() => {
          setIsExtensionOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onStatsChange={setStats}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--surface)",
            border: `1px solid ${
              toast.type === "error"
                ? "#ef4444"
                : toast.type === "success"
                ? "#22c55e"
                : "var(--border)"
            }`,
            borderRadius: 8,
            padding: "12px 18px",
            fontSize: 13,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            gap: 12,
            alignItems: "center",
            maxWidth: 380,
          }}
        >
          <span>{toast.msg}</span>
          <span
            style={{ cursor: "pointer", color: "var(--muted)", marginLeft: "auto" }}
            onClick={() => setToast(null)}
          >
            ✕
          </span>
        </div>
      )}
    </div>
  );
}
