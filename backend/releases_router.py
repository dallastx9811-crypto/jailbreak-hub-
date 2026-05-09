"""GitHub Releases tracker for jailbreak tools.

Fetches latest release info from the public GitHub API and caches it in
MongoDB for ~10 minutes to avoid rate limits.
"""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# Tool id -> GitHub repo "owner/name"
GITHUB_REPOS = {
    "palera1n": "palera1n/palera1n",
    "dopamine": "opa334/Dopamine",
    "roothide": "RootHide/Bootstrap",
    "taurine": "Odyssey-Team/Taurine",
    "odyssey": "Odyssey-Team/Odyssey",
}

CACHE_TTL_MINUTES = 10
CACHE_COLLECTION = "release_cache"


class Asset(BaseModel):
    name: str
    size: int
    download_url: str
    content_type: Optional[str] = None
    download_count: int = 0


class ReleaseInfo(BaseModel):
    tool_id: str
    repo: Optional[str] = None
    tag: Optional[str] = None
    name: Optional[str] = None
    published_at: Optional[str] = None
    html_url: Optional[str] = None
    body: Optional[str] = None
    assets: List[Asset] = []
    fetched_at: str
    has_tracker: bool = True


def _format_size(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    if size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    return f"{size / (1024 * 1024):.1f} MB"


async def _fetch_from_github(repo: str) -> Dict[str, Any]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "jb-hub-release-tracker",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = f"https://api.github.com/repos/{repo}/releases/latest"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 404:
            # Some repos publish only tags, not releases. Fall back.
            tags_url = f"https://api.github.com/repos/{repo}/tags"
            tag_resp = await client.get(tags_url, headers=headers)
            if tag_resp.status_code == 200 and tag_resp.json():
                first = tag_resp.json()[0]
                return {
                    "tag_name": first.get("name"),
                    "name": first.get("name"),
                    "published_at": None,
                    "html_url": f"https://github.com/{repo}/releases/tag/{first.get('name')}",
                    "body": "(tag-only release; no detailed notes)",
                    "assets": [],
                }
            resp.raise_for_status()
        resp.raise_for_status()
        return resp.json()


async def _fetch_all_releases(repo: str, limit: int = 30) -> List[Dict[str, Any]]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "jb-hub-release-tracker",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = f"https://api.github.com/repos/{repo}/releases?per_page={limit}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json() or []


def _to_release_info(tool_id: str, repo: str, raw: Dict[str, Any]) -> ReleaseInfo:
    assets = []
    for a in raw.get("assets", []) or []:
        assets.append(
            Asset(
                name=a.get("name", ""),
                size=int(a.get("size", 0)),
                download_url=a.get("browser_download_url", ""),
                content_type=a.get("content_type"),
                download_count=int(a.get("download_count", 0)),
            )
        )
    return ReleaseInfo(
        tool_id=tool_id,
        repo=repo,
        tag=raw.get("tag_name"),
        name=raw.get("name") or raw.get("tag_name"),
        published_at=raw.get("published_at"),
        html_url=raw.get("html_url"),
        body=(raw.get("body") or "")[:1500],
        assets=assets,
        fetched_at=datetime.now(timezone.utc).isoformat(),
        has_tracker=True,
    )


def make_releases_router(db):
    router = APIRouter(prefix="/api/tools", tags=["releases"])

    async def _get_cached(tool_id: str) -> Optional[ReleaseInfo]:
        doc = await db[CACHE_COLLECTION].find_one(
            {"tool_id": tool_id}, {"_id": 0}
        )
        if not doc:
            return None
        try:
            fetched = datetime.fromisoformat(doc["fetched_at"])
        except Exception:
            return None
        if datetime.now(timezone.utc) - fetched > timedelta(minutes=CACHE_TTL_MINUTES):
            return None
        return ReleaseInfo(**doc)

    async def _store_cache(info: ReleaseInfo) -> None:
        await db[CACHE_COLLECTION].update_one(
            {"tool_id": info.tool_id},
            {"$set": info.model_dump()},
            upsert=True,
        )

    @router.get("/{tool_id}/releases", response_model=ReleaseInfo)
    async def get_releases(tool_id: str, refresh: bool = False):
        repo = GITHUB_REPOS.get(tool_id)
        if not repo:
            return ReleaseInfo(
                tool_id=tool_id,
                repo=None,
                fetched_at=datetime.now(timezone.utc).isoformat(),
                has_tracker=False,
            )

        if not refresh:
            cached = await _get_cached(tool_id)
            if cached:
                return cached

        try:
            raw = await _fetch_from_github(repo)
        except httpx.HTTPStatusError as e:
            # Serve a stale cache if any
            stale = await db[CACHE_COLLECTION].find_one(
                {"tool_id": tool_id}, {"_id": 0}
            )
            if stale:
                return ReleaseInfo(**stale)
            raise HTTPException(
                status_code=502,
                detail=f"GitHub API error {e.response.status_code} for {repo}",
            )
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=f"GitHub fetch failed: {e}")

        info = _to_release_info(tool_id, repo, raw)
        await _store_cache(info)
        return info

    @router.get("/{tool_id}/releases/changelog")
    async def get_changelog(tool_id: str, from_tag: Optional[str] = None):
        repo = GITHUB_REPOS.get(tool_id)
        if not repo:
            return {
                "tool_id": tool_id,
                "has_tracker": False,
                "from_tag": from_tag,
                "releases": [],
            }
        try:
            raw = await _fetch_all_releases(repo, limit=30)
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"GitHub API error {e.response.status_code} for {repo}",
            )
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=f"GitHub fetch failed: {e}")

        # Stop when we encounter from_tag (exclusive). If from_tag missing/unknown,
        # return the latest 5 entries.
        between: List[Dict[str, Any]] = []
        for r in raw:
            tag = r.get("tag_name")
            if from_tag and tag == from_tag:
                break
            between.append(
                {
                    "tag": tag,
                    "name": r.get("name") or tag,
                    "published_at": r.get("published_at"),
                    "html_url": r.get("html_url"),
                    "body": (r.get("body") or "")[:2000],
                }
            )
            if not from_tag and len(between) >= 5:
                break

        return {
            "tool_id": tool_id,
            "has_tracker": True,
            "repo": repo,
            "from_tag": from_tag,
            "releases": between,
            "count": len(between),
        }

    return router
