import React, { useState } from 'react';
import {
  Shield,
  Dumbbell,
  Compass,
  FileCheck2,
  Terminal,
  Activity,
  Menu,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: 'home' | 'form' | 'results' | 'catalog' | 'audit' | 'tests';
  setActiveTab: (tab: 'home' | 'form' | 'results' | 'catalog' | 'audit' | 'tests') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  hasResults: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasResults,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as const, label: 'Inicio', icon: Compass },
    { id: 'form' as const, label: 'Diseñar Plan', icon: Activity },
    {
      id: 'results' as const,
      label: 'Mi Entrenamiento',
      icon: Dumbbell,
      hasBadge: hasResults,
    },
    { id: 'catalog' as const, label: 'Catálogo (60)', icon: Layers },
    { id: 'audit' as const, label: 'Motor & Reglas', icon: Terminal },
    { id: 'tests' as const, label: 'Tests (17/17)', icon: FileCheck2 },
  ];

  const handleSelectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2D4A]/80 bg-[#080D19]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand Logo & Tagline */}
        <button
          onClick={() => handleSelectTab('home')}
          className="flex items-center gap-3 text-left group focus-visible:outline-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#22D3EE]/20 via-[#6366F1]/20 to-transparent border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.25)] group-hover:border-[#22D3EE] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all">
            <Shield className="w-5 h-5 stroke-[2.4]" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#080D19]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC]">
                Sport<span className="text-[#22D3EE]">Expert</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/30 font-semibold tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] tracking-tight hidden sm:block">
              Sistema Experto Determinista de Alto Rendimiento
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#111B2E]/90 p-1.5 rounded-xl border border-[#1E2D4A]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                  isActive
                    ? 'text-[#080D19] bg-[#22D3EE] font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#16243D]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#080D19]' : 'text-[#22D3EE]'}`} />
                <span>{item.label}</span>
                {item.hasBadge && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-[#080D19]' : 'bg-[#10B981] animate-pulse'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Header Right Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#94A3B8] bg-[#111B2E] px-3 py-1.5 rounded-lg border border-[#1E2D4A]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="font-mono text-[11px] text-[#F8FAFC]">17/17 Verificado</span>
          </div>

          <button
            onClick={() => handleSelectTab('form')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-[#F8FAFC] bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#4338CA] transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar Plan</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#111B2E] border border-[#1E2D4A] text-[#94A3B8] hover:text-[#F8FAFC]"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-[#1E2D4A] bg-[#080D19]/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#22D3EE] text-[#080D19] font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                        : 'text-[#94A3B8] hover:bg-[#111B2E] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.hasBadge && (
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
