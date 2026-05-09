"""Backend API tests for Jailbreak Info Hub."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://elastic-shtern-7.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------- Health -------- #
class TestRoot:
    def test_root_status(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "Jailbreak" in data["service"]


# -------- Tools -------- #
class TestTools:
    def test_list_tools(self, client):
        r = client.get(f"{API}/tools")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8
        ids = [t["id"] for t in data]
        for expected in ["palera1n", "dopamine", "unc0ver", "checkra1n", "taurine", "odyssey", "xinaA15", "roothide"]:
            assert expected in ids

    def test_get_tool_detail(self, client):
        r = client.get(f"{API}/tools/palera1n")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "palera1n"
        assert data["status"] == "active"
        assert "checkm8" in data["description"].lower()

    def test_get_tool_dopamine(self, client):
        r = client.get(f"{API}/tools/dopamine")
        assert r.status_code == 200
        assert r.json()["name"] == "Dopamine"

    def test_get_tool_not_found(self, client):
        r = client.get(f"{API}/tools/does-not-exist")
        assert r.status_code == 404


# -------- Tool Detail (iteration 2) -------- #
class TestToolDetail:
    def test_palera1n_detail(self, client):
        r = client.get(f"{API}/tools/palera1n/detail")
        assert r.status_code == 200
        d = r.json()
        # base fields preserved
        assert d["id"] == "palera1n"
        assert d["name"] == "palera1n"
        assert d["status"] == "active"
        # extras merged in
        assert d["download_url"].startswith("https://")
        assert isinstance(d["requirements"], list) and len(d["requirements"]) > 0
        assert isinstance(d["commands"], list) and len(d["commands"]) > 0
        for c in d["commands"]:
            assert "label" in c and "platform" in c and "code" in c
        assert isinstance(d["install_steps"], list) and len(d["install_steps"]) > 0
        assert isinstance(d["troubleshooting"], list) and len(d["troubleshooting"]) > 0
        for t in d["troubleshooting"]:
            assert "problem" in t and "fix" in t
        assert "official_site" in d

    def test_dopamine_detail(self, client):
        r = client.get(f"{API}/tools/dopamine/detail")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "dopamine"
        assert d["name"] == "Dopamine"
        assert d["download_url"].startswith("https://")
        assert len(d["requirements"]) > 0
        assert len(d["commands"]) > 0
        assert len(d["install_steps"]) > 0
        assert len(d["troubleshooting"]) > 0

    def test_all_tools_have_details(self, client):
        for tid in ["palera1n", "dopamine", "unc0ver", "checkra1n", "taurine", "odyssey", "xinaA15", "roothide"]:
            r = client.get(f"{API}/tools/{tid}/detail")
            assert r.status_code == 200, f"detail failed for {tid}"
            d = r.json()
            assert d["id"] == tid
            assert "requirements" in d and len(d["requirements"]) > 0
            assert "install_steps" in d and len(d["install_steps"]) > 0

    def test_detail_unknown_returns_404(self, client):
        r = client.get(f"{API}/tools/does-not-exist/detail")
        assert r.status_code == 404

    def test_base_endpoint_has_no_extras(self, client):
        # Existing /api/tools/{id} returns Pydantic Tool model (no extras)
        r = client.get(f"{API}/tools/palera1n")
        assert r.status_code == 200
        d = r.json()
        assert "requirements" not in d
        assert "commands" not in d
        assert "install_steps" not in d


# -------- Devices -------- #
class TestDevices:
    def test_list_devices(self, client):
        r = client.get(f"{API}/devices")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 22
        for d in data:
            assert {"id", "name", "soc", "max_ios"}.issubset(d.keys())


# -------- iOS Versions -------- #
class TestIOSVersions:
    def test_ios_versions(self, client):
        r = client.get(f"{API}/ios-versions")
        assert r.status_code == 200
        data = r.json()
        assert "versions" in data
        assert isinstance(data["versions"], list)
        assert "16.7.1" in data["versions"] or "15.7.1" in data["versions"]


# -------- Compatibility -------- #
class TestCompatibility:
    def test_compat_iphone_x_ios_16(self, client):
        r = client.post(f"{API}/compatibility", json={"device_id": "iphone-x", "ios_version": "16.7.1"})
        assert r.status_code == 200
        data = r.json()
        assert data["device"]["id"] == "iphone-x"
        assert data["ios_version"] == "16.7.1"
        tool_ids = [t["id"] for t in data["compatible_tools"]]
        assert "palera1n" in tool_ids
        assert "Found" in data["note"]

    def test_compat_no_tools(self, client):
        r = client.post(f"{API}/compatibility", json={"device_id": "iphone-15-pro", "ios_version": "18.2"})
        assert r.status_code == 200
        data = r.json()
        assert data["compatible_tools"] == []
        assert "No public jailbreak" in data["note"]

    def test_compat_device_not_found(self, client):
        r = client.post(f"{API}/compatibility", json={"device_id": "bogus", "ios_version": "16.0"})
        assert r.status_code == 404

    def test_compat_iphone_12_ios_148(self, client):
        r = client.post(f"{API}/compatibility", json={"device_id": "iphone-12", "ios_version": "14.8"})
        assert r.status_code == 200
        tool_ids = [t["id"] for t in r.json()["compatible_tools"]]
        # iPhone 12 A14 with iOS 14.8 should match unc0ver at minimum
        assert "unc0ver" in tool_ids


# -------- News -------- #
class TestNews:
    def test_news_sorted_desc(self, client):
        r = client.get(f"{API}/news")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        dates = [n["date"] for n in data]
        assert dates == sorted(dates, reverse=True)


# -------- Tutorials -------- #
class TestTutorials:
    def test_tutorials(self, client):
        r = client.get(f"{API}/tutorials")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 4
        for t in data:
            assert len(t["steps"]) > 0


# -------- FAQ -------- #
class TestFaq:
    def test_faq(self, client):
        r = client.get(f"{API}/faq")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        for f in data:
            assert "q" in f and "a" in f


# -------- Stats -------- #
class TestStats:
    def test_stats(self, client):
        r = client.get(f"{API}/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["tools"] == 8
        assert data["devices"] == 22
        assert data["tutorials"] >= 4
        assert data["ios_versions"] >= 10


# -------- Newsletter -------- #
class TestNewsletter:
    def test_newsletter_valid_email(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == email
        assert "id" in data
        assert "created_at" in data

    def test_newsletter_invalid_email(self, client):
        r = client.post(f"{API}/newsletter", json={"email": "not-an-email"})
        assert r.status_code == 422


# -------- Chat (iteration 3 - Claude Sonnet 4.5) -------- #
class TestChat:
    def test_chat_empty_message_returns_400(self, client):
        r = client.post(f"{API}/chat", json={"message": ""}, timeout=20)
        assert r.status_code == 400

    def test_chat_whitespace_message_returns_400(self, client):
        r = client.post(f"{API}/chat", json={"message": "   "}, timeout=20)
        assert r.status_code == 400

    def test_chat_creates_session_and_returns_reply(self, client):
        payload = {"message": "My iPhone X is on iOS 16.6.1, can I jailbreak it?"}
        r = client.post(f"{API}/chat", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "session_id" in data and isinstance(data["session_id"], str) and len(data["session_id"]) > 0
        # Validate UUID format
        try:
            uuid.UUID(data["session_id"])
        except ValueError:
            pytest.fail("session_id is not a valid UUID")
        assert "reply" in data and isinstance(data["reply"], str) and len(data["reply"]) > 0
        assert "messages" in data and isinstance(data["messages"], list)
        # First user + first assistant message at minimum
        assert len(data["messages"]) >= 2
        roles = [m["role"] for m in data["messages"]]
        assert roles[0] == "user"
        assert "assistant" in roles
        # No mongo _id leaking
        for m in data["messages"]:
            assert "_id" not in m
            assert "role" in m and "content" in m and "ts" in m
        # Reply should reference palera1n given the catalog grounding
        assert "palera1n" in data["reply"].lower()
        # Stash for next test
        TestChat._sid = data["session_id"]

    def test_chat_continues_session_with_history(self, client):
        sid = getattr(TestChat, "_sid", None)
        if not sid:
            pytest.skip("Previous session test did not run")
        payload = {"message": "What command should I run for rootless?", "session_id": sid}
        r = client.post(f"{API}/chat", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["session_id"] == sid
        # Should now include >=4 messages (2 turns)
        assert len(data["messages"]) >= 4
        # Order is chronological
        ts_list = [m["ts"] for m in data["messages"]]
        assert ts_list == sorted(ts_list)

    def test_chat_history_endpoint(self, client):
        sid = getattr(TestChat, "_sid", None)
        if not sid:
            pytest.skip("Previous session test did not run")
        r = client.get(f"{API}/chat/{sid}", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        for m in data:
            assert "_id" not in m
            assert m["role"] in ("user", "assistant")
            assert isinstance(m["content"], str) and len(m["content"]) > 0

    def test_chat_history_unknown_session_returns_empty_list(self, client):
        r = client.get(f"{API}/chat/{uuid.uuid4()}", timeout=20)
        assert r.status_code == 200
        assert r.json() == []


# -------- Releases (iteration 4 - GitHub Releases tracker) -------- #
class TestReleases:
    def test_palera1n_releases_has_tracker(self, client):
        r = client.get(f"{API}/tools/palera1n/releases", timeout=30)
        # tolerate occasional 502 from GitHub rate limiting
        if r.status_code == 502:
            pytest.skip(f"GitHub API rate limit/upstream: {r.text}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["has_tracker"] is True
        assert d["tool_id"] == "palera1n"
        assert d["repo"] == "palera1n/palera1n"
        assert d["tag"] and isinstance(d["tag"], str)
        assert d["published_at"] and isinstance(d["published_at"], str)
        assert d["html_url"].startswith("https://github.com/palera1n/palera1n/")
        assert isinstance(d["assets"], list) and len(d["assets"]) >= 1
        for a in d["assets"]:
            assert {"name", "size", "download_url", "download_count"}.issubset(a.keys())
            assert isinstance(a["size"], int)
            assert isinstance(a["download_count"], int)
            assert a["download_url"].startswith("https://github.com/")
            assert "/releases/download/" in a["download_url"]
        assert "fetched_at" in d
        # No mongo _id leakage
        assert "_id" not in d

    def test_dopamine_releases(self, client):
        r = client.get(f"{API}/tools/dopamine/releases", timeout=30)
        if r.status_code == 502:
            pytest.skip(f"GitHub upstream: {r.text}")
        assert r.status_code == 200
        d = r.json()
        assert d["has_tracker"] is True
        assert d["repo"] == "opa334/Dopamine"
        assert d["tag"]
        assert isinstance(d["assets"], list)

    def test_roothide_releases(self, client):
        r = client.get(f"{API}/tools/roothide/releases", timeout=30)
        if r.status_code == 502:
            pytest.skip(f"GitHub upstream: {r.text}")
        assert r.status_code == 200
        d = r.json()
        assert d["has_tracker"] is True
        assert d["repo"] == "RootHide/Bootstrap"
        assert d["tag"]

    @pytest.mark.parametrize("tool_id", ["checkra1n", "unc0ver", "xinaA15"])
    def test_no_tracker_tools(self, client, tool_id):
        r = client.get(f"{API}/tools/{tool_id}/releases", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["has_tracker"] is False
        assert d["tool_id"] == tool_id
        assert d.get("repo") is None
        assert "fetched_at" in d
        assert "_id" not in d

    def test_caching_behavior(self, client):
        # First call - may fetch from GitHub or cache
        r1 = client.get(f"{API}/tools/palera1n/releases", timeout=30)
        if r1.status_code == 502:
            pytest.skip("GitHub upstream rate limit")
        assert r1.status_code == 200
        fetched_at_1 = r1.json()["fetched_at"]

        # Second call without refresh -> cached, same fetched_at
        r2 = client.get(f"{API}/tools/palera1n/releases", timeout=30)
        assert r2.status_code == 200
        fetched_at_2 = r2.json()["fetched_at"]
        assert fetched_at_2 == fetched_at_1, "Second call should return cached fetched_at"

        # Third call with refresh=true -> newer fetched_at
        import time as _time
        _time.sleep(1.1)
        r3 = client.get(f"{API}/tools/palera1n/releases?refresh=true", timeout=30)
        if r3.status_code == 502:
            pytest.skip("GitHub upstream rate limit on refresh")
        assert r3.status_code == 200
        fetched_at_3 = r3.json()["fetched_at"]
        assert fetched_at_3 > fetched_at_1, (
            f"refresh=true should produce newer fetched_at. Old={fetched_at_1} New={fetched_at_3}"
        )
