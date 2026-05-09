import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Zap, Loader2, ArrowUpRight } from "lucide-react";
import {
    getDevices,
    getIosVersions,
    checkCompatibility,
} from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SectionHeader from "@/components/jb/SectionHeader";

export default function CompatibilityChecker() {
    const [devices, setDevices] = useState([]);
    const [versions, setVersions] = useState([]);
    const [device, setDevice] = useState("");
    const [version, setVersion] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([getDevices(), getIosVersions()])
            .then(([d, v]) => {
                setDevices(d);
                setVersions(v);
            })
            .catch(() => toast.error("Failed to load lookup data"));
    }, []);

    const canCheck = useMemo(() => device && version, [device, version]);

    const run = async () => {
        if (!canCheck) {
            toast.error("Select a device and iOS version");
            return;
        }
        setLoading(true);
        try {
            const res = await checkCompatibility(device, version);
            setResult(res);
            toast.success(res.note);
        } catch (e) {
            toast.error("Compatibility check failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            id="checker"
            data-testid="compat-section"
            className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24"
        >
            <div className="absolute inset-0 jb-grid-bg opacity-30" />
            <div className="relative">
                <SectionHeader
                    kicker="01 · Kernel.audit"
                    title="Compatibility checker"
                    description="Pick your device and current iOS version. We'll tell you which jailbreaks are compatible — and which are out of reach."
                />

                <div className="jb-glow-border bg-jb-surface border border-jb-primary/30 p-6 md:p-10 mt-12">
                    <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 md:gap-6 items-end">
                        <Field label="> device">
                            <Select value={device} onValueChange={setDevice}>
                                <SelectTrigger
                                    data-testid="compat-device-trigger"
                                    className="bg-black border-white/15 rounded-none h-12 font-mono text-sm focus:ring-jb-primary focus:border-jb-primary"
                                >
                                    <SelectValue placeholder="Select device..." />
                                </SelectTrigger>
                                <SelectContent
                                    className="bg-jb-surface border-white/15 rounded-none font-mono max-h-80"
                                >
                                    {devices.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={d.id}
                                            data-testid={`compat-device-${d.id}`}
                                            className="font-mono text-sm focus:bg-jb-primary/10 focus:text-jb-primary rounded-none"
                                        >
                                            {d.name} · {d.soc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="> ios version">
                            <Select value={version} onValueChange={setVersion}>
                                <SelectTrigger
                                    data-testid="compat-ios-trigger"
                                    className="bg-black border-white/15 rounded-none h-12 font-mono text-sm focus:ring-jb-primary focus:border-jb-primary"
                                >
                                    <SelectValue placeholder="Select iOS..." />
                                </SelectTrigger>
                                <SelectContent className="bg-jb-surface border-white/15 rounded-none font-mono max-h-80">
                                    {versions.map((v) => (
                                        <SelectItem
                                            key={v}
                                            value={v}
                                            data-testid={`compat-ios-${v}`}
                                            className="font-mono text-sm focus:bg-jb-primary/10 focus:text-jb-primary rounded-none"
                                        >
                                            iOS {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <button
                            data-testid="compat-run-btn"
                            onClick={run}
                            disabled={!canCheck || loading}
                            className="h-12 px-8 bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.22em] hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Zap size={16} strokeWidth={2.5} />
                            )}
                            Execute
                        </button>
                    </div>

                    {/* Result */}
                    {result && (
                        <div
                            data-testid="compat-result"
                            className="mt-10 border-t border-white/10 pt-8 jb-rise"
                        >
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-jb-muted">
                                    Query result
                                </span>
                                <span className="font-mono text-xs text-white">
                                    {result.device.name}
                                </span>
                                <span className="text-jb-muted">·</span>
                                <span className="font-mono text-xs text-white">
                                    iOS {result.ios_version}
                                </span>
                                <span className="text-jb-muted">·</span>
                                <span className="font-mono text-xs text-jb-accent">
                                    SoC {result.device.soc}
                                </span>
                            </div>

                            {result.compatible_tools.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {result.compatible_tools.map((t) => (
                                        <Link
                                            key={t.id}
                                            to={`/tool/${t.id}`}
                                            data-testid={`compat-tool-${t.id}`}
                                            className="group border border-jb-primary/40 bg-black/40 p-5 hover:bg-jb-primary/5 transition-colors block"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2
                                                        size={14}
                                                        className="text-jb-primary"
                                                    />
                                                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary">
                                                        compatible
                                                    </span>
                                                </div>
                                                <ArrowUpRight
                                                    size={14}
                                                    className="text-jb-muted group-hover:text-jb-primary transition-colors"
                                                />
                                            </div>
                                            <div className="font-mono text-lg font-bold">
                                                {t.name}
                                            </div>
                                            <div className="text-xs text-jb-muted mt-1">
                                                {t.type} · {t.package_manager}
                                            </div>
                                            <div className="text-xs text-jb-muted mt-3 font-mono">
                                                iOS {t.ios_min} → {t.ios_max}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary">
                                                view install guide →
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 border border-jb-danger/40 bg-jb-danger/5 p-5">
                                    <XCircle
                                        size={18}
                                        className="text-jb-danger mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <div className="font-mono text-sm font-bold text-white mb-1">
                                            No compatible jailbreak found
                                        </div>
                                        <div className="text-sm text-jb-muted">
                                            {result.note}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block font-mono text-[11px] uppercase tracking-[0.22em] text-jb-primary mb-2">
                {label}
            </label>
            {children}
        </div>
    );
}
