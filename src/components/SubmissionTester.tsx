import React, { useState } from "react";
import { Difficulty, SubmissionPayload, SyncResponse } from "../types";
import { CategorizerService } from "../services/categorizer";
import { GithubService } from "../services/githubService";
import { StatsService } from "../services/statsService";

interface PresetProblem {
  title: string;
  difficulty: Difficulty;
  language: string;
  tags: string[];
  url: string;
  code: string;
}

const PRESETS: PresetProblem[] = [
  {
    title: "Course Schedule II",
    difficulty: "Medium",
    language: "python3",
    tags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    url: "https://leetcode.com/problems/course-schedule-ii/",
    code: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        adj = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for dest, src in prerequisites:
            adj[src].append(dest)
            indegree[dest] += 1
            
        queue = collections.deque([i for i in range(numCourses) if indegree[i] == 0])
        order = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in adj[node]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    queue.append(neighbor)
        return order if len(order) == numCourses else []`,
  },
  {
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    language: "python3",
    tags: ["Array", "Binary Search", "Dynamic Programming"],
    url: "https://leetcode.com/problems/longest-increasing-subsequence/",
    code: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        if not nums:
            return 0
        dp = [1] * len(nums)
        for i in range(len(nums)):
            for j in range(i):
                if nums[i] > nums[j]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)`,
  },
  {
    title: "Subsets",
    difficulty: "Medium",
    language: "cpp",
    tags: ["Array", "Backtracking", "Bit Manipulation"],
    url: "https://leetcode.com/problems/subsets/",
    code: `class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(nums, 0, current, result);
        return result;
    }
    void backtrack(const vector<int>& nums, int start, vector<int>& cur, vector<vector<int>>& res) {
        res.push_back(cur);
        for (int i = start; i < nums.size(); ++i) {
            cur.push_back(nums[i]);
            backtrack(nums, i + 1, cur, res);
            cur.pop_back();
        }
    }
};`,
  },
  {
    title: "Valid Anagram",
    difficulty: "Easy",
    language: "python3",
    tags: ["Hash Table", "String", "Sorting"],
    url: "https://leetcode.com/problems/valid-anagram/",
    code: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = collections.Counter(s)
        for c in t:
            count[c] -= 1
            if count[c] < 0:
                return False
        return True`,
  },
];

interface SubmissionTesterProps {
  onSuccess: (res: SyncResponse) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionTester({ onSuccess, isOpen, onClose }: SubmissionTesterProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [title, setTitle] = useState(PRESETS[0].title);
  const [difficulty, setDifficulty] = useState<Difficulty>(PRESETS[0].difficulty);
  const [language, setLanguage] = useState(PRESETS[0].language);
  const [tagsInput, setTagsInput] = useState(PRESETS[0].tags.join(", "));
  const [url, setUrl] = useState(PRESETS[0].url);
  const [code, setCode] = useState(PRESETS[0].code);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  function loadPreset(idx: number) {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setTitle(p.title);
    setDifficulty(p.difficulty);
    setLanguage(p.language);
    setTagsInput(p.tags.join(", "));
    setUrl(p.url);
    setCode(p.code);
  }

  // Live category prediction
  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const predictedCategory = CategorizerService.categorize(title, code, tags);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const category = CategorizerService.categorize(title, code, tags);
      const githubService = new GithubService();
      const { githubUrl, filePath } = await githubService.pushSubmission({
        title,
        code,
        language,
        difficulty,
        category,
        url,
        tags,
      });

      StatsService.recordSubmission(title, difficulty, category, language, githubUrl);

      const response: SyncResponse = {
        status: "success",
        message: `Synced to ${filePath}`,
        category,
        github_url: githubUrl,
        filePath,
      };

      onSuccess(response);
      onClose();
    } catch (err: unknown) {
      alert("Submission error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
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
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
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
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
              ⚡ Simulate LeetCode Accepted Submission
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>
              Tests Chrome Extension capture → Categorizer Service → GitHub push & stats update
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 18,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Preset Buttons */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>
              QUICK PRESETS:
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESETS.map((p, idx) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => loadPreset(idx)}
                  style={{
                    background: selectedPreset === idx ? "#1e2d42" : "var(--surface2)",
                    border: `1px solid ${selectedPreset === idx ? "var(--accent)" : "var(--border)"}`,
                    color: selectedPreset === idx ? "var(--accent)" : "var(--text)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {p.title} ({p.difficulty})
                </button>
              ))}
            </div>
          </div>

          {/* Title & Difficulty */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                PROBLEM TITLE
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                DIFFICULTY
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
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
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Language & Tags */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                LANGUAGE
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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
                <option value="python3">Python 3 (py)</option>
                <option value="cpp">C++ (cpp)</option>
                <option value="java">Java (java)</option>
                <option value="javascript">JavaScript (js)</option>
                <option value="typescript">TypeScript (ts)</option>
                <option value="go">Go (go)</option>
                <option value="rust">Rust (rs)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                TOPIC TAGS (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Graph, Breadth-First Search"
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

          {/* Category Prediction Box */}
          <div
            style={{
              padding: "8px 12px",
              background: "#161b22",
              border: "1px solid #23863640",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Categorizer Live Detection:
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "#58a6ff",
                background: "#1f6feb22",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {predictedCategory}
            </span>
          </div>

          {/* Code */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
              ACCEPTED CODE BODY
            </label>
            <textarea
              required
              rows={7}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: "100%",
                background: "#080b11",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px",
                color: "#e2e8f0",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                resize: "vertical",
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
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
              disabled={isSubmitting}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                background: "#16a34a",
                border: "none",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Syncing..." : "⚡ Trigger Sync"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
