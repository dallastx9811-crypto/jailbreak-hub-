import { useState } from "react";
import { Lock, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { createCheckout } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/jb/AuthModal";

export default function PaywallGate({ children }) {
    const { user, loading } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    if (loading) return null;

    if (user?.has_paid) return children;

    const handleUnlock = async () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        setRedirecting(true);
        try {
            const { url } = await createCheckout();
            window.location.href = url;
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not start checkout");
            setRedirecting(false);
        }
    };

    return (
        <>
            <div className="relative border border-white/10 bg-jb-surface overflow-hidden">
                {/* Blurred preview */}
                <div className="select-none pointer-events-none blur-sm opacity-40 p-8 font-mono text-sm text-jb-muted">
                    <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
                    <div className="h-4 bg-white/10 rounded mb-3 w-1/2" />
                    <div className="h-4 bg-white/10 rounded mb-3 w-2/3" />
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 py-8 bg-black/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 border border-jb-primary/40 flex items-center justify-center">
                            <Lock size={20} className="text-jb-primary" />
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-jb-primary">
                            Full access required
                        </div>
                        <p className="font-mono text-xs text-jb-muted max-w-xs leading-relaxed">
                            {user
                                ? "Unlock downloads and live release tracking with a one-time payment."
                                : "Create a free account, then unlock full access with a one-time payment."}
                        </p>
                    </div>

                    <button
                        onClick={handleUnlock}
                        disabled={redirecting}
                        className="inline-flex items-center gap-2 bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.22em] px-6 py-3.5 hover:bg-[#00cc33] transition-colors disabled:opacity-50"
                    >
                        {redirecting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Zap size={14} strokeWidth={2.5} />
                        )}
                        {user ? "Unlock — $2.50 lifetime" : "Sign in to unlock"}
                    </button>

                    {!user && (
                        <button
                            onClick={() => setShowAuth(true)}
                            className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted hover:text-white transition-colors"
                        >
                            Create free account →
                        </button>
                    )}
                </div>
            </div>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
