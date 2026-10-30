import React, { useState } from "react";
import { AppSettings, ExtensionSyncPreferences, StatsData } from "../types";

interface ExtensionPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StatsData;
  settings: AppSettings;
  onSavePreferences: (prefs: ExtensionSyncPreferences) => void;
  onTriggerBulkSync: () => Promise<void>;
  isSyncing: boolean;
  onOpenSettings?: () => void;
}

export default function ExtensionPopupModal({
  isOpen,
  onClose,
  stats,
  settings,
  onSavePreferences,
  onTriggerBulkSync,
  isSyncing,
  onOpenSettings,
}: ExtensionPopupModalProps) {
  const prefs = settings.preferences || {
    submitOnlyNew: false,
    keepMultipleSubmissions: true,
    addSubmissionNote: true,
    lastSyncStatus: {
      success: false,
      message: "You have not logged in to LeetCode. Please log in for syncing problems.",
      timestamp: Date.now() - 41 * 60 * 1000, // 41 minutes ago to match screenshot!
    },
  };

  const [submitOnlyNew, setSubmitOnlyNew] = useState(prefs.submitOnlyNew);
  const [keepMultipleSubmissions, setKeepMultipleSubmissions] = useState(
    prefs.keepMultipleSubmissions
  );
  const [addSubmissionNote, setAddSubmissionNote] = useState(prefs.addSubmissionNote);
  const [syncNotice, setSyncNotice] = useState<{
    success: boolean;
    message: string;
    timeText: string;
  }>(() => {
    if (prefs.lastSyncStatus) {
      const minutesAgo = Math.round((Date.now() - prefs.lastSyncStatus.timestamp) / 60000);
      return {
        success: prefs.lastSyncStatus.success,
        message: prefs.lastSyncStatus.message,
        timeText: minutesAgo <= 1 ? "Just now" : `${minutesAgo} minutes ago`,
      };
    }
    return {
      success: false,
      message: "You have not logged in to LeetCode. Please log in for syncing problems.",
      timeText: "41 minutes ago",
    };
  });

  if (!isOpen) return null;

  function updatePref(key: keyof ExtensionSyncPreferences, val: boolean) {
    const nextPrefs: ExtensionSyncPreferences = {
      submitOnlyNew: key === "submitOnlyNew" ? val : submitOnlyNew,
      keepMultipleSubmissions:
        key === "keepMultipleSubmissions" ? val : keepMultipleSubmissions,
      addSubmissionNote: key === "addSubmissionNote" ? val : addSubmissionNote,
      lastSyncStatus: prefs.lastSyncStatus,
    };

    if (key === "submitOnlyNew") setSubmitOnlyNew(val);
    if (key === "keepMultipleSubmissions") setKeepMultipleSubmissions(val);
    if (key === "addSubmissionNote") setAddSubmissionNote(val);

    onSavePreferences(nextPrefs);
  }

  async function handleSyncClick() {
    try {
      await onTriggerBulkSync();
      const updatedNotice = {
        success: true,
        message: `Successfully synced latest solutions to ${settings.githubRepo}.`,
        timeText: "Just now",
      };
      setSyncNotice(updatedNotice);
      onSavePreferences({
        submitOnlyNew,
        keepMultipleSubmissions,
        addSubmissionNote,
        lastSyncStatus: {
          success: true,
          message: updatedNotice.message,
          timestamp: Date.now(),
        },
      });
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      const failedNotice = {
        success: false,
        message: err || "You have not logged in to LeetCode. Please log in for syncing problems.",
        timeText: "Just now",
      };
      setSyncNotice(failedNotice);
      onSavePreferences({
        submitOnlyNew,
        keepMultipleSubmissions,
        addSubmissionNote,
        lastSyncStatus: {
          success: false,
          message: failedNotice.message,
          timestamp: Date.now(),
        },
      });
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Outer Extension Phone / Popup Frame matching the screenshot */}
      <div
        style={{
          width: 380,
          maxHeight: "92vh",
          background: "#0c1017",
          border: "1px solid #1f2736",
          borderRadius: 22,
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255,255,255,0.06)",
          overflowY: "auto",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'DM Sans', sans-serif",
          color: "#f1f5f9",
          padding: "20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
        }}
      >
        {/* Close Button top right */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: "50%",
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 14,
            zIndex: 10,
          }}
          title="Close Extension View"
        >
          ✕
        </button>

        {/* 1. Header: Logo, Tagline, Title, and Version */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Official LeetCode Tracker Logo */}
            <img
              src="/assets/logo-leetcode-tracker/Leetcode-tracker-128.png"
              alt="LeetCode Tracker"
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
                objectFit: "contain",
              }}
            />

            {/* Tagline and App Name */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#f59e0b",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                CODE. COMMIT. GROW.
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em", marginTop: 2 }}>
                LeetCode <span style={{ color: "#f59e0b" }}>Tracker</span>
              </div>
            </div>
          </div>

          {/* Version Badge */}
          <div
            style={{
              background: "#161c27",
              border: "1px solid #242d3d",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 500,
              color: "#8391a4",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            v2.0.5
          </div>
        </div>

        {/* 2. "Open linked repository" Bar */}
        <a
          href={`https://github.com/${settings.githubRepo}`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: "#121722",
            border: "1px solid #222b3b",
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "#f59e0b",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#171e2c";
            (e.currentTarget as HTMLElement).style.borderColor = "#f59e0b55";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#121722";
            (e.currentTarget as HTMLElement).style.borderColor = "#222b3b";
          }}
        >
          <span>Open linked repository</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {/* 3. Card: PREFERENCES / Sync settings */}
        <div
          style={{
            background: "#121722",
            border: "1px solid #1c2434",
            borderRadius: 16,
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#f59e0b",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                PREFERENCES
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                Sync settings
              </div>
            </div>

            {/* Gear Icon */}
            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#f59e0b",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Open Repository Settings"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          {/* Toggle 1: Submit only new solutions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                Submit only new solutions
              </div>
              <div style={{ fontSize: 11, color: "#828fa3", marginTop: 2, lineHeight: 1.3 }}>
                Skip commits when the saved code is unchanged.
              </div>
            </div>
            {/* iOS style toggle */}
            <button
              type="button"
              onClick={() => updatePref("submitOnlyNew", !submitOnlyNew)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: submitOnlyNew ? "#f59e0b" : "#2b3444",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s ease",
                flexShrink: 0,
                padding: 2,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: submitOnlyNew ? "#0d1117" : "#e2e8f0",
                  transform: submitOnlyNew ? "translateX(20px)" : "translateX(0px)",
                  transition: "transform 0.2s ease, background 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          <div style={{ height: 1, background: "#1b2333" }} />

          {/* Toggle 2: Keep multiple submissions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                Keep multiple submissions
              </div>
              <div style={{ fontSize: 11, color: "#828fa3", marginTop: 2, lineHeight: 1.3 }}>
                Store timestamped versions grouped by language.
              </div>
            </div>
            <button
              type="button"
              onClick={() => updatePref("keepMultipleSubmissions", !keepMultipleSubmissions)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: keepMultipleSubmissions ? "#f59e0b" : "#2b3444",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s ease",
                flexShrink: 0,
                padding: 2,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: keepMultipleSubmissions ? "#0d1117" : "#e2e8f0",
                  transform: keepMultipleSubmissions ? "translateX(20px)" : "translateX(0px)",
                  transition: "transform 0.2s ease, background 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>

          <div style={{ height: 1, background: "#1b2333" }} />

          {/* Toggle 3: Add a submission note */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                Add a submission note
              </div>
              <div style={{ fontSize: 11, color: "#828fa3", marginTop: 2, lineHeight: 1.3 }}>
                Prompt for an optional note before committing.
              </div>
            </div>
            <button
              type="button"
              onClick={() => updatePref("addSubmissionNote", !addSubmissionNote)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: addSubmissionNote ? "#f59e0b" : "#2b3444",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s ease",
                flexShrink: 0,
                padding: 2,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: addSubmissionNote ? "#0d1117" : "#e2e8f0",
                  transform: addSubmissionNote ? "translateX(20px)" : "translateX(0px)",
                  transition: "transform 0.2s ease, background 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>
        </div>

        {/* 4. Card: Sync your history */}
        <div
          style={{
            background: "#121722",
            border: "1px solid #1c2434",
            borderRadius: 16,
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            {/* Left: Icon and Text */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#1c2534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f59e0b",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>
                  Sync your history
                </div>
                <div style={{ fontSize: 11, color: "#828fa3", marginTop: 2, lineHeight: 1.25 }}>
                  Import previously accepted LeetCode submissions.
                </div>
              </div>
            </div>

            {/* Right: Sync Button */}
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              style={{
                background: "#f59e0b",
                color: "#0a0e17",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                fontWeight: 700,
                fontSize: 13,
                cursor: isSyncing ? "default" : "pointer",
                opacity: isSyncing ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isSyncing ? "Syncing…" : "Sync"}</span>
            </button>
          </div>

          {/* Status Message Line */}
          <div style={{ marginTop: 2 }}>
            <div
              style={{
                fontSize: 11,
                color: syncNotice.success ? "#4ade80" : "#f87171",
                lineHeight: 1.35,
              }}
            >
              {syncNotice.success ? (
                <>✓ {syncNotice.message}</>
              ) : (
                <>Last sync failed: {syncNotice.message}</>
              )}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
              {syncNotice.timeText}
            </div>
          </div>
        </div>

        {/* 5. Card: CONNECTION / Account */}
        <div
          style={{
            background: "#121722",
            border: "1px solid #1c2434",
            borderRadius: 16,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#f59e0b",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                CONNECTION
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                Account
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
              }}
              style={{
                background: "#1c2534",
                border: "1px solid #2b3548",
                color: "#cbd5e1",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Configure
            </button>
          </div>

          {/* GitHub Connection row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#18202d",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/assets/icons/github/github-mark-white.svg" alt="" style={{ width: 18, height: 18, opacity: 0.9 }} />
              <div>
                <div style={{ fontWeight: 600, color: "#ffffff" }}>{settings.githubRepo}</div>
                <div style={{ fontSize: 10, color: "#828fa3" }}>GitHub Repository</div>
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "var(--font-mono, monospace)", background: "#212836", padding: "2px 8px", borderRadius: 4 }}>
              {settings.branch}
            </span>
          </div>

          {/* LeetCode Connection status */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#18202d",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: settings.leetcodeUsername ? "#22c55e" : "#f59e0b" }} />
              <div>
                <div style={{ fontWeight: 600, color: "#ffffff" }}>
                  {settings.leetcodeUsername || "LeetCode Web Session"}
                </div>
                <div style={{ fontSize: 10, color: "#828fa3" }}>
                  {settings.leetcodeUsername ? "Logged in profile" : "Monaco Editor auto-detector active"}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 10, color: "#828fa3" }}>
              Active
            </span>
          </div>

          {/* Mini solved breakdown */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
              background: "#161c28",
              borderRadius: 8,
              padding: "8px",
              textAlign: "center",
              fontSize: 11,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "#ffffff" }}>{stats.total}</div>
              <div style={{ fontSize: 9, color: "#828fa3" }}>Total</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#3fb950" }}>{stats.difficulty.Easy}</div>
              <div style={{ fontSize: 9, color: "#828fa3" }}>Easy</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#f59e0b" }}>{stats.difficulty.Medium}</div>
              <div style={{ fontSize: 9, color: "#828fa3" }}>Medium</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#ef4444" }}>{stats.difficulty.Hard}</div>
              <div style={{ fontSize: 9, color: "#828fa3" }}>Hard</div>
            </div>
          </div>

          {/* Footer Action to open dashboard */}
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "9px",
              background: "#1e2837",
              color: "#38bdf8",
              border: "1px solid #2a374d",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>📊 Open Full Analytics Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
