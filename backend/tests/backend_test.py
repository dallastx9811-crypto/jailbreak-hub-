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
