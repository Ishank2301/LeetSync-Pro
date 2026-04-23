// content.js — LeetSync Pro
// Detects "Accepted" on LeetCode's SPA and extracts submission data.

console.log("[LeetSync Pro] Content script active.");

// ── State ─────────────────────────────────────────────────────────────────────
let lastDetectedUrl = "";
let syncInProgress = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a URL slug like "two-sum" → "Two Sum" */
function slugToTitle(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Read the active language from LeetCode's language selector button. */
function extractLanguage() {
  const selectors = [
    '[data-e2e-locator="console-language-selector"]',
    'button[id*="headlessui-menu-button"]',
    ".ant-select-selection-item",
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return "Unknown";
}

/** Read difficulty from the problem description panel. */
function extractDifficulty() {
  // New LeetCode UI uses a class like "text-difficulty-easy" / "-medium" / "-hard"
  const el = document.querySelector('[class*="text-difficulty-"]');
  if (el) {
    const cls = el.className;
    if (cls.includes("easy")) return "Easy";
    if (cls.includes("medium")) return "Medium";
    if (cls.includes("hard")) return "Hard";
    return el.textContent.trim();
  }
  return "Medium"; // Safe fallback
}

/**
 * Extract source code from Monaco Editor's DOM.
 * This is the most reliable approach for Manifest V3 (no script injection needed).
 */
function extractCode() {
  const lines = document.querySelectorAll(".view-lines .view-line");
  if (lines.length > 0) {
    return Array.from(lines)
      .map((l) => l.innerText)
      .join("\n");
  }
  // Fallback: CodeMirror (some LeetCode variants)
  const cm = document.querySelector(".CodeMirror-code");
  if (cm) return cm.innerText;
  return null;
}

/** Detect whether the result banner shows "Accepted". */
function isAccepted() {
  // Primary: data-e2e locator
  const resultEl = document.querySelector('[data-e2e-locator="submission-result"]');
  if (resultEl?.textContent?.trim() === "Accepted") return true;

  // Fallback: span text scan (catches alternate UI versions)
  const spans = document.querySelectorAll("span");
  return Array.from(spans).some(
    (s) => s.textContent.trim() === "Accepted" && s.offsetParent !== null
  );
}

// ── Core extraction + dispatch ─────────────────────────────────────────────────

async function extractAndSync() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    const urlParts = window.location.pathname.split("/");
    const problemsIdx = urlParts.indexOf("problems");
    if (problemsIdx === -1) return;

    const slug = urlParts[problemsIdx + 1];
    const title = slugToTitle(slug);
    const difficulty = extractDifficulty();
    const language = extractLanguage();
    const code = extractCode();

    if (!code || code.trim().length < 5) {
      console.warn("[LeetSync Pro] Code extraction failed — retrying in 2 s...");
      setTimeout(() => {
        syncInProgress = false;
        extractAndSync();
      }, 2000);
      return;
    }

    const payload = {
      title,
      code,
      language,
      difficulty,
      url: window.location.href,
    };

    console.log("[LeetSync Pro] Dispatching payload:", payload);
    chrome.runtime.sendMessage({ action: "SYNC_SUBMISSION", payload });

  } catch (err) {
    console.error("[LeetSync Pro] Extraction error:", err);
  } finally {
    syncInProgress = false;
  }
}

// ── MutationObserver — SPA-aware ──────────────────────────────────────────────

const observer = new MutationObserver(() => {
  const currentUrl = window.location.href;

  if (isAccepted() && currentUrl !== lastDetectedUrl) {
    lastDetectedUrl = currentUrl;
    console.log("[LeetSync Pro] ✅ Accepted submission detected!");
    // Give the editor ~2 s to fully render before extracting
    setTimeout(extractAndSync, 2000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Also listen for URL changes (SPA navigation via History API)
let _lastHref = window.location.href;
setInterval(() => {
  if (window.location.href !== _lastHref) {
    _lastHref = window.location.href;
    lastDetectedUrl = ""; // Reset so next acceptance on a new problem is captured
  }
}, 1000);
