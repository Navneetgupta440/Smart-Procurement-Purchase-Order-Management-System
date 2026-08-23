import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Code2, 
  Terminal, 
  FolderArchive,
  ArrowUp,
  Linkedin,
  Github,
  Globe
} from 'lucide-react';
import { NavTab } from './Navbar';
import { FounderSignature } from './FounderSignature';

interface FooterProps {
  onTabChange: (tab: NavTab) => void;
  onOpenArchitecture: () => void;
  onOpenApiExplorer: () => void;
  onOpenWorkflow: () => void;
  onOpenZip: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
}

export function Footer({
  onTabChange,
  onOpenArchitecture,
  onOpenApiExplorer,
  onOpenWorkflow,
  onOpenZip,
  onOpenAuthModal
}: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#121212] text-[#F9F7F2] border-t border-[#121212] mt-auto">
      {/* Upper Footer: Newsletter & Core Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#F9F7F2]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#F9F7F2]/40 bg-[#F9F7F2] text-[#121212] flex items-center justify-center font-serif">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl tracking-tight text-[#F9F7F2]">SmartProcure</span>
                <span className="ml-2 px-1.5 py-0.2 border border-[#F9F7F2]/40 text-[#F9F7F2] text-[9px] font-sans uppercase tracking-widest">
                  Enterprise
                </span>
              </div>
            </div>
            <p className="text-xs text-[#F9F7F2]/75 leading-relaxed font-sans max-w-sm">
              Standardized corporate procurement infrastructure delivering 3-tier approval governance, algorithmic supplier quote scoring, and real-time shipment logistics tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#F9F7F2]/60 pt-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Production Core: PostgreSQL 16 • Spring Boot 3.3.x</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-semibold text-[#F9F7F2]/90">
              Platform Views
            </h4>
            <ul className="space-y-2 text-xs text-[#F9F7F2]/70 font-sans">
              <li>
                <button 
                  onClick={() => { onTabChange('home'); scrollToTop(); }} 
                  className="hover:text-[#F9F7F2] transition cursor-pointer"
                >
                  System Home Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onTabChange('workspace'); scrollToTop(); }} 
                  className="hover:text-[#F9F7F2] transition cursor-pointer"
                >
                  Role Workspaces
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onTabChange('catalog'); scrollToTop(); }} 
                  className="hover:text-[#F9F7F2] transition cursor-pointer"
                >
                  Product Catalog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onTabChange('about'); scrollToTop(); }} 
                  className="hover:text-[#F9F7F2] transition cursor-pointer"
                >
                  Architecture & About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onTabChange('contact'); scrollToTop(); }} 
                  className="hover:text-[#F9F7F2] transition cursor-pointer"
                >
                  Support & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Developer & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-semibold text-[#F9F7F2]/90">
              Developer APIs
            </h4>
            <ul className="space-y-2 text-xs text-[#F9F7F2]/70 font-sans">
              <li>
                <button 
                  onClick={onOpenArchitecture} 
                  className="hover:text-[#F9F7F2] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>20-Step Architecture</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenApiExplorer} 
                  className="hover:text-[#F9F7F2] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Swagger REST APIs</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenWorkflow} 
                  className="hover:text-[#F9F7F2] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>POST /workflow Runner</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenZip} 
                  className="hover:text-[#F9F7F2] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Export Full Project ZIP</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenAuthModal('signin')} 
                  className="hover:text-[#F9F7F2] transition cursor-pointer"
                >
                  Switch User Account
                </button>
              </li>
            </ul>
          </div>

          {/* System Alerts Subscription */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-[0.2em] font-semibold text-[#F9F7F2]/90">
              Procurement Alerts
            </h4>
            <p className="text-xs text-[#F9F7F2]/70 leading-relaxed font-sans">
              Receive broadcast updates on low stock thresholds, vendor price changes, and system maintenance.
            </p>
            {subscribed ? (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed for platform notifications!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Enter work email..."
                    className="w-full pl-3 pr-8 py-2 bg-[#222222] border border-[#F9F7F2]/20 focus:border-[#F9F7F2] text-xs text-[#F9F7F2] outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 px-2.5 flex items-center text-[#F9F7F2]/70 hover:text-[#F9F7F2] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Executive Leadership & Founder Attribution Section */}
      <div className="bg-[#1a1a1a] border-y border-[#F9F7F2]/15 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <FounderSignature 
            variant="dark"
            showBio={true}
            showContact={true}
            className="border-amber-400/40 shadow-xl"
          />
          <div className="flex justify-end">
            <button
              onClick={() => { onTabChange('about'); scrollToTop(); }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
            >
              View Full CEO & Founder Profile &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Legal & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F9F7F2]/70 font-sans">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F9F7F2]" />
            <span>© 2026 SmartProcure Enterprise. All rights reserved.</span>
          </div>
          <span className="hidden sm:inline text-[#F9F7F2]/30">•</span>
          <span className="text-[#F9F7F2]/90">
            Founded & Engineered by <strong className="text-amber-400 font-semibold cursor-pointer hover:underline" onClick={() => onTabChange('about')}>Navneet Gupta</strong> (CEO)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-mono">
          <span>Flyway Baseline V1/V2</span>
          <span>•</span>
          <span>HikariCP Pool</span>
          <span>•</span>
          <span>Zero-Downtime DDL</span>
          <button 
            onClick={scrollToTop}
            className="p-1.5 bg-[#222] hover:bg-[#333] text-[#F9F7F2] border border-[#F9F7F2]/20 transition cursor-pointer ml-2"
            title="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
