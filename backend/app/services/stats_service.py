import json
import os
import logging
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)

INITIAL_DATA = {
    "total": 0,
    "difficulty": {"Easy": 0, "Medium": 0, "Hard": 0},
    "categories": {},
    "languages": {},
    "solved_titles": [],
    "history": [],  # [{title, difficulty, category, language, synced_at, github_url}]
}


class StatsService:
    def __init__(self):
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        self.stats_file = os.path.join(settings.DATA_DIR, "stats.json")
        self._init_db()

    def _init_db(self):
        if not os.path.exists(self.stats_file):
            self._save(INITIAL_DATA.copy())

    def _load(self) -> dict:
        with open(self.stats_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Back-compat: add new keys if they didn't exist
        for key, default in INITIAL_DATA.items():
            data.setdefault(key, default)
        return data

    def _save(self, data: dict):
        with open(self.stats_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

    def record_submission(
        self,
        title: str,
        difficulty: str,
        category: str,
        language: str = "Unknown",
        github_url: str = "",
    ):
        data = self._load()

        if title not in data["solved_titles"]:
            data["total"] += 1
            data["difficulty"][difficulty] = data["difficulty"].get(difficulty, 0) + 1
            data["categories"][category] = data["categories"].get(category, 0) + 1
            data["languages"][language] = data["languages"].get(language, 0) + 1
            data["solved_titles"].append(title)

        # Always log a history entry (captures re-syncs with different languages)
        data["history"].append(
            {
                "title": title,
                "difficulty": difficulty,
                "category": category,
                "language": language,
                "github_url": github_url,
                "synced_at": datetime.now(timezone.utc).isoformat(),
            }
        )

        self._save(data)
        logger.info("Stats recorded for: %s", title)

    def get_stats(self) -> dict:
        return self._load()

    def reset(self):
        """Hard reset — useful for testing."""
        self._save(INITIAL_DATA.copy())
        logger.warning("Stats database has been reset.")
