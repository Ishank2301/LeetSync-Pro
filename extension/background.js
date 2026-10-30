// background.js — LeetCode Tracker Standalone Service Worker

// ── Categorizer Algorithm ──────────────────────────────────────────────────────
const CATEGORY_RULES = [
  {
    category: "Graph",
    keywords: [["graph", 5], ["node", 3], ["edge", 4], ["dfs", 5], ["bfs", 5], ["dijkstra", 5], ["bellman", 5], ["floyd", 5], ["topological", 5], ["island", 4], ["connected component", 5], ["union find", 5], ["disjoint set", 5], ["cycle", 3], ["neighbor", 3]]
  },
  {
    category: "DP",
    keywords: [["dynamic programming", 5], ["dp[", 5], ["dp =", 4], ["memo", 4], ["tabulation", 4], ["knapsack", 5], ["fibonacci", 4], ["lcs", 5], ["lis", 5], ["edit distance", 5], ["coin change", 5], ["max subarray", 4], ["partition", 3]]
  },
  {
    category: "Trees",
    keywords: [["tree", 5], ["bst", 5], ["root", 4], ["leaf", 4], ["inorder", 5], ["preorder", 5], ["postorder", 5], ["trie", 5], ["segment tree", 5], ["fenwick", 5], ["avl", 5], ["treenode", 5], ["lca", 5]]
  },
  {
    category: "Heap / Priority Queue",
    keywords: [["heap", 5], ["heapq", 5], ["priority queue", 5], ["min heap", 5], ["max heap", 5], ["heappush", 5], ["heappop", 5], ["k largest", 4], ["k smallest", 4]]
  },
  {
    category: "Sliding Window",
    keywords: [["sliding window", 5], ["window size", 4], ["two pointer", 4], ["left, right", 3], ["shrink", 3], ["expand", 3]]
  },
  {
    category: "Binary Search",
    keywords: [["binary search", 5], ["bisect", 5], ["mid =", 4], ["lo, hi", 4], ["left, right", 3], ["sorted array", 3], ["search rotated", 5]]
  },
  {
    category: "Linked Lists",
    keywords: [["listnode", 5], ["linked list", 5], ["next.next", 5], ["dummy", 4], ["reverse list", 5], ["slow, fast", 4], ["cycle detection", 5]]
  },
  {
    category: "Backtracking",
    keywords: [["backtrack", 5], ["permutation", 4], ["combination", 4], ["subset", 4], ["n-queens", 5], ["sudoku", 5], ["pruning", 3]]
  },
  {
    category: "Greedy",
    keywords: [["greedy", 5], ["interval", 4], ["meeting rooms", 5], ["activity selection", 5], ["jump game", 5], ["gas station", 5]]
  },
  {
    category: "Hashing",
    keywords: [["hashmap", 5], ["hash map", 5], ["counter", 4], ["frequency", 3], ["defaultdict", 4], ["seen", 3], ["visited", 3], ["anagram", 4]]
  },
  {
    category: "Strings",
    keywords: [["string", 4], ["char", 3], ["substring", 4], ["palindrome", 5], ["regex", 4], ["parse", 3], ["encode", 3], ["decode", 3], ["roman", 4], ["wildcard", 4]]
  },
  {
    category: "Arrays",
    keywords: [["array", 3], ["subarray", 4], ["nums", 3], ["matrix", 4], ["rotate", 3], ["spiral", 4], ["prefix sum", 5], ["difference array", 5]]
  },
  {
    category: "Math",
    keywords: [["math", 4], ["prime", 5], ["gcd", 5], ["lcm", 5], ["modulo", 4], ["bit manipulation", 5], ["xor", 4], ["power", 3], ["sqrt", 4]]
  }
];

