import { useEffect, useState } from "react";
import {
    Download,
    RefreshCw,
    CheckCircle2,
    Loader2,
    Github,
    HardDrive,
    Calendar,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getToolReleases } from "@/lib/api";

function formatSize(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
}

function platformGuess(name) {
    const n = name.toLowerCase();
    if (n.endsWith(".ipa")) return "iOS";
    if (n.endsWith(".dmg") || n.includes("macos") || n.includes("darwin"))
        return "macOS";
    if (n.endsWith(".deb")) return "Debian";
    if (n.includes("linux")) return "Linux";
    if (n.endsWith(".exe") || n.includes("windows")) return "Windows";
    if (n.endsWith(".tar.gz") || n.endsWith(".zip")) return "Archive";
    return "Binary";
}

export default function ReleaseTracker({ toolId }) {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const load = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            const data = await getToolReleases(toolId, refresh);
            setInfo(data);
            setError(null);
            if (refresh) toast.success("Release info refreshed");
        } catch (e) {
            setError("Could not reach the release tracker");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toolId]);

    if (loading) {
        return (
            <div
                data-testid="release-tracker-loading"
                className="border border-white/10 bg-jb-surface p-8 flex items-center gap-3 font-mono text-xs text-jb-muted"
            >
                <Loader2 className="animate-spin text-jb-primary" size={14} />
                Querying GitHub releases...
            </div>
        );
    }

    if (!info?.has_tracker) {
        return (
            <div
                data-testid="release-tracker-unavailable"
                className="border border-white/10 bg-jb-surface p-6 md:p-8"
            >
                <div className="flex items-start gap-3">
                    <AlertCircle
                        size={18}
                        className="text-jb-muted shrink-0 mt-0.5"
                    />
                    <div>
                        <div className="font-mono text-sm font-bold text-white mb-1">
                            No live release tracker for this tool
                        </div>
                        <p className="text-sm text-jb-muted leading-relaxed">
                            This project does not publish releases on GitHub.
                            Use the official site button above to download from
                            the maintainer's website.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                data-testid="release-tracker-error"
                className="border border-jb-danger/40 bg-jb-danger/5 p-6"
            >
                <div className="font-mono text-sm text-jb-danger mb-2">
                    {error}
                </div>
                <button
                    onClick={() => load(true)}
                    className="font-mono text-xs uppercase tracking-[0.22em] text-jb-primary hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    const onDownload = (asset) => {
        toast.success(`Starting download: ${asset.name}`);
        // The link itself does the download via target="_blank"
    };

    return (
        <div
            data-testid="release-tracker"
            className="border border-jb-primary/30 bg-jb-surface jb-glow-border"
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3 flex-wrap">
                    <CheckCircle2 size={16} className="text-jb-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-jb-primary">
                        Verified release · live from GitHub
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href={info.html_url}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="release-github-link"
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted hover:text-white transition-colors"
                    >
                        <Github size={12} />
                        {info.repo}
                    </a>
                    <button
                        data-testid="release-refresh"
                        onClick={() => load(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted hover:text-jb-primary transition-colors disabled:opacity-40"
                        title="Force refresh"
                    >
                        <RefreshCw
                            size={12}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        {refreshing ? "Refreshing" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Version block */}
            <div className="px-6 py-6 border-b border-white/10">
                <div className="flex flex-wrap items-baseline gap-4 mb-2">
                    <h3
                        data-testid="release-tag"
                        className="font-mono text-3xl md:text-4xl font-black tracking-tighter text-white"
                    >
                        {info.tag}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted inline-flex items-center gap-1.5">
                        <Calendar size={11} />
                        Published {timeAgo(info.published_at)}
                    </span>
                </div>
                {info.name && info.name !== info.tag && (
                    <div className="text-sm text-white">{info.name}</div>
                )}
            </div>

            {/* Assets */}
            <div className="border-b border-white/10">
                <div className="px-6 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-jb-muted">
                        &gt; binaries · {info.assets.length}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                        click to download
                    </span>
                </div>
                {info.assets.length === 0 ? (
                    <div className="px-6 py-8 text-center font-mono text-sm text-jb-muted">
                        This release ships no binary assets. View the source
                        on GitHub.
                    </div>
                ) : (
                    <ul>
                        {info.assets.map((a, i) => (
                            <li
                                key={i}
                                data-testid={`release-asset-${i}`}
                                className="border-b border-white/5 last:border-b-0"
                            >
                                <a
                                    href={a.download_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => onDownload(a)}
                                    data-testid={`release-asset-download-${i}`}
                                    className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 hover:bg-jb-primary/5 transition-colors"
                                >
                                    <span className="inline-flex items-center justify-center w-8 h-8 border border-white/15 group-hover:border-jb-primary/60 transition-colors shrink-0">
                                        <HardDrive
                                            size={14}
                                            className="text-jb-muted group-hover:text-jb-primary transition-colors"
                                        />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block font-mono text-sm text-white truncate">
                                            {a.name}
                                        </span>
                                        <span className="flex items-center gap-3 mt-0.5">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                                                {platformGuess(a.name)}
                                            </span>
                                            <span className="font-mono text-[10px] text-jb-muted">
                                                {formatSize(a.size)}
                                            </span>
                                            <span className="font-mono text-[10px] text-jb-muted">
                                                {a.download_count.toLocaleString()} downloads
                                            </span>
                                        </span>
                                    </span>
                                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary group-hover:text-white transition-colors shrink-0">
                                        <Download size={14} strokeWidth={2.5} />
                                        Download
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Release notes */}
            {info.body && (
                <details
                    data-testid="release-notes"
                    className="group"
                >
                    <summary className="px-6 py-4 cursor-pointer font-mono text-[10px] uppercase tracking-[0.28em] text-jb-muted hover:text-jb-primary transition-colors flex items-center justify-between">
                        &gt; release notes
                        <span className="text-jb-primary group-open:rotate-90 transition-transform">
                            →
                        </span>
                    </summary>
                    <pre className="px-6 pb-6 font-mono text-xs text-jb-muted leading-relaxed whitespace-pre-wrap break-words">
                        {info.body}
                    </pre>
                </details>
            )}
        </div>
    );
}
