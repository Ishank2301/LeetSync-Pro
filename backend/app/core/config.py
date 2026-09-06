from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "LeetSync Pro API"
    VERSION: str = "1.0.0"

    # GitHub
    GITHUB_TOKEN: str
    GITHUB_REPO: str  # Format: "username/repo"

    # LeetCode (optional — for Bulk Sync)
    LEETCODE_SESSION: Optional[str] = None

    # Storage
    DATA_DIR: str = "data"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