function categorizeProblem(title, code, tags) {
  const titleLower = title.toLowerCase();
  const codeLower = (code || "").toLowerCase();

  if (tags && tags.length > 0) {
    const tagsLower = tags.map(t => t.toLowerCase());
    for (const rule of CATEGORY_RULES) {
      for (const [kw] of rule.keywords) {
        if (tagsLower.some(tag => tag.includes(kw))) {
          return rule.category;
        }
      }
    }
  }

  const scores = {};
  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const [kw, weight] of rule.keywords) {
      if (titleLower.includes(kw)) score += weight * 2;
      if (codeLower.includes(kw)) score += weight;
    }
    if (score > 0) scores[rule.category] = score;
  }

  const categories = Object.keys(scores);
  if (!categories.length) return "Misc";

  let topCategory = categories[0];
  let topScore = scores[topCategory];
  for (const cat of categories) {
    if (scores[cat] > topScore) {
      topCategory = cat;
      topScore = scores[cat];
    }
  }

  if (topCategory === "DP" && ["two sum", "three sum", "k sum"].includes(titleLower)) {
    return scores["Hashing"] ? "Hashing" : (scores["Arrays"] ? "Arrays" : topCategory);
  }

  return topCategory;
}

// ── Language Extension Map ──────────────────────────────────────────────────
const EXT_MAP = {
  python3: "py", python: "py", cpp: "cpp", "c++": "cpp", c: "c", java: "java",
  javascript: "js", typescript: "ts", go: "go", rust: "rs", kotlin: "kt",
  swift: "swift", scala: "scala", ruby: "rb", php: "php", csharp: "cs", "c#": "cs"
};

function getCommentPrefix(ext) {
  const hashLangs = new Set(["py", "rb", "sh", "r", "ex"]);
  return hashLangs.has(ext) ? "#" : "//";
}

function resolveExt(lang) {
  const slug = (lang || "").toLowerCase().trim();
  return EXT_MAP[slug] || "py";
}

function buildHeader(title, difficulty, url, ext) {
  const p = getCommentPrefix(ext);
  const cleanUrl = url ? url.split("/submissions/")[0].replace(/\/+$/, "") + "/" : "";
  const lines = [
    `${p} Problem    : ${title}`,
    `${p} Difficulty : ${difficulty}`,
  ];
  if (cleanUrl) lines.push(`${p} URL        : ${cleanUrl}`);
  lines.push("");
  return lines.join("\n");
}

// ── Message Listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SYNC_SUBMISSION") {
    handleSubmissionSync(request.payload).then(sendResponse);
    return true;
  }
  if (request.action === "BULK_SYNC") {
    handleBulkSync(request.limit ?? 20).then(sendResponse);
    return true;
  }
});

