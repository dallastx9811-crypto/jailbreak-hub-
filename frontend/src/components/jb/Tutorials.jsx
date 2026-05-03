import { useEffect, useState } from "react";
import { getTutorials } from "@/lib/api";
import SectionHeader from "@/components/jb/SectionHeader";
import { Clock, Gauge, ChevronRight } from "lucide-react";

export default function Tutorials() {
    const [tutorials, setTutorials] = useState([]);
    const [open, setOpen] = useState(null);

    useEffect(() => {
        getTutorials().then(setTutorials).catch(() => {});
    }, []);

    return (
        <section
            id="tutorials"
            data-testid="tutorials-section"
            className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-white/10"
        >
            <SectionHeader
                kicker="04 · Runbook.docs"
                title="Tutorials & runbooks"
                description="Step-by-step guides curated from community documentation. Read before you execute."
            />

            <div className="mt-12 border border-white/10">
                {tutorials.map((t, i) => {
                    const isOpen = open === t.id;
                    return (
                        <div
                            key={t.id}
                            data-testid={`tutorial-${t.id}`}
                            className="border-b border-white/10 last:border-b-0"
                        >
                            <button
                                data-testid={`tutorial-toggle-${t.id}`}
                                onClick={() =>
                                    setOpen(isOpen ? null : t.id)
                                }
                                className="w-full flex items-center gap-6 px-6 md:px-10 py-7 hover:bg-jb-primary/5 transition-colors text-left"
                            >
                                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-jb-muted w-10 shrink-0">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="flex-1">
                                    <span className="block font-mono text-lg md:text-xl font-bold text-white">
                                        {t.title}
                                    </span>
                                    <span className="flex items-center gap-4 mt-1.5">
                                        <Meta
                                            icon={<Clock size={12} />}
                                            label={t.duration}
                                        />
                                        <Meta
                                            icon={<Gauge size={12} />}
                                            label={t.difficulty}
                                        />
                                    </span>
                                </span>
                                <ChevronRight
                                    size={18}
                                    className={`text-jb-primary transition-transform ${
                                        isOpen ? "rotate-90" : ""
                                    }`}
                                />
                            </button>
                            {isOpen && (
                                <div className="px-6 md:px-10 pb-8 pt-2">
                                    <div className="pl-16 space-y-3">
                                        {t.steps.map((s, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-4 font-mono text-sm"
                                            >
                                                <span className="text-jb-primary shrink-0">
                                                    {String(idx + 1).padStart(
                                                        2,
                                                        "0",
                                                    )}{" "}
                                                    →
                                                </span>
                                                <span className="text-jb-muted leading-relaxed">
                                                    {s}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function Meta({ icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-jb-muted">
            {icon}
            {label}
        </span>
    );
}
