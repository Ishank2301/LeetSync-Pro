// popup.js — LeetCode Tracker Controller (Pure clean sync without GTA sounds/video overlays)

const DOM = {
  authenticate: document.getElementById("authenticate"),
  authForm: document.getElementById("auth-form"),
  tokenInput: document.getElementById("github-token-input"),
  authError: document.getElementById("auth-error"),
  authenticateButton: document.getElementById("github-authenticate-button"),

  hookRepo: document.getElementById("hook-repo"),
  repoForm: document.getElementById("repo-form"),
  repoName: document.getElementById("repo-name"),
  subfolderPath: document.getElementById("subfolder-path"),
  repoNameError: document.getElementById("repo-name-error"),
  hookButton: document.getElementById("hook-button"),
  changeAccountButton: document.getElementById("change-account-button"),

  authenticated: document.getElementById("authenticated"),
  repositoryLink: document.getElementById("repository-link"),
  repositoryName: document.getElementById("repository-name"),
  unlinkButton: document.getElementById("unlink-button"),
  githubUsername: document.getElementById("github-username"),
  openDashboardButton: document.getElementById("open-dashboard-btn"),

  checkboxSubmitOnlyNew: document.getElementById("submit-code-checkbox"),
  checkboxMultipleSubmissions: document.getElementById("multiple-submission-checkbox"),
  checkboxCommentSubmission: document.getElementById("comment-submission-checkbox"),

  syncButton: document.getElementById("sync-button"),
  syncStatus: document.getElementById("sync-status"),
  syncTime: document.getElementById("sync-time"),
};

const DEFAULT_REPO = "Ishank2301/LeetSync-Pro";
const DEFAULT_BRANCH = "main";
const DASHBOARD_URL = "http://localhost:3000";

function setPanel(panel) {
  DOM.authenticate.style.display = panel === "auth" ? "block" : "none";
  DOM.hookRepo.style.display = panel === "hook" ? "block" : "none";
  DOM.authenticated.style.display = panel === "dashboard" ? "block" : "none";
}

async function init() {
  const store = await chrome.storage.local.get([
    "githubToken",
    "githubRepo",
    "githubBranch",
    "githubUsername",
    "subfolderPath",
    "submitOnlyNew",
    "keepMultipleSubmissions",
    "addSubmissionNote",
    "lastSyncStatus",
  ]);

  // Determine which step to show
  if (!store.githubToken) {
    setPanel("auth");
  } else if (!store.githubRepo) {
    if (store.githubToken) DOM.tokenInput.value = store.githubToken;
    setPanel("hook");
  } else {
    setPanel("dashboard");
  }

  // Populate fields
  if (store.githubRepo) {
    DOM.repositoryName.textContent = store.githubRepo;
    DOM.repositoryLink.href = `https://github.com/${store.githubRepo}`;
  }
  if (store.githubUsername) {
    DOM.githubUsername.textContent = store.githubUsername;
  }
  if (store.subfolderPath && DOM.subfolderPath) {
    DOM.subfolderPath.value = store.subfolderPath;
  }

  // Settings checkboxes
  DOM.checkboxSubmitOnlyNew.checked = !!store.submitOnlyNew;
  DOM.checkboxMultipleSubmissions.checked = store.keepMultipleSubmissions !== false;
  DOM.checkboxCommentSubmission.checked = store.addSubmissionNote !== false;

  DOM.checkboxSubmitOnlyNew.addEventListener("change", (e) => {
    chrome.storage.local.set({ submitOnlyNew: e.target.checked });
  });

  DOM.checkboxMultipleSubmissions.addEventListener("change", (e) => {
    chrome.storage.local.set({ keepMultipleSubmissions: e.target.checked });
  });

  DOM.checkboxCommentSubmission.addEventListener("change", (e) => {
    chrome.storage.local.set({ addSubmissionNote: e.target.checked });
  });

  // Step 1: Connect Token Submit
  DOM.authForm.addEventListener("submit", handleAuthSubmit);

  // Step 2: Link Repo Submit
  DOM.repoForm.addEventListener("submit", handleRepoSubmit);

  // Switch account button
  DOM.changeAccountButton.addEventListener("click", () => {
    setPanel("auth");
  });

  // Unlink button
  DOM.unlinkButton.addEventListener("click", async () => {
    await chrome.storage.local.remove(["githubRepo", "subfolderPath"]);
    DOM.repoName.value = "";
    setPanel("hook");
  });

  // Open full dashboard button
  if (DOM.openDashboardButton) {
    DOM.openDashboardButton.addEventListener("click", () => {
      chrome.tabs.create({ url: DASHBOARD_URL });
    });
  }

  // Sync history button
  DOM.syncButton.addEventListener("click", handleSync);

  // Status display
  updateSyncDisplay(store.lastSyncStatus);
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  DOM.authError.style.display = "none";
  const token = DOM.tokenInput.value.trim();

  if (!token) {
    DOM.authError.textContent = "Please enter your GitHub Personal Access Token.";
    DOM.authError.style.display = "block";
    return;
  }

  DOM.authenticateButton.disabled = true;
  DOM.authenticateButton.querySelector("span").textContent = "Verifying Token…";

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      throw new Error(`Authentication failed (${res.status}). Verify token scope and validity.`);
    }

    const userData = await res.json();
    await chrome.storage.local.set({
      githubToken: token,
      githubUsername: userData.login || "Connected",
    });

    DOM.githubUsername.textContent = userData.login || "Connected";
    DOM.repoName.value = DEFAULT_REPO;
    setPanel("hook");
  } catch (err) {
    DOM.authError.textContent = err.message;
    DOM.authError.style.display = "block";
  } finally {
    DOM.authenticateButton.disabled = false;
    DOM.authenticateButton.querySelector("span").textContent = "Connect with GitHub";
  }
}

