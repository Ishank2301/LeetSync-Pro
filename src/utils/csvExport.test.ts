import test from "node:test";
import assert from "node:assert/strict";
import { escapeCSVValue, generateSubmissionsCSV } from "./csvExport";
import { SubmissionItem } from "../types";

test("escapeCSVValue handles regular strings and empty values", () => {
  assert.equal(escapeCSVValue(null), "");
  assert.equal(escapeCSVValue(undefined), "");
  assert.equal(escapeCSVValue("Two Sum"), "Two Sum");
  assert.equal(escapeCSVValue(42), "42");
});

test("escapeCSVValue handles quotes, commas, and newlines correctly", () => {
  assert.equal(escapeCSVValue('Two "Special" Sum'), '"Two ""Special"" Sum"');
  assert.equal(escapeCSVValue("Graph, BFS"), '"Graph, BFS"');
  assert.equal(escapeCSVValue("Line 1\nLine 2"), '"Line 1\nLine 2"');
});

test("escapeCSVValue joins array tags with semicolons", () => {
  assert.equal(escapeCSVValue(["Array", "Hash Table"]), "Array; Hash Table");
});

test("generateSubmissionsCSV generates valid multi-row CSV", () => {
  const sample: SubmissionItem[] = [
    {
      id: "sub-1",
      title: "Two Sum",
      difficulty: "Easy",
      category: "Hashing",
      language: "cpp",
      github_url: "https://github.com/test/repo/blob/main/solutions/Easy/Two_Sum.cpp",
      synced_at: "2026-10-30T10:00:00Z",
      url: "https://leetcode.com/problems/two-sum/",
      tags: ["Array", "Hash Table"],
      status: "Solved",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      notes: 'Used unordered_map for O(1) lookup, "optimal" approach.',
    },
    {
      id: "sub-2",
      title: "Trapping Rain Water",
      difficulty: "Hard",
      category: "Two Pointers",
      language: "python3",
      github_url: "https://github.com/test/repo/blob/main/solutions/Hard/Trapping_Rain_Water.py",
      synced_at: "2026-10-29T10:00:00Z",
      status: "Review",
    },
  ];

  const csv = generateSubmissionsCSV(sample);
  const lines = csv.split("\r\n");

  // Header + 2 data rows
  assert.equal(lines.length, 3);
  assert.ok(lines[0].includes("Problem Title"));
  assert.ok(lines[0].includes("GitHub Repository URL"));
  assert.ok(lines[1].includes("Two Sum"));
  assert.ok(lines[1].includes("Array; Hash Table"));
  assert.ok(lines[1].includes('""optimal"" approach'));
  assert.ok(lines[2].includes("Trapping Rain Water"));
});
