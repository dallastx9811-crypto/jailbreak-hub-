import { AlertTriangle, Lock, Zap, HeartCrack } from "lucide-react";
import SectionHeader from "@/components/jb/SectionHeader";

const RISKS = [
    {
        icon: Lock,
        title: "Security surface expands",
        body: "Jailbreaking disables key OS mitigations. Malicious tweaks can read keychain data and background activity.",
    },
    {
        icon: HeartCrack,
        title: "Warranty & services",
        body: "Apple Pay, Banking, and streaming apps may refuse to run. Warranty service can be denied while jailbroken.",
    },
    {
        icon: Zap,
        title: "Update path",
        body: "A jailbroken device cannot always update cleanly. Rootless jailbreaks are gentler, but never free of risk.",
    },
    {
        icon: AlertTriangle,
        title: "Bricks are rare, not impossible",
        body: "Every jailbreak ships with recovery tooling. Do not skip a backup — data loss is the most common outcome.",
    },
];

export default function Risks() {
    return (
        <section
            id="risks"
            data-testid="risks-section"
            className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-white/10 bg-black/60"
        >
            <SectionHeader
                kicker="07 · Threat.model"
                title="Risks you should accept"
                description="Jailbreaking is a tradeoff. Understand what you give up before you run anything."
            />

            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-jb-danger/30">
                {RISKS.map((r, i) => {
                    const Icon = r.icon;
                    return (
                        <div
                            key={i}
                            data-testid={`risk-${i}`}
                            className="p-8 border-r border-b border-jb-danger/30 last:border-r-0 md:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(2n)]:border-r"
                        >
                            <div className="w-10 h-10 border border-jb-danger/40 flex items-center justify-center mb-5">
                                <Icon size={18} className="text-jb-danger" />
                            </div>
                            <h3 className="font-mono text-lg font-bold mb-3 text-white">
                                {r.title}
                            </h3>
                            <p className="text-sm text-jb-muted leading-relaxed">
                                {r.body}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
