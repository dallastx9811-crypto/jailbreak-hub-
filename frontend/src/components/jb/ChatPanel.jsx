import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, X, Sparkles, Loader2, Eraser } from "lucide-react";
import { sendChat, getChatHistory } from "@/lib/api";
import { toast } from "sonner";

const STORAGE_KEY = "jbhub_chat_session";

const SUGGESTIONS = [
    "iPhone X on iOS 16.6.1 — can I jailbreak?",
    "Difference between rootful and rootless?",
    "Best jailbreak for iPad Pro (2018)?",
    "How to recover from a boot loop",
];

export default function ChatPanel() {
    const [open, setOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Load existing session on mount
    useEffect(() => {
        const sid = localStorage.getItem(STORAGE_KEY);
        if (sid) {
            setSessionId(sid);
            getChatHistory(sid)
                .then((m) => setMessages(m || []))
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, busy]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const submit = async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || busy) return;
        setBusy(true);
        const optimistic = [
            ...messages,
            { role: "user", content: msg, ts: new Date().toISOString() },
        ];
        setMessages(optimistic);
        setInput("");
        try {
            const res = await sendChat(msg, sessionId);
            if (!sessionId) {
                setSessionId(res.session_id);
                localStorage.setItem(STORAGE_KEY, res.session_id);
            }
            setMessages(res.messages);
        } catch (e) {
            toast.error("Assistant unavailable. Try again.");
            setMessages(messages);
        } finally {
            setBusy(false);
        }
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const reset = () => {
        localStorage.removeItem(STORAGE_KEY);
        setSessionId(null);
        setMessages([]);
        toast.success("Conversation cleared");
    };

    return (
        <>
            {/* Trigger */}
            <button
                data-testid="chat-toggle"
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 bg-jb-primary text-black font-mono text-xs font-bold uppercase tracking-[0.22em] px-5 py-3.5 hover:bg-[#00cc33] transition-colors shadow-[0_4px_24px_rgba(0,255,65,0.3)]"
            >
                {open ? (
                    <>
                        <X size={14} strokeWidth={2.5} />
                        Close
                    </>
                ) : (
                    <>
                        <Sparkles size={14} strokeWidth={2.5} />
                        Ask AI
                    </>
                )}
            </button>

            {/* Panel */}
            {open && (
                <aside
                    data-testid="chat-panel"
                    className="fixed inset-x-2 bottom-24 md:inset-x-auto md:right-6 md:bottom-24 md:w-[420px] md:h-[640px] max-h-[80vh] z-40 border border-jb-primary/40 bg-jb-surface flex flex-col jb-glow-border"
                >
                    <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-black">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 border border-jb-primary/60 flex items-center justify-center shrink-0">
                                <Sparkles
                                    size={14}
                                    className="text-jb-primary"
                                    strokeWidth={2.5}
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="font-mono text-sm font-bold truncate">
                                    JB-Hub Assistant
                                </div>
                                <div className="font-mono text-[10px] text-jb-muted uppercase tracking-[0.22em]">
                                    Claude Sonnet 4.5 · grounded
                                </div>
                            </div>
                        </div>
                        <button
                            data-testid="chat-reset"
                            onClick={reset}
                            title="Clear conversation"
                            className="text-jb-muted hover:text-jb-primary p-1 transition-colors"
                        >
                            <Eraser size={16} />
                        </button>
                    </header>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        data-testid="chat-messages"
                        className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
                    >
                        {messages.length === 0 && (
                            <Welcome onPick={(q) => submit(q)} />
                        )}
                        {messages.map((m, i) => (
                            <Message key={i} role={m.role} content={m.content} />
                        ))}
                        {busy && (
                            <div
                                data-testid="chat-thinking"
                                className="flex items-center gap-2 font-mono text-xs text-jb-muted"
                            >
                                <Loader2
                                    size={12}
                                    className="animate-spin text-jb-primary"
                                />
                                thinking...
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/10 p-3">
                        <div className="flex items-end gap-0 border border-white/15 bg-black focus-within:border-jb-primary/60 transition-colors">
                            <textarea
                                ref={inputRef}
                                data-testid="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKey}
                                rows={1}
                                placeholder="Ask about your device + iOS..."
                                className="flex-1 bg-transparent outline-none px-4 py-3 font-mono text-sm placeholder:text-jb-muted resize-none max-h-32"
                            />
                            <button
                                data-testid="chat-send"
                                onClick={() => submit()}
                                disabled={busy || !input.trim()}
                                className="bg-jb-primary text-black px-4 py-3 self-stretch hover:bg-[#00cc33] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                {busy ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} strokeWidth={2.5} />
                                )}
                            </button>
                        </div>
                        <div className="font-mono text-[10px] text-jb-muted uppercase tracking-[0.22em] mt-2 px-1">
                            Educational use · enter to send · shift+enter for newline
                        </div>
                    </div>
                </aside>
            )}
        </>
    );
}

function Welcome({ onPick }) {
    return (
        <div data-testid="chat-welcome" className="space-y-5">
            <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary mb-2">
                    &gt; assistant.ready
                </div>
                <p className="text-sm text-jb-muted leading-relaxed">
                    Ask me anything about iOS jailbreaking. I'm grounded in this
                    site's catalog of 8 tools and 22 devices. I won't make up
                    exploits — if I don't know, I'll say so.
                </p>
            </div>
            <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                    &gt; try.examples
                </div>
                {SUGGESTIONS.map((s) => (
                    <button
                        key={s}
                        data-testid={`chat-suggest-${s.slice(0, 10)}`}
                        onClick={() => onPick(s)}
                        className="w-full text-left border border-white/10 bg-black/40 hover:border-jb-primary/60 hover:bg-jb-primary/5 px-3 py-2.5 font-mono text-xs text-white transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

function Message({ role, content }) {
    const isUser = role === "user";
    return (
        <div
            data-testid={`chat-msg-${role}`}
            className={`${isUser ? "flex justify-end" : ""}`}
        >
            <div
                className={`${
                    isUser
                        ? "bg-jb-primary/10 border border-jb-primary/40 max-w-[85%]"
                        : "border-l-2 border-jb-primary"
                } px-4 py-3`}
            >
                <div
                    className={`font-mono text-[10px] uppercase tracking-[0.22em] mb-1.5 ${
                        isUser ? "text-jb-primary" : "text-jb-accent"
                    }`}
                >
                    {isUser ? "you" : "assistant"}
                </div>
                {isUser ? (
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                        {content}
                    </p>
                ) : (
                    <Markdown text={content} />
                )}
            </div>
        </div>
    );
}

/** Minimal markdown renderer — headings, bold, code blocks, inline code, links, lists */
function Markdown({ text }) {
    const blocks = parseBlocks(text);
    return (
        <div className="space-y-2.5 text-sm text-jb-muted leading-relaxed">
            {blocks.map((b, i) => {
                if (b.type === "code") {
                    return (
                        <pre
                            key={i}
                            className="bg-black border border-white/10 px-3 py-2.5 font-mono text-[12px] text-white overflow-x-auto whitespace-pre-wrap"
                        >
                            {b.lang && (
                                <div className="text-[10px] uppercase tracking-[0.22em] text-jb-muted mb-1">
                                    {b.lang}
                                </div>
                            )}
                            {b.content}
                        </pre>
                    );
                }
                if (b.type === "h1" || b.type === "h2" || b.type === "h3") {
                    const sizeCls =
                        b.type === "h1"
                            ? "text-base"
                            : b.type === "h2"
                              ? "text-sm"
                              : "text-sm";
                    return (
                        <div
                            key={i}
                            className={`font-mono font-bold text-white ${sizeCls}`}
                        >
                            {renderInline(b.content)}
                        </div>
                    );
                }
                if (b.type === "li") {
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-2 pl-2"
                        >
                            <span className="text-jb-primary mt-0.5">•</span>
                            <div>{renderInline(b.content)}</div>
                        </div>
                    );
                }
                if (b.type === "hr") {
                    return (
                        <hr
                            key={i}
                            className="border-t border-white/10 my-2"
                        />
                    );
                }
                return (
                    <p key={i}>{renderInline(b.content)}</p>
                );
            })}
        </div>
    );
}

function parseBlocks(text) {
    const out = [];
    const lines = text.split("\n");
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const codeMatch = line.match(/^```(\w*)\s*$/);
        if (codeMatch) {
            const lang = codeMatch[1];
            const content = [];
            i++;
            while (i < lines.length && !/^```\s*$/.test(lines[i])) {
                content.push(lines[i]);
                i++;
            }
            i++;
            out.push({ type: "code", lang, content: content.join("\n") });
            continue;
        }
        if (/^#\s+/.test(line)) {
            out.push({ type: "h1", content: line.replace(/^#\s+/, "") });
            i++;
            continue;
        }
        if (/^##\s+/.test(line)) {
            out.push({ type: "h2", content: line.replace(/^##\s+/, "") });
            i++;
            continue;
        }
        if (/^###\s+/.test(line)) {
            out.push({ type: "h3", content: line.replace(/^###\s+/, "") });
            i++;
            continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
            out.push({
                type: "li",
                content: line.replace(/^\s*[-*]\s+/, ""),
            });
            i++;
            continue;
        }
        if (/^---+$/.test(line.trim())) {
            out.push({ type: "hr" });
            i++;
            continue;
        }
        if (line.trim() === "") {
            i++;
            continue;
        }
        // gather paragraph
        const para = [line];
        i++;
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !/^[#*\-`]/.test(lines[i].trim()) &&
            !/^---+$/.test(lines[i].trim())
        ) {
            para.push(lines[i]);
            i++;
        }
        out.push({ type: "p", content: para.join(" ") });
    }
    return out;
}

function renderInline(s) {
    // Order matters: code → bold → links
    const parts = [];
    let rest = s;
    let key = 0;

    const patterns = [
        // inline code
        {
            re: /`([^`]+)`/,
            render: (m) => (
                <code
                    key={key++}
                    className="font-mono text-[12px] bg-black border border-white/10 px-1.5 py-0.5 text-white"
                >
                    {m[1]}
                </code>
            ),
        },
        // bold
        {
            re: /\*\*([^*]+)\*\*/,
            render: (m) => (
                <strong key={key++} className="text-white font-semibold">
                    {m[1]}
                </strong>
            ),
        },
        // markdown links [text](url) - in-app paths use Link, others use <a>
        {
            re: /\[([^\]]+)\]\(([^)]+)\)/,
            render: (m) => {
                const url = m[2];
                if (url.startsWith("/")) {
                    return (
                        <Link
                            key={key++}
                            to={url}
                            className="text-jb-primary hover:underline"
                        >
                            {m[1]}
                        </Link>
                    );
                }
                return (
                    <a
                        key={key++}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-jb-primary hover:underline"
                    >
                        {m[1]}
                    </a>
                );
            },
        },
    ];

    const result = [];
    let guard = 0;
    while (rest && guard < 200) {
        guard++;
        let earliest = null;
        for (const p of patterns) {
            const m = rest.match(p.re);
            if (m && (earliest === null || m.index < earliest.index)) {
                earliest = { match: m, render: p.render };
            }
        }
        if (!earliest) {
            result.push(rest);
            break;
        }
        if (earliest.match.index > 0) {
            result.push(rest.slice(0, earliest.match.index));
        }
        result.push(earliest.render(earliest.match));
        rest = rest.slice(earliest.match.index + earliest.match[0].length);
    }
    return result;
}
