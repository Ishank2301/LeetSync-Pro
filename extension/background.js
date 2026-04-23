// background.js — LeetSync Pro Service Worker

const API_BASE = "http://localhost:8000/api/v1";

// ── Message handler ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SYNC_SUBMISSION") {
    handleSync(request.payload);
  }
  if (request.action === "BULK_SYNC") {
    handleBulkSync(request.limit ?? 20);
  }
  // Must return true to keep the message channel open for async responses
  return true;
});

// ── Single submission sync ─────────────────────────────────────────────────────

async function handleSync(payload) {
  try {
    const resp = await fetch(`${API_BASE}/submission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${err}`);
    }

    const data = await resp.json();
    console.log("[LeetSync Pro] ✅ Sync success:", data);

    notify(
      "✅ LeetSync Pro — Synced!",
      `${payload.title} → ${data.category}\n${data.github_url}`
    );

    // Persist last sync result for popup display
    await chrome.storage.local.set({ lastSync: { ...data, title: payload.title, ts: Date.now() } });

  } catch (err) {
    console.error("[LeetSync Pro] ❌ Sync failed:", err.message);
    notify("❌ LeetSync Pro — Sync Failed", err.message);
  }
}

// ── Bulk sync ──────────────────────────────────────────────────────────────────

async function handleBulkSync(limit) {
  try {
    notify("⏳ LeetSync Pro", `Starting bulk sync of last ${limit} submissions…`);

    const resp = await fetch(`${API_BASE}/bulk-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    notify(
      "✅ LeetSync Pro — Bulk Sync Done",
      `Synced: ${data.synced} | Skipped: ${data.skipped} | Errors: ${data.errors}`
    );
    console.log("[LeetSync Pro] Bulk sync result:", data);

  } catch (err) {
    console.error("[LeetSync Pro] Bulk sync error:", err.message);
    notify("❌ LeetSync Pro — Bulk Sync Failed", err.message);
  }
}

// ── Chrome notification helper ─────────────────────────────────────────────────

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/lcp_icon.png",
    title,
    message,
    priority: 1,
  });
}
