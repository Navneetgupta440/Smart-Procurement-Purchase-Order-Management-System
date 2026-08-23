import React, { useState } from 'react';
import { 
  Download, 
  FolderArchive, 
  CheckCircle2, 
  FileCode2, 
  Database, 
  Layers, 
  ShieldCheck,
  Server,
  FileText,
  Loader2,
  Sparkles
} from 'lucide-react';
import { generateProjectZip } from '../../services/zipGenerator';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipDownloadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ready to compile package');
  const [downloadComplete, setDownloadComplete] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setDownloadComplete(false);
      
      const blob = await generateProjectZip((percent, text) => {
        setProgress(percent);
        setStatusText(text);
      });

      // Trigger real browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Smart-Procurement-System.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setDownloadComplete(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setStatusText('Failed to build ZIP');
    }
  };

  const includedModules = [
    { title: 'Java Spring Boot 3.3.x Backend', desc: 'Entities, Repositories, DTOs, Security, JWT, Multi-Tier Approval Service, Workflow Engine', icon: Server },
    { title: 'PostgreSQL & Flyway Migrations', desc: 'V1 Initial, V2 Core Domain Schema (26 tables), V3 Seed Data & Indexes', icon: Database },
    { title: 'Central Workflow & REST APIs', desc: 'POST /api/v1/workflow orchestrator, Product, Supplier, PO, and Delivery endpoints', icon: Layers },
    { title: 'Postman Collection & Environment', desc: 'Smart-Procurement.postman_collection.json & environment ready to import', icon: FileCode2 },
    { title: 'Docker Compose & Production Setup', desc: 'docker-compose.yml with PostgreSQL 16 Alpine and multi-stage Dockerfile', icon: ShieldCheck },
    { title: 'Complete Enterprise Documentation', desc: 'ARCHITECTURE.md, DATABASE.md, API.md, SECURITY.md, and README.md', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Source Package Export</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">Download Complete Project Archive</h3>
            <p className="text-xs font-serif italic text-[#121212]/60 mt-1">
              Production-ready repository with Java Spring Boot, PostgreSQL, Docker & Postman
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        {/* Highlight Card */}
        <div className="p-4 bg-white border border-[#121212]/20 space-y-2 text-xs font-sans">
          <div className="flex items-center gap-2 text-[#121212] font-medium text-xs">
            <Sparkles className="w-4 h-4 text-[#121212]" />
            <span>Ready for Local Execution, Postman Verification, and Docker Containerization</span>
          </div>
          <p className="text-[#121212]/75 leading-relaxed">
            Click below to compile and immediately download the entire production-grade repository package: 
            <strong className="font-mono text-[#121212]"> Smart-Procurement-System.zip</strong>.
          </p>
        </div>

        {/* Modules included */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-sans font-medium text-[#121212]/70 uppercase tracking-[0.2em]">Included in this Repository Package</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {includedModules.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="p-3.5 bg-white border border-[#121212]/20 flex items-start gap-3 text-xs font-sans">
                  <Icon className="w-4 h-4 text-[#121212] mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-medium text-[#121212]">{m.title}</h5>
                    <p className="text-[11px] text-[#121212]/60 mt-0.5 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar (During Generation) */}
        {isGenerating && (
          <div className="space-y-2 p-4 bg-white border border-[#121212]/20 font-sans">
            <div className="flex justify-between text-xs font-medium text-[#121212]">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#121212] animate-spin" />
                {statusText}
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-[#EAE5D9] h-2 overflow-hidden border border-[#121212]/20">
              <div
                className="bg-[#121212] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {downloadComplete && (
          <div className="p-3.5 bg-white border border-[#121212] text-[#121212] text-xs font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#121212] shrink-0" />
            <span>Success! <strong className="font-mono">Smart-Procurement-System.zip</strong> has been downloaded to your machine.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-[#121212]/15">
          <span className="text-[11px] text-[#121212]/50 font-mono">Format: .ZIP (Self-Contained)</span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-[#121212]/30 bg-white hover:bg-[#F4F0E8] text-[#121212] text-[10px] uppercase tracking-[0.15em] font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2 transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compiling ZIP Archive...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate & Download ZIP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
