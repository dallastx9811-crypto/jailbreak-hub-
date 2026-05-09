import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    ExternalLink,
    Copy,
    Check,
    AlertTriangle,
    Cpu,
    Package,
    Shield,
    Terminal as TerminalIcon,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getToolDetail } from "@/lib/api";
import Nav from "@/components/jb/Nav";
import Footer from "@/components/jb/Footer";

export default function ToolDetail() {
    const { id } = useParams();
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        getToolDetail(id)
            .then((t) => {
                setTool(t);
                setLoading(false);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-jb-bg text-white flex items-center justify-center font-mono text-sm text-jb-muted">
                <Loader2 className="animate-spin mr-3" size={18} /> loading tool...
            </main>
        );
    }

    if (error || !tool) {
        return (
            <main className="min-h-screen bg-jb-bg text-white flex flex-col items-center justify-center gap-4 px-6">
                <div className="font-mono text-jb-danger uppercase tracking-[0.22em] text-sm">
                    404 · tool not found
                </div>
                <Link
                    to="/"
                    className="font-mono text-xs uppercase tracking-[0.22em] text-jb-primary hover:underline"
                    data-testid="tool-detail-back"
                >
                    ← back to hub
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-jb-bg text-white">
            <Nav />

            {/* Hero */}
            <section
                data-testid="tool-detail-hero"
                className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-12 lg:px-24 overflow-hidden"
            >
                <div className="absolute inset-0 jb-grid-bg opacity-40" />
                <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-jb-primary/10 blur-[120px]" />

                <div className="relative max-w-5xl">
                    <Link
                        to="/#tools"
                        data-testid="tool-detail-back-link"
                        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-jb-muted hover:text-jb-primary mb-10"
                    >
                        <ArrowLeft size={14} />
                        Back to all tools
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="inline-flex items-center gap-2 border border-white/10 bg-black/50 px-3 py-1.5">
                            <span
                                className={`w-1.5 h-1.5 ${tool.status === "active" ? "bg-jb-primary animate-pulse" : "bg-jb-muted"}`}
                            />
                            <span
                                className={`font-mono text-[10px] uppercase tracking-[0.28em] ${tool.status === "active" ? "text-jb-primary" : "text-jb-muted"}`}
                            >
                                {tool.status}
                            </span>
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                            {tool.type}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                            iOS {tool.ios_min} → {tool.ios_max}
                        </span>
                    </div>

                    <h1
                        data-testid="tool-detail-title"
                        className="font-mono text-5xl md:text-7xl font-black tracking-tighter mb-4"
                    >
                        {tool.name}
                    </h1>
                    <p className="text-jb-muted text-base md:text-xl max-w-3xl leading-relaxed mb-8">
                        {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {tool.download_url && (
                            <a
                                href={tool.download_url}
                                target="_blank"
                                rel="noreferrer"
                                data-testid="tool-detail-download"
                                className="inline-flex items-center gap-2 bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.22em] px-6 py-3.5 hover:bg-[#00cc33] transition-colors"
                            >
                                <Download size={14} strokeWidth={2.5} />
                                Download from official source
                            </a>
                        )}
                        <a
                            href={tool.official_site || tool.url}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="tool-detail-official"
                            className="inline-flex items-center gap-2 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-[0.22em] px-6 py-3.5 hover:border-white hover:bg-white/5 transition-colors"
                        >
                            <ExternalLink size={14} strokeWidth={2.5} />
                            Visit project site
                        </a>
                    </div>
                </div>
            </section>

            {/* Meta strip */}
            <section className="border-t border-b border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-4">
                    <Meta
                        icon={<Cpu size={14} />}
                        label="SoC support"
                        value={tool.soc.join(", ")}
                    />
                    <Meta
                        icon={<Package size={14} />}
                        label="Package mgr"
                        value={tool.package_manager}
                    />
                    <Meta
                        icon={<Shield size={14} />}
                        label="Mode"
                        value={tool.rootful ? "Rootful" : "Rootless"}
                    />
                    <Meta
                        icon={<TerminalIcon size={14} />}
                        label="Maintainer"
                        value={tool.developer}
                    />
                </div>
            </section>

            {/* Requirements */}
            {tool.requirements && (
                <Section
                    kicker="01 · Pre-flight"
                    title="Requirements checklist"
                    description="Confirm each item before you begin. Skipping any of these is the most common cause of failure."
                >
                    <ul className="grid md:grid-cols-2 gap-0 border border-white/10">
                        {tool.requirements.map((r, i) => (
                            <li
                                key={i}
                                data-testid={`tool-req-${i}`}
                                className="flex items-start gap-4 px-6 py-5 border-r border-b border-white/10 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r-0"
                            >
                                <span className="font-mono text-[11px] text-jb-primary uppercase tracking-[0.22em] w-8 shrink-0 pt-0.5">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-sm text-jb-muted leading-relaxed">
                                    {r}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Commands */}
            {tool.commands && tool.commands.length > 0 && (
                <Section
                    kicker="02 · Shell.commands"
                    title="Install commands"
                    description="Copy and paste into your terminal. Always read what a command does before running it."
                >
                    <div className="space-y-4">
                        {tool.commands.map((c, i) => (
                            <CommandBlock key={i} cmd={c} idx={i} />
                        ))}
                    </div>
                </Section>
            )}

            {/* Install steps */}
            {tool.install_steps && (
                <Section
                    kicker="03 · Procedure"
                    title="Step-by-step install"
                    description="Follow in order. If something fails, jump to troubleshooting."
                    dark
                >
                    <ol className="border border-white/10">
                        {tool.install_steps.map((s, i) => (
                            <li
                                key={i}
                                data-testid={`tool-step-${i}`}
                                className="flex items-start gap-6 px-6 md:px-10 py-6 border-b border-white/10 last:border-b-0"
                            >
                                <span className="font-mono text-2xl md:text-3xl text-jb-primary font-black tracking-tighter shrink-0 leading-none">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-base text-jb-muted leading-relaxed pt-1">
                                    {s}
                                </span>
                            </li>
                        ))}
                    </ol>
                </Section>
            )}

            {/* Troubleshooting */}
            {tool.troubleshooting && tool.troubleshooting.length > 0 && (
                <Section
                    kicker="04 · Postmortem"
                    title="Troubleshooting"
                    description="Common failures and the fixes that work."
                >
                    <div className="grid md:grid-cols-2 gap-0 border border-jb-danger/30">
                        {tool.troubleshooting.map((t, i) => (
                            <div
                                key={i}
                                data-testid={`tool-trouble-${i}`}
                                className="p-6 md:p-8 border-r border-b border-jb-danger/30 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r-0"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle
                                        size={14}
                                        className="text-jb-danger"
                                    />
                                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-danger">
                                        symptom
                                    </span>
                                </div>
                                <h3 className="font-mono text-base font-bold text-white mb-3">
                                    {t.problem}
                                </h3>
                                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary mb-2">
                                    → fix
                                </div>
                                <p className="text-sm text-jb-muted leading-relaxed">
                                    {t.fix}
                                </p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Disclaimer footer */}
            <section className="px-6 md:px-12 lg:px-24 py-16 border-t border-white/10">
                <div className="border border-jb-danger/40 bg-jb-danger/5 p-6 md:p-8 max-w-4xl">
                    <div className="flex items-start gap-4">
                        <AlertTriangle
                            size={20}
                            className="text-jb-danger shrink-0 mt-1"
                        />
                        <div>
                            <div className="font-mono text-xs uppercase tracking-[0.22em] text-jb-danger mb-2">
                                Educational use only
                            </div>
                            <p className="text-sm text-jb-muted leading-relaxed">
                                This page summarises publicly available
                                installation instructions from the official{" "}
                                <a
                                    href={tool.official_site || tool.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-jb-primary hover:underline"
                                >
                                    {tool.developer}
                                </a>{" "}
                                project. Always verify the binary signature
                                from the official source before running.
                                Jailbreaking may void warranty, disable Apple
                                services, and reduce security. Proceed at your
                                own risk.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function Section({ kicker, title, description, children, dark }) {
    return (
        <section
            className={`px-6 md:px-12 lg:px-24 py-20 md:py-28 border-t border-white/10 ${dark ? "bg-black/40" : ""}`}
        >
            <div className="max-w-3xl mb-12">
                {kicker && (
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-jb-primary mb-4">
                        {kicker}
                    </div>
                )}
                <h2 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter mb-3">
                    {title}
                </h2>
                {description && (
                    <p className="text-jb-muted leading-relaxed">{description}</p>
                )}
            </div>
            {children}
        </section>
    );
}

function Meta({ icon, label, value }) {
    return (
        <div className="px-6 md:px-8 py-6 border-r border-white/10 last:border-r-0 odd:border-b md:odd:border-b-0">
            <div className="flex items-center gap-2 text-jb-muted mb-2">
                {icon}
                <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                    {label}
                </span>
            </div>
            <div className="font-mono text-sm text-white truncate">{value}</div>
        </div>
    );
}

function CommandBlock({ cmd, idx }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(cmd.code);
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error("Copy failed");
        }
    };

    return (
        <div
            data-testid={`tool-cmd-${idx}`}
            className="border border-white/10 bg-jb-surface"
        >
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-black">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-jb-primary font-mono">$</span>
                    <span className="font-mono text-xs text-white truncate">
                        {cmd.label}
                    </span>
                    <span className="hidden md:inline-flex font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted border border-white/10 px-2 py-0.5">
                        {cmd.platform}
                    </span>
                </div>
                <button
                    data-testid={`tool-cmd-copy-${idx}`}
                    onClick={copy}
                    className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted hover:text-jb-primary transition-colors shrink-0"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-jb-primary" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="px-5 py-4 font-mono text-sm text-white overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {cmd.code}
            </pre>
        </div>
    );
}
