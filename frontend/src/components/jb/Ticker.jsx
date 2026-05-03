const ITEMS = [
    "palera1n 2.0 · iOS 17.7.2",
    "Dopamine 2.2 · kernel stability",
    "RootHide · detection bypass",
    "iOS 18 research · POC 2025",
    "checkm8 · A9–A11 legacy",
    "TrollStore · CoreTrust revived",
    "Cydia 1.1.38 · TLS 1.3",
    "XinaA15 · A15 rootless",
];

export default function Ticker() {
    const line = [...ITEMS, ...ITEMS];
    return (
        <div
            data-testid="ticker"
            className="border-t border-b border-white/10 bg-black overflow-hidden"
        >
            <div className="flex items-center whitespace-nowrap py-3 jb-ticker">
                {line.map((t, i) => (
                    <span
                        key={i}
                        className="font-mono text-[11px] uppercase tracking-[0.3em] text-jb-muted px-6 flex items-center gap-6"
                    >
                        <span className="text-jb-primary">◉</span>
                        {t}
                    </span>
                ))}
            </div>
        </div>
    );
}
