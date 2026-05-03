export default function SectionHeader({ kicker, title, description, align = "left" }) {
    return (
        <div
            className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
        >
            {kicker && (
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-jb-primary mb-4">
                    {kicker}
                </div>
            )}
            <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-4">
                {title}
            </h2>
            {description && (
                <p className="text-jb-muted text-base md:text-lg leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
