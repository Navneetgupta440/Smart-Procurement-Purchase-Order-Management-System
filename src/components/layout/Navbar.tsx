import React, { useState, useMemo, useCallback, memo } from 'react';
import { 
  Building2, 
  Layers, 
  Sparkles, 
  Code2, 
  Terminal, 
  FolderArchive, 
  RotateCcw, 
  Bell, 
  User, 
  LogIn, 
  ChevronDown, 
  ShieldCheck,
  Package,
  Home,
  LayoutDashboard,
  Info,
  Headphones,
  LogOut,
  UserPlus,
  Crown,
  Sparkle,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Role, RoleType, User as UserType } from '../../types/procurement';
import { ProcurementState } from '../../services/procurementStore';

export type NavTab = 'home' | 'workspace' | 'catalog' | 'about' | 'contact';

interface NavbarProps {
  state: ProcurementState;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRoleChange: (role: RoleType) => void;
  onResetData: () => void;
  onOpenArchitecture: () => void;
  onOpenWalkthrough: () => void;
  onOpenApiExplorer: () => void;
  onOpenWorkflow: () => void;
  onOpenZip: () => void;
  onOpenNotificationDrawer: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onLogout?: () => void;
}

// Role configurations with custom accents, tags, and icons
interface RoleConfig {
  title: string;
  short: string;
  accent: string;
  badgeBg: string;
  dotColor: string;
}

const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  EMPLOYEE: { 
    title: 'Employee Requester', 
    short: 'Employee', 
    accent: 'hover:border-blue-400 hover:text-blue-300', 
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    dotColor: 'bg-blue-400' 
  },
  MANAGER: { 
    title: 'Dept Manager (T1)', 
    short: 'Dept Mgr', 
    accent: 'hover:border-indigo-400 hover:text-indigo-300', 
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    dotColor: 'bg-indigo-400' 
  },
  PROCUREMENT_OFFICER: { 
    title: 'Procurement (T2)', 
    short: 'Procurement', 
    accent: 'hover:border-emerald-400 hover:text-emerald-300', 
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    dotColor: 'bg-emerald-400' 
  },
  PROCUREMENT_MANAGER: { 
    title: 'Procurement (T2)', 
    short: 'Procurement', 
    accent: 'hover:border-emerald-400 hover:text-emerald-300', 
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    dotColor: 'bg-emerald-400' 
  },
  SUPPLIER: { 
    title: 'Vendor Partner', 
    short: 'Vendor', 
    accent: 'hover:border-amber-400 hover:text-amber-300', 
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    dotColor: 'bg-amber-400' 
  },
  DELIVERY_PERSONNEL: { 
    title: 'Logistics Courier', 
    short: 'Logistics', 
    accent: 'hover:border-sky-400 hover:text-sky-300', 
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    dotColor: 'bg-sky-400' 
  },
  DELIVERY_AGENT: { 
    title: 'Logistics Courier', 
    short: 'Logistics', 
    accent: 'hover:border-sky-400 hover:text-sky-300', 
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    dotColor: 'bg-sky-400' 
  },
  CUSTOMER: { 
    title: 'Client / Customer', 
    short: 'Customer', 
    accent: 'hover:border-purple-400 hover:text-purple-300', 
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    dotColor: 'bg-purple-400' 
  },
  ADMIN: { 
    title: 'Executive Admin (T3)', 
    short: 'Admin (T3)', 
    accent: 'hover:border-rose-400 hover:text-rose-300', 
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    dotColor: 'bg-rose-400' 
  }
};

const ROLE_PERSONA_ORDER: RoleType[] = [
  'EMPLOYEE', 
  'MANAGER', 
  'PROCUREMENT_MANAGER', 
  'SUPPLIER', 
  'DELIVERY_AGENT', 
  'CUSTOMER', 
  'ADMIN'
];

// Memoized Individual Role Persona Button Component
interface RoleButtonProps {
  role: RoleType;
  isActive: boolean;
  onSelectRole: (role: RoleType) => void;
}

