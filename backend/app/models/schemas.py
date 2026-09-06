from pydantic import BaseModel, Field
from typing import Optional, Dict, List


class SubmissionData(BaseModel):
    title: str = Field(..., description="Problem title, e.g. 'Two Sum'")
    code: str = Field(..., description="Source code of the accepted solution")
    language: str = Field(..., description="Language slug, e.g. 'python3', 'cpp'")
    difficulty: str = Field(..., description="'Easy', 'Medium', or 'Hard'")
    url: Optional[str] = Field(None, description="Full LeetCode problem URL")
    tags: Optional[List[str]] = Field(default_factory=list, description="Optional LC topic tags")


class SyncResponse(BaseModel):
    status: str
    message: str
    category: str
    github_url: str


class BulkSyncRequest(BaseModel):
    limit: int = Field(20, ge=1, le=100, description="Number of recent submissions to sync")


class BulkSyncResponse(BaseModel):
    status: str
    synced: int
    skipped: int
    errors: int
    details: List[Dict]


class StatsResponse(BaseModel):
    total: int
    difficulty: Dict[str, int]
    categories: Dict[str, int]
    solved_titles: List[str]