// ── Direct GitHub Sync ────────────────────────────────────────────────────────
async function handleSubmissionSync(payload) {
  const store = await chrome.storage.local.get([
    "githubRepo",
    "githubToken",
    "githubBranch",
    "submitOnlyNew",
    "keepMultipleSubmissions",
    "cachedStats",
    "history",
  ]);

  const repo = store.githubRepo;
  const token = store.githubToken;
  const branch = store.githubBranch || "main";

  if (!repo || !token) {
    notify(
      "⚠️ LeetCode Tracker Setup Needed",
      "Click the extension icon to connect your GitHub repository and token."
    );
    // Save to pending submissions queue
    const { pendingSubmissions = [] } = await chrome.storage.local.get("pendingSubmissions");
    pendingSubmissions.push({ ...payload, timestamp: Date.now() });
    await chrome.storage.local.set({ pendingSubmissions });
    return { status: "pending", message: "Setup required" };
  }

  const category = categorizeProblem(payload.title, payload.code, payload.tags);
  const ext = resolveExt(payload.language);
  const folder = payload.difficulty.charAt(0).toUpperCase() + payload.difficulty.slice(1).toLowerCase();
  const safeTitle = payload.title.trim().replace(/\s+/g, "_").replace(/-/g, "_");

  let fileName = `${safeTitle}.${ext}`;
  if (store.keepMultipleSubmissions) {
    // If user solves problem again in same language, timestamp version
    const existingHistory = store.history || [];
    const priorSolves = existingHistory.filter(h => h.title === payload.title && h.language === payload.language);
    if (priorSolves.length > 0) {
      const v = priorSolves.length + 1;
      fileName = `${safeTitle}_v${v}.${ext}`;
    }
  }

  const baseFolder = store.subfolderPath ? store.subfolderPath.replace(/^\/+|\/+$/g, "") : "solutions";
  const filePath = `${baseFolder}/${folder}/${fileName}`;
  const header = buildHeader(payload.title, payload.difficulty, payload.url, ext);
  const fullContent = header + "\n" + (payload.code || "");
  const commitMessage = `✅ [${payload.difficulty}] ${payload.title} | ${category}`;

  try {
    // Direct GitHub API Call
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    // Check if file exists
    let sha = null;
    let existingContent = "";
    try {
      const getRes = await fetch(apiUrl, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
        if (fileData.content) {
          existingContent = decodeURIComponent(escape(atob(fileData.content.replace(/\s/g, ""))));
        }
      }
    } catch (e) {
      console.warn("File check notice:", e);
    }

    // If submitOnlyNew is true, skip if content is identical
    if (store.submitOnlyNew && existingContent && existingContent.trim() === fullContent.trim()) {
      notify("ℹ LeetCode Tracker", `${payload.title} code unchanged — skipping commit.`);
      return { status: "skipped", message: "Unchanged code" };
    }

    const bodyData = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(fullContent))),
      branch,
    };
    if (sha) bodyData.sha = sha;

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(bodyData),
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`GitHub error (${putRes.status}): ${errorText}`);
    }

    const ghUrl = `https://github.com/${repo}/blob/${branch}/${filePath}`;
    notify(
      "✅ Solution Synced!",
      `[${payload.difficulty}] ${payload.title} → ${repo}`
    );

    // Update stats and history in storage
    const history = store.history || [];
    const item = {
      title: payload.title,
      difficulty: payload.difficulty,
      category,
      language: payload.language,
      github_url: ghUrl,
      synced_at: new Date().toISOString(),
    };
    history.push(item);

    const stats = store.cachedStats || { total: 0, difficulty: { Easy: 0, Medium: 0, Hard: 0 } };
    const solvedTitles = new Set(history.map(h => h.title));
    stats.total = solvedTitles.size;
    stats.difficulty[payload.difficulty] = (stats.difficulty[payload.difficulty] || 0) + 1;

    await chrome.storage.local.set({
      history,
      cachedStats: stats,
      lastSync: item,
      lastSyncStatus: {
        success: true,
        message: `Synced ${payload.title} to GitHub`,
        timestamp: Date.now(),
      },
    });

    return { status: "success", github_url: ghUrl, category };

  } catch (err) {
    console.error("Direct sync error:", err);
    notify("❌ Sync Failed", err.message);
    await chrome.storage.local.set({
      lastSyncStatus: {
        success: false,
        message: err.message,
        timestamp: Date.now(),
      },
    });
    return { status: "error", error: err.message };
  }
}

// ── Bulk Sync ─────────────────────────────────────────────────────────────────
async function handleBulkSync(limit) {
  const store = await chrome.storage.local.get(["pendingSubmissions", "githubRepo", "githubToken"]);
  const queue = store.pendingSubmissions || [];

  if (!queue.length) {
    return { status: "completed", synced: 0, skipped: 0, errors: 0 };
  }

  let synced = 0;
  for (const item of queue.slice(0, limit)) {
    const res = await handleSubmissionSync(item);
    if (res.status === "success") synced++;
  }

  // Remove processed items
  await chrome.storage.local.set({ pendingSubmissions: queue.slice(synced) });
  return { status: "completed", synced, skipped: 0, errors: 0 };
}

// ── Notification Helper ───────────────────────────────────────────────────────
function notify(title, message) {
  try {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/lcp_icon.png",
      title,
      message,
      priority: 1,
    });
  } catch (e) {
    console.log("[Notification]", title, message);
  }
}
