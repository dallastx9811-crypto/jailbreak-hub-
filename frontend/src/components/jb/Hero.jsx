import { ShieldAlert, Cpu, Cable, BookOpen } from "lucide-react";

export default function Hero({ stats }) {
    return (
        <section
            id="top"
            data-testid="hero"
            className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden jb-scanline jb-noise"
        >
            <div className="absolute inset-0 jb-grid-bg opacity-60" />
            <div className="absolute -top-20 -right-20 w-[520px] h-[520px] rounded-full bg-jb-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-40 -left-20 w-[420px] h-[420px] rounded-full bg-jb-accent/10 blur-[120px] pointer-events-none" />

            <div className="relative px-6 md:px-12 lg:px-24">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-8 jb-rise">
                        <div className="inline-flex items-center gap-2 border border-white/10 bg-black/50 px-3 py-1.5 mb-8">
                            <span className="w-1.5 h-1.5 bg-jb-primary animate-pulse" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-jb-muted">
                                System online · Research archive
                            </span>
                        </div>

                        <h1
                            data-testid="hero-title"
                            className="font-mono text-4xl sm:text-5xl lg:text-[5.5rem] leading-[0.95] tracking-tighter font-black mb-6"
                        >
                            The <span className="text-jb-primary">iOS jailbreak</span>
                            <br />
                            knowledge base<span className="jb-caret" />
                        </h1>

                        <p className="text-jb-muted text-base md:text-lg max-w-2xl leading-relaxed mb-8">
                            A curated, up-to-date catalog of every major iOS and
                            iPadOS jailbreak — from checkm8-era legends like{" "}
                            <span className="text-white font-mono">checkra1n</span>{" "}
                            to modern rootless releases like{" "}
                            <span className="text-white font-mono">Dopamine</span>{" "}
                            and{" "}
                            <span className="text-white font-mono">palera1n</span>
                            . Check compatibility, read research, and learn the
                            craft.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-12">
                            <a
                                href="#checker"
                                data-testid="hero-cta-primary"
                                className="inline-flex items-center gap-2 bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-6 py-3.5 hover:bg-[#00cc33] transition-colors"
                            >
                                <Cpu size={16} strokeWidth={2.5} />
                                Run compatibility check
                            </a>
                            <a
                                href="#tools"
                                data-testid="hero-cta-secondary"
                                className="inline-flex items-center gap-2 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-6 py-3.5 hover:border-white hover:bg-white/5 transition-colors"
                            >
                                <BookOpen size={16} strokeWidth={2.5} />
                                Browse tools
                            </a>
                        </div>

                        {/* Disclaimer */}
                        <div
                            data-testid="hero-disclaimer"
                            className="flex items-start gap-3 border border-jb-danger/40 bg-jb-danger/5 p-4 max-w-2xl"
                        >
                            <ShieldAlert
                                size={18}
                                className="text-jb-danger mt-0.5 shrink-0"
                            />
                            <p className="text-sm text-jb-muted leading-relaxed">
                                <span className="text-jb-danger font-mono uppercase tracking-[0.2em] text-xs">
                                    Disclaimer:
                                </span>{" "}
                                This site is an educational archive. Jailbreaking
                                may void warranty, compromise security, and is
                                regulated differently by jurisdiction. We do not
                                distribute exploits. Proceed at your own risk.
                            </p>
                        </div>
                    </div>

                    {/* Terminal window */}
                    <div className="lg:col-span-4 jb-rise" style={{ animationDelay: "150ms" }}>
                        <TerminalWindow stats={stats} />
                    </div>
                </div>

                {/* Stats strip */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-b border-white/10">
                    <Stat
                        label="Jailbreak tools"
                        value={stats.tools}
                        testid="stat-tools"
                    />
                    <Stat
                        label="Devices tracked"
                        value={stats.devices}
                        testid="stat-devices"
                    />
                    <Stat
                        label="iOS versions"
                        value={stats.ios_versions}
                        testid="stat-ios"
                    />
                    <Stat
                        label="Tutorials"
                        value={stats.tutorials}
                        testid="stat-tutorials"
                    />
                </div>
            </div>
        </section>
    );
}

function Stat({ label, value, testid }) {
    return (
        <div
            data-testid={testid}
            className="p-6 md:p-8 border-r border-white/10 last:border-r-0 odd:border-b md:odd:border-b-0"
        >
            <div className="font-mono text-4xl md:text-5xl text-jb-primary font-black tracking-tighter">
                {String(value).padStart(2, "0")}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-jb-muted mt-2">
                {label}
            </div>
        </div>
    );
}

function TerminalWindow({ stats }) {
    return (
        <div className="border border-white/10 bg-jb-surface font-mono text-[13px] leading-relaxed">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-black">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c940]" />
                <span className="ml-auto text-[10px] text-jb-muted uppercase tracking-[0.2em]">
                    ~/jb-hub — zsh
                </span>
            </div>
            <div className="p-5 space-y-1.5 text-jb-muted">
                <div>
                    <span className="text-jb-primary">$</span> jb status
                </div>
                <div className="pl-3">
                    [<span className="text-jb-accent">ok</span>] catalog synced
                </div>
                <div className="pl-3">
                    [<span className="text-jb-accent">ok</span>] {stats.tools} tools indexed
                </div>
                <div className="pl-3">
                    [<span className="text-jb-accent">ok</span>] {stats.devices} devices tracked
                </div>
                <div className="pt-2">
                    <span className="text-jb-primary">$</span> jb check --device
                    iphone-x --ios 16.7
                </div>
                <div className="pl-3 text-white">
                    → palera1n <span className="text-jb-muted">(rootless · semi-tethered)</span>
                </div>
                <div className="pt-2">
                    <span className="text-jb-primary">$</span>
                    <span className="jb-caret" />
                </div>
            </div>
        </div>
    );
}
