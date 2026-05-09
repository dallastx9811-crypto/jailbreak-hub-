"""Backend tests for GET /api/tools/{id}/releases/changelog (iteration 5)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://elastic-shtern-7.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestChangelog:
    def test_palera1n_changelog_no_from_tag_returns_max_5(self, client):
        r = client.get(f"{API}/tools/palera1n/releases/changelog", timeout=30)
        if r.status_code == 502:
            pytest.skip("GitHub upstream issue")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["has_tracker"] is True
        assert d["tool_id"] == "palera1n"
        assert d["repo"] == "palera1n/palera1n"
        assert d["from_tag"] is None
        assert isinstance(d["releases"], list)
        assert 1 <= len(d["releases"]) <= 5, f"expected up to 5, got {len(d['releases'])}"
        assert d["count"] == len(d["releases"])
        for r_ in d["releases"]:
            assert {"tag", "name", "published_at", "html_url", "body"}.issubset(r_.keys())
            assert r_["tag"]
            assert r_["html_url"].startswith("https://github.com/palera1n/palera1n/")

    def test_palera1n_changelog_with_from_tag_v2_0(self, client):
        r = client.get(f"{API}/tools/palera1n/releases/changelog", params={"from_tag": "v2.0"}, timeout=30)
        if r.status_code == 502:
            pytest.skip("GitHub upstream issue")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["has_tracker"] is True
        assert d["from_tag"] == "v2.0"
        assert isinstance(d["releases"], list)
        # Should be > 0 entries between v2.0 (exclusive) and latest
        assert len(d["releases"]) >= 1
        # v2.0 should NOT appear in the list (exclusive)
        tags = [r_["tag"] for r_ in d["releases"]]
        assert "v2.0" not in tags
        # The latest tag should be in the list (inclusive)
        # We don't hardcode latest since it may change

    def test_palera1n_changelog_from_tag_equals_latest_returns_zero(self, client):
        # Step 1: get latest tag
        r_latest = client.get(f"{API}/tools/palera1n/releases", timeout=30)
        if r_latest.status_code == 502:
            pytest.skip("GitHub upstream issue")
        assert r_latest.status_code == 200
        latest_tag = r_latest.json()["tag"]
        assert latest_tag

        # Step 2: changelog with from_tag = latest -> 0 releases
        r = client.get(f"{API}/tools/palera1n/releases/changelog", params={"from_tag": latest_tag}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["from_tag"] == latest_tag
        assert d["releases"] == []
        assert d["count"] == 0

    def test_checkra1n_changelog_has_no_tracker(self, client):
        r = client.get(f"{API}/tools/checkra1n/releases/changelog", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["has_tracker"] is False
        assert d["releases"] == []
        assert d["tool_id"] == "checkra1n"

    def test_unknown_tool_changelog_no_tracker(self, client):
        r = client.get(f"{API}/tools/does-not-exist/releases/changelog", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["has_tracker"] is False
        assert d["releases"] == []

    def test_changelog_no_mongo_id_leak(self, client):
        r = client.get(f"{API}/tools/palera1n/releases/changelog", timeout=30)
        if r.status_code == 502:
            pytest.skip("GitHub upstream issue")
        # Look for mongo "_id" key (not the substring in release notes)
        assert '"_id"' not in r.text
