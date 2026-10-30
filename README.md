# ⚡ LeetSync Pro

A high-utility, modern **LeetCode Tracker & GitHub Sync** application built in React and TypeScript. Automatically categorizes, syncs, tracks, and manages your LeetCode problem solutions with streak analytics, spaced revision tracking, and interactive Chrome extension integration.

---

## 🚀 Features

- **📊 Comprehensive Analytics Dashboard**
  - Live problem counters (Total, Easy, Medium, Hard, and Unique Topics).
  - Difficulty distribution donut chart and category breakdown bar chart.
  - 16-week contribution activity heatmap with daily streak tracking and best streak records.

- **📁 Problem Library & Spaced Practice**
  - Full searchable, filterable problem catalog by difficulty, topic category, status, and starred favorites.
  - Spaced practice status tracking (`✓ Solved`, `⏳ Needs Review`, `★ Mastered`).
  - Personal intuition/revision notes editor and Time ($O(n)$) & Space ($O(1)$) complexity tags.
  - In-app code viewer and direct GitHub solution links.

- **🧠 Intelligent Weighted Categorizer**
  - Rule-based keyword and topic tag classification engine ported from Python.
  - Accurately classifies solutions into **Graph**, **DP**, **Trees**, **Heap / Priority Queue**, **Sliding Window**, **Binary Search**, **Linked Lists**, **Backtracking**, **Greedy**, **Hashing**, **Strings**, **Arrays**, and **Math**.

- **⬆ Bulk Sync & One-Click Push**
  - Batch problem sync engine that processes, categorizes, formats headers, and persists solutions.
  - Real-time GitHub commit path generator (`solutions/{Difficulty}/{Problem_Title}.{ext}`).

- **🧩 Interactive Chrome Extension Companion**
  - In-app preview of the LeetSync Pro Chrome Extension popup with real-time status and quick sync triggers.

- **⚙ Settings & Data Portability**
  - Configure target GitHub repository (`owner/repo`), Personal Access Token, and branch.
  - JSON progress export and import backup tools.

---

## 🛠 Tech Stack

- **Framework**: React 18 + Vite (SPA)
- **Language**: TypeScript
- **Visuals & Charts**: Recharts, SVG contribution heatmap
- **Styling**: Space Mono & DM Sans dark developer aesthetic

---

## 📜 License

MIT
