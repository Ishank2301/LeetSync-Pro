# ⚡ LeetSync Pro

A production-grade system that **automatically syncs** your accepted LeetCode submissions to a GitHub repository — with intelligent categorization, a stats dashboard, and bulk import.

```
Chrome Extension  →  FastAPI Backend  →  GitHub Repository
                         ↕
                   stats.json (local DB)
                         ↕
                  React Dashboard (Vite)
```

---

## 🏗 Architecture

| Layer | Tech | Role |
|---|---|---|
| Extension | Chrome MV3, Vanilla JS | Detects "Accepted", extracts code, fires POST |
| Backend | FastAPI + uvicorn | Categorization, GitHub push, stats |
| Storage | PyGithub + JSON file | Remote repo + local stats DB |
| Dashboard | React + Vite + Recharts | Live analytics UI |

---

## ⚙️ Setup

### 1 — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GITHUB_TOKEN=ghp_yourClassicPATHere
GITHUB_REPO=yourusername/leetcode-solutions

# Optional — for Bulk Sync
LEETCODE_SESSION=your_session_cookie
```

> **GitHub PAT scopes required:** `repo` (full control of private repos)

Start the server:

```bash
uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

---

### 2 — Chrome Extension

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. The LeetSync icon appears in your toolbar

---

### 3 — Dashboard

```bash
cd dashboard
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🚀 Usage

### Auto-Sync (per submission)
Just solve a problem on LeetCode. The moment you see **Accepted**, the extension detects it, extracts the code from Monaco Editor, and POSTs to your local backend. Your solution lands in GitHub under:

```
solutions/{Category}/{Problem_Title}.{ext}
```

### Bulk Sync
- Click the extension popup → **Bulk Sync** (last 20 submissions)
- Or via the dashboard **Bulk Sync** button
- Or directly: `POST http://localhost:8000/api/v1/bulk-sync` with `{"limit": 50}`

> **Requires** `LEETCODE_SESSION` in `.env`

---

## 📁 Repository Structure

```
solutions/
├── Arrays/
│   └── Two_Sum.py
├── Graph/
│   └── Number_of_Islands.py
├── DP/
│   └── Climbing_Stairs.py
└── ...
```

Each file includes a metadata header:

```python
# ─────────────────────────────────────────
#  Problem : Two Sum
#  Difficulty: Easy
#  Language  : python3
#  URL       : https://leetcode.com/problems/two-sum/
# ─────────────────────────────────────────
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/submission` | Sync a single submission |
| `POST` | `/api/v1/bulk-sync` | Bulk sync recent submissions |
| `GET`  | `/api/v1/stats` | Get all statistics |
| `DELETE` | `/api/v1/stats/reset` | Wipe stats DB |
| `GET`  | `/api/v1/health` | Health check |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🗺 Roadmap

- [ ] **Phase 2 Categorizer** — AST-based analysis + LLM classifier
- [ ] **Streak tracking** — daily solve streaks
- [ ] **GitHub README auto-generation** — problem table with links
- [ ] **Extension options page** — configure backend URL, exclude tags
- [ ] **Multi-language stats** — treemap of language usage

---

## 📜 License

MIT
