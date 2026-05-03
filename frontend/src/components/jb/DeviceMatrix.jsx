import { useEffect, useState } from "react";
import { getDevices } from "@/lib/api";
import SectionHeader from "@/components/jb/SectionHeader";

export default function DeviceMatrix() {
    const [devices, setDevices] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getDevices().then(setDevices).catch(() => {});
    }, []);

    const filtered = devices.filter((d) =>
        (d.name + d.soc).toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <section
            id="matrix"
            data-testid="matrix-section"
            className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-white/10 bg-black/40"
        >
            <SectionHeader
                kicker="03 · Silicon.map"
                title="Device support matrix"
                description="From A9 to A17 Pro. Every iPhone and iPad we track, with their max iOS and SoC generation."
            />

            <div className="mt-10 mb-6 flex items-center gap-3 border border-white/10 bg-jb-surface px-4 py-3 max-w-md">
                <span className="font-mono text-jb-primary text-sm">$</span>
                <input
                    data-testid="matrix-search"
                    type="text"
                    placeholder="grep device or SoC..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-jb-muted text-white"
                />
            </div>

            <div className="border border-white/10 overflow-x-auto">
                <table className="w-full font-mono text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-black">
                            <Th>#</Th>
                            <Th>Device</Th>
                            <Th>Chip</Th>
                            <Th>Max iOS</Th>
                            <Th>Arch</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((d, i) => (
                            <tr
                                key={d.id}
                                data-testid={`matrix-row-${d.id}`}
                                className="border-b border-white/5 hover:bg-jb-primary/5 transition-colors"
                            >
                                <Td>
                                    <span className="text-jb-muted">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-white font-medium">
                                        {d.name}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-jb-accent">{d.soc}</span>
                                </Td>
                                <Td>
                                    <span className="text-white">{d.max_ios}</span>
                                </Td>
                                <Td>
                                    <span className="text-jb-muted">
                                        {isArm64e(d.soc) ? "arm64e" : "arm64"}
                                    </span>
                                </Td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-8 text-center text-jb-muted"
                                >
                                    No matching devices.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function Th({ children }) {
    return (
        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-jb-muted font-normal">
            {children}
        </th>
    );
}

function Td({ children }) {
    return <td className="px-5 py-3">{children}</td>;
}

function isArm64e(soc) {
    const arm64e = ["A12", "A13", "A14", "A15", "A16", "A17", "M1", "M2"];
    return arm64e.some((s) => soc.includes(s));
}
