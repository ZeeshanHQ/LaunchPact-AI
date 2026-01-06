
import React from 'react';
import { Check, Shield, Zap, Globe, Server, ArrowRight, BookOpen, FileText, Lock, Users, Star, Layout } from 'lucide-react';

/* --- PRICING PAGE --- */
export const PricingPage: React.FC<{ onContactSales: () => void }> = ({ onContactSales }) => (
  <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-fade-in">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
        <Zap size={12} /> Flexible Plans
      </div>
      <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic mb-6">
        Invest in your <br/><span className="text-indigo-600">Unfair Advantage</span>
      </h1>
      <p className="text-xl text-slate-500 font-medium">
        From solo founders to scaling teams. Choose the engine that powers your next unicorn.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Free Plan */}
      <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all relative">
        <h3 className="text-xl font-black text-slate-900 uppercase italic">Bootstrap</h3>
        <div className="my-6">
          <span className="text-5xl font-black text-slate-900">$0</span>
          <span className="text-slate-400 font-bold">/mo</span>
        </div>
        <p className="text-sm text-slate-500 font-medium mb-8">Perfect for validation and initial MVP architecture.</p>
        <button className="w-full py-4 rounded-xl bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors mb-8">
          Start for Free
        </button>
        <ul className="space-y-4 text-sm font-medium text-slate-600">
          <li className="flex gap-3"><Check size={18} className="text-green-500"/> 3 Projects / Month</li>
          <li className="flex gap-3"><Check size={18} className="text-green-500"/> Basic Market Analysis</li>
          <li className="flex gap-3"><Check size={18} className="text-green-500"/> Standard AI Models</li>
          <li className="flex gap-3"><Check size={18} className="text-green-500"/> Community Support</li>
        </ul>
      </div>

      {/* Pro Plan */}
      <div className="p-8 rounded-[2.5rem] border-2 border-indigo-600 bg-indigo-50/20 shadow-2xl relative transform md:-translate-y-4">
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl rounded-tr-2xl">
          Most Popular
        </div>
        <h3 className="text-xl font-black text-indigo-600 uppercase italic">Founder</h3>
        <div className="my-6">
          <span className="text-5xl font-black text-slate-900">$29</span>
          <span className="text-slate-400 font-bold">/mo</span>
        </div>
        <p className="text-sm text-slate-500 font-medium mb-8">For serious builders shipping tailored products.</p>
        <button className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors mb-8 shadow-lg shadow-indigo-200">
          Get Pro Access
        </button>
        <ul className="space-y-4 text-sm font-medium text-slate-600">
          <li className="flex gap-3"><Check size={18} className="text-indigo-600"/> Unlimited Projects</li>
          <li className="flex gap-3"><Check size={18} className="text-indigo-600"/> Deep Competitor Intel</li>
          <li className="flex gap-3"><Check size={18} className="text-indigo-600"/> <b>Gemini 2.5 Flash & Pro</b></li>
          <li className="flex gap-3"><Check size={18} className="text-indigo-600"/> Guided Co-Founder Mode</li>
          <li className="flex gap-3"><Check size={18} className="text-indigo-600"/> Export to PDF/Notion</li>
        </ul>
      </div>

      {/* Enterprise */}
      <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-slate-900 text-white shadow-xl relative">
        <h3 className="text-xl font-black text-white uppercase italic">Agency</h3>
        <div className="my-6">
          <span className="text-5xl font-black text-white">$99</span>
          <span className="text-slate-400 font-bold">/mo</span>
        </div>
        <p className="text-sm text-slate-400 font-medium mb-8">For dev shops and incubators managing multiple ventures.</p>
        <button onClick={onContactSales} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors mb-8 border border-white/10">
          Contact Sales
        </button>
        <ul className="space-y-4 text-sm font-medium text-slate-300">
          <li className="flex gap-3"><Check size={18} className="text-white"/> Everything in Founder</li>
          <li className="flex gap-3"><Check size={18} className="text-white"/> Team Collaboration</li>
          <li className="flex gap-3"><Check size={18} className="text-white"/> White-label Reports</li>
          <li className="flex gap-3"><Check size={18} className="text-white"/> API Access</li>
          <li className="flex gap-3"><Check size={18} className="text-white"/> Dedicated Strategy Manager</li>
        </ul>
      </div>
    </div>
  </div>
);

/* --- ENTERPRISE PAGE --- */
export const EnterprisePage: React.FC = () => (
  <div className="bg-[#0b0f19] min-h-screen text-white pt-32 pb-20 animate-fade-in">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-24">
        <div className="space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
            <Shield size={12} /> Enterprise Security
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Build at <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Global Scale</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            IdeaForge Enterprise provides the security, control, and custom AI modeling required by Fortune 500 innovation labs and Venture Capital firms.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors">
              Book Demo
            </button>
            <button className="px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-colors text-white">
              View Documentation
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-gradient-to-tr from-indigo-900/50 to-slate-900 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
           <Server size={200} className="text-indigo-500/10 absolute -bottom-10 -right-10 group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <Shield className="text-green-400" />
                 <div>
                    <h4 className="font-bold">SOC 2 Type II Compliant</h4>
                    <p className="text-xs text-slate-400">Bank-grade data encryption and sovereignty.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <Globe className="text-blue-400" />
                 <div>
                    <h4 className="font-bold">Regional Deployment</h4>
                    <p className="text-xs text-slate-400">Host instances in US, EU, or APAC regions.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <Zap className="text-yellow-400" />
                 <div>
                    <h4 className="font-bold">Custom Fine-Tuned Models</h4>
                    <p className="text-xs text-slate-400">Train Forge AI on your internal data.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-16 opacity-60">
        {['Acme Corp', 'Global Ventures', 'TechFlow', 'Nebula Inc'].map((logo, i) => (
          <div key={i} className="flex items-center justify-center font-black text-2xl uppercase tracking-widest text-slate-600">
            {logo}
          </div>
        ))}
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
    blog: "Insights & Trends",
    'case-studies': "Success Stories",
    guide: "The Founder's Playbook",
    help: "Support Center"
  };

  const articles = [
    { title: "How to validate a SaaS idea in 24 hours", cat: "Strategy", read: "5 min" },
    { title: "The tech stack that scales to 1M users", cat: "Engineering", read: "8 min" },
    { title: "Pitching to VCs: What metrics matter?", cat: "Fundraising", read: "6 min" },
    { title: "Understanding MVP vs MLP (Minimum Lovable Product)", cat: "Product", read: "4 min" },
    { title: "5 AI tools to automate your marketing", cat: "Growth", read: "7 min" },
    { title: "Designing for retention: The Hook Model", cat: "UX Design", read: "10 min" }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <BookOpen size={12} /> Knowledge Hub
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
            {titles[type]}
          </h1>
        </div>
        <div className="relative w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute left-3 top-3.5 text-slate-400">
             <Layout size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((art, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="h-48 bg-slate-100 rounded-[2rem] mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600">
                {art.cat}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
              {art.title}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
               <span>{art.read} read</span>
               <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
               <span>Oct 24, 2024</span>
            </div>
          </div>
        ))}
      </div>
      
      {type === 'guide' && (
        <div className="mt-20 p-10 bg-indigo-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic mb-2">Download the Full Playbook</h2>
            <p className="text-indigo-200 font-medium">Get the 50-page PDF guide on building 0 to 1.</p>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors flex items-center gap-2">
            Download PDF <ArrowRight size={14}/>
          </button>
        </div>
      )}
    </div>
  );
};

/* --- LEGAL PAGE --- */
export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const title = type === 'privacy' ? "Privacy Policy" : "Terms of Service";
  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">{title}</h1>
        <p className="text-slate-500 text-sm font-bold">Last Updated: October 2024</p>
      </div>
      <div className="prose prose-slate prose-lg">
        <p>
          Welcome to IdeaForge AI. We are committed to protecting your personal information and your right to privacy. 
          If you have any questions or concerns about this {type === 'privacy' ? 'policy' : 'agreement'}, or our practices with regards to your personal information, please contact us.
        </p>
        <h3>1. Information We Collect</h3>
        <p>
          We collect personal information that you voluntarily provide to us when you register on the website, 
          express an interest in obtaining information about us or our products and services, when you participate 
          in activities on the website or otherwise when you contact us.
        </p>
        <h3>2. {type === 'privacy' ? 'How We Use Your Information' : 'Acceptable Use'}</h3>
        <p>
          {type === 'privacy' 
            ? "We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests."
            : "You agree not to use the Service to generate content that is illegal, harmful, or violates the rights of others. We reserve the right to terminate accounts that violate these terms."
          }
        </p>
        <h3>3. AI Generated Content</h3>
        <p>
          The blueprints and strategies generated by IdeaForge AI are for informational purposes only. You retain ownership of the specific prompts you enter, 
          while the structure of the generated blueprints is licensed to you for use in your business.
        </p>
      </div>
    </div>
  );
};
