import React from 'react';
import { motion } from 'framer-motion';
import { Home, Zap, Layers, CreditCard, MessageSquare, Menu, GripHorizontal } from 'lucide-react';

const dockItems = [
    { label: "Launch Engine", icon: <Layers size={20} />, href: "#" },
    { label: "Elite Features", icon: <Zap size={20} />, href: "#features" },
    { label: "Investment Pricing", icon: <CreditCard size={20} />, href: "#pricing" },
    { label: "Success Stories", icon: <MessageSquare size={20} />, href: "/resources-case-studies" },
];

const MegaMenu: React.FC = () => {
    return (
        <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
                drag
                dragConstraints={{ left: -300, right: 300, top: -500, bottom: 0 }}
                whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
                className="pointer-events-auto cursor-grab touch-none flex items-center gap-2 p-2 rounded-2xl bg-slate-950/60 backdrop-blur-3xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:bg-slate-950/80 transition-all group/dock"
            >
                <div className="px-3 py-2 text-slate-500 group-hover/dock:text-slate-300 transition-colors">
                    <GripHorizontal size={14} />
                </div>

                <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                    {dockItems.map((item, index) => (
                        <MegaMenuItem key={index} item={item} />
                    ))}
                </div>

                <div className="w-px h-8 bg-white/10 mx-1"></div>

                <MegaMenuItem
                    item={{ label: "Main Menu", icon: <Menu size={20} />, href: "#" }}
                    className="bg-indigo-600 hover:bg-white text-white hover:text-slate-950 border-transparent shadow-lg shadow-indigo-600/20"
                />
            </motion.div>
        </div>
    );
};

const MegaMenuItem: React.FC<{ item: any, className?: string }> = ({ item, className }) => {
    return (
        <motion.a
            href={item.href}
            whileHover={{ scale: 1.2, translateY: -10 }}
            whileTap={{ scale: 0.9 }}
            className={`relative group w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors ${className}`}
        >
            {item.icon}

            {/* Tooltip */}
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 duration-200">
                {item.label}
            </span>
        </motion.a>
    );
};

export default MegaMenu;
