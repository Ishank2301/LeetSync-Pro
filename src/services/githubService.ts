import { AppSettings, Difficulty } from "../types";

export const EXT_MAP: Record<string, string> = {
  python3: "py",
  python: "py",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  java: "java",
  javascript: "js",
  typescript: "ts",
  go: "go",
  rust: "rs",
  kotlin: "kt",
  swift: "swift",
  scala: "scala",
  ruby: "rb",
  php: "php",
  csharp: "cs",
  "c#": "cs",
  dart: "dart",
  r: "r",
  bash: "sh",
  racket: "rkt",
  erlang: "erl",
  elixir: "ex",
};

export const LANG_NORMALIZE: Record<string, string> = {
  python: "python3",
  python3: "python3",
  "python 3": "python3",
  "c++": "cpp",
  "c#": "csharp",
  javascript: "javascript",
  typescript: "typescript",
};

export function getCommentPrefix(ext: string): string {
  const hashLangs = new Set(["py", "rb", "sh", "r", "ex", "exs"]);
  const slashLangs = new Set([
    "js",
    "ts",
    "java",
    "cpp",
    "c",
    "go",
    "rs",
    "kt",
    "swift",
    "cs",
    "scala",
    "dart",
    "php",
  ]);
  if (hashLangs.has(ext)) return "#";
  if (slashLangs.has(ext)) return "//";
  return "#";
}

export function buildFileHeader(
  title: string,
  difficulty: string,
  url?: string,
  ext: string = "py"
): string {
  const p = getCommentPrefix(ext);
  const lines = [
    `${p} Problem    : ${title}`,
    `${p} Difficulty : ${difficulty}`,
  ];
  if (url) {
    const cleanUrl = url.split("/submissions/")[0].replace(/\/+$/, "") + "/";
    lines.push(`${p} URL        : ${cleanUrl}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function resolveExtension(language: string): string {
  const langSlug = LANG_NORMALIZE[language.toLowerCase().trim()] || language.toLowerCase().trim();
  let ext = EXT_MAP[langSlug];
  if (!ext) {
    for (const [key, val] of Object.entries(EXT_MAP)) {
      if (langSlug.includes(key)) {
        ext = val;
        break;
      }
    }
  }
  return ext || "py";
}

export function generateFilePath(title: string, difficulty: Difficulty, language: string): string {
  const ext = resolveExtension(language);
  const folder = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  const safeTitle = title.trim().replace(/\s+/g, "_").replace(/-/g, "_");
  return `solutions/${folder}/${safeTitle}.${ext}`;
}

export class GithubService {
  private repo: string;
  private token: string;
  private branch: string;

  constructor(settings?: Partial<AppSettings>) {
    this.repo = settings?.githubRepo || "Ishank2301/LeetSync-Pro";
    this.token = settings?.githubToken || "";
    this.branch = settings?.branch || "main";
  }

  public async pushSubmission(params: {
    title: string;
    code: string;
    language: string;
    difficulty: Difficulty;
    category: string;
    url?: string;
    tags?: string[];
  }): Promise<{ githubUrl: string; filePath: string }> {
    const { title, code, language, difficulty, url, tags } = params;
    const ext = resolveExtension(language);
    const filePath = generateFilePath(title, difficulty, language);
    const tagStr = tags && tags.length ? ` | ${tags.join(", ")}` : "";
    const commitMessage = `✅ [${difficulty}] ${title}${tagStr}`;
    const header = buildFileHeader(title, difficulty, url, ext);
    const fullContent = header + "\n" + code;

    // If a valid GitHub token is provided, push directly to GitHub API
    if (this.token && this.token.startsWith("ghp_") && this.repo.includes("/")) {
      try {
        const apiUrl = `https://api.github.com/repos/${this.repo}/contents/${filePath}`;
        const headers = {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        };

        // Check if file exists to get SHA
        let sha: string | undefined;
        const checkRes = await fetch(apiUrl, { headers });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          sha = fileData.sha;
        }

        const bodyData: Record<string, unknown> = {
          message: commitMessage,
          content: btoa(unescape(encodeURIComponent(fullContent))),
          branch: this.branch,
        };
        if (sha) {
          bodyData.sha = sha;
        }

        const putRes = await fetch(apiUrl, {
          method: "PUT",
          headers,
          body: JSON.stringify(bodyData),
        });

        if (!putRes.ok) {
          const err = await putRes.text();
          console.warn("GitHub API error, falling back to repository link:", err);
        }
      } catch (err) {
        console.warn("Direct GitHub push network notice:", err);
      }
    }

    const githubUrl = `https://github.com/${this.repo}/blob/${this.branch}/${filePath}`;
    return { githubUrl, filePath };
  }
}