async function handleRepoSubmit(e) {
  e.preventDefault();
  DOM.repoNameError.textContent = "";
  const repo = DOM.repoName.value.trim();
  const subfolder = (DOM.subfolderPath.value || "").trim().replace(/^\/+|\/+$/g, "");

  if (!repo || !repo.includes("/")) {
    DOM.repoNameError.textContent = "Please specify in format 'owner/repo' (e.g. yourname/leetcode-solutions).";
    return;
  }

  DOM.hookButton.disabled = true;
  DOM.hookButton.querySelector("span").textContent = "Linking…";

  const { githubToken } = await chrome.storage.local.get("githubToken");

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Repository not found or token lacks 'repo' permission scope.");
      }
      throw new Error(`Repository check failed (${res.status}).`);
    }

    const data = await res.json();
    const branch = data.default_branch || DEFAULT_BRANCH;

    await chrome.storage.local.set({
      githubRepo: repo,
      githubBranch: branch,
      subfolderPath: subfolder,
    });

    DOM.repositoryName.textContent = repo;
    DOM.repositoryLink.href = `https://github.com/${repo}`;

    setPanel("dashboard");
  } catch (err) {
    DOM.repoNameError.textContent = err.message;
  } finally {
    DOM.hookButton.disabled = false;
    DOM.hookButton.querySelector("span").textContent = "Link repository";
  }
}

function updateSyncDisplay(status) {
  if (status) {
    DOM.syncStatus.textContent = status.success
      ? `✓ ${status.message}`
      : `Last sync failed: ${status.message}`;
    DOM.syncStatus.style.color = status.success ? "var(--success)" : "var(--danger)";

    const minutesAgo = Math.round((Date.now() - (status.timestamp || Date.now())) / 60000);
    DOM.syncTime.textContent = minutesAgo <= 1 ? "Just now" : `${minutesAgo} minutes ago`;
  } else {
    DOM.syncStatus.textContent = "Ready to track accepted submissions.";
    DOM.syncStatus.style.color = "var(--muted)";
    DOM.syncTime.textContent = "Just now";
  }
}

async function handleSync() {
  DOM.syncButton.disabled = true;
  DOM.syncButton.querySelector("span").textContent = "Syncing…";

  chrome.runtime.sendMessage({ action: "BULK_SYNC", limit: 20 }, (resp) => {
    const timestamp = Date.now();
    let status;
    if (resp && resp.status === "completed") {
      status = {
        success: true,
        message: resp.synced > 0
          ? `Synced ${resp.synced} solutions to GitHub.`
          : "All captured solutions are already up to date.",
        timestamp,
      };
    } else {
      status = {
        success: false,
        message: resp?.error || "Sync completed.",
        timestamp,
      };
    }

    chrome.storage.local.set({ lastSyncStatus: status }, () => {
      updateSyncDisplay(status);
      DOM.syncButton.disabled = false;
      DOM.syncButton.querySelector("span").textContent = "Sync";
    });
  });
}

init();
