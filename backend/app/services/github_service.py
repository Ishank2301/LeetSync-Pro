import logging
from github import Github, GithubException
from app.core.config import settings

logger = logging.getLogger(__name__)

# Map LeetCode language slugs → file extensions
EXT_MAP: dict[str, str] = {
    "python3": "py",
    "python": "py",
    "cpp": "cpp",
    "c++": "cpp",
    "c": "c",
    "java": "java",
    "javascript": "js",
    "typescript": "ts",
    "go": "go",
    "rust": "rs",
    "kotlin": "kt",
    "swift": "swift",
    "scala": "scala",
    "ruby": "rb",
    "php": "php",
    "csharp": "cs",
    "c#": "cs",
    "dart": "dart",
    "r": "r",
    "bash": "sh",
    "racket": "rkt",
    "erlang": "erl",
    "elixir": "ex",
}


def _get_comment_prefix(ext: str) -> str:
    """Return the single-line comment prefix for a given file extension."""
    hash_langs = {"py", "rb", "sh", "r", "ex", "exs"}
    slash_langs = {
        "js",
        "ts",
        "java",
        "cpp",
        "c",
        "go",
        "rs",
        "kt",
        "swift",
        "cs",
        "scala",
        "dart",
        "php",
    }
    if ext in hash_langs:
        return "#"
    if ext in slash_langs:
        return "//"
    return "#"  # safe default


def _build_file_header(title: str, difficulty: str, url: str | None, ext: str) -> str:
    """
    Clean self-documenting header — no language line (the file extension says it all).
    Example:
        # Problem    : Two Sum
        # Difficulty : Easy
        # URL        : https://leetcode.com/problems/two-sum/
    """
    p = _get_comment_prefix(ext)
    lines = [
        f"{p} Problem    : {title}",
        f"{p} Difficulty : {difficulty}",
    ]
    if url:
        # Strip submission-specific URL fragments, keep the clean problem URL
        clean_url = url.split("/submissions/")[0].rstrip("/") + "/"
        lines.append(f"{p} URL        : {clean_url}")
    lines.append("")
    return "\n".join(lines)


# Normalize common language display names → slug
LANG_NORMALIZE: dict[str, str] = {
    "python": "python3",
    "python3": "python3",
    "python 3": "python3",
    "c++": "cpp",
    "c#": "csharp",
    "javascript": "javascript",
    "typescript": "typescript",
}


class GithubService:
    def __init__(self):
        self.gh = Github(settings.GITHUB_TOKEN)
        self.repo = self.gh.get_repo(settings.GITHUB_REPO)

    def push_submission(
        self,
        title: str,
        code: str,
        language: str,
        difficulty: str,
        category: str,  # still accepted but ignored for folder structure
        url: str | None = None,
        tags: list[str] | None = None,
    ) -> str:
        """
        Folder structure: solutions/{Easy|Medium|Hard}/{Safe_Title}.{ext}
        Commit message  : ✅ [Medium] Two Sum | Array, Hash Table
        """
        # Normalize language → extension
        lang_slug = LANG_NORMALIZE.get(
            language.lower().strip(), language.lower().strip()
        )
        ext = EXT_MAP.get(lang_slug, None)

        # If we still don't have an extension, try stripping spaces
        if ext is None:
            for key, val in EXT_MAP.items():
                if key in lang_slug:
                    ext = val
                    break

        if ext is None:
            ext = "py"  # final fallback — most users use Python
            logger.warning("Unknown language '%s', defaulting to .py", language)

        # Folder is strictly difficulty-based
        folder = difficulty.capitalize()  # Easy / Medium / Hard
        safe_title = title.strip().replace(" ", "_").replace("-", "_")
        file_path = f"solutions/{folder}/{safe_title}.{ext}"

        # Commit message includes topic tags if available
        tag_str = ", ".join(tags) if tags else ""
        commit_message = f"✅ [{difficulty}] {title}" + (
            f" | {tag_str}" if tag_str else ""
        )

        header = _build_file_header(title, difficulty, url, ext)
        full_content = header + code

        try:
            contents = self.repo.get_contents(file_path)
            self.repo.update_file(
                contents.path, commit_message, full_content, contents.sha
            )
            logger.info("Updated: %s", file_path)
        except GithubException as exc:
            if exc.status == 404:
                self.repo.create_file(file_path, commit_message, full_content)
                logger.info("Created: %s", file_path)
            else:
                logger.error("GitHub API error (%s): %s", exc.status, exc.data)
                raise

        return f"https://github.com/{settings.GITHUB_REPO}/blob/main/{file_path}"
