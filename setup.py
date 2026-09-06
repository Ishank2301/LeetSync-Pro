import os


def create_file(filepath, content):
    if content.startswith("\n"):
        content = content[1:]

    directory = os.path.dirname(filepath)
    if directory:
        os.makedirs(directory, exist_ok=True)

    with open(filepath, "w", encoding="utf-8") as file_handle:
        file_handle.write(content)

    print(f"Created {filepath}")


print("Creating LeetSync Pro files in the current directory...")

# ============================================================
# Extension
# ============================================================

create_file("extension/manifest.json", r'''
{
  "manifest_version": 3,
  "name": "LeetSync Pro",
  "version": "2.1.0",
  "description": "Sync accepted LeetCode solutions to GitHub with rich metadata.",
  "browser_specific_settings": {
    "gecko": {
      "id": "leetsync-pro@example.com",
      "strict_min_version": "109.0"
    }
  },
  "background": {
    "scripts": ["background.js"]
  },
  "action": {
    "default_popup": "popup.html"
  },
  "permissions": [
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "http://localhost:8000/*",
    "https://leetcode.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://leetcode.com/problems/*"],
      "js": ["content.js"]
    }
  ]
}
''')


create_file("extension/content.js", r'''
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

let syncTimeout = null;
let isSyncing = false;

function extractTitle() {
  const candidates = [
    '[data-cy="question-title"]',
    'a[href*="/problems/"]',
    "h1"
  ];

  for (const selector of candidates) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim().replace(/^\d+\.\s*/, "");
    }
  }

  return document.title.split("|")[0].trim();
}

function normalizeDifficulty(raw) {
  const text = (raw || "").trim().toLowerCase();

  if (["easy", "medium", "hard"].includes(text)) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  return "Unknown";
}

function extractDifficulty() {
  const direct = document.querySelector('[data-difficulty]');
  if (direct) {
    return direct.getAttribute("data-difficulty");
  }

  const className = document.querySelector(
    ".text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard"
  );
  if (className) {
    return normalizeDifficulty(className.textContent);
  }

  const header =
    document.querySelector('[class*="header"]') ||
    document.querySelector("main") ||
    document.body;

  const nodes = header.querySelectorAll("div, span, p, a");

  for (const node of nodes) {
    if (node.children.length === 0 && node.textContent) {
      const difficulty = normalizeDifficulty(node.textContent);
      if (difficulty !== "Unknown") {
        return difficulty;
      }
    }
  }

  return "Unknown";
}

function extractLanguage() {
  const elements = Array.from(
    document.querySelectorAll('button, [class*="select"], [class*="language"]')
  );

  for (const element of elements) {
    const text = (element.textContent || "").trim().toLowerCase();

    if (text.includes("python")) return "python3";
    if (text.includes("c++") || text.includes("cpp")) return "cpp";
    if (text.includes("java")) return "java";
    if (text.includes("javascript")) return "javascript";
    if (text.includes("typescript")) return "typescript";
    if (text.includes("go")) return "go";
    if (text.includes("rust")) return "rust";
    if (text.includes("swift")) return "swift";
    if (text.includes("kotlin")) return "kotlin";
    if (text.includes("c#") || text.includes("csharp")) return "csharp";
  }

  return "unknown";
}

function extractCode() {
  const lines = Array.from(document.querySelectorAll(".view-lines .view-line"));

  if (lines.length > 0) {
    return lines.map((line) => line.textContent).join("\n");
  }

  const editor = document.querySelector(".monaco-editor");
  if (editor && editor.innerText.trim()) {
    return editor.innerText;
  }

  return "";
}

function extractTags() {
  const tags = new Set();

  const anchors = Array.from(
    document.querySelectorAll('a[href*="/tag/"], a[class*="topic"], a[class*="tag"]')
  );

  for (const anchor of anchors) {
    const text = (anchor.textContent || "").trim();
    if (text && text.length < 60) {
      tags.add(text);
    }
  }

  return Array.from(tags);
}

function extractMetrics() {
  const runtime = { display: null, percentile: null };
  const memory = { display: null, percentile: null };

  const nodes = Array.from(document.querySelectorAll("span, div"));

  const runtimeNode = nodes.find(
    (node) =>
      node.children.length === 0 &&
      /\d+(\.\d+)?\s*(ms|s)/.test(node.textContent || "")
  );

  const memoryNode = nodes.find(
    (node) =>
      node.children.length === 0 &&
      /\d+(\.\d+)?\s*(MB|GB)/.test(node.textContent || "")
  );

  if (runtimeNode) {
    runtime.display = runtimeNode.textContent.trim();
  }

  if (memoryNode) {
    memory.display = memoryNode.textContent.trim();
  }

  const allText = document.body.innerText || "";
  const percentiles = Array.from(
    allText.matchAll(/Beats\s*([\d.]+)%/gi),
    (match) => parseFloat(match[1])
  );

  if (percentiles.length >= 1) {
    runtime.percentile = percentiles[0];
  }

  if (percentiles.length >= 2) {
    memory.percentile = percentiles[1];
  }

  return { runtime, memory };
}

function extractAndSync() {
  if (isSyncing) {
    return;
  }

  const title = extractTitle();
  const code = extractCode();

  if (!title || !code) {
    return;
  }

  const metrics = extractMetrics();

  const payload = {
    title,
    code,
    language: extractLanguage(),
    difficulty: extractDifficulty(),
    url: window.location.href,
    tags: extractTags(),
    runtime_display: metrics.runtime.display,
    runtime_percentile: metrics.runtime.percentile,
    memory_display: metrics.memory.display,
    memory_percentile: metrics.memory.percentile
  };

  isSyncing = true;

  try {
    browserAPI.runtime.sendMessage(
      { action: "SYNC_SUBMISSION", payload },
      () => {
        isSyncing = false;

        if (browserAPI.runtime.lastError) {
          console.error(browserAPI.runtime.lastError.message);
        }
      }
    );
  } catch (error) {
    console.error(error);
    isSyncing = false;
  }

  setTimeout(() => {
    isSyncing = false;
  }, 10000);
}

function handleMutation() {
  const text = document.body.innerText || "";

  if (text.includes("Accepted") && (text.includes("ms") || text.includes("MB"))) {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(extractAndSync, 2500);
  }
}

const observer = new MutationObserver(handleMutation);

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
''')


