import React from 'react';
import { 
  Linkedin, 
  Github, 
  Globe, 
  ExternalLink, 
  Crown,
  ShieldCheck,
  Mail,
  Phone
} from 'lucide-react';

export interface FounderSignatureProps {
  variant?: 'light' | 'dark' | 'card' | 'compact';
  className?: string;
  showBio?: boolean;
  showContact?: boolean;
}

export const FOUNDER_LINKS = {
  name: 'NAVNEET GUPTA',
  title: 'CEO & FOUNDER',
  subtitle: 'Lead Full-Stack Architect & Machine Learning Engineer',
  linkedin: 'https://www.linkedin.com/in/navneet-gupta-4a1644297',
  github: 'https://github.com/Navneetgupta440',
  portfolio: 'https://portfolio-ng440.netlify.app/',
  email: 'indianavneetgupta33@gmail.com',
  phone: '+91-7317567350'
};

export const FounderSignature: React.FC<FounderSignatureProps> = ({
  variant = 'card',
  className = '',
  showBio = false,
  showContact = false
}) => {
  const isDark = variant === 'dark';

  if (variant === 'compact') {
    return (
      <div className={`inline-flex flex-wrap items-center gap-3 py-1.5 px-3 border ${
        isDark 
          ? 'bg-[#121212] border-amber-400/30 text-[#F9F7F2]' 
          : 'bg-white border-[#121212]/20 text-[#121212]'
      } ${className}`}>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-serif font-bold tracking-tight text-xs">
            NAVNEET GUPTA
          </span>
          <span className="text-[10px] text-amber-500 font-mono">|</span>
          <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
            CEO & FOUNDER
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <a
            href={FOUNDER_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-[#0077b5] hover:opacity-80 transition"
            title="LinkedIn Profile"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
          <a
            href={FOUNDER_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1 hover:opacity-80 transition ${isDark ? 'text-white' : 'text-[#24292e]'}`}
            title="GitHub Profile"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a
            href={FOUNDER_LINKS.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-emerald-600 hover:opacity-80 transition"
            title="Live Portfolio"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 sm:p-6 border transition-all ${
      isDark 
        ? 'bg-[#121212] border-amber-400/40 text-[#F9F7F2]' 
        : 'bg-white border-2 border-[#121212] text-[#121212] shadow-sm'
    } ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Title & Attribution Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold border ${
              isDark 
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300' 
                : 'bg-amber-100 border-amber-500 text-amber-950 font-bold'
            }`}>
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>OFFICIAL ATTRIBUTION</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 border border-emerald-500 text-emerald-900 text-[9px] font-mono uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              REAL-TIME ACCESS
            </span>
          </div>

          <h3 className={`font-serif text-xl sm:text-2xl font-bold tracking-tight flex flex-wrap items-center gap-2 ${
            isDark ? 'text-white' : 'text-[#121212]'
          }`}>
            <span>NAVNEET GUPTA</span>
            <span className="text-amber-500 font-mono text-base font-normal">|</span>
            <span className={`text-xs sm:text-sm font-sans font-bold uppercase tracking-wider px-2 py-0.5 border ${
              isDark 
                ? 'text-amber-300 bg-amber-400/10 border-amber-400/30' 
                : 'text-amber-900 bg-amber-50 border-amber-400'
            }`}>
              CEO & FOUNDER
            </span>
          </h3>

          {showBio && (
            <p className={`text-xs font-sans max-w-2xl leading-relaxed ${
              isDark ? 'text-[#F9F7F2]/75' : 'text-[#121212]/75'
            }`}>
              SmartProcure is designed, engineered, and founded by <strong>NAVNEET GUPTA</strong>. Full Stack Architect and Machine Learning Engineer specializing in automated multi-tier approval governance, algorithmic supplier evaluation, and resilient enterprise procurement systems.
            </p>
          )}

          {showContact && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <a 
                href={`mailto:${FOUNDER_LINKS.email}`}
                className={`flex items-center gap-1.5 font-mono hover:underline ${
                  isDark ? 'text-[#F9F7F2]/80 hover:text-white' : 'text-[#121212]/80 hover:text-black'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{FOUNDER_LINKS.email}</span>
              </a>
              <a 
                href={`tel:${FOUNDER_LINKS.phone}`}
                className={`flex items-center gap-1.5 font-mono hover:underline ${
                  isDark ? 'text-[#F9F7F2]/80 hover:text-white' : 'text-[#121212]/80 hover:text-black'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>{FOUNDER_LINKS.phone}</span>
              </a>
            </div>
          )}
        </div>

        {/* Real-time Links Action Group */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={FOUNDER_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-[#0077b5] hover:bg-[#005f93] text-white text-xs font-sans font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title="Open Navneet Gupta LinkedIn in real-time"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <a
            href={FOUNDER_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-[#24292e] hover:bg-black text-white text-xs font-sans font-semibold flex items-center gap-1.5 transition shadow-xs border border-white/20 cursor-pointer"
            title="Open Navneet Gupta GitHub in real-time"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <a
            href={FOUNDER_LINKS.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-sans font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title="Open Navneet Gupta Live Portfolio in real-time"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portfolio</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FounderSignature;
