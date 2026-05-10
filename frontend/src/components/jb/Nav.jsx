import { useEffect, useState } from "react";
import { Terminal, Menu, X, LogIn, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/jb/AuthModal";

const LINKS = [
    { href: "#checker", label: "Checker" },
    { href: "#tools", label: "Tools" },
    { href: "#matrix", label: "Matrix" },
    { href: "#tutorials", label: "Tutorials" },
    { href: "#news", label: "News" },
    { href: "#faq", label: "FAQ" },
];

export default function Nav() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 8);
        on();
        window.addEventListener("scroll", on);
        return () => window.removeEventListener("scroll", on);
    }, []);

    return (
        <>
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

                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <>
                                    {user.has_paid && (
                                        <span className="inline-flex items-center gap-1.5 border border-jb-primary/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary">
                                            <Zap size={10} strokeWidth={2.5} />
                                            Full Access
                                        </span>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="inline-flex items-center gap-2 border border-white/15 text-jb-muted font-mono text-xs uppercase tracking-[0.2em] px-3 py-2 hover:border-white hover:text-white transition-colors"
                                    >
                                        <LogOut size={12} />
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowAuth(true)}
                                    data-testid="nav-login"
                                    className="inline-flex items-center gap-2 border border-jb-primary/60 text-jb-primary font-mono text-xs font-bold uppercase tracking-[0.2em] px-4 py-2.5 hover:bg-jb-primary hover:text-black transition-colors"
                                >
                                    <LogIn size={12} />
                                    Sign In
                                </button>
                            )}
                        </div>

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
                            <div className="pt-3 border-t border-white/10 mt-2">
                                {user ? (
                                    <button
                                        onClick={() => { logout(); setOpen(false); }}
                                        className="font-mono text-sm uppercase tracking-[0.18em] text-jb-muted hover:text-white py-2"
                                    >
                                        Sign out
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setShowAuth(true); setOpen(false); }}
                                        className="font-mono text-sm uppercase tracking-[0.18em] text-jb-primary py-2"
                                    >
                                        Sign In / Register
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
