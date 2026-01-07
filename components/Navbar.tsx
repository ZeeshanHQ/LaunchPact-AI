
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
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-700 ${scrolled ? 'pt-2' : 'pt-6'}`}>
        <nav className={`
          relative px-6 py-3 rounded-full transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
          ${scrolled
            ? 'bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-[92%] max-w-6xl'
            : 'bg-transparent w-[96%] max-w-7xl'}
        `}>
          <div className="flex items-center justify-between">
            {/* Logo Section - Icon Only */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={onGoHome}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <img src="/logo_v2.png" alt="LaunchPact AI" className="relative h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onGoDashboard}
                    className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-white font-medium text-xs uppercase tracking-widest px-4 py-2 transition-all hover:bg-white/5 rounded-full"
                  >
                    <Layout size={14} />
                    <span>Console</span>
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
                    className="hidden sm:block text-slate-400 hover:text-white font-medium text-xs uppercase tracking-widest px-4 py-2 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="relative group overflow-hidden rounded-full"
                  >
                    <div className="absolute inset-0 bg-white transition-transform duration-500 group-hover:scale-105"></div>
                    <div className="relative flex items-center gap-2 px-6 py-2.5 text-slate-950 font-bold text-xs uppercase tracking-widest">
                      <span>Start Building</span>
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
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-10 duration-200 flex flex-col items-center justify-center">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-8 right-8 p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col gap-6 w-full max-w-xs text-center">
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => { onNavigate('/login'); setMobileMenuOpen(false); }}
                  className="w-full py-4 text-xl font-medium text-slate-300 hover:text-white"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onNavigate('/signup'); setMobileMenuOpen(false); }}
                  className="w-full py-4 bg-white text-slate-950 rounded-2xl text-xl font-bold"
                >
                  Start Building
                </button>
              </>
            )}
            {isLoggedIn && (
              <button
                onClick={() => { onGoDashboard(); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xl font-bold"
              >
                Go to Console
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
