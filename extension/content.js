// content.js — LeetSync Pro
// STRICT MODE: Only syncs AFTER "Accepted" is received from a real submission
console.log("[LeetSync Pro] Content script active.");

// ── State ─────────────────────────────────────────────────────────────────────
let lastAcceptedSignature = "";  // Unique key for each Accepted result
let syncInProgress = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugToTitle(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function extractDifficulty() {
  // LeetCode uses class names like "text-difficulty-easy", "-medium", "-hard"
  const el = document.querySelector('[class*="text-difficulty-"]');
  if (el) {
    const cls = el.className;
    if (cls.includes("easy"))   return "Easy";
    if (cls.includes("medium")) return "Medium";
    if (cls.includes("hard"))   return "Hard";
  }
  // Fallback: look for the plain text labels in the problem header
  const all = document.querySelectorAll("*");
  for (const el of all) {
    const t = el.childNodes.length === 1 && el.textContent.trim();
    if (t === "Easy")   return "Easy";
    if (t === "Medium") return "Medium";
    if (t === "Hard")   return "Hard";
  }
  return "Medium";
}

function extractLanguage() {
  // LeetCode stores the selected language in several places depending on UI version
  const selectors = [
    // New UI — the editor toolbar button showing current language
    '[data-e2e-locator="editor-lang-select"] button',
    '[data-e2e-locator="editor-lang-select"]',
    // Older UI
    '.ant-select-selection-item',
    // The tab that shows language name in submissions panel
    '[data-layout-path*="language"] button',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    // Skip if it's "Choose a type" or empty or too long to be a language name
    if (text && text.length < 30 && !text.toLowerCase().includes("choose")) {
      return text;
    }
  }
  return "python3"; // safe default — most users use Python
}

function extractCode() {
  // Monaco editor (primary)
  const lines = document.querySelectorAll(".view-lines .view-line");
  if (lines.length > 0) {
    return Array.from(lines).map((l) => l.innerText).join("\n");
  }
  // CodeMirror fallback
  const cm = document.querySelector(".CodeMirror-code");
  if (cm) return cm.innerText;
  return null;
}

/** Returns a unique key for the current accepted submission to prevent duplicates */
function getSubmissionKey() {
  const slug = window.location.pathname.split("/").filter(Boolean)[1] || "";
  // LeetCode puts the submission ID in the URL after acceptance e.g. /submissions/12345/
  const match = window.location.pathname.match(/submissions\/(\d+)/);
  const subId = match ? match[1] : Date.now().toString();
  return `${slug}::${subId}`;
}

function isAccepted() {
  // Primary selector
  const el = document.querySelector('[data-e2e-locator="submission-result"]');
  if (el?.textContent?.trim() === "Accepted") return true;
  // Fallback: look for visible "Accepted" text only in the result area
  const resultArea = document.querySelector('[class*="result"]') || document.body;
  const spans = resultArea.querySelectorAll("span");
  return Array.from(spans).some(
    (s) => s.textContent.trim() === "Accepted" && s.offsetParent !== null
  );
}

// ── Core sync ─────────────────────────────────────────────────────────────────

async function extractAndSync() {
  if (syncInProgress) {
    console.log("[LeetSync Pro] Sync already in progress");
    return;
  }
  syncInProgress = true;

  try {
    const urlParts = window.location.pathname.split("/").filter(Boolean);
    const problemsIdx = urlParts.indexOf("problems");
    if (problemsIdx === -1) {
      console.warn("[LeetSync Pro] Not on a problem page");
      syncInProgress = false;
      return;
    }

    const slug = urlParts[problemsIdx + 1];
    const title = slugToTitle(slug);
    const difficulty = extractDifficulty();
    const language = extractLanguage();
    const code = extractCode();

    if (!code || code.trim().length < 10) {
      console.warn("[LeetSync Pro] Code too short or missing");
      syncInProgress = false;
      return;
    }

    const payload = {
      title,
      code,
      language,
      difficulty,
      url: `https://leetcode.com/problems/${slug}/`,
    };

    console.log("[LeetSync Pro] ✅ Syncing:", title, "|", difficulty, "|", language);
    chrome.runtime.sendMessage({ action: "SYNC_SUBMISSION", payload });

  } catch (err) {
    console.error("[LeetSync Pro] Error:", err);
  } finally {
    syncInProgress = false;
  }
}

// ── MutationObserver — debounced to prevent multiple rapid fires ──────────────

const observer = new MutationObserver(() => {
  if (!isAccepted()) return;

  // Create a unique signature for this "Accepted" result
  // This prevents syncing the same result multiple times
  const resultEl = document.querySelector('[data-e2e-locator="submission-result"]');
  const signature = resultEl?.textContent + "_" + window.location.href;

  if (signature === lastAcceptedSignature) {
    console.log("[LeetSync Pro] This Accepted result already synced");
    return;
  }

  lastAcceptedSignature = signature;
  console.log("[LeetSync Pro] ✅ NEW Accepted detected — syncing in 2s...");
  
  // Wait for Monaco to fully render
  setTimeout(extractAndSync, 2000);
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });

// Reset accepted signature on navigation
let _lastHref = window.location.href;
setInterval(() => {
  if (window.location.href !== _lastHref) {
    _lastHref = window.location.href;
    lastAcceptedSignature = "";
    console.log("[LeetSync Pro] Navigated to new page — reset.");
  }
}, 1000);