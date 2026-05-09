"""Per-tool installation guides, commands, and troubleshooting.

Keyed by tool id (matching server.TOOLS[i]["id"]).
"""

TOOL_DETAILS = {
    "palera1n": {
        "download_url": "https://github.com/palera1n/palera1n/releases/latest",
        "official_site": "https://palera.in",
        "platforms": ["macOS", "Linux"],
        "requirements": [
            "macOS 11+ or Linux (Debian/Ubuntu/Arch)",
            "USB-A or USB-C cable (avoid USB-C → Lightning hubs)",
            "Disable Find My iPhone in Settings → Apple ID",
            "Disable passcode and Face ID/Touch ID before starting",
            "Device battery above 50%",
            "iOS version between 15.0 and 17.7.2",
            "A9–A11 device (iPhone 6s through iPhone X, iPad 6/7, iPad Pro 2017)"
        ],
        "commands": [
            {
                "label": "Install via Homebrew (macOS)",
                "platform": "macOS",
                "code": "brew install palera1n/tap/palera1n"
            },
            {
                "label": "Manual download (macOS / Linux)",
                "platform": "macOS / Linux",
                "code": "curl -fsSL https://static.palera.in/scripts/install.sh | bash"
            },
            {
                "label": "Run rootless (recommended)",
                "platform": "all",
                "code": "sudo palera1n -l"
            },
            {
                "label": "Run rootful (legacy)",
                "platform": "all",
                "code": "sudo palera1n -f"
            },
            {
                "label": "Re-jailbreak after reboot",
                "platform": "all",
                "code": "sudo palera1n -l --tweaks"
            }
        ],
        "install_steps": [
            "Back up your device fully via Finder before doing anything.",
            "Install palera1n via Homebrew or the install script.",
            "Plug your device in via USB. Trust the computer if prompted.",
            "Run `sudo palera1n -l` for rootless or `-f` for rootful.",
            "Follow the on-screen prompts to enter Recovery Mode, then DFU.",
            "After the device boots, tap the palera1n loader and choose 'Install Sileo'.",
            "After reboot, every time the device powers off you must re-run palera1n."
        ],
        "troubleshooting": [
            {"problem": "Device stuck in DFU loop", "fix": "Hold Side + Volume Down 10s, then release Side while holding Volume Down for 5s more."},
            {"problem": "`palera1n: command not found`", "fix": "Add /usr/local/bin to PATH, or run with full path: `sudo /usr/local/bin/palera1n -l`."},
            {"problem": "Sileo crashes on first launch", "fix": "Re-run palera1n with `--reset-storage` once, then refresh sources."},
            {"problem": "Boot loops after tweak install", "fix": "Hold Volume Up while booting to enter no-tweaks mode, then uninstall the offending tweak."}
        ]
    },
    "dopamine": {
        "download_url": "https://github.com/opa334/Dopamine/releases/latest",
        "official_site": "https://ellekit.space/dopamine/",
        "platforms": ["iOS sideload"],
        "requirements": [
            "iPhone XS through iPhone 14 / iPad equivalent (A12–A16)",
            "iOS 15.0 – 16.6.1",
            "Sideloader: TrollStore, AltStore, Sideloadly, or signing service",
            "At least 1 GB free storage",
            "Device battery above 50%"
        ],
        "commands": [
            {
                "label": "Download IPA (latest)",
                "platform": "shell",
                "code": "curl -L -o Dopamine.ipa https://github.com/opa334/Dopamine/releases/latest/download/Dopamine.ipa"
            },
            {
                "label": "Sideload via AltStore CLI (macOS)",
                "platform": "macOS",
                "code": "altserver -u <udid> -a <apple-id> Dopamine.ipa"
            },
            {
                "label": "Sideload via Sideloadly (any OS)",
                "platform": "all",
                "code": "# Drag Dopamine.ipa into Sideloadly, plug device in, click Start."
            }
        ],
        "install_steps": [
            "Back up your device.",
            "Download the latest Dopamine.ipa from GitHub releases.",
            "Sideload using TrollStore (permasigned) or AltStore (7-day signature).",
            "Open Dopamine from your home screen.",
            "Tap the big 'Jailbreak' button. The device will userspace-reboot.",
            "After reboot, open Sileo, refresh sources, and install your tweaks."
        ],
        "troubleshooting": [
            {"problem": "Dopamine icon disappears after 7 days", "fix": "Re-sign with AltStore or migrate to TrollStore for permanent signing."},
            {"problem": "'Jailbreak Failed: kfd' error", "fix": "Force close, lock+unlock device, re-open Dopamine and retry. Update to Dopamine 2.2+ for stability fixes."},
            {"problem": "Sileo shows 'Untrusted Source'", "fix": "Settings → Sileo → Sources → trust default repos."}
        ]
    },
    "unc0ver": {
        "download_url": "https://unc0ver.dev",
        "official_site": "https://unc0ver.dev",
        "platforms": ["iOS sideload"],
        "requirements": [
            "iPhone 6s – iPhone 12 / iPad equivalent (A9–A14)",
            "iOS 11.0 – 14.8",
            "Sideloader: AltStore, ReProvision, Sideloadly, or signing service",
            "Device battery above 30%"
        ],
        "commands": [
            {
                "label": "Download IPA",
                "platform": "shell",
                "code": "curl -L -o unc0ver.ipa https://unc0ver.dev/downloads/latest"
            },
            {
                "label": "Sideload via AltStore",
                "platform": "macOS / Windows",
                "code": "# Open AltStore → My Apps → '+' → Pick unc0ver.ipa"
            }
        ],
        "install_steps": [
            "Back up the device.",
            "Download the latest unc0ver IPA from unc0ver.dev.",
            "Sideload via AltStore or Sideloadly.",
            "Trust the developer in Settings → General → VPN & Device Management.",
            "Open unc0ver and tap 'Jailbreak'. The device will respring multiple times.",
            "Once Cydia appears, you're jailbroken."
        ],
        "troubleshooting": [
            {"problem": "App crashes on launch", "fix": "Re-sign with AltServer; expired signature is the most common cause."},
            {"problem": "Stuck on 'Substrate Compatibility Layer'", "fix": "Force restart device and re-open unc0ver."},
            {"problem": "Cydia missing tweaks", "fix": "Add your repos manually under Cydia → Sources → Edit → Add."}
        ]
    },
    "checkra1n": {
        "download_url": "https://checkra.in/releases",
        "official_site": "https://checkra.in",
        "platforms": ["macOS", "Linux"],
        "requirements": [
            "Mac running macOS 10.13+ or Linux",
            "USB-A cable (USB-C → Lightning hubs frequently fail)",
            "iPhone 5s – iPhone X (A7–A11)",
            "iOS 12.0 – 14.8.1"
        ],
        "commands": [
            {
                "label": "Download checkra1n (macOS)",
                "platform": "macOS",
                "code": "curl -L -o checkra1n.dmg https://assets.checkra.in/downloads/macos/checkra1n.dmg"
            },
            {
                "label": "Download checkra1n (Linux x86_64)",
                "platform": "Linux",
                "code": "curl -L -o checkra1n https://assets.checkra.in/downloads/linux/cli/x86_64/checkra1n && chmod +x checkra1n"
            },
            {
                "label": "Run CLI version",
                "platform": "Linux",
                "code": "sudo ./checkra1n -c"
            }
        ],
        "install_steps": [
            "Download checkra1n for your OS.",
            "Open the app or run the CLI binary.",
            "Connect your device via USB-A.",
            "Click 'Start' → follow on-screen prompts to enter DFU mode.",
            "Wait for the green checkmark — exploit succeeds in ~30 seconds.",
            "Open the checkra1n loader on the device home screen and install Cydia.",
            "Reboot = device returns to stock until you re-run checkra1n."
        ],
        "troubleshooting": [
            {"problem": "Stuck at 'Right before trigger'", "fix": "Use a different USB-A port and a known-good cable. USB-C hubs are unreliable."},
            {"problem": "DFU mode fails", "fix": "Try the assisted DFU mode in checkra1n, or watch a video walkthrough for your specific device."},
            {"problem": "Cydia loader missing", "fix": "Re-run checkra1n with the 'Cydia' option enabled in the GUI."}
        ]
    },
    "taurine": {
        "download_url": "https://taurine.app",
        "official_site": "https://taurine.app",
        "platforms": ["iOS sideload"],
        "requirements": [
            "iPhone 6s – iPhone 12 / iPad equivalent (A9–A14)",
            "iOS 14.0 – 14.3",
            "Sideloader: AltStore, Sideloadly, or signing service"
        ],
        "commands": [
            {
                "label": "Download Taurine IPA",
                "platform": "shell",
                "code": "curl -L -o Taurine.ipa https://taurine.app/static/Taurine.ipa"
            }
        ],
        "install_steps": [
            "Back up the device.",
            "Download Taurine.ipa from the official site.",
            "Sideload using AltStore or Sideloadly.",
            "Open Taurine and tap 'Jailbreak'.",
            "After respring, Sileo will be installed."
        ],
        "troubleshooting": [
            {"problem": "Tweaks fail to inject", "fix": "Disable Tweak Injection in Taurine settings, respring, re-enable, respring again."},
            {"problem": "Jailbreak fails on iOS 14.3", "fix": "Confirm you are exactly on 14.0–14.3. 14.4+ is patched and unsupported."}
        ]
    },
    "odyssey": {
        "download_url": "https://theodyssey.dev",
        "official_site": "https://theodyssey.dev",
        "platforms": ["iOS sideload"],
        "requirements": [
            "iPhone 6s – iPhone 11 / iPad equivalent (A9–A13)",
            "iOS 13.0 – 13.7",
            "Sideloader: AltStore or Sideloadly"
        ],
        "commands": [
            {
                "label": "Download Odyssey IPA",
                "platform": "shell",
                "code": "curl -L -o Odyssey.ipa https://theodyssey.dev/static/Odyssey.ipa"
            }
        ],
        "install_steps": [
            "Back up your device.",
            "Download the Odyssey IPA.",
            "Sideload via AltStore (renew weekly) or Sideloadly.",
            "Open the app and tap 'Jailbreak'.",
            "Sileo opens automatically after respring."
        ],
        "troubleshooting": [
            {"problem": "Substitute fails to load", "fix": "Reinstall Substitute from Sileo and respring."},
            {"problem": "Boot loop", "fix": "Hold Volume Up at boot to enter safe mode, uninstall the last tweak."}
        ]
    },
    "xinaA15": {
        "download_url": "https://xina.asyncnode.net",
        "official_site": "https://xina.asyncnode.net",
        "platforms": ["iOS sideload"],
        "requirements": [
            "iPhone 13 / iPhone 13 Pro / iPad Mini 6 (A15 only)",
            "iOS 15.0 – 15.1.1",
            "TrollStore or AltStore"
        ],
        "commands": [
            {
                "label": "Download XinaA15",
                "platform": "shell",
                "code": "curl -L -o XinaA15.ipa https://xina.asyncnode.net/download/latest"
            }
        ],
        "install_steps": [
            "Confirm you are on iOS 15.0–15.1.1 and own an A15 device.",
            "Sideload XinaA15.ipa.",
            "Launch and tap 'Jailbreak'. Allow several reboots.",
            "Open Sileo and configure repos."
        ],
        "troubleshooting": [
            {"problem": "App refuses to launch", "fix": "Re-sign via AltStore; XinaA15 requires a fresh signature each week unless using TrollStore."}
        ]
    },
    "roothide": {
        "download_url": "https://github.com/RootHide/Bootstrap/releases/latest",
        "official_site": "https://roothide.github.io",
        "platforms": ["iOS sideload"],
        "requirements": [
            "Existing Dopamine jailbreak installed",
            "A12–A16 device on iOS 15.0–16.6.1",
            "TrollStore recommended for permanence"
        ],
        "commands": [
            {
                "label": "Download Bootstrap IPA",
                "platform": "shell",
                "code": "curl -L -o RootHide.ipa https://github.com/RootHide/Bootstrap/releases/latest/download/RootHide.ipa"
            }
        ],
        "install_steps": [
            "Confirm Dopamine is installed and active.",
            "Sideload RootHide Bootstrap.ipa via TrollStore.",
            "Open Bootstrap, tap 'Install', then respring.",
            "Use 'App Manager' inside Bootstrap to enable per-app jailbreak hiding.",
            "Banking and streaming apps should now pass jailbreak detection."
        ],
        "troubleshooting": [
            {"problem": "App still detects jailbreak", "fix": "In Bootstrap → App Manager, toggle off 'Tweak Injection' and 'Jailbreak Visibility' for that app, then force-quit and relaunch."},
            {"problem": "Sileo and Zebra both empty", "fix": "Reinstall the 'roothide-essentials' package from RootHide repo."}
        ]
    }
}
