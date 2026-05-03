import { useEffect, useState } from "react";
import { getNews } from "@/lib/api";
import SectionHeader from "@/components/jb/SectionHeader";

export default function NewsFeed() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        getNews().then(setNews).catch(() => {});
    }, []);

    return (
        <section
            id="news"
            data-testid="news-section"
            className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-white/10 bg-black/40"
        >
            <SectionHeader
                kicker="05 · Scene.log"
                title="Latest from the scene"
                description="Release notes, research drops, and community updates — sourced and summarized."
            />

            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/10">
                {news.map((n, i) => (
                    <article
                        key={n.id}
                        data-testid={`news-${n.id}`}
                        className="border-r border-b border-white/10 p-8 hover:bg-jb-primary/5 transition-colors flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-primary">
                                {n.category}
                            </span>
                            <span className="text-jb-muted">·</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                                {n.date}
                            </span>
                        </div>
                        <h3 className="font-mono text-xl font-bold tracking-tight mb-3 leading-tight">
                            {n.title}
                        </h3>
                        <p className="text-jb-muted text-sm leading-relaxed flex-1">
                            {n.excerpt}
                        </p>
                        <div className="mt-6 pt-6 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-jb-muted">
                            entry_{String(i + 1).padStart(3, "0")}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
