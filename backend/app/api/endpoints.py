import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.models.schemas import (
    SubmissionData,
    SyncResponse,
    BulkSyncRequest,
    BulkSyncResponse,
    StatsResponse,
)
from app.services.github_service import GithubService
from app.services.categorizer import CategorizerService
from app.services.stats_service import StatsService
from app.services.bulk_sync_service import BulkSyncService
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Singletons (initialized once at startup)
github_service = GithubService()
stats_service = StatsService()


@router.post("/submission", response_model=SyncResponse, summary="Sync a single accepted submission")
async def handle_submission(data: SubmissionData, background_tasks: BackgroundTasks):
    """
    Called by the Chrome extension on each accepted LeetCode submission.
    Categorizes the code, pushes to GitHub, and asynchronously updates local stats.
    """
    try:
        category = CategorizerService.categorize(data.title, data.code, data.tags)
        gh_url = github_service.push_submission(
            data.title,
            data.code,
            data.language,
            data.difficulty,
            category,
            data.url,
        )
        background_tasks.add_task(
            stats_service.record_submission,
            data.title,
            data.difficulty,
            category,
            data.language,
            gh_url,
        )
        return SyncResponse(
            status="success",
            message="Successfully synced to GitHub",
            category=category,
            github_url=gh_url,
        )
    except Exception as exc:
        logger.exception("Error handling submission for '%s'", data.title)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/bulk-sync", response_model=BulkSyncResponse, summary="Bulk sync recent submissions")
async def bulk_sync(request: BulkSyncRequest):
    """
    Fetches recent accepted submissions from the LeetCode GraphQL API and
    pushes them all to GitHub. Requires LEETCODE_SESSION in .env.
    """
    if not settings.LEETCODE_SESSION:
        raise HTTPException(
            status_code=400,
            detail="LEETCODE_SESSION is not configured. Add it to your .env file.",
        )
    try:
        svc = BulkSyncService()
        result = await svc.run(limit=request.limit)
        return BulkSyncResponse(status="completed", **result)
    except Exception as exc:
        logger.exception("Bulk sync failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/stats", response_model=StatsResponse, summary="Get submission statistics")
async def get_stats():
    """Returns aggregated stats: total solved, by difficulty, by category, by language."""
    return stats_service.get_stats()


@router.delete("/stats/reset", summary="Reset all statistics (destructive)")
async def reset_stats():
    """Wipes the local stats database. Irreversible."""
    stats_service.reset()
    return {"status": "ok", "message": "Stats database has been reset."}


@router.get("/health", summary="Health check")
async def health():
    return {"status": "ok", "version": settings.VERSION}