create_file("extension/background.js", r'''
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const DEFAULT_BACKEND_URL = "http://localhost:8000";

function normalizeBackendUrl(url) {
  if (!url) {
    return DEFAULT_BACKEND_URL;
  }

  return url.replace(/\/+$/, "");
}

function showNotification(title, message) {
  try {
    browserAPI.notifications.create({
      type: "basic",
      title: title,
      message: message
    });
  } catch (error) {
    console.error(error);
  }
}

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || request.action !== "SYNC_SUBMISSION") {
    return;
  }

  browserAPI.storage.local.get(["gh_token", "gh_repo", "backend_url"], (settings) => {
    if (!settings.gh_token || !settings.gh_repo) {
      showNotification(
        "LeetSync Pro",
        "Open the extension popup and connect GitHub first."
      );
      return;
    }

    const payload = {
      ...request.payload,
      github_token: settings.gh_token,
      repo_name: settings.gh_repo
    };

    const backendUrl = normalizeBackendUrl(settings.backend_url);

    fetch(`${backendUrl}/api/v1/submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          showNotification("LeetSync Pro", `Synced ${request.payload.title} to GitHub.`);
        } else if (data.status === "skipped") {
          showNotification("LeetSync Pro", `${request.payload.title} was already synced.`);
        } else {
          showNotification(
            "LeetSync Pro",
            `Sync failed: ${data.reason || data.detail || "unknown error"}`
          );
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("LeetSync Pro", "Could not reach the LeetSync backend.");
      });
  });
});
''')


create_file("extension/popup.html", r'''
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 340px;
      font-family: Arial, sans-serif;
      padding: 14px;
    }

    h2,
    h3 {
      margin: 0 0 10px;
    }

    label {
      font-size: 12px;
      font-weight: bold;
      display: block;
      margin-top: 8px;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      margin: 6px 0 10px;
    }

    button {
      width: 100%;
      padding: 9px;
      background: #2ea44f;
      color: white;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
    }

    .status {
      display: none;
      color: #2ea44f;
      font-size: 12px;
      margin-top: 6px;
      text-align: center;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 12px;
    }

    .stat-card {
      background: #f6f8fa;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }

    .easy {
      color: #2ea44f;
    }

    .medium {
      color: #d29922;
    }

    .hard {
      color: #f85149;
    }

    .hint {
      font-size: 11px;
      color: #57606a;
      margin-top: 0;
    }
  </style>
</head>
<body>
  <h2>LeetSync Pro</h2>

  <label for="gh-token">GitHub Token</label>
  <input id="gh-token" type="password" placeholder="ghp_...">

  <label for="gh-repo">Repository</label>
  <input id="gh-repo" type="text" placeholder="username/leetcode-solutions">

  <label for="backend-url">Backend URL</label>
  <input id="backend-url" type="text" placeholder="http://localhost:8000">

  <button id="save-btn">Save GitHub Connection</button>
  <div class="status" id="save-status">Saved.</div>

  <p class="hint">
    Token needs repo scope. Repository format: username/repository.
  </p>

  <hr>

  <h3>Stats</h3>

  <div class="grid">
    <div class="stat-card">
      <h3>Total</h3>
      <p id="total">0</p>
    </div>

    <div class="stat-card easy">
      <h3>Easy</h3>
      <p id="easy">0</p>
    </div>

    <div class="stat-card medium">
      <h3>Medium</h3>
      <p id="medium">0</p>
    </div>

    <div class="stat-card hard">
      <h3>Hard</h3>
      <p id="hard">0</p>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>
''')


