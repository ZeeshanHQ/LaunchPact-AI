import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "How long does it take to generate a complete venture architect?",
        answer: "The Neural Forge processes your vision in real-time. Within 30-60 seconds, you'll have a complete execution blueprint, including market analysis, tech stack, and risk assessment."
    },
    {
        question: "Can I edit the plan after it's generated?",
        answer: "Absolutely. The Forge provides a living workspace where you can refine every aspect of the generated architecture using our guided builder."
    },
    {
        question: "Is my startup idea secure?",
        answer: "We prioritize security. All submissions are encrypted, and we do not store raw ideas for model training without explicit permission."
    },
    {
        question: "What technical stacks do you support?",
        answer: "We support a wide range of modern architectures, from Next.js/Supabase to complex microservices with Kubernetes, tailored to your specific scaling needs."
    },
    {
        question: "How does the 'Investor Export' work?",
        answer: "It transforms your structural blueprint into professional PDF pitch decks and whitepapers, formatted specifically to what modern VC firms look for."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="w-full bg-slate-950 py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 mb-6">
                        <HelpCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intellect Base</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Questions.</span>
                    </h2>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`rounded-2xl border transition-all duration-300 ${openIndex === index ? 'bg-white/[0.04] border-indigo-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-white' : 'text-slate-400'}`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 ml-4 p-1 rounded-lg bg-white/5 text-slate-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-indigo-400' : ''}`}>
                                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 text-slate-400 leading-relaxed font-medium">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
