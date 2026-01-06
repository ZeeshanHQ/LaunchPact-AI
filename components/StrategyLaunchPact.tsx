
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X } from 'lucide-react';

const StrategyLaunchPact: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window (Placeholder for future functionality) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="pointer-events-auto bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-80 mb-4 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                            <span className="font-bold text-white flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-500" />
                                LaunchPact AI Strategy
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-4 h-64 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <Sparkles size={24} className="text-indigo-400" />
                            </div>
                            <p className="text-sm text-slate-400">
                                "I am your Cognitive Partner. How can I help you architect your empire today?"
                            </p>
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors">
                                Start Session
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Rollover Widget */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pointer-events-auto relative h-16 bg-slate-900 border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex items-center overflow-hidden group hover:border-indigo-500/50 transition-all duration-500 cursor-pointer"
                style={{ width: isHovered ? '240px' : '64px' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                {/* Icon Container (Always visible) */}
                <div className="absolute left-1 w-14 h-14 flex items-center justify-center z-20">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <Sparkles size={20} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Text (revealed on hover) */}
                <div className="flex items-center pl-16 pr-8 whitespace-nowrap overflow-hidden">
                    <div className="flex flex-col items-start h-12 justify-center">
                        <div className="relative overflow-hidden h-5">
                            <AnimatePresence mode="wait">
                                {isHovered ? (
                                    <motion.span
                                        key="strategy"
                                        initial={{ y: 20, rotateX: -90, opacity: 0 }}
                                        animate={{ y: 0, rotateX: 0, opacity: 1 }}
                                        exit={{ y: -20, rotateX: 90, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                        className="text-white font-black text-sm tracking-[0.15em] uppercase block"
                                    >
                                        LaunchPact AI
                                    </motion.span>
                                ) : null}
                            </AnimatePresence>
                        </div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 0.5 : 0 }}
                            className="text-[9px] text-indigo-300 font-bold tracking-widest uppercase mt-0.5"
                        >
                            AI Protocol Active
                        </motion.span>
                    </div>
                </div>
            </motion.button>
        </div>
    );
};

export default StrategyLaunchPact;
