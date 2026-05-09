import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Package, Cpu, Shield, ArrowUpRight } from "lucide-react";
import { getTools } from "@/lib/api";
import SectionHeader from "@/components/jb/SectionHeader";
import { toast } from "sonner";

const FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "legacy", label: "Legacy" },
    { id: "rootless", label: "Rootless" },
    { id: "rootful", label: "Rootful" },
];

export default function ToolsDirectory() {
    const [tools, setTools] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        getTools()
            .then(setTools)
            .catch(() => toast.error("Failed to load tools"));
    }, []);

    const filtered = tools.filter((t) => {
        if (filter === "all") return true;
        if (filter === "active") return t.status === "active";
        if (filter === "legacy") return t.status === "legacy";
        if (filter === "rootless") return !t.rootful;
        if (filter === "rootful") return t.rootful;
        return true;
    });

    return (
        <section
            id="tools"
            data-testid="tools-section"
            className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-white/10"
        >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
                <SectionHeader
                    kicker="02 · Payload.registry"
                    title="Jailbreak tools directory"
                    description="The definitive index. Every tool tagged by release status, SoC coverage, package manager, and maintainer."
                />
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            data-testid={`tools-filter-${f.id}`}
                            onClick={() => setFilter(f.id)}
                            className={`font-mono text-[11px] uppercase tracking-[0.22em] px-4 py-2.5 border transition-colors ${
                                filter === f.id
                                    ? "border-jb-primary bg-jb-primary text-black"
                                    : "border-white/15 text-jb-muted hover:border-white hover:text-white"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/10">
                {filtered.map((t, i) => (
                    <ToolCard key={t.id} tool={t} idx={i} />
                ))}
            </div>
        </section>
    );
}

function ToolCard({ tool, idx }) {
    const statusColor =
        tool.status === "active" ? "text-jb-primary" : "text-jb-muted";

    return (
        <article
            data-testid={`tool-card-${tool.id}`}
            className="group relative border-r border-b border-white/10 p-7 hover:bg-jb-primary/[0.03] transition-colors"
        >
            <div className="flex items-start justify-between mb-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                    #{String(idx + 1).padStart(2, "0")}
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`w-1.5 h-1.5 ${
                            tool.status === "active"
                                ? "bg-jb-primary"
                                : "bg-jb-muted"
                        }`}
                    />
                    <span
                        className={`font-mono text-[10px] uppercase tracking-[0.22em] ${statusColor}`}
                    >
                        {tool.status}
                    </span>
                </div>
            </div>

            <h3 className="font-mono text-2xl font-black tracking-tight mb-1">
                {tool.name}
            </h3>
            <p className="text-jb-muted text-sm mb-5">{tool.tagline}</p>

            <div className="space-y-2 text-xs font-mono border-t border-white/10 pt-5 mb-6">
                <Row k="type" v={tool.type} />
                <Row k="ios" v={`${tool.ios_min} → ${tool.ios_max}`} />
                <Row k="soc" v={tool.soc.join(", ")} />
                <Row k="rootless" v={tool.rootful ? "no" : "yes"} />
                <Row k="pkg" v={tool.package_manager} />
                <Row k="dev" v={tool.developer} />
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-5">
                <Chip icon={<Cpu size={11} />} label={tool.soc[0]} />
                <Chip icon={<Package size={11} />} label={tool.package_manager.split(" ")[0]} />
                <Chip
                    icon={<Shield size={11} />}
                    label={tool.rootful ? "rootful" : "rootless"}
                />
            </div>

            <a
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                data-testid={`tool-link-${tool.id}`}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-jb-muted hover:text-white transition-colors"
            >
                Project site
                <ExternalLink size={12} />
            </a>
            <Link
                to={`/tool/${tool.id}`}
                data-testid={`tool-detail-link-${tool.id}`}
                className="mt-4 inline-flex items-center justify-between gap-2 font-mono text-xs uppercase tracking-[0.22em] text-jb-primary hover:text-white border border-jb-primary/40 hover:border-white px-4 py-2.5 w-full transition-colors"
            >
                View install guide
                <ArrowUpRight size={14} />
            </Link>
        </article>
    );
}

function Row({ k, v }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-jb-muted uppercase tracking-[0.18em]">
                {k}
            </span>
            <span className="text-white text-right">{v}</span>
        </div>
    );
}

function Chip({ icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-jb-muted">
            {icon}
            {label}
        </span>
    );
}
