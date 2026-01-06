import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const Pricing: React.FC = () => {
    const [isYearly, setIsYearly] = useState(false);

    const togglePricing = () => setIsYearly(!isYearly);

    const plans = [
        {
            name: "Starter",
            price: isYearly ? "0" : "0",
            period: "Forever Free",
            description: "For hobbyists and dabblers.",
            features: ["5 Blueprints / Month", "Basic Gemini Integration", "Community Support", "Standard Export"],
            cta: "Start Free",
            popular: false
        },
        {
            name: "Pro",
            price: isYearly ? "29" : "39",
            period: "/ month",
            description: "For serious founders.",
            features: ["Unlimited Blueprints", "GPT-4 & Claude 3 Opus", "Deep Market Research", "Investor Deck Export", "Priority Support"],
            cta: "Go Pro",
            popular: true
        },
        {
            name: "Agency",
            price: isYearly ? "99" : "129",
            period: "/ month",
            description: "For venture studios.",
            features: ["Everything in Pro", "White Label Export", "Team Collaboration (5 Seats)", "API Access", "Dedicated Success Manager"],
            cta: "Contact Sales",
            popular: false
        }
    ];

    return (
        <div className="bg-slate-950 py-32 relative text-center">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 space-y-4">
                    <h2 className="text-5xl font-black text-white tracking-tight">Simple Pricing.</h2>
                    <p className="text-slate-400 text-lg">Invest in your future, not shelf-ware.</p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
                        <div
                            onClick={togglePricing}
                            className="w-16 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center px-1 cursor-pointer relative"
                        >
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                className={`w-6 h-6 rounded-full bg-indigo-500 ${isYearly ? 'ml-auto' : ''}`}
                            />
                        </div>
                        <span className={`text-sm font-bold ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly <span className="text-emerald-400 text-xs text-normal">(Save 20%)</span></span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -10 }}
                            className={`relative rounded-[2rem] p-8 text-left flex flex-col ${plan.popular ? 'bg-indigo-900/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'bg-slate-900/20 border-slate-800'} border backdrop-blur-sm`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[2rem]">
                                    MOST POPULAR
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-black text-white">${plan.price}</span>
                                <span className="text-slate-500 text-sm font-medium">{plan.period}</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-8 min-h-[40px]">{plan.description}</p>

                            <button className={`w-full py-4 rounded-xl font-bold mb-8 transition-colors ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white hover:bg-slate-200 text-slate-900'}`}>
                                {plan.cta}
                            </button>

                            <div className="space-y-4 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="min-w-5 min-h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
