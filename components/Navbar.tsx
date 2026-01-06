
import React, { useState, useEffect } from 'react';
import { Layout, User, LogIn, Sparkles, Menu, X, ChevronRight, Zap, Shield, BookOpen, Crown } from 'lucide-react';

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

  const navItems = [
    { label: 'Intelligence', id: 'intelligence', icon: Zap },
    { label: 'Marketplace', id: 'marketplace', icon: Shield },
    { label: 'Community', id: 'community', icon: BookOpen },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate(id.startsWith('/') ? id : `/${id}`);
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-700 ${scrolled ? 'pt-2' : 'pt-6'}`}>
        <nav className={`
          relative px-6 py-2.5 rounded-full transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
          ${scrolled
            ? 'bg-slate-900/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-[92%] max-w-6xl'
            : 'bg-white/5 backdrop-blur-sm border border-white/5 w-[96%] max-w-7xl'}
        `}>
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={onGoHome}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <img src="/pnx_logo.png" alt="Logo" className="relative h-8 md:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
              </div>
              <span className="hidden sm:block font-black text-xl tracking-tighter text-white uppercase italic">
                LaunchPact<span className="text-indigo-500">AI</span>
              </span>
            </div>

            {/* Desktop Menu - Floating Island Style */}
            <div className={`hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-xl`}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group"
                >
                  <item.icon size={14} className="group-hover:text-indigo-400 transition-colors" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onGoDashboard}
                    className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 transition-all hover:bg-white/5 rounded-full"
                  >
                    <Layout size={14} />
                    <span>Project Console</span>
                  </button>

                  <div className="h-4 w-[1px] bg-white/10 hidden lg:block mx-1"></div>

                  <button
                    onClick={() => {
                      if (window.confirm("End current session?")) {
                        onLogout();
                      }
                    }}
                    className="relative group p-0.5 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 hover:border-white/30 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-indigo-400 overflow-hidden relative">
                      <User size={18} />
                      <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('/login')}
                    className="hidden sm:block text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] px-3 py-2 transition-colors"
                  >
                    Access
                  </button>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform duration-500 group-hover:scale-110"></div>
                    <div className="relative flex items-center gap-2 px-6 py-2.5 text-white font-black text-[10px] uppercase tracking-[0.2em]">
                      <span>Initialize</span>
                      <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button
                className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-full border border-white/10 transition-all"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-10 duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id.startsWith('/') ? item.id : `/${item.id}`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-4 rounded-2xl hover:bg-white/5 text-lg font-semibold text-slate-200 flex items-center gap-4 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
