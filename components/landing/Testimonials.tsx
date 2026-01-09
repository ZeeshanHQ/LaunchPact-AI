import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
    {
        name: "Alex Rivera",
        role: "Founder, QuantFlow",
        content: "The Forge didn't just give me a plan; it gave me the architectural confidence to raise our Seed round in record time.",
        avatar: "https://i.pravatar.cc/150?u=alex"
    },
    {
        name: "Sarah Chen",
        role: "CEO, NexaHealth",
        content: "Validation usually takes months. With LaunchPact AI, we simulated our target personas and pivoted within a week.",
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        name: "Marcus Thorne",
        role: "CTO, BitGrid",
        content: "The tech stack recommendations are spot on. It saved us from making expensive infrastructure mistakes early on.",
        avatar: "https://i.pravatar.cc/150?u=marcus"
    }
];

const Testimonials: React.FC = () => {
    return (
        <section className="w-full bg-slate-950 py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 mb-6">
                        <Star size={14} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Empire Builders</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        Trusted by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Next Generation.</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all duration-500"
                        >
                            <Quote className="absolute top-8 right-8 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" size={40} />

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 overflow-hidden ring-4 ring-indigo-500/10">
                                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold tracking-tight">{t.name}</h4>
                                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">{t.role}</p>
                                </div>
                            </div>

                            <p className="text-slate-400 leading-relaxed font-medium italic">
                                "{t.content}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
