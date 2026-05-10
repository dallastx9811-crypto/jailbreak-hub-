from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from tool_details import TOOL_DETAILS


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Jailbreak Info Hub")
api_router = APIRouter(prefix="/api")


# ---------------- Static Catalog Data ---------------- #

TOOLS = [
    {
        "id": "palera1n",
        "name": "palera1n",
        "tagline": "checkm8-based jailbreak for modern iOS",
        "type": "semi-tethered",
        "ios_min": "15.0",
        "ios_max": "17.7.2",
        "devices": ["iPhone 6s", "iPhone 6s Plus", "iPhone SE (1st gen)", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus", "iPhone X", "iPad (5th gen)", "iPad (6th gen)", "iPad (7th gen)", "iPad Pro 9.7", "iPad Pro 12.9 (2015)", "iPad Pro (2017)"],
        "soc": ["A9", "A9X", "A10", "A10X", "A11"],
        "rootful": True,
        "package_manager": "Sileo / Zebra",
        "developer": "palera1n team",
        "url": "https://palera.in",
        "status": "active",
        "description": "A macOS/Linux command-line tool leveraging the unpatchable checkm8 bootROM exploit. Supports rootful and rootless jailbreaks on A9–A11 devices running iOS 15 through iOS 17."
    },
    {
        "id": "dopamine",
        "name": "Dopamine",
        "tagline": "rootless jailbreak for arm64e devices",
        "type": "semi-untethered",
        "ios_min": "15.0",
        "ios_max": "16.6.1",
        "devices": ["iPhone XS", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPad Pro (2018+)"],
        "soc": ["A12", "A13", "A14", "A15", "M1"],
        "rootful": False,
        "package_manager": "Sileo",
        "developer": "opa334",
        "url": "https://ellekit.space/dopamine/",
        "status": "active",
        "description": "Rootless semi-untethered jailbreak based on Lars Fröder's fugu15 and the kfd exploit. Preserves system integrity while granting tweak support on A12+ devices."
    },
    {
        "id": "unc0ver",
        "name": "unc0ver",
        "tagline": "legacy semi-untethered jailbreak",
        "type": "semi-untethered",
        "ios_min": "11.0",
        "ios_max": "14.8",
        "devices": ["iPhone 6s", "iPhone 7", "iPhone 8", "iPhone X", "iPhone XS", "iPhone 11", "iPhone 12"],
        "soc": ["A9", "A10", "A11", "A12", "A13", "A14"],
        "rootful": True,
        "package_manager": "Cydia",
        "developer": "Pwn20wnd",
        "url": "https://unc0ver.dev",
        "status": "legacy",
        "description": "Long-running jailbreak covering iOS 11 through 14.8. Uses multiple exploits including Cicuta Virosa. Widely adopted during the A12–A14 era."
    },
    {
        "id": "checkra1n",
        "name": "checkra1n",
        "tagline": "the original checkm8 jailbreak",
        "type": "semi-tethered",
        "ios_min": "12.0",
        "ios_max": "14.8.1",
        "devices": ["iPhone 5s", "iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus", "iPhone SE (1st gen)", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus", "iPhone X", "iPad Air", "iPad Air 2", "iPad mini 2", "iPad mini 3", "iPad mini 4", "iPad (5th gen)", "iPad (6th gen)", "iPad (7th gen)", "iPad Pro 9.7", "iPad Pro 12.9", "iPad Pro (2017)"],
        "soc": ["A7", "A8", "A8X", "A9", "A9X", "A10", "A10X", "A11"],
        "rootful": True,
        "package_manager": "Cydia",
        "developer": "checkra1n team",
        "url": "https://checkra.in",
        "status": "legacy",
        "description": "Hardware-level jailbreak exploiting the permanent checkm8 bootROM vulnerability on A7–A11 devices. Must be re-applied after every reboot."
    },
    {
        "id": "taurine",
        "name": "Taurine",
        "tagline": "semi-untethered jailbreak for iOS 14",
        "type": "semi-untethered",
        "ios_min": "14.0",
        "ios_max": "14.3",
        "devices": ["iPhone 6s", "iPhone 7", "iPhone 8", "iPhone X", "iPhone XS", "iPhone 11", "iPhone 12"],
        "soc": ["A9", "A10", "A11", "A12", "A13", "A14"],
        "rootful": True,
        "package_manager": "Sileo",
        "developer": "Odyssey Team",
        "url": "https://taurine.app",
        "status": "legacy",
        "description": "Released by the Odyssey team for iOS 14.0–14.3. Ships with the Sileo package manager and libhooker runtime."
    },
    {
        "id": "odyssey",
        "name": "Odyssey",
        "tagline": "iOS 13 semi-untethered jailbreak",
        "type": "semi-untethered",
        "ios_min": "13.0",
        "ios_max": "13.7",
        "devices": ["iPhone 6s", "iPhone 7", "iPhone 8", "iPhone X", "iPhone XS", "iPhone 11"],
        "soc": ["A9", "A10", "A11", "A12", "A13"],
        "rootful": True,
        "package_manager": "Sileo",
        "developer": "Odyssey Team",
        "url": "https://theodyssey.dev",
        "status": "legacy",
        "description": "Odyssey Team's iOS 13 jailbreak, predecessor to Taurine. First jailbreak to ship Sileo by default."
    },
    {
        "id": "xinaA15",
        "name": "XinaA15",
        "tagline": "rootless jailbreak for A15 devices",
        "type": "semi-untethered",
        "ios_min": "15.0",
        "ios_max": "15.1.1",
        "devices": ["iPhone 13", "iPhone 13 Pro", "iPad Mini (6th gen)"],
        "soc": ["A15"],
        "rootful": False,
        "package_manager": "Sileo",
        "developer": "Xina Jailbreak Team",
        "url": "https://xina.asyncnode.net",
        "status": "active",
        "description": "Rootless jailbreak targeting A15 devices on iOS 15.0–15.1.1. Uses the puaf exploit chain."
    },
    {
        "id": "roothide",
        "name": "RootHide",
        "tagline": "hide jailbreak from detection",
        "type": "utility",
        "ios_min": "15.0",
        "ios_max": "16.6.1",
        "devices": ["iPhone XS", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14"],
        "soc": ["A12", "A13", "A14", "A15", "A16"],
        "rootful": False,
        "package_manager": "Sileo",
        "developer": "RootHide team",
        "url": "https://roothide.github.io",
        "status": "active",
        "description": "A Dopamine fork providing advanced jailbreak detection bypass and dual package manager environment."
    }
]

DEVICES = [
    # iPhone — A7 (iOS 12 max)
    {"id": "iphone-5s", "name": "iPhone 5s", "soc": "A7", "max_ios": "12.5.7"},
    # iPhone — A8 (iOS 12 max)
    {"id": "iphone-6", "name": "iPhone 6", "soc": "A8", "max_ios": "12.5.7"},
    {"id": "iphone-6-plus", "name": "iPhone 6 Plus", "soc": "A8", "max_ios": "12.5.7"},
    # iPhone — A9 (iOS 15 max)
    {"id": "iphone-6s", "name": "iPhone 6s", "soc": "A9", "max_ios": "15.8.3"},
    {"id": "iphone-6s-plus", "name": "iPhone 6s Plus", "soc": "A9", "max_ios": "15.8.3"},
    {"id": "iphone-se-1", "name": "iPhone SE (1st gen)", "soc": "A9", "max_ios": "15.8.3"},
    # iPhone — A10
    {"id": "iphone-7", "name": "iPhone 7", "soc": "A10", "max_ios": "15.8.3"},
    {"id": "iphone-7-plus", "name": "iPhone 7 Plus", "soc": "A10", "max_ios": "15.8.3"},
    # iPhone — A11
    {"id": "iphone-8", "name": "iPhone 8", "soc": "A11", "max_ios": "16.7.10"},
    {"id": "iphone-8-plus", "name": "iPhone 8 Plus", "soc": "A11", "max_ios": "16.7.10"},
    {"id": "iphone-x", "name": "iPhone X", "soc": "A11", "max_ios": "16.7.10"},
    # iPhone — A12+
    {"id": "iphone-xs", "name": "iPhone XS", "soc": "A12", "max_ios": "18.x"},
    {"id": "iphone-xs-max", "name": "iPhone XS Max", "soc": "A12", "max_ios": "18.x"},
    {"id": "iphone-xr", "name": "iPhone XR", "soc": "A12", "max_ios": "18.x"},
    {"id": "iphone-11", "name": "iPhone 11", "soc": "A13", "max_ios": "18.x"},
    {"id": "iphone-11-pro", "name": "iPhone 11 Pro", "soc": "A13", "max_ios": "18.x"},
    {"id": "iphone-11-pro-max", "name": "iPhone 11 Pro Max", "soc": "A13", "max_ios": "18.x"},
    {"id": "iphone-se-2", "name": "iPhone SE (2nd gen)", "soc": "A13", "max_ios": "18.x"},
    {"id": "iphone-12", "name": "iPhone 12", "soc": "A14", "max_ios": "18.x"},
    {"id": "iphone-12-mini", "name": "iPhone 12 mini", "soc": "A14", "max_ios": "18.x"},
    {"id": "iphone-12-pro", "name": "iPhone 12 Pro", "soc": "A14", "max_ios": "18.x"},
    {"id": "iphone-12-pro-max", "name": "iPhone 12 Pro Max", "soc": "A14", "max_ios": "18.x"},
    {"id": "iphone-13", "name": "iPhone 13", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-13-mini", "name": "iPhone 13 mini", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-13-pro", "name": "iPhone 13 Pro", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-13-pro-max", "name": "iPhone 13 Pro Max", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-se-3", "name": "iPhone SE (3rd gen)", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-14", "name": "iPhone 14", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-14-plus", "name": "iPhone 14 Plus", "soc": "A15", "max_ios": "18.x"},
    {"id": "iphone-14-pro", "name": "iPhone 14 Pro", "soc": "A16", "max_ios": "18.x"},
    {"id": "iphone-14-pro-max", "name": "iPhone 14 Pro Max", "soc": "A16", "max_ios": "18.x"},
    {"id": "iphone-15", "name": "iPhone 15", "soc": "A16", "max_ios": "18.x"},
    {"id": "iphone-15-plus", "name": "iPhone 15 Plus", "soc": "A16", "max_ios": "18.x"},
    {"id": "iphone-15-pro", "name": "iPhone 15 Pro", "soc": "A17 Pro", "max_ios": "18.x"},
    {"id": "iphone-15-pro-max", "name": "iPhone 15 Pro Max", "soc": "A17 Pro", "max_ios": "18.x"},

    # iPad Air
    {"id": "ipad-air-1", "name": "iPad Air (1st gen)", "soc": "A7", "max_ios": "12.5.7"},
    {"id": "ipad-air-2", "name": "iPad Air 2", "soc": "A8X", "max_ios": "15.8.3"},
    {"id": "ipad-air-3", "name": "iPad Air (3rd gen)", "soc": "A12", "max_ios": "18.x"},
    {"id": "ipad-air-4", "name": "iPad Air (4th gen)", "soc": "A14", "max_ios": "18.x"},
    {"id": "ipad-air-5", "name": "iPad Air (5th gen)", "soc": "M1", "max_ios": "18.x"},

    # iPad mini
    {"id": "ipad-mini-2", "name": "iPad mini 2", "soc": "A7", "max_ios": "12.5.7"},
    {"id": "ipad-mini-3", "name": "iPad mini 3", "soc": "A7", "max_ios": "12.5.7"},
    {"id": "ipad-mini-4", "name": "iPad mini 4", "soc": "A8", "max_ios": "15.8.3"},
    {"id": "ipad-mini-5", "name": "iPad mini (5th gen)", "soc": "A12", "max_ios": "18.x"},
    {"id": "ipad-mini-6", "name": "iPad mini (6th gen)", "soc": "A15", "max_ios": "18.x"},

    # iPad (regular)
    {"id": "ipad-5", "name": "iPad (5th gen)", "soc": "A9", "max_ios": "16.7.10"},
    {"id": "ipad-6", "name": "iPad (6th gen)", "soc": "A10", "max_ios": "17.x"},
    {"id": "ipad-7", "name": "iPad (7th gen)", "soc": "A10", "max_ios": "17.x"},
    {"id": "ipad-8", "name": "iPad (8th gen)", "soc": "A12", "max_ios": "18.x"},
    {"id": "ipad-9", "name": "iPad (9th gen)", "soc": "A13", "max_ios": "18.x"},
    {"id": "ipad-10", "name": "iPad (10th gen)", "soc": "A14", "max_ios": "18.x"},

    # iPad Pro
    {"id": "ipad-pro-2015-12", "name": "iPad Pro 12.9 (2015)", "soc": "A9X", "max_ios": "16.7.10"},
    {"id": "ipad-pro-2016-9", "name": "iPad Pro 9.7 (2016)", "soc": "A9X", "max_ios": "16.7.10"},
    {"id": "ipad-pro-2017", "name": "iPad Pro (2017)", "soc": "A10X", "max_ios": "16.7.10"},
    {"id": "ipad-pro-2018", "name": "iPad Pro (2018)", "soc": "A12X", "max_ios": "17.x"},
    {"id": "ipad-pro-2020", "name": "iPad Pro (2020)", "soc": "A12Z", "max_ios": "17.x"},
    {"id": "ipad-pro-m1", "name": "iPad Pro (M1)", "soc": "M1", "max_ios": "18.x"},
    {"id": "ipad-pro-m2", "name": "iPad Pro (M2)", "soc": "M2", "max_ios": "18.x"},
]

IOS_VERSIONS = [
    "11.0", "11.4.1", "12.0", "12.4", "12.5.7", "13.0", "13.5", "13.7",
    "14.0", "14.3", "14.8", "14.8.1", "15.0", "15.1", "15.4.1", "15.7.1",
    "15.8.3", "16.0", "16.3", "16.5", "16.6.1", "16.7", "16.7.1", "16.7.10", "17.0", "17.2", "17.4",
    "17.5.1", "17.7.2", "18.0", "18.1", "18.2"
]

NEWS = [
    {
        "id": "news-1",
        "title": "iOS 18 Jailbreak: What we know so far",
        "date": "2026-01-28",
        "category": "Research",
        "excerpt": "Security researchers demonstrate kernel PoC on iOS 18.1 at POC 2025. Public tooling remains months away.",
        "body": "At POC 2025, researchers disclosed a kernel read/write primitive affecting iOS 18.0–18.1 on arm64e devices. While no public jailbreak has been released, several teams are analyzing the chain for feasibility."
    },
    {
        "id": "news-2",
        "title": "palera1n 2.0 adds iOS 17.7.2 support",
        "date": "2026-01-14",
        "category": "Release",
        "excerpt": "palera1n team ships 2.0.0 with expanded iOS 17 support and a reworked rootless runtime.",
        "body": "palera1n 2.0.0 was released today, bringing official support for iOS 17.7.2 on all compatible checkm8 devices. The rootless runtime has been merged with upstream ellekit."
    },
    {
        "id": "news-3",
        "title": "Dopamine 2.2 — kernel stability fixes",
        "date": "2025-12-20",
        "category": "Release",
        "excerpt": "opa334 releases Dopamine 2.2 addressing kernel panics on iOS 16.6.1 A15 devices.",
        "body": "Dopamine 2.2 lands with improved exploit reliability and kfd stability on A15 hardware. Users are recommended to update via TrollStore or AltStore."
    },
    {
        "id": "news-4",
        "title": "Cydia 1.1.38 — modern TLS support",
        "date": "2025-11-02",
        "category": "Community",
        "excerpt": "After years of dormancy, Cydia ships a maintenance release for TLS 1.3 and modern repos.",
        "body": "saurik's Cydia received a community-driven maintenance release bumping TLS support and fixing source errors on legacy jailbreaks."
    },
    {
        "id": "news-5",
        "title": "TrollStore Lives: sideloading renaissance",
        "date": "2025-10-11",
        "category": "Tools",
        "excerpt": "A CoreTrust bypass rediscovered on iOS 17.0 revives TrollStore-style permasigning for many users.",
        "body": "A newly discovered CoreTrust bug grants TrollStore-like permasigning capabilities on iOS 17.0, extending device coverage for non-jailbreak sideloading."
    }
]

TUTORIALS = [
    {
        "id": "tut-1",
        "title": "Preparing your device for jailbreak",
        "duration": "10 min",
        "difficulty": "Beginner",
        "steps": [
            "Back up your device fully via Finder or iCloud.",
            "Disable 'Find My iPhone' via Settings → Apple ID.",
            "Disable passcode, Face ID, and Touch ID temporarily.",
            "Ensure your device battery is above 50%.",
            "Verify your iOS version in Settings → General → About."
        ]
    },
    {
        "id": "tut-2",
        "title": "Installing palera1n on macOS",
        "duration": "15 min",
        "difficulty": "Intermediate",
        "steps": [
            "Download palera1n from the official site palera.in.",
            "Move the binary to /usr/local/bin and chmod +x it.",
            "Plug your device in via USB and enter DFU mode.",
            "Run `palera1n -l` for rootless or `palera1n -f` for rootful.",
            "Follow the on-device installer (Sileo will be installed after first boot)."
        ]
    },
    {
        "id": "tut-3",
        "title": "Jailbreaking with Dopamine",
        "duration": "8 min",
        "difficulty": "Beginner",
        "steps": [
            "Install TrollStore or sideload Dopamine.ipa via AltStore.",
            "Launch Dopamine from your home screen.",
            "Tap 'Jailbreak' and wait for the userspace reboot.",
            "Open Sileo and refresh your sources.",
            "Install essential tweaks and repositories."
        ]
    },
    {
        "id": "tut-4",
        "title": "Recovering from a boot loop",
        "duration": "12 min",
        "difficulty": "Advanced",
        "steps": [
            "Force restart: Volume Up → Volume Down → hold Side button.",
            "If the device stays bricked, enter Recovery Mode.",
            "Connect to a computer and open Finder/iTunes.",
            "Choose 'Update' first to preserve data; fallback to 'Restore' only if needed.",
            "Restore from the backup you created before jailbreaking."
        ]
    }
]

FAQ = [
    {
        "q": "Is jailbreaking legal?",
        "a": "In the United States, jailbreaking is legal under a DMCA exemption for personal use on smartphones. Laws vary by country; always check your local regulations."
    },
    {
        "q": "Will jailbreaking void my warranty?",
        "a": "Apple's policy states that unauthorized modifications may void your warranty. Restoring your device typically removes the jailbreak and is often enough for warranty service."
    },
    {
        "q": "What is the difference between rootful and rootless?",
        "a": "Rootful jailbreaks modify the root filesystem directly. Rootless jailbreaks keep the system partition intact and install tweaks in /var, which is more stable and update-friendly."
    },
    {
        "q": "What do tethered / semi-tethered / untethered mean?",
        "a": "Untethered: persists across reboots. Semi-untethered: requires re-running a jailbreak app after reboot. Semi-tethered: requires a computer to re-jailbreak after reboot. Tethered: requires a computer every boot."
    },
    {
        "q": "Can I unjailbreak my device?",
        "a": "Yes. A standard restore via Finder/iTunes or `Erase All Content and Settings` in most cases removes the jailbreak entirely."
    },
    {
        "q": "Which package manager should I use?",
        "a": "Sileo is the modern choice with a native Swift UI. Zebra offers a lightweight alternative. Cydia is used for legacy jailbreaks."
    }
]


# ---------------- Pydantic Models ---------------- #

class Tool(BaseModel):
    id: str
    name: str
    tagline: str
    type: str
    ios_min: str
    ios_max: str
    devices: List[str]
    soc: List[str]
    rootful: bool
    package_manager: str
    developer: str
    url: str
    status: str
    description: str


class Device(BaseModel):
    id: str
    name: str
    soc: str
    max_ios: str


class CompatibilityRequest(BaseModel):
    device_id: str
    ios_version: str


class CompatibilityResult(BaseModel):
    device: Device
    ios_version: str
    compatible_tools: List[Tool]
    note: str


class NewsItem(BaseModel):
    id: str
    title: str
    date: str
    category: str
    excerpt: str
    body: str


class Tutorial(BaseModel):
    id: str
    title: str
    duration: str
    difficulty: str
    steps: List[str]


class FaqItem(BaseModel):
    q: str
    a: str


class NewsletterSignup(BaseModel):
    email: EmailStr


class NewsletterRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---------------- Helpers ---------------- #

def _parse_version(v: str) -> tuple:
    parts = v.split(".")
    result = []
    for p in parts:
        try:
            result.append(int(p))
        except ValueError:
            result.append(0)
    # pad to 3
    while len(result) < 3:
        result.append(0)
    return tuple(result[:3])


def _version_in_range(version: str, min_v: str, max_v: str) -> bool:
    v = _parse_version(version)
    return _parse_version(min_v) <= v <= _parse_version(max_v)


# ---------------- Routes ---------------- #

@api_router.get("/")
async def root():
    return {"service": "Jailbreak Info Hub API", "status": "ok"}


@api_router.get("/tools", response_model=List[Tool])
async def list_tools():
    return TOOLS


@api_router.get("/tools/{tool_id}", response_model=Tool)
async def get_tool(tool_id: str):
    for t in TOOLS:
        if t["id"] == tool_id:
            return t
    raise HTTPException(status_code=404, detail="Tool not found")


@api_router.get("/tools/{tool_id}/detail")
async def get_tool_detail(tool_id: str) -> Dict[str, Any]:
    base = next((t for t in TOOLS if t["id"] == tool_id), None)
    if not base:
        raise HTTPException(status_code=404, detail="Tool not found")
    extra = TOOL_DETAILS.get(tool_id, {})
    return {**base, **extra}


@api_router.get("/devices", response_model=List[Device])
async def list_devices():
    return DEVICES


@api_router.get("/ios-versions")
async def list_ios_versions():
    return {"versions": IOS_VERSIONS}


@api_router.post("/compatibility", response_model=CompatibilityResult)
async def check_compatibility(req: CompatibilityRequest):
    device = next((d for d in DEVICES if d["id"] == req.device_id), None)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    compatible = []
    for tool in TOOLS:
        # Match by device name inclusion (substring) and iOS version range
        device_match = any(
            d.lower() in device["name"].lower() or device["name"].lower() in d.lower()
            for d in tool["devices"]
        )
        soc_match = device["soc"] in tool["soc"]
        version_match = _version_in_range(req.ios_version, tool["ios_min"], tool["ios_max"])
        if (device_match or soc_match) and version_match:
            compatible.append(tool)

    note = (
        f"Found {len(compatible)} compatible tool(s) for {device['name']} on iOS {req.ios_version}."
        if compatible
        else f"No public jailbreak is currently available for {device['name']} on iOS {req.ios_version}. Check back as the scene evolves."
    )

    return {
        "device": device,
        "ios_version": req.ios_version,
        "compatible_tools": compatible,
        "note": note
    }


@api_router.get("/news", response_model=List[NewsItem])
async def list_news():
    return sorted(NEWS, key=lambda n: n["date"], reverse=True)


@api_router.get("/tutorials", response_model=List[Tutorial])
async def list_tutorials():
    return TUTORIALS


@api_router.get("/faq", response_model=List[FaqItem])
async def list_faq():
    return FAQ


@api_router.post("/newsletter", response_model=NewsletterRecord)
async def newsletter_signup(payload: NewsletterSignup):
    record = NewsletterRecord(email=payload.email)
    doc = record.model_dump()
    await db.newsletter.insert_one(doc)
    return record


@api_router.get("/stats")
async def stats():
    return {
        "tools": len(TOOLS),
        "devices": len(DEVICES),
        "tutorials": len(TUTORIALS),
        "ios_versions": len(IOS_VERSIONS),
    }


app.include_router(api_router)

from chat_router import make_chat_router  # noqa: E402
from releases_router import make_releases_router  # noqa: E402
from auth_router import make_auth_router  # noqa: E402
from payments_router import make_payments_router  # noqa: E402

app.include_router(
    make_chat_router(db, TOOLS, DEVICES, IOS_VERSIONS, TOOL_DETAILS)
)
app.include_router(make_releases_router(db))

_auth_router, _get_current_user = make_auth_router(db)
app.include_router(_auth_router)
app.include_router(make_payments_router(db, _get_current_user))

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