create_file("extension/popup.js", r'''
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const DEFAULT_BACKEND_URL = "http://localhost:8000";

function $(id) {
  return document.getElementById(id);
}

function currentBackendUrl() {
  const value = $("backend-url").value.trim();
  return value ? value.replace(/\/+$/, "") : DEFAULT_BACKEND_URL;
}

browserAPI.storage.local.get(["gh_token", "gh_repo", "backend_url"], (settings) => {
  if (settings.gh_token) {
    $("gh-token").value = settings.gh_token;
  }

  if (settings.gh_repo) {
    $("gh-repo").value = settings.gh_repo;
  }

  $("backend-url").value = settings.backend_url || DEFAULT_BACKEND_URL;
});

$("save-btn").addEventListener("click", () => {
  const payload = {
    gh_token: $("gh-token").value.trim(),
    gh_repo: $("gh-repo").value.trim(),
    backend_url: currentBackendUrl()
  };

  browserAPI.storage.local.set(payload, () => {
    const status = $("save-status");
    status.style.display = "block";

    setTimeout(() => {
      status.style.display = "none";
    }, 2000);
  });
});

function loadStats() {
  fetch(`${currentBackendUrl()}/api/v1/stats`)
    .then((response) => response.json())
    .then((stats) => {
      $("total").textContent = stats.total || 0;
      $("easy").textContent = stats.Easy || 0;
      $("medium").textContent = stats.Medium || 0;
      $("hard").textContent = stats.Hard || 0;
    })
    .catch(() => {
      $("total").textContent = "0";
      $("easy").textContent = "0";
      $("medium").textContent = "0";
      $("hard").textContent = "0";
    });
}

loadStats();
''')


# ============================================================
# Backend
# ============================================================

create_file("backend/requirements.txt", r'''
fastapi
uvicorn[standard]
pydantic
pygithub
httpx
requests
python-dotenv
markdownify
beautifulsoup4
''')


create_file("backend/.env.example", r'''
# Optional.
# GitHub token/repository are now saved from the extension popup.
# These values are only needed if you want environment fallback for bulk sync.

LEETCODE_SESSION=
LEETCODE_CSRF_TOKEN=
''')


create_file("backend/app/__init__.py", "")
create_file("backend/app/api/__init__.py", "")
create_file("backend/app/models/__init__.py", "")
create_file("backend/app/services/__init__.py", "")


create_file("backend/app/main.py", r'''
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router

app = FastAPI(title="LeetSync Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "service": "LeetSync Pro API",
        "status": "ok"
    }
''')


create_file("backend/app/models/schemas.py", r'''
from typing import List, Optional

from pydantic import BaseModel, Field


class SubmissionData(BaseModel):
    title: str
    code: str
    language: str
    difficulty: str
    url: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)

    runtime_display: Optional[str] = None
    runtime_percentile: Optional[float] = None
    memory_display: Optional[str] = None
    memory_percentile: Optional[float] = None

    github_token: Optional[str] = None
    repo_name: Optional[str] = None


class BulkSyncRequest(BaseModel):
    github_token: Optional[str] = None
    repo_name: Optional[str] = None
    leetcode_session: Optional[str] = None
    csrf_token: Optional[str] = None
    username: Optional[str] = None
    limit: int = 20
''')


create_file("backend/app/services/question_service.py", r'''
import httpx
import markdownify

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

QUESTION_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    content
    difficulty
    topicTags {
      name
    }
    exampleTestcases
  }
}
"""


async def get_question_details(title_slug):
    fallback = {
        "description": "",
        "tags": [],
        "exampleTestcases": "",
        "difficulty": ""
    }

    if not title_slug:
        return fallback

    headers = {
        "Referer": f"https://leetcode.com/problems/{title_slug}/",
        "User-Agent": "Mozilla/5.0 (compatible; LeetSync Pro)"
    }

    payload = {
        "query": QUESTION_QUERY,
        "variables": {
            "titleSlug": title_slug
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                LEETCODE_GRAPHQL_URL,
                json=payload,
                headers=headers
            )
            response.raise_for_status()

            question = response.json().get("data", {}).get("question", {}) or {}

            content_html = question.get("content") or ""
            description = markdownify.markdownify(
                content_html,
                heading_style="ATX"
            ).strip()

            return {
                "description": description,
                "tags": [
                    tag.get("name")
                    for tag in question.get("topicTags", [])
                    if tag.get("name")
                ],
                "exampleTestcases": question.get("exampleTestcases") or "",
                "difficulty": question.get("difficulty") or ""
            }

    except Exception as error:
        print(f"Question metadata fetch failed for {title_slug}: {error}")
        return fallback
''')


