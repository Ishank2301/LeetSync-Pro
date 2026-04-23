// popup.js
const API_BASE = "http://localhost:8000/api/v1";

async function init() {
  // Health check
  try {
    const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    document.getElementById("backend-status").textContent =
      r.ok ? "🟢 Running" : "🔴 Error";
  } catch {
    document.getElementById("backend-status").textContent = "🔴 Offline";
  }

  // Stats
  try {
    const r = await fetch(`${API_BASE}/stats`);
    const s = await r.json();
    document.getElementById("total").textContent  = s.total ?? 0;
    document.getElementById("easy").textContent   = s.difficulty?.Easy ?? 0;
    document.getElementById("medium").textContent = s.difficulty?.Medium ?? 0;
  } catch { /* silently skip */ }

  // Last sync from storage
  const { lastSync } = await chrome.storage.local.get("lastSync");
  if (lastSync) {
    document.getElementById("last-sync").innerHTML = `
      <strong>${lastSync.title}</strong>
      <span class="tag">${lastSync.category}</span><br/>
      <a href="${lastSync.github_url}" target="_blank">View on GitHub ↗</a>
    `;
  }
}

document.getElementById("btn-bulk").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "BULK_SYNC", limit: 20 });
  window.close();
});

document.getElementById("btn-dash").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5173" });
});

init();
