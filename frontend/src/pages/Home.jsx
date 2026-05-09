import { useEffect, useState } from "react";
import Nav from "@/components/jb/Nav";
import Hero from "@/components/jb/Hero";
import Ticker from "@/components/jb/Ticker";
import CompatibilityChecker from "@/components/jb/CompatibilityChecker";
import ToolsDirectory from "@/components/jb/ToolsDirectory";
import DeviceMatrix from "@/components/jb/DeviceMatrix";
import Tutorials from "@/components/jb/Tutorials";
import NewsFeed from "@/components/jb/NewsFeed";
import Faq from "@/components/jb/Faq";
import Risks from "@/components/jb/Risks";
import Footer from "@/components/jb/Footer";
import ChatPanel from "@/components/jb/ChatPanel";
import { getStats } from "@/lib/api";

export default function Home() {
    const [stats, setStats] = useState({
        tools: 8,
        devices: 22,
        tutorials: 4,
        ios_versions: 29,
    });

    useEffect(() => {
        getStats().then(setStats).catch(() => {});
    }, []);

    return (
        <main className="min-h-screen bg-jb-bg text-white">
            <Nav />
            <Hero stats={stats} />
            <Ticker />
            <CompatibilityChecker />
            <ToolsDirectory />
            <DeviceMatrix />
            <Tutorials />
            <NewsFeed />
            <Faq />
            <Risks />
            <Footer />
            <ChatPanel />
        </main>
    );
}
