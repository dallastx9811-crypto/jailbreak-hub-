import { useState } from "react";
import { X, Loader2, Terminal } from "lucide-react";
import { toast } from "sonner";
import { register, login } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal({ onClose }) {
    const { login: authLogin } = useAuth();
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fn = tab === "login" ? login : register;
            const { token, user } = await fn(email, password);
            authLogin(token, user);
            toast.success(tab === "login" ? "Logged in" : "Account created");
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/15 z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Terminal size={16} className="text-jb-primary" />
                        <span className="font-mono text-xs uppercase tracking-[0.22em] text-white">
                            {tab === "login" ? "sign in" : "create account"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-jb-muted hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    {["login", "register"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 font-mono text-[11px] uppercase tracking-[0.22em] py-3 transition-colors ${
                                tab === t
                                    ? "text-jb-primary border-b-2 border-jb-primary"
                                    : "text-jb-muted hover:text-white"
                            }`}
                        >
                            {t === "login" ? "Log In" : "Register"}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={submit} className="px-6 py-6 space-y-4">
                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-white/15 focus:border-jb-primary outline-none px-4 py-3 font-mono text-sm text-white placeholder:text-jb-muted/50 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/15 focus:border-jb-primary outline-none px-4 py-3 font-mono text-sm text-white placeholder:text-jb-muted/50 transition-colors"
                            placeholder={tab === "register" ? "min 6 characters" : "••••••••"}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.22em] py-3.5 hover:bg-[#00cc33] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {tab === "login" ? "Log In" : "Create Account"}
                    </button>
                </form>

                <div className="px-6 pb-5 text-center">
                    <span className="font-mono text-[10px] text-jb-muted">
                        {tab === "login" ? "No account? " : "Have an account? "}
                    </span>
                    <button
                        onClick={() => setTab(tab === "login" ? "register" : "login")}
                        className="font-mono text-[10px] text-jb-primary hover:underline"
                    >
                        {tab === "login" ? "Register" : "Log in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