create_file("backend/app/services/categorizer.py", r'''
def classify(submission):
    text_parts = [submission.title or ""]
    text_parts.extend(submission.tags or [])

    text = " ".join(text_parts).lower()

    categories = {
        "Graph": [
            "graph",
            "dfs",
            "bfs",
            "union find",
            "topological",
            "dijkstra",
            "island"
        ],
        "Dynamic Programming": [
            "dynamic",
            "dp",
            "knapsack",
            "subsequence",
            "memoization"
        ],
        "Trees": [
            "tree",
            "binary",
            "bst",
            "traversal",
            "trie",
            "heap"
        ],
        "Arrays & Hashing": [
            "array",
            "hash",
            "matrix",
            "grid",
            "stack",
            "queue",
            "sort",
            "binary search"
        ]
    }

    scores = {category: 0 for category in categories}

    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text:
                scores[category] += 1

    best = max(scores, key=scores.get)

    if scores[best] == 0:
        return "General"

    return best
''')


create_file("backend/app/services/github_service.py", r'''
import base64
import re

from github import Github, InputGitTreeElement
from github.GithubException import GithubException

LANGUAGE_EXTENSIONS = {
    "python": "py",
    "python3": "py",
    "cpp": "cpp",
    "c++": "cpp",
    "c": "c",
    "java": "java",
    "javascript": "js",
    "typescript": "ts",
    "go": "go",
    "rust": "rs",
    "ruby": "rb",
    "swift": "swift",
    "kotlin": "kt",
    "php": "php",
    "csharp": "cs",
    "c#": "cs"
}


def sanitize_title(title):
    base = (title or "").strip().replace(" ", "_").replace("-", "_")
    cleaned = re.sub(r"[^A-Za-z0-9_]+", "", base)
    return cleaned or "Untitled_Problem"


def get_extension(language):
    key = (language or "").strip().lower()

    if key in LANGUAGE_EXTENSIONS:
        return LANGUAGE_EXTENSIONS[key]

    cleaned = re.sub(r"[^a-z0-9]+", "", key)
    return cleaned or "txt"


def build_commit_message(submission):
    parts = []

    if submission.runtime_display:
        runtime_part = f"Runtime: {submission.runtime_display}"
        if submission.runtime_percentile is not None:
            runtime_part += f" (Beats {submission.runtime_percentile}%)"
        parts.append(runtime_part)

    if submission.memory_display:
        memory_part = f"Memory: {submission.memory_display}"
        if submission.memory_percentile is not None:
            memory_part += f" (Beats {submission.memory_percentile}%)"
        parts.append(memory_part)

    if submission.language:
        parts.append(submission.language)

    message = f"✅ {submission.title} ({submission.difficulty})"

    if parts:
        message += " | " + " | ".join(parts)

    return message


def update_readme_table(readme_md, language, new_row):
    lines = readme_md.split("\n")
    language_key = (language or "").strip().lower()

    for index, line in enumerate(lines):
        compact = line.lower().replace(" ", "")
        if compact.startswith(f"|{language_key}|"):
            lines[index] = new_row
            return "\n".join(lines)

    for index, line in enumerate(lines):
        compact = line.replace(" ", "")
        if "|---|---|---|---|" in compact:
            lines.insert(index + 1, new_row)
            return "\n".join(lines)

    return readme_md.rstrip() + "\n\n" + new_row + "\n"


def generate_readme(submission, question_details, existing_readme, extension, category):
    safe_title = sanitize_title(submission.title)
    file_name = f"{safe_title}.{extension}"
    language = submission.language or "Unknown"

    runtime_value = submission.runtime_display or "N/A"
    if submission.runtime_percentile is not None:
        runtime_value += f" (Beats {submission.runtime_percentile}%)"

    memory_value = submission.memory_display or "N/A"
    if submission.memory_percentile is not None:
        memory_value += f" (Beats {submission.memory_percentile}%)"

    new_row = f"| {language} | [{file_name}](./{file_name}) | {runtime_value} | {memory_value} |"

    if existing_readme:
        return update_readme_table(existing_readme, language, new_row)

    tags = question_details.get("tags") or submission.tags or []
    topics = ", ".join(tags) if tags else "N/A"
    link = submission.url or "N/A"
    description = question_details.get("description") or "No description available."
    examples = question_details.get("exampleTestcases") or ""

    readme = f"""# {submission.title}

**Difficulty:** {submission.difficulty or "Unknown"}
**Topics:** {topics}
**Category:** {category or "General"}
**Link:** {link}

## Description

{description}

## Solutions

| Language | File | Runtime | Memory |
|---|---|---|---|
{new_row}
"""

    if examples:
        readme += f"""
## Examples

```text
{examples}