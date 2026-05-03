import { useEffect, useState } from "react";
import { Terminal, Menu, X } from "lucide-react";

const LINKS = [
    { href: "#checker", label: "Checker" },
    { href: "#tools", label: "Tools" },
    { href: "#matrix", label: "Matrix" },
    { href: "#tutorials", label: "Tutorials" },
    { href: "#news", label: "News" },
    { href: "#faq", label: "FAQ" },
];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 8);
        on();
        window.addEventListener("scroll", on);
        return () => window.removeEventListener("scroll", on);
    }, []);

    return (
        <header
            data-testid="site-nav"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-black/70 backdrop-blur-xl border-b border-white/10"
                    : "bg-transparent"
            }`}
        >
            <div className="px-6 md:px-12 lg:px-24">
                <div className="flex items-center justify-between h-16">
                    <a
                        href="#top"
                        data-testid="nav-logo"
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-9 h-9 border border-jb-primary/60 bg-black flex items-center justify-center group-hover:bg-jb-primary/10 transition-colors">
                            <Terminal
                                size={18}
                                className="text-jb-primary"
                                strokeWidth={2.5}
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-mono text-sm font-bold tracking-tight">
                                jailbreak://hub
                            </span>
                            <span className="font-mono text-[10px] text-jb-muted tracking-[0.2em] uppercase">
                                v2.4 · educational
                            </span>
                        </div>
                    </a>

                    <nav className="hidden md:flex items-center gap-1">
                        {LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                data-testid={`nav-link-${l.label.toLowerCase()}`}
                                className="font-mono text-xs uppercase tracking-[0.18em] text-jb-muted hover:text-jb-primary px-3 py-2 transition-colors"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <a
                        href="#checker"
                        data-testid="nav-cta"
                        className="hidden md:inline-flex items-center gap-2 bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-4 py-2.5 hover:bg-[#00cc33] transition-colors"
                    >
                        Run Check
                        <span className="font-mono">→</span>
                    </a>

                    <button
                        data-testid="nav-mobile-toggle"
                        onClick={() => setOpen((v) => !v)}
                        className="md:hidden text-white p-2"
                        aria-label="Toggle menu"
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
                    <div className="px-6 py-4 flex flex-col gap-1">
                        {LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                                className="font-mono text-sm uppercase tracking-[0.18em] text-jb-muted hover:text-jb-primary py-2"
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
