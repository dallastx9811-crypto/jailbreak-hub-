import { useEffect, useState } from "react";
import { getFaq } from "@/lib/api";
import SectionHeader from "@/components/jb/SectionHeader";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
    const [faq, setFaq] = useState([]);

    useEffect(() => {
        getFaq().then(setFaq).catch(() => {});
    }, []);

    return (
        <section
            id="faq"
            data-testid="faq-section"
            className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-t border-white/10"
        >
            <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                    <SectionHeader
                        kicker="06 · Manpage.faq"
                        title="Frequently asked questions"
                        description="Answers to the questions that come up in every jailbreak thread. If you have a new one, the Discord is a good next stop."
                    />
                </div>
                <div className="lg:col-span-7">
                    <Accordion
                        type="single"
                        collapsible
                        className="border-t border-white/10"
                    >
                        {faq.map((f, i) => (
                            <AccordionItem
                                key={i}
                                value={`faq-${i}`}
                                data-testid={`faq-item-${i}`}
                                className="border-b border-white/10"
                            >
                                <AccordionTrigger className="font-mono text-base md:text-lg text-white hover:no-underline hover:text-jb-primary py-6 text-left">
                                    <span className="flex items-center gap-4">
                                        <span className="font-mono text-[11px] text-jb-primary uppercase tracking-[0.22em]">
                                            Q_{String(i + 1).padStart(2, "0")}
                                        </span>
                                        {f.q}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-jb-muted leading-relaxed pl-14 pb-6 text-sm md:text-base">
                                    {f.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
