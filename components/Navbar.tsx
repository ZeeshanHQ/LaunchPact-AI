
import React, { useState, useEffect } from 'react';
import { Layout, User, Menu, X, ChevronRight } from 'lucide-react';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onGoHome: () => void;
  onGoDashboard: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogin, onGoHome, onGoDashboard, onNavigate, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div
        className={`
          nav-island 
          ${scrolled ? 'scrolled w-auto' : 'expanded w-[90%] max-w-7xl bg-transparent border-transparent shadow-none top-8'}
        `}
      >
        <nav className="flex items-center justify-between px-2 w-full">

          {/* Left: Logo (Hidden when scrolled if needed, or compact) */}
          <div className={`flex items-center gap-4 transition-all duration-500 ${scrolled ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
            <div onClick={onGoHome} className="cursor-pointer group flex items-center gap-2 pl-2">
              <img src="/logo_v2.png" alt="LaunchPact" className="h-8 w-auto object-contain" />
            </div>
          </div>

          {/* Center: Main Navigation (Always visible) */}
          <div className="flex-1 flex justify-center">
            <div className={`
                flex items-center p-1.5 rounded-full transition-all duration-500
                ${scrolled ? 'bg-slate-800/50 border border-white/5' : 'bg-transparent'}
              `}>
              {/* Home / Logo Trigger for Island */}
              {scrolled && (
                <button onClick={onGoHome} className="p-2 mr-2 rounded-full hover:bg-white/10 text-indigo-400 transition-colors">
                  <img src="/logo_v2.png" alt="LP" className="h-5 w-auto" />
                </button>
              )}

              <div className="flex items-center gap-1">
                <NavPill label="Platform" onClick={() => onNavigate('/platform')} />
                <NavPill label="Features" onClick={() => {
                  const section = document.getElementById('features');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                  else onGoHome();
                }} />
                <NavPill label="Pricing" onClick={() => onNavigate('/pricing')} />
                <NavPill label="Insights" onClick={() => onNavigate('/insights')} />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className={`flex items-center justify-end gap-3 transition-all duration-500 ${scrolled ? 'w-auto pl-4' : 'w-auto'}`}>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGoDashboard}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Layout size={14} />
                  <span>Console</span>
                </button>
                <button onClick={() => window.confirm("End session?") && onLogout()} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <User size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => onNavigate('/login')} className="hidden sm:block text-xs font-medium text-slate-400 hover:text-white px-3 py-2 transition-colors">
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="bg-white text-slate-900 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10"
                >
                  Start
                </button>
              </div>
            )}
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>

        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-10 duration-200 flex flex-col items-center justify-center">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-white"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col gap-6 w-full max-w-xs text-center">
            {!isLoggedIn ? (
              <>
                <button onClick={() => { onNavigate('/login'); setMobileMenuOpen(false); }} className="w-full py-4 text-xl font-medium text-slate-300">Log In</button>
                <button onClick={() => { onNavigate('/signup'); setMobileMenuOpen(false); }} className="w-full py-4 bg-white text-slate-950 rounded-2xl text-xl font-bold">Start Building</button>
              </>
            ) : (
              <button onClick={() => { onGoDashboard(); setMobileMenuOpen(false); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xl font-bold">Go to Console</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const NavPill = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
  >
    {label}
  </button>
);

export default Navbar;
