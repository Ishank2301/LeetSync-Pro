"""
BulkSyncService
───────────────
Queries the LeetCode GraphQL API using the user's session cookie to
fetch recent accepted submissions and push them all to GitHub.

Requirements:
  - LEETCODE_SESSION set in .env
  - httpx installed (already in requirements.txt)

Rate limits:
  - GitHub allows ~5 000 authenticated requests/hour → safely handles large backlogs.
  - LeetCode's GQL endpoint is undocumented; we add a small delay between
    submission detail fetches to avoid triggering bot-detection.
"""

import asyncio
import logging
from typing import Any

import httpx

from app.core.config import settings
from app.services.categorizer import CategorizerService
from app.services.github_service import GithubService
from app.services.stats_service import StatsService

logger = logging.getLogger(__name__)

LEETCODE_GQL = "https://leetcode.com/graphql"

# GraphQL queries ──────────────────────────────────────────────────────────────

RECENT_SUBMISSIONS_QUERY = """
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
    lang
  }
}
"""

SUBMISSION_DETAIL_QUERY = """
query submissionDetails($id: Int!) {
  submissionDetails(id: $id) {
    id
    code
    lang
    question {
      title
      difficulty
      topicTags { name }
    }
  }
}
"""

PROFILE_QUERY = """
query globalData {
  userStatus {
    username
  }
}
"""

# ──────────────────────────────────────────────────────────────────────────────


class BulkSyncService:
    def __init__(self):
        if not settings.LEETCODE_SESSION:
            raise RuntimeError(
                "LEETCODE_SESSION is not set. Add it to your .env file. "
                "Find it in browser DevTools → Application → Cookies → leetcode.com"
            )
        self._cookies = {"LEETCODE_SESSION": settings.LEETCODE_SESSION}
        self._headers = {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
        }
        self.github_svc = GithubService()
        self.stats_svc = StatsService()
        self.categorizer = CategorizerService()

    async def _gql(
        self, client: httpx.AsyncClient, query: str, variables: dict
    ) -> dict:
        resp = await client.post(
            LEETCODE_GQL,
            json={"query": query, "variables": variables},
            cookies=self._cookies,
            headers={**self._headers, "x-csrftoken": self._get_csrf_token()},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        if "errors" in data:
            logger.error("GraphQL errors: %s", data["errors"])
        return data

    def _get_csrf_token(self) -> str:
        """Extract CSRF token from session cookie or return empty string."""
        # LeetCode's CSRF token is often embedded in the session cookie
        # For now, return empty string and rely on session auth
        return "unknown"

    async def _get_username(self, client: httpx.AsyncClient) -> str:
        data = await self._gql(client, PROFILE_QUERY, {})
        return data["data"]["userStatus"]["username"]

    async def run(self, limit: int = 20) -> dict[str, Any]:
        results: list[dict] = []
        synced = skipped = errors = 0

        async with httpx.AsyncClient() as client:
            username = await self._get_username(client)
            logger.info("Bulk sync started for user: %s (limit=%d)", username, limit)

            submissions_data = await self._gql(
                client, RECENT_SUBMISSIONS_QUERY, {"username": username, "limit": limit}
            )
            submissions = submissions_data["data"]["recentAcSubmissionList"]

            for sub in submissions:
                sub_id = int(sub["id"])
                title = sub["title"]

                try:
                    detail_data = await self._gql(
                        client, SUBMISSION_DETAIL_QUERY, {"id": sub_id}
                    )

                    # Check for GraphQL errors in response
                    if "errors" in detail_data and detail_data["errors"]:
                        logger.error(
                            "GraphQL error for submission %s: %s",
                            sub_id,
                            detail_data["errors"],
                        )
                        errors += 1
                        results.append(
                            {
                                "title": title,
                                "status": "error",
                                "reason": f"GraphQL error: {detail_data['errors']}",
                            }
                        )
                        await asyncio.sleep(1.5)
                        continue

                    detail = detail_data.get("data", {}).get("submissionDetails")

                    if detail is None:
                        logger.warning(
                            "No detail for submission %s — skipping.", sub_id
                        )
                        skipped += 1
                        results.append(
                            {"title": title, "status": "skipped", "reason": "no_detail"}
                        )
                        await asyncio.sleep(1.5)
                        continue

                    code: str = detail["code"]
                    language: str = detail["lang"]
                    question = detail["question"]
                    difficulty: str = question["difficulty"]
                    tags: list[str] = [t["name"] for t in question.get("topicTags", [])]

                    category = self.categorizer.categorize(title, code, tags)
                    gh_url = self.github_svc.push_submission(
                        title,
                        code,
                        language,
                        difficulty,
                        category,
                        url=f"https://leetcode.com/problems/{sub['titleSlug']}/",
                    )
                    self.stats_svc.record_submission(
                        title, difficulty, category, language, gh_url
                    )

                    synced += 1
                    results.append(
                        {"title": title, "status": "synced", "github_url": gh_url}
                    )
                    logger.info("Synced: %s → %s", title, gh_url)

                except httpx.HTTPStatusError as exc:
                    errors += 1
                    results.append(
                        {
                            "title": title,
                            "status": "error",
                            "reason": f"HTTP {exc.response.status_code}",
                        }
                    )
                    try:
                        error_data = exc.response.json()
                        logger.error(
                            "HTTP %d for %s: %s",
                            exc.response.status_code,
                            title,
                            error_data,
                        )
                    except:
                        logger.error(
                            "HTTP %d for %s: %s",
                            exc.response.status_code,
                            title,
                            exc.response.text,
                        )
                except Exception as exc:
                    errors += 1
                    results.append(
                        {"title": title, "status": "error", "reason": str(exc)}
                    )
                    logger.error("Error syncing %s: %s", title, exc)

                # Be polite to LeetCode's servers
                await asyncio.sleep(1.5)

        return {
            "synced": synced,
            "skipped": skipped,
            "errors": errors,
            "details": results,
        }
