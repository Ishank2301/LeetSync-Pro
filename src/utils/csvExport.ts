import { SubmissionItem } from "../types";

/**
 * Escapes a single CSV value according to RFC 4180:
 * - Wrap in quotes if it contains commas, double quotes, or newlines
 * - Escape internal double quotes by doubling them (" -> "")
 */
export function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let str = "";
  if (Array.isArray(value)) {
    str = value.join("; ");
  } else if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }

  // If string contains comma, quote, or newline, escape and quote it
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts an array of SubmissionItems into a formatted CSV string.
 */
export function generateSubmissionsCSV(submissions: SubmissionItem[]): string {
  const headers = [
    "ID",
    "Problem Title",
    "Difficulty",
    "Category",
    "Language",
    "Status",
    "Synced At",
    "LeetCode URL",
    "GitHub Repository URL",
    "Tags",
    "Time Complexity",
    "Space Complexity",
    "Notes",
  ];

  const headerRow = headers.map(escapeCSVValue).join(",");

  if (!submissions || submissions.length === 0) {
    return headerRow;
  }

  const rows = submissions.map((item) => {
    return [
      item.id || "",
      item.title || "",
      item.difficulty || "",
      item.category || "",
      item.language || "",
      item.status || "Solved",
      item.synced_at || "",
      item.url || "",
      item.github_url || "",
      item.tags || [],
      item.timeComplexity || "",
      item.spaceComplexity || "",
      item.notes || "",
    ]
      .map(escapeCSVValue)
      .join(",");
  });

  return [headerRow, ...rows].join("\r\n");
}

/**
 * Generates and triggers browser download of the CSV file.
 */
export function triggerCSVDownload(
  submissions: SubmissionItem[],
  customFilename?: string
): string {
  const csvData = generateSubmissionsCSV(submissions);
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = customFilename || `leetsync_problem_logs_${dateStr}.csv`;

  // Create blob and trigger download
  const blob = new Blob(["\uFEFF" + csvData], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}
