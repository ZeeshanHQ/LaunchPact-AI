import React from 'react';
import Hero from './Hero';
import SocialProof from './landing/SocialProof';
import ProblemStatement from './landing/ProblemStatement';
import EmpireBuildingScroll from './landing/EmpireBuildingScroll';
import HowItWorks from './landing/HowItWorks';
import FeatureShowcase from './landing/FeatureShowcase';
import FAQ from './landing/FAQ';
import Testimonials from './landing/Testimonials';
import Pricing from './landing/Pricing';
import MegaMenu from './landing/MegaMenu';

interface LandingPageProps {
    onGenerate: (idea: string) => void;
    isLoading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGenerate, isLoading }) => {
    return (
        <div className="w-full min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
            {/* 1. Hero Section: The Hook */}
            <Hero onGenerate={onGenerate} isLoading={isLoading} />

            {/* 2. Social Proof: The Credibility (First 1,000 Founders) */}
            <SocialProof />

            {/* 3. Problem Statement: The Villain (Execution Chaos) */}
            <ProblemStatement />

            {/* 4. The Solution: From Thought to Empire (Scroll Animation) */}
            <EmpireBuildingScroll />

            {/* 5. How It Works: Interactive Process */}
            <HowItWorks />

            {/* 6. Feature Showcase: Bento Grid */}
            <FeatureShowcase />

            {/* 7. Testimonials: Social Evidence */}
            <Testimonials />

            {/* 8. FAQ: Addressing Objections */}
            <FAQ />

            {/* 9. Pricing: Simple Tiers */}
            <Pricing />

            {/* 10. Mega Menu: Dynamic Island Dock */}
            <MegaMenu />
        </div>
    );
};

export default LandingPage;
