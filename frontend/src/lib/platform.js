/**
 * Detect the user's platform from the browser User-Agent.
 * Returns one of: 'macos-arm64' | 'macos-x86_64' | 'macos' | 'linux-x86_64' |
 * 'linux-arm64' | 'linux' | 'windows' | 'ios' | 'android' | 'unknown'
 */
export function detectPlatform() {
    if (typeof navigator === "undefined") return "unknown";
    const ua = (navigator.userAgent || "").toLowerCase();
    const platform = (navigator.platform || "").toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    if (/windows|win32|win64/.test(ua) || /win/.test(platform)) return "windows";

    if (/mac/.test(ua) || /mac/.test(platform)) {
        // navigator.userAgentData is more reliable for Apple Silicon detection
        if (/arm64|aarch64/.test(ua)) return "macos-arm64";
        // Heuristic: many Apple Silicon Macs still report Intel UA. Default macos.
        return "macos";
    }

    if (/linux/.test(ua) || /linux/.test(platform)) {
        if (/aarch64|arm64/.test(ua)) return "linux-arm64";
        if (/x86_64|x64|amd64/.test(ua)) return "linux-x86_64";
        return "linux";
    }
    return "unknown";
}

/** Return a 0-100 match score for an asset given a target platform. */
export function scoreAsset(assetName, target) {
    const n = (assetName || "").toLowerCase();
    if (!n) return 0;

    const matches = (re) => re.test(n);

    switch (target) {
        case "ios":
            if (matches(/\.ipa$/)) return 100;
            return 0;
        case "macos-arm64":
            if (matches(/macos.*(arm64|aarch64)/)) return 100;
            if (matches(/macos.*universal/)) return 90;
            if (matches(/\.dmg$/)) return 70;
            if (matches(/macos/)) return 60;
            return 0;
        case "macos-x86_64":
        case "macos":
            if (matches(/macos.*(x86_64|x64|intel|amd64)/)) return 100;
            if (matches(/macos.*universal/)) return 95;
            if (matches(/\.dmg$/)) return 80;
            if (matches(/macos|darwin/)) return 70;
            return 0;
        case "linux-x86_64":
        case "linux":
            if (matches(/linux.*(x86_64|x64|amd64)/)) return 100;
            if (matches(/linux/) && !matches(/arm|aarch/)) return 80;
            if (matches(/\.deb$/) && matches(/amd64|x86_64/)) return 90;
            return 0;
        case "linux-arm64":
            if (matches(/linux.*(arm64|aarch64)/)) return 100;
            if (matches(/\.deb$/) && matches(/arm64|aarch64/)) return 90;
            return 0;
        case "windows":
            if (matches(/\.exe$/)) return 100;
            if (matches(/windows|win32|win64/)) return 95;
            return 0;
        case "all":
        default:
            return 50;
    }
}

export const PLATFORM_LABELS = {
    auto: "Auto",
    ios: "iOS",
    "macos-arm64": "macOS (Apple)",
    "macos-x86_64": "macOS (Intel)",
    macos: "macOS",
    "linux-x86_64": "Linux x64",
    "linux-arm64": "Linux ARM",
    linux: "Linux",
    windows: "Windows",
    all: "All",
};
