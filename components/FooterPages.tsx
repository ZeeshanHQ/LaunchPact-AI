
import React from 'react';
import { Check, Shield, Zap, Globe, Server, ArrowRight, BookOpen, Layout, Target, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

/* --- SHARED COMPONENTS --- */
const PageHeader: React.FC<{ title: string; subtitle: string; tag: string; icon: React.ReactNode }> = ({ title, subtitle, tag, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-24"
  >
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 mb-6">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tag}</span>
    </div>
    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-none italic uppercase">
      {title}
    </h1>
    <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
      {subtitle}
    </p>
  </motion.div>
);

/* --- PRICING PAGE --- */
export const PricingPage: React.FC<{ onContactSales: () => void }> = ({ onContactSales }) => {
  const plans = [
    {
      name: "Bootstrap",
      price: "$0",
      period: "Forever",
      desc: "For solo founders validating initial architecture.",
      features: ["3 Ventures / Month", "Standard Market Analysis", "G-1.5 Flash Optimization", "Community Access"],
      cta: "Initialize",
      color: "border-white/5 bg-white/[0.02]"
    },
    {
      name: "Founder",
      price: "$49",
      period: "/ mo",
      desc: "Architect market-dominant ventures with elite intel.",
      features: ["Unlimited Ventures", "Deep Competitor Swarms", "G-1.5 Pro Intelligence", "Full Executive Exports", "Founders Network"],
      cta: "Go Elite",
      popular: true,
      color: "border-indigo-500/30 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
    },
    {
      name: "Studio",
      price: "$199",
      period: "/ mo",
      desc: "For innovation labs and multi-venture studios.",
      features: ["Advanced Team Logic", "White-Label Sovereignty", "API Forge Access", "Custom Model Tuning", "Dedicated Strategist"],
      cta: "Contact Ops",
      color: "border-white/10 bg-white/[0.05]"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          tag="Monetization Layer"
          title="Simple Pricing."
          subtitle="Invest in the infrastructure of your empire. Scalable architecture for every stage of dominance."
          icon={<Zap size={14} />}
        />

        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-[3rem] border backdrop-blur-3xl flex flex-col relative ${p.color}`}
            >
              {p.popular && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl rounded-tr-[3rem]">
                  Elite Choice
                </div>
              )}
              <h3 className="text-2xl font-black text-white uppercase italic mb-8">{p.name}</h3>
              <div className="mb-8">
                <span className="text-6xl font-black text-white tracking-tighter">{p.price}</span>
                <span className="text-slate-500 text-lg font-bold ml-2">{p.period}</span>
              </div>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">{p.desc}</p>

              <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] mb-10 transition-all ${p.popular ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-white text-slate-950 hover:bg-slate-200'}`}>
                {p.cta}
              </button>

              <div className="space-y-4">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex gap-4 items-center text-sm font-medium text-slate-300">
                    <Check size={16} className="text-indigo-400 flex-shrink-0" />
                    {f}
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

/* --- ENTERPRISE PAGE --- */
export const EnterprisePage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
    <div className="max-w-7xl mx-auto relative z-10">
      <PageHeader
        tag="Innovation Protocol"
        title="Global Scale."
        subtitle="Custom AI infrastructure for Fortune 500 innovation labs and tier-1 venture studios."
        icon={<Shield size={14} />}
      />

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
        <div className="space-y-10">
          {[
            { title: "Bank-Grade Sovereignty", desc: "Full SOC 2 Type II compliance with isolated data instances.", icon: <Shield className="text-green-400" /> },
            { title: "Custom Logic Gates", desc: "Fine-tune the Neural Forge on your internal proprietary data sets.", icon: <Zap className="text-amber-400" /> },
            { title: "Global Deployments", icon: <Globe className="text-indigo-400" />, desc: "Regional instances across US, EU, and APAC for data localization." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5"
            >
              <div className="mt-1">{item.icon}</div>
              <div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="aspect-square bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent rounded-[4rem] border border-white/5 flex items-center justify-center p-20 relative overflow-hidden">
          <Server size={200} className="text-indigo-500/20" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-white/5 rounded-full scale-110 border-dashed"
          />
        </div>
      </div>
    </div>
  </div>
);

/* --- RESOURCES & BLOG PAGE --- */
interface ResourcePageProps {
  type: 'blog' | 'case-studies' | 'guide' | 'help';
}

export const ResourcePage: React.FC<ResourcePageProps> = ({ type }) => {
  const titles = {
    blog: "Insights",
    'case-studies': "Success Protocols",
    guide: "Founder Playbook",
    help: "Support Console"
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          tag="Knowledge Base"
          title={titles[type]}
          subtitle="Structural intelligence and methodology for architecting the next generation of dominance."
          icon={<BookOpen size={14} />}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-default"
            >
              <div className="h-64 bg-white/[0.02] border border-white/5 rounded-[2.5rem] mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 shadow-xl">
                  Protocol {i}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-indigo-400 transition-colors">
                How to architect a market-dominant ecosystem in 48 hours.
              </h3>
              <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <span>08 Min Read</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span>Neural Review Ready</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* --- LEGAL PAGE --- */
export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const title = type === 'privacy' ? "Privacy Protocol" : "Service Terms";

  const sections = type === 'privacy' ? [
    { title: "01. Data Sovereignty", desc: "Your identity and architectural inputs are encrypted with enterprise-grade sovereignty protocols." },
    { title: "02. Logic Utilization", desc: "Data is used solely to refine the intelligence of your specific venture blueprints." },
    { title: "03. Third-Party Ops", desc: "We only coordinate with SOC 2 compliant infrastructure providers (Google Cloud, Render)." }
  ] : [
    { title: "01. Acceptance", desc: "By initializing the Neural Forge, you agree to these architectural governance rules." },
    { title: "02. IP Sovereignty", desc: "You own the generated DNA for all blueprints forged under a paid founder license." },
    { title: "03. Ethical Forge", desc: "Malicious deployment of generated strategies will result in immediate network termination." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          tag="Governance & Compliance"
          title={title}
          subtitle="Legal structural definitions for the LaunchPact AI ecosystem. Last updated January 2026."
          icon={<Shield size={14} />}
        />

        <div className="max-w-3xl space-y-16">
          {sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-6">{s.title}</h2>
              <p className="text-slate-400 text-lg font-medium leading-[1.8]">{s.desc}</p>
            </motion.section>
          ))}

          <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 border-dashed text-slate-500 text-sm font-medium leading-relaxed italic">
            Questions regarding governance should be transmitted to our legal ops department:
            <a href="mailto:ops@launchpact.ai" className="text-indigo-400 font-bold ml-2 underline">ops@launchpact.ai</a>
          </div>
        </div>
      </div>
    </div>
  );
};
