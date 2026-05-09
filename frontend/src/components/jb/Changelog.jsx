import { useEffect, useState } from "react";
import { GitCommit, ChevronDown, Loader2, X } from "lucide-react";
import { getToolChangelog } from "@/lib/api";

const STORAGE_PREFIX = "jbhub_last_release_";

export const lastReleaseKey = (toolId) => `${STORAGE_PREFIX}${toolId}`;

export function recordDownloadedTag(toolId, tag) {
    if (!toolId || !tag) return;
    try {
        localStorage.setItem(lastReleaseKey(toolId), tag);
    } catch {
        /* ignore quota errors */
    }
}

export default function Changelog({ toolId, currentTag }) {
    const [storedTag, setStoredTag] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openIdx, setOpenIdx] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        try {
            const v = localStorage.getItem(lastReleaseKey(toolId));
            setStoredTag(v);
        } catch {
            setStoredTag(null);
        }
    }, [toolId]);

    useEffect(() => {
        // Only fetch if user has a stored tag AND it differs from current
        if (!storedTag || !currentTag || storedTag === currentTag || dismissed) {
            return;
        }
        setLoading(true);
        getToolChangelog(toolId, storedTag)
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [toolId, storedTag, currentTag, dismissed]);

    const dismiss = () => {
        setDismissed(true);
        // mark as up to date
        recordDownloadedTag(toolId, currentTag);
        setStoredTag(currentTag);
    };

    if (!storedTag || storedTag === currentTag || dismissed) return null;

    return (
        <div
            data-testid="changelog-panel"
            className="border border-jb-accent/40 bg-jb-accent/5 mt-6"
        >
            <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-jb-accent/30">
                <div className="flex items-center gap-3 min-w-0">
                    <GitCommit size={14} className="text-jb-accent shrink-0" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-jb-accent truncate">
                        Update available · you're on{" "}
                        <span className="text-white">{storedTag}</span>, latest
                        is <span className="text-white">{currentTag}</span>
                    </span>
                </div>
                <button
                    data-testid="changelog-dismiss"
                    onClick={dismiss}
                    className="text-jb-muted hover:text-white shrink-0"
                    title="Mark as updated"
                >
                    <X size={14} />
                </button>
            </header>

            {loading && (
                <div className="px-6 py-6 flex items-center gap-2 font-mono text-xs text-jb-muted">
                    <Loader2 size={14} className="animate-spin text-jb-accent" />
                    Loading changelog...
                </div>
            )}

            {data && data.releases && data.releases.length > 0 && (
                <ul data-testid="changelog-list">
                    {data.releases.map((r, i) => {
                        const open = openIdx === i;
                        return (
                            <li
                                key={r.tag}
                                data-testid={`changelog-entry-${i}`}
                                className="border-b border-jb-accent/20 last:border-b-0"
                            >
                                <button
                                    onClick={() => setOpenIdx(open ? -1 : i)}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-jb-accent/5 transition-colors text-left"
                                >
                                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted w-10 shrink-0">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block font-mono text-sm font-bold text-white">
                                            {r.tag}
                                        </span>
                                        {r.name && r.name !== r.tag && (
                                            <span className="block text-xs text-jb-muted truncate mt-0.5">
                                                {r.name}
                                            </span>
                                        )}
                                    </span>
                                    {r.published_at && (
                                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted hidden sm:inline">
                                            {new Date(
                                                r.published_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    )}
                                    <ChevronDown
                                        size={14}
                                        className={`text-jb-accent transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {open && r.body && (
                                    <pre className="px-6 pb-5 pl-20 font-mono text-xs text-jb-muted leading-relaxed whitespace-pre-wrap break-words">
                                        {r.body}
                                    </pre>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {data && data.releases && data.releases.length === 0 && (
                <div className="px-6 py-6 font-mono text-xs text-jb-muted">
                    Couldn't find releases between {storedTag} and{" "}
                    {currentTag}. Visit GitHub for full history.
                </div>
            )}
        </div>
    );
}