const RoleButton = memo(({ role, isActive, onSelectRole }: RoleButtonProps) => {
  const config = ROLE_CONFIGS[role] || { 
    title: role, 
    short: role, 
    accent: 'hover:border-white/40 hover:text-white', 
    badgeBg: 'bg-white/10 text-white', 
    dotColor: 'bg-white' 
  };

  const handleClick = useCallback(() => {
    onSelectRole(role);
  }, [role, onSelectRole]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      aria-label={`Switch persona to ${config.title}`}
      className={`group relative px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer border select-none transition-all duration-200 ease-out focus:outline-none focus:ring-1 focus:ring-amber-400/60 ${
        isActive 
          ? 'bg-[#F9F7F2] text-[#121212] border-[#F9F7F2] font-bold shadow-sm translate-y-0 ring-2 ring-amber-400/40' 
          : 'bg-white/5 text-[#F9F7F2]/80 border-white/15 hover:bg-white/15 hover:text-white hover:border-white/40 hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-95'
      } ${!isActive ? config.accent : ''}`}
      title={`Instant switch to ${config.title}`}
    >
      <div className="flex items-center gap-1.5">
        <span 
          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
            isActive ? 'bg-[#121212] scale-110' : `${config.dotColor} opacity-70 group-hover:opacity-100 group-hover:scale-125`
          }`} 
        />
        <span>{config.short}</span>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        )}
      </div>
    </button>
  );
});

RoleButton.displayName = 'RoleButton';

export function Navbar({
  state,
  activeTab,
  onTabChange,
  onRoleChange,
  onResetData,
  onOpenArchitecture,
  onOpenWalkthrough,
  onOpenApiExplorer,
  onOpenWorkflow,
  onOpenZip,
  onOpenNotificationDrawer,
  onOpenAuthModal,
  onLogout
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Memoized unread notification count
  const unreadNotifCount = useMemo(() => {
    return state.notifications.filter(n => n.status === 'PENDING').length;
  }, [state.notifications]);

  // Memoized navigation tabs list
  const navItems = useMemo<{ id: NavTab; label: string; icon: React.ReactNode }[]>(() => [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" /> },
    { id: 'workspace', label: 'Workspaces', icon: <LayoutDashboard className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" /> },
    { id: 'catalog', label: 'Catalog', icon: <Package className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" /> },
    { id: 'about', label: 'About & Creator', icon: <Info className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" /> },
    { id: 'contact', label: 'Contact', icon: <Headphones className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" /> }
  ], []);

  // Instant role switch callback with tab sync
  const handleSelectRole = useCallback((role: RoleType) => {
    onRoleChange(role);
    if (activeTab !== 'workspace') {
      onTabChange('workspace');
    }
  }, [onRoleChange, activeTab, onTabChange]);

  // Memoize active role check helper
  const currentRole = state.currentUser.role;
  const isRoleActive = useCallback((role: RoleType) => {
    return currentRole === role || 
      (role === 'PROCUREMENT_MANAGER' && currentRole === 'PROCUREMENT_OFFICER') ||
      (role === 'DELIVERY_AGENT' && currentRole === 'DELIVERY_PERSONNEL');
  }, [currentRole]);

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2] border-b border-[#121212] transition-colors">
      {/* Top Primary Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Identity & Founder Tagline */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 border border-[#121212] bg-[#121212] text-[#F9F7F2] flex items-center justify-center font-serif shadow-xs group-hover:bg-[#2A2A2A] group-hover:scale-105 transition-all duration-200">
            <Building2 className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-normal tracking-tight text-[#121212] group-hover:text-black transition-colors">
                SmartProcure
              </span>
              <span className="px-2 py-0.5 border border-[#121212]/30 text-[#121212] text-[9px] font-sans uppercase tracking-[0.2em] font-semibold bg-[#121212]/5 group-hover:bg-[#121212] group-hover:text-[#F9F7F2] transition-all duration-200">
                Enterprise
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-sans text-[#121212]/75">
              <span className="font-serif italic hidden sm:inline">Multi-Tier PO & Logistics Governance</span>
              <span className="hidden md:inline text-[#121212]/30">•</span>
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  onTabChange('about');
                }}
                className="hidden md:inline-flex items-center gap-1 font-semibold text-[#121212] hover:text-amber-900 hover:underline transition-colors"
              >
                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                CEO & Founder: Navneet Gupta
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group px-3.5 py-2 text-xs font-sans uppercase tracking-[0.12em] font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border select-none ${
                  isActive 
                    ? 'bg-[#121212] text-[#F9F7F2] border-[#121212] shadow-xs' 
                    : 'bg-transparent text-[#121212]/75 border-transparent hover:border-[#121212]/30 hover:bg-[#121212]/5 hover:text-[#121212] hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Auth Bar */}
        <div className="flex items-center gap-2">
          {/* Creator Profile Chip Button */}
          <button
            onClick={() => onTabChange('about')}
            title="View CEO & Founder Profile — Navneet Gupta"
            className="hidden lg:flex px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 hover:-translate-y-0.5 border border-amber-400/80 text-amber-950 text-[11px] font-sans font-semibold items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-xs active:translate-y-0"
          >
            <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
            <span>Navneet Gupta <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold opacity-80">(CEO)</span></span>
          </button>

          {/* Notification Icon Button */}
          <button
            onClick={onOpenNotificationDrawer}
            title="Open real-time notifications"
            className="relative p-2.5 bg-white border border-[#121212]/30 hover:border-[#121212] hover:bg-[#F9F7F2] hover:-translate-y-0.5 text-[#121212] transition-all duration-200 cursor-pointer shadow-2xs active:translate-y-0"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center font-mono animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* 20 Steps Architecture Button */}
          <button
            onClick={onOpenArchitecture}
            className="hidden xl:flex px-3 py-2 border border-[#121212] bg-[#121212] hover:bg-[#2A2A2A] hover:-translate-y-0.5 text-[#F9F7F2] text-[11px] font-sans uppercase tracking-[0.15em] font-medium items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:translate-y-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>20 Steps</span>
          </button>

          {/* 7-Stage Walkthrough Button */}
          <button
            onClick={onOpenWalkthrough}
            className="hidden sm:flex px-3 py-2 border border-[#121212]/20 hover:border-[#121212] hover:bg-[#F4F0E8] hover:-translate-y-0.5 text-[#121212] bg-white text-[11px] font-sans uppercase tracking-[0.15em] font-medium items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#121212]" />
            <span className="hidden xl:inline">7-Stage</span> Walkthrough
          </button>

          {/* Swagger REST API Button */}
          <button
            onClick={onOpenApiExplorer}
            className="hidden 2xl:flex px-3 py-2 border border-[#121212]/20 hover:border-[#121212] hover:bg-[#F4F0E8] hover:-translate-y-0.5 text-[#121212] bg-white text-[11px] font-sans uppercase tracking-[0.15em] font-medium items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:translate-y-0"
          >
            <Code2 className="w-3.5 h-3.5 text-[#121212]" />
            <span>API Docs</span>
          </button>

          {/* Central Workflow API Button */}
          <button
            onClick={onOpenWorkflow}
            className="hidden 2xl:flex px-3 py-2 border border-[#121212]/20 hover:border-[#121212] hover:bg-[#F4F0E8] hover:-translate-y-0.5 text-[#121212] bg-white text-[11px] font-sans uppercase tracking-[0.15em] font-medium items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:translate-y-0"
          >
            <Terminal className="w-3.5 h-3.5 text-[#121212]" />
            <span>Workflow</span>
          </button>

          {/* Download Project ZIP Button */}
          <button
            onClick={onOpenZip}
            className="px-3 py-2 bg-white hover:bg-[#F4F0E8] hover:border-[#121212] hover:-translate-y-0.5 text-[#121212] border border-[#121212]/30 text-[11px] font-sans uppercase tracking-[0.15em] font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:translate-y-0"
          >
            <FolderArchive className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">ZIP</span>
          </button>

          {/* User Account / Sign In Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="px-3 py-2 bg-white hover:bg-[#F2EDE4] hover:border-[#121212] hover:-translate-y-0.5 text-[#121212] border border-[#121212]/40 text-[11px] font-sans uppercase tracking-[0.1em] font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:translate-y-0"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline truncate max-w-[100px]">{state.currentUser.name.split(' ')[0]}</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#F9F7F2] border border-[#121212] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-[#121212]/15">
                  <div className="text-xs font-bold text-[#121212] truncate flex items-center gap-1.5">
                    {state.currentUser.name}
                    {state.currentUser.email === 'indianavneetgupta33@gmail.com' && (
                      <span className="px-1 py-0.2 bg-amber-200 text-amber-900 text-[8px] font-bold uppercase tracking-wider rounded-xs">CEO</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#121212]/60 truncate font-mono">{state.currentUser.email}</div>
                  <div className="mt-1 inline-block px-1.5 py-0.2 bg-[#121212] text-[#F9F7F2] text-[9px] font-sans uppercase tracking-wider font-semibold">
                    {state.currentUser.role.replace('_', ' ')}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { onTabChange('workspace'); }}
                    className="w-full px-4 py-2 text-left text-xs text-[#121212] hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>My Role Workspace</span>
                  </button>

                  <button
                    onClick={() => { onTabChange('about'); }}
                    className="w-full px-4 py-2 text-left text-xs text-amber-900 bg-amber-50/50 hover:bg-amber-100/70 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-700" />
                    <span>Founder Profile (Navneet Gupta)</span>
                  </button>

                  <div className="px-4 py-1.5 bg-[#F4F0E8]/70 border-y border-[#121212]/10 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-[#121212]/60 block font-semibold">
                      Real-Time Channels
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href="https://www.linkedin.com/in/navneet-gupta-4a1644297"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-[#0077b5] text-white text-[10px] font-sans font-semibold rounded-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                      >
                        <Linkedin className="w-2.5 h-2.5" />
                        <span>LinkedIn</span>
                      </a>
                      <a
                        href="https://github.com/Navneetgupta440"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-[#24292e] text-white text-[10px] font-sans font-semibold rounded-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                      >
                        <Github className="w-2.5 h-2.5" />
                        <span>GitHub</span>
                      </a>
                      <a
                        href="https://portfolio-ng440.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-sans font-semibold rounded-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>Portfolio</span>
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAuthModal('signin')}
                    className="w-full px-4 py-2 text-left text-xs text-[#121212] hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Switch User / Sign In</span>
                  </button>

                  <button
                    onClick={() => onOpenAuthModal('signup')}
                    className="w-full px-4 py-2 text-left text-xs text-[#121212] hover:bg-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create New Account</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-xs text-[#121212] hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-[#121212]/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#121212]" />
                      <span>Lock Gateway & Sign Out</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-[#121212]/15">
                  <button
                    onClick={() => {
                      onResetData();
                    }}
                    className="w-full px-4 py-1.5 text-left text-[11px] text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Demo Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs Ribbon */}
      <div className="md:hidden flex items-center justify-around bg-[#F2EDE4] border-t border-[#121212]/15 px-2 py-1.5 overflow-x-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.1em] font-semibold flex items-center gap-1 transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-[#121212] text-[#F9F7F2] shadow-xs' 
                  : 'text-[#121212]/70 hover:text-[#121212] hover:bg-[#121212]/5 active:scale-95'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ultra-Fast Responsive Role Persona Switcher Bar */}
      <div className="bg-[#121212] text-[#F9F7F2] px-4 py-2 border-t border-[#121212]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-thin">
            <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#F9F7F2]/60 whitespace-nowrap mr-1 font-semibold flex items-center gap-1 select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Role Persona:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {ROLE_PERSONA_ORDER.map(role => (
                <RoleButton
                  key={role}
                  role={role}
                  isActive={isRoleActive(role)}
                  onSelectRole={handleSelectRole}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto text-[#F9F7F2]/70 text-[11px] select-none">
            <span className="font-sans flex items-center gap-1.5">
              <span>Active Persona:</span>
              <strong className="text-[#F9F7F2] font-semibold tracking-wide">{state.currentUser.name}</strong>
              <span className="italic font-serif opacity-80 text-amber-300">({state.currentUser.department?.split(' ')[0] || state.currentUser.role})</span>
            </span>
            <button
              onClick={() => {
                onResetData();
              }}
              title="Reset local demo database state"
              className="p-1 hover:text-white text-[#F9F7F2]/60 hover:bg-white/10 rounded-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


