import React, { useState } from "react";
import { AppSettings, StatsData } from "../types";
import { StatsService } from "../services/statsService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onStatsChange: (newStats: StatsData) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onStatsChange,
}: SettingsModalProps) {
  const [githubRepo, setGithubRepo] = useState(settings.githubRepo);
  const [githubToken, setGithubToken] = useState(settings.githubToken);
  const [branch, setBranch] = useState(settings.branch);
  const [folderStructure, setFolderStructure] = useState(settings.folderStructure);
  const [leetcodeUsername, setLeetcodeUsername] = useState(settings.leetcodeUsername);
  const [leetcodeSession, setLeetcodeSession] = useState(settings.leetcodeSession);

  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSaveSettings({
      githubRepo,
      githubToken,
      branch,
      folderStructure,
      leetcodeUsername,
      leetcodeSession,
      preferences: settings.preferences,
    });
    onClose();
  }

  function handleExport() {
    const jsonStr = StatsService.exportJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leetsync_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    try {
      if (!importText.trim()) return;
      const updated = StatsService.importJSON(importText);
      onStatsChange(updated);
      setShowImport(false);
      setImportText("");
      alert("Progress imported successfully!");
    } catch (e: unknown) {
      alert("Failed to import JSON: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  function handleReset() {
    if (confirm("Are you sure you want to wipe your local problem stats? This cannot be undone.")) {
      const blank = StatsService.reset();
      onStatsChange(blank);
      onClose();
    }
  }

  function handleRestoreSeed() {
    if (confirm("Restore sample LeetCode problem data?")) {
      const seeded = StatsService.restoreSeed();
      onStatsChange(seeded);
      onClose();
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
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
          maxWidth: 580,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
            ⚙ Settings & Integrations
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* GitHub Config */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", letterSpacing: "0.08em" }}>
              GITHUB DESTINATION REPOSITORY
            </span>

            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text)", marginBottom: 4 }}>
                Repository (owner/repo)
              </label>
              <input
                type="text"
                placeholder="e.g. Ishank2301/LeetSync-Pro"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text)", marginBottom: 4 }}>
                  Personal Access Token (optional)
                </label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text)", marginBottom: 4 }}>
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", height: 1, background: "var(--border)", margin: "4px 0" }} />

          {/* LeetCode Sync Config */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", letterSpacing: "0.08em" }}>
              LEETCODE SYNC OPTIONS
            </span>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text)", marginBottom: 4 }}>
                  LeetCode Username
                </label>
                <input
                  type="text"
                  placeholder="LeetCode profile name"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text)", marginBottom: 4 }}>
                  Folder Structure
                </label>
                <select
                  value={folderStructure}
                  onChange={(e) => setFolderStructure(e.target.value as "difficulty" | "category")}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                >
                  <option value="difficulty">solutions/{`{Difficulty}`}/{`{Title}`}.{`{ext}`}</option>
                  <option value="category">solutions/{`{Category}`}/{`{Title}`}.{`{ext}`}</option>
                </select>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", height: 1, background: "var(--border)", margin: "4px 0" }} />

          {/* Backup & Data Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", letterSpacing: "0.08em" }}>
              DATA MANAGEMENT & BACKUP
            </span>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleExport}
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                📥 Export JSON Backup
              </button>

              <button
                type="button"
                onClick={() => setShowImport(!showImport)}
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                📤 Import JSON
              </button>

              <button
                type="button"
                onClick={handleRestoreSeed}
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--blue)",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                ↺ Load Example Solved Set
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: "#450a0a",
                  border: "1px solid #7f1d1d",
                  color: "#fca5a5",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                🗑 Wipe Stats
              </button>
            </div>

            {showImport && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  rows={4}
                  placeholder="Paste JSON stats backup content here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#080b11",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: 8,
                    color: "var(--text)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleImport}
                  style={{
                    alignSelf: "flex-end",
                    background: "var(--blue)",
                    color: "#fff",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Apply Import
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 7,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                background: "#16a34a",
                border: "none",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
