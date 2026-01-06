import React from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Users, Layers, Zap, Globe, LineChart, Code2 } from 'lucide-react';

const features = [
    {
        title: "Live Market Intelligence",
        description: "Don't build in a vacuum. Our engine swarms the web to validate your assumptions against real-time market data.",
        icon: <Globe size={24} />,
        className: "md:col-span-2 md:row-span-2",
        bg: "bg-indigo-900/20",
        border: "border-indigo-500/20"
    },
    {
        title: "Investor-Ready Export",
        description: "Generate PDF pitch decks and whitepapers in one click.",
        icon: <Download size={24} />,
        className: "md:col-span-1 md:row-span-1",
        bg: "bg-slate-900/50",
        border: "border-slate-800"
    },
    {
        title: "Persona Simulation",
        description: "Chat with your target users before you write a single line of code.",
        icon: <Users size={24} />,
        className: "md:col-span-1 md:row-span-1",
        bg: "bg-slate-900/50",
        border: "border-slate-800"
    },
    {
        title: "Full Tech Stack Architecture",
        description: "Get a complete recommendation for your frontend, backend, and database based on your scaling needs.",
        icon: <Code2 size={24} />,
        className: "md:col-span-2 md:row-span-1",
        bg: "bg-slate-900/50",
        border: "border-slate-800"
    },
];

const FeatureShowcase: React.FC = () => {
    return (
        <div className="bg-slate-950 py-32 relative overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-20">
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Build Your Empire.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`rounded-[2rem] p-8 border ${feature.border} ${feature.bg} backdrop-blur-sm relative overflow-hidden group hover:bg-indigo-900/10 transition-colors ${feature.className}`}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity text-indigo-400">
                                {feature.icon}
                            </div>

                            <div className="h-full flex flex-col justify-end">
                                <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm md:text-base">{feature.description}</p>
                            </div>

                            {/* Hover Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureShowcase;
