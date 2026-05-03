import { useState } from "react";
import { toast } from "sonner";
import { Github, Twitter, MessageCircle, Terminal, Mail } from "lucide-react";
import { subscribeNewsletter } from "@/lib/api";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            toast.error("Enter a valid email");
            return;
        }
        setBusy(true);
        try {
            await subscribeNewsletter(email);
            toast.success("Subscribed. Welcome to the feed.");
            setEmail("");
        } catch {
            toast.error("Subscription failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <footer
            data-testid="site-footer"
            className="border-t border-white/10 bg-black"
        >
            <div className="px-6 md:px-12 lg:px-24 py-20">
                <div className="grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 border border-jb-primary/60 bg-black flex items-center justify-center">
                                <Terminal
                                    size={18}
                                    className="text-jb-primary"
                                    strokeWidth={2.5}
                                />
                            </div>
                            <div className="font-mono font-bold">
                                jailbreak://hub
                            </div>
                        </div>
                        <p className="text-jb-muted max-w-md leading-relaxed text-sm">
                            An independent, non-commercial educational archive
                            of iOS and iPadOS jailbreak tools, research, and
                            community news. We do not distribute, host, or
                            endorse exploits.
                        </p>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-jb-primary mb-4">
                            &gt; subscribe.to_feed
                        </div>
                        <form
                            onSubmit={submit}
                            data-testid="newsletter-form"
                            className="flex flex-col sm:flex-row gap-0 border border-white/15 bg-jb-surface"
                        >
                            <div className="flex items-center gap-3 px-4 flex-1">
                                <Mail
                                    size={16}
                                    className="text-jb-muted shrink-0"
                                />
                                <input
                                    data-testid="newsletter-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@domain.com"
                                    className="w-full bg-transparent outline-none py-4 font-mono text-sm placeholder:text-jb-muted text-white"
                                />
                            </div>
                            <button
                                data-testid="newsletter-submit"
                                type="submit"
                                disabled={busy}
                                className="bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.22em] px-8 py-4 hover:bg-[#00cc33] disabled:opacity-40 transition-colors"
                            >
                                {busy ? "Sending..." : "Subscribe"}
                            </button>
                        </form>
                        <p className="text-xs text-jb-muted mt-3 font-mono">
                            no spam · unsubscribe with one click
                        </p>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-jb-muted">
                        © 2026 jailbreak://hub · educational use only
                    </div>
                    <div className="flex items-center gap-4">
                        <Social href="#" icon={<Github size={16} />} label="github" />
                        <Social href="#" icon={<Twitter size={16} />} label="twitter" />
                        <Social
                            href="#"
                            icon={<MessageCircle size={16} />}
                            label="discord"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function Social({ href, icon, label }) {
    return (
        <a
            href={href}
            data-testid={`social-${label}`}
            className="w-9 h-9 border border-white/10 flex items-center justify-center text-jb-muted hover:text-jb-primary hover:border-jb-primary/60 transition-colors"
            aria-label={label}
        >
            {icon}
        </a>
    );
}
