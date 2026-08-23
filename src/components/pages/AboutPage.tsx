import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  Layers, 
  Award, 
  Truck, 
  CheckCircle2, 
  Users, 
  Lock, 
  FileCheck,
  TrendingUp,
  Cpu,
  ArrowRight,
  Crown,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Code,
  Terminal,
  Server,
  Binary,
  ExternalLink
} from 'lucide-react';
import { RoleType } from '../../types/procurement';

interface AboutPageProps {
  onNavigateTab: (tab: 'home' | 'workspace' | 'catalog' | 'about' | 'contact') => void;
  onSelectRole: (role: RoleType) => void;
  onOpenArchitecture: () => void;
}

export function AboutPage({ onNavigateTab, onSelectRole, onOpenArchitecture }: AboutPageProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* CEO & Founder Executive Profile Showcase */}
      <section className="bg-white border-2 border-[#121212] p-8 sm:p-12 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          {/* Header Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#121212]/15 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border-2 border-amber-600 text-amber-950 text-[11px] font-sans uppercase tracking-[0.25em] font-extrabold shadow-xs">
                  <Crown className="w-4 h-4 text-amber-700 fill-amber-500" />
                  <span>PROJECT CREATOR & FOUNDER ATTRIBUTION</span>
                </div>
                <span className="px-2.5 py-1 bg-[#121212] text-white text-[10px] font-mono uppercase tracking-widest font-bold">
                  OFFICIAL ATTRIBUTION
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-500 text-emerald-900 text-[10px] font-mono uppercase tracking-wider font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  LIVE REAL-TIME ACCESS
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl text-[#121212] tracking-tight font-bold">
                NAVNEET GUPTA
              </h1>
              <p className="text-base sm:text-lg font-serif italic text-amber-900 font-medium">
                CEO & Founder &bull; Lead Full-Stack Architect & ML Engineer
              </p>
            </div>

            {/* Direct Contact & Real-Time Social Access Ribbon */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
              <a 
                href="mailto:indianavneetgupta33@gmail.com" 
                className="px-3 py-2 bg-[#121212] text-[#F9F7F2] hover:bg-[#2A2A2A] flex items-center gap-1.5 transition shadow-2xs"
                title="Send direct email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>indianavneetgupta33@gmail.com</span>
              </a>
              <a 
                href="tel:+917317567350" 
                className="px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 text-[#121212] hover:border-[#121212] flex items-center gap-1.5 transition"
                title="Call phone"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91-7317567350</span>
              </a>
              
              {/* Real-time live profile links */}
              <div className="flex items-center gap-1.5">
                <a
                  href="https://www.linkedin.com/in/navneet-gupta-4a1644297"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#0077b5] text-white hover:bg-[#005f93] font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Open Navneet Gupta LinkedIn Profile in real-time"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <a
                  href="https://github.com/Navneetgupta440"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#24292e] text-white hover:bg-black font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Open Navneet Gupta GitHub Profile in real-time"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <a
                  href="https://portfolio-ng440.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-700 text-white hover:bg-emerald-800 font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Open Navneet Gupta Live Portfolio in real-time"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4 font-sans text-sm text-[#121212]/80 leading-relaxed">
              <h2 className="font-serif text-xl text-[#121212] font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Visionary Leadership & Architecture Background</span>
              </h2>
              <p>
                <strong>Navneet Gupta</strong> is the CEO, Founder, and Primary System Architect of <strong>SmartProcure</strong>. He is a Full Stack Developer and Data Engineering specialist with extensive hands-on experience building high-throughput data pipelines, production-grade REST APIs, machine learning classification engines, and scalable enterprise web systems.
              </p>
              <p>
                Navneet architected SmartProcure to solve critical supply chain bottlenecks, introducing 3-tier financial governance (<span className="font-mono text-xs text-[#121212] bg-[#121212]/5 px-1">$50K / $100K thresholds</span>), multi-factor weighted vendor ranking algorithms, cryptographic hash-encrypted authentication, and real-time shipment GPS reconciliation.
              </p>
            </div>

            {/* Academic & Core Background Card */}
            <div className="bg-[#F9F7F2] border border-[#121212] p-5 space-y-3 font-sans text-xs">
              <div className="font-serif text-base font-semibold text-[#121212] flex items-center gap-2 border-b border-[#121212]/15 pb-2">
                <GraduationCap className="w-4 h-4 text-[#121212]" />
                <span>Education & Alma Mater</span>
              </div>
              <div>
                <strong className="text-sm text-[#121212] block">Bachelor of Technology (B.Tech)</strong>
                <span className="text-[#121212]/80 font-medium">Computer Science and Engineering</span>
                <p className="text-[11px] text-[#121212]/60 mt-0.5">Accurate Institute of Management and Technology (AKTU) &bull; Greater Noida, India</p>
                <div className="mt-1 text-[11px] text-amber-800 font-semibold">Graduation: Oct. 2023 – Aug. 2027</div>
              </div>
              <div className="pt-2 border-t border-[#121212]/10 space-y-1">
                <div className="font-semibold text-[#121212]">Key Industry Honors:</div>
                <div className="text-[11px] text-[#121212]/75">&bull; AICTE & ICAC Approved MERN Stack Certified</div>
                <div className="text-[11px] text-[#121212]/75">&bull; Deloitte Australia Data Analytics Simulation</div>
                <div className="text-[11px] text-[#121212]/75">&bull; Top A++ Performance Grade (Machine Learning)</div>
              </div>
            </div>
          </div>

          {/* Technical Skills Spectrum */}
          <div className="space-y-4 pt-4 border-t border-[#121212]/15">
            <h3 className="font-serif text-lg text-[#121212] flex items-center gap-2">
              <Code className="w-4 h-4 text-[#121212]" />
              <span>Core Technical Stack & Engineering Capabilities</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
              <div className="p-4 bg-[#F4F0E8] border border-[#121212]/20 space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#121212]/70 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Programming Languages
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Java', 'Python', 'SQL', 'JavaScript', 'TypeScript'].map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-[#121212]/30 text-[#121212] font-mono text-[11px] font-semibold">{s}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#F4F0E8] border border-[#121212]/20 space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#121212]/70 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" /> Web & Backend Frameworks
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React.js', 'Node.js', 'Express.js', 'Spring Boot 3.3', 'REST APIs', 'JWT Auth'].map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-[#121212]/30 text-[#121212] font-mono text-[11px] font-semibold">{s}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#F4F0E8] border border-[#121212]/20 space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#121212]/70 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Databases & Storage
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['PostgreSQL', 'MongoDB', 'MySQL', 'Flyway Migrations', 'HikariCP'].map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-[#121212]/30 text-[#121212] font-mono text-[11px] font-semibold">{s}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#F4F0E8] border border-[#121212]/20 space-y-2">
                <div className="font-semibold uppercase tracking-wider text-[10px] text-[#121212]/70 flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5" /> Data, AI & ML Pipelines
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'ETL Workflows', 'Power BI'].map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-[#121212]/30 text-[#121212] font-mono text-[11px] font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Experience & Key Project Track Record */}
          <div className="space-y-4 pt-4 border-t border-[#121212]/15">
            <h3 className="font-serif text-lg text-[#121212] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#121212]" />
              <span>Professional Track Record & Proven Engineering Projects</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              {/* Experience 1 */}
              <div className="p-5 bg-white border border-[#121212] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#121212]">MERN Stack Developer</h4>
                    <p className="text-xs text-[#121212]/75">Codec Technologies Pvt. Ltd. &bull; Remote</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#121212] text-white">Sep 2025 – Dec 2025</span>
                </div>
                <ul className="space-y-1.5 text-[#121212]/80 list-disc pl-4 pt-1">
                  <li>Developed and maintained 5+ full-stack modules using React.js, Node.js, Express.js, and MongoDB, improving data storage and retrieval efficiency by 20%.</li>
                  <li>Designed and implemented 10+ RESTful API endpoints handling structured data flow, authentication, and JWT authorization.</li>
                  <li>Optimized database queries, reducing average application response time by 25% and boosting reliability across 6 Agile sprint cycles.</li>
                </ul>
              </div>

              {/* Experience 2 */}
              <div className="p-5 bg-white border border-[#121212] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#121212]">Python & Machine Learning Engineer</h4>
                    <p className="text-xs text-[#121212]/75">Softpro India Computer Technologies Pvt. Ltd. &bull; Remote</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">Sep 2024 – Nov 2024</span>
                </div>
                <ul className="space-y-1.5 text-[#121212]/80 list-disc pl-4 pt-1">
                  <li>Automated data preprocessing pipelines for 3 real-world datasets using Python, Pandas, and NumPy, cutting manual processing time by 30%.</li>
                  <li>Trained and evaluated 4 machine learning models with TensorFlow and Scikit-Learn, achieving up to 90% prediction accuracy.</li>
                  <li>Built 5+ Power BI dashboards for executive decision-making and earned top <strong>A++ Performance Grade</strong> rating.</li>
                </ul>
              </div>

              {/* Featured Project 1 */}
              <div className="p-5 bg-[#F9F7F2] border border-[#121212] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#121212]">Pneumonia Medical Detection CNN Pipeline</h4>
                    <p className="text-[11px] font-mono text-[#121212]/70">Python, TensorFlow, Keras, OpenCV, CNN</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5">5,000+ X-Rays</span>
                </div>
                <p className="text-[#121212]/80 leading-relaxed">
                  Engineered an end-to-end data pipeline for medical image classification using Convolutional Neural Networks (CNNs), processing 5,000+ chest X-ray images with modular 4-stage automated data cleaning and normalization.
                </p>
              </div>

              {/* Featured Project 2 */}
              <div className="p-5 bg-[#F9F7F2] border border-[#121212] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#121212]">Enterprise E-Commerce & Procurement Platform</h4>
                    <p className="text-[11px] font-mono text-[#121212]/70">React.js, Node.js, Express.js, MongoDB / PostgreSQL</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-blue-800 bg-blue-100 px-2 py-0.5">Scalable REST</span>
                </div>
                <p className="text-[#121212]/80 leading-relaxed">
                  Architected full-stack enterprise architecture with REST APIs, JWT authentication, normalized multi-table database schemas across products, orders, and users with role-based access control (RBAC).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Hero Header */}
      <section className="bg-white border border-[#121212] p-8 sm:p-12 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121212]/5 border border-[#121212]/20 text-[#121212] text-[10px] font-sans uppercase tracking-[0.25em] font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Platform Overview & Architecture</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#121212] leading-tight">
          Next-Generation Autonomous Procurement & Governance Infrastructure
        </h2>
        <p className="text-sm sm:text-base text-[#121212]/75 font-sans leading-relaxed max-w-3xl">
          SmartProcure is an enterprise procurement execution system designed by <strong>Navneet Gupta</strong> for organizations requiring strict financial governance, multi-level approval hierarchies, transparent vendor scoring, and real-time shipment reconciliation.
        </p>
      </section>

      {/* 4 Architectural Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F9F7F2] border border-[#121212] p-6 space-y-3">
          <div className="w-10 h-10 bg-[#121212] text-[#F9F7F2] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#121212]">3-Tier Approval Governance</h3>
          <p className="text-xs text-[#121212]/70 leading-relaxed font-sans">
            Automatic threshold routing: Tier 1 (&lt; $50K Department Manager), Tier 2 ($50K-$100K Procurement Head), and Tier 3 (&gt; $100K Executive VP/Admin).
          </p>
        </div>

        <div className="bg-[#F9F7F2] border border-[#121212] p-6 space-y-3">
          <div className="w-10 h-10 bg-[#121212] text-[#F9F7F2] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#121212]">Weighted Supplier Scoring</h3>
          <p className="text-xs text-[#121212]/70 leading-relaxed font-sans">
            Algorithmically evaluates candidate quotes across price (35%), quality rating (20%), lead delivery speed (20%), vendor rating (15%), and historical reliability (10%).
          </p>
        </div>

        <div className="bg-[#F9F7F2] border border-[#121212] p-6 space-y-3">
          <div className="w-10 h-10 bg-[#121212] text-[#F9F7F2] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#121212]">PostgreSQL 16 & Flyway</h3>
          <p className="text-xs text-[#121212]/70 leading-relaxed font-sans">
            26 normalized tables, RFC 4122 UUID primary keys, versioned migrations (`V1`, `V2`), immutable audit trails, and strict optimistic concurrency locking.
          </p>
        </div>

        <div className="bg-[#F9F7F2] border border-[#121212] p-6 space-y-3">
          <div className="w-10 h-10 bg-[#121212] text-[#F9F7F2] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg text-[#121212]">Logistics & Stock Sync</h3>
          <p className="text-xs text-[#121212]/70 leading-relaxed font-sans">
            End-to-end courier tracking numbers, electronic dispatch acknowledgments, and automated warehouse inventory reconciliation upon receipt.
          </p>
        </div>
      </section>

      {/* Engineering Stats & Highlights */}
      <section className="bg-white border border-[#121212] p-8 space-y-6">
        <div className="border-b border-[#121212]/15 pb-4">
          <h2 className="font-serif text-2xl text-[#121212]">System Engineering Specifications</h2>
          <p className="text-xs text-[#121212]/60 font-sans">Production-ready full-stack architecture parameters</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-4 bg-[#F9F7F2] border border-[#121212]/15">
            <div className="text-2xl font-serif font-bold text-[#121212]">26</div>
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60 mt-1">DB Tables</div>
          </div>
          <div className="p-4 bg-[#F9F7F2] border border-[#121212]/15">
            <div className="text-2xl font-serif font-bold text-[#121212]">7</div>
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60 mt-1">RBAC Roles</div>
          </div>
          <div className="p-4 bg-[#F9F7F2] border border-[#121212]/15">
            <div className="text-2xl font-serif font-bold text-[#121212]">100%</div>
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60 mt-1">Audit Ledger</div>
          </div>
          <div className="p-4 bg-[#F9F7F2] border border-[#121212]/15">
            <div className="text-2xl font-serif font-bold text-[#121212]">UUIDv4</div>
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60 mt-1">Primary Keys</div>
          </div>
          <div className="p-4 bg-[#F9F7F2] border border-[#121212]/15">
            <div className="text-2xl font-serif font-bold text-[#121212]">Spring 3.3</div>
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60 mt-1">Core Engine</div>
          </div>
          <div className="p-4 bg-[#F9F7F2] border border-[#121212]/15">
            <div className="text-2xl font-serif font-bold text-[#121212]">HikariCP</div>
            <div className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60 mt-1">Pool Manager</div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onOpenArchitecture}
            className="px-4 py-2 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Interactive 20-Step Implementation Blueprint</span>
          </button>
        </div>
      </section>

      {/* Stakeholder Governance Matrix */}
      <section className="bg-[#F4F0E8] border border-[#121212] p-8 space-y-6">
        <div className="border-b border-[#121212]/15 pb-3">
          <h2 className="font-serif text-2xl text-[#121212]">Stakeholder Governance Matrix</h2>
          <p className="text-xs text-[#121212]/60 font-sans">Role definitions, authority levels, and operational scope</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white border border-[#121212]/15 space-y-1.5">
            <div className="font-semibold text-sm text-[#121212]">Employee Requesters</div>
            <p className="text-[#121212]/70 leading-relaxed">
              Creates purchase requisitions for items needed in day-to-day operations. Can track approval milestone progress in real-time.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#121212]/15 space-y-1.5">
            <div className="font-semibold text-sm text-[#121212]">Department Managers</div>
            <p className="text-[#121212]/70 leading-relaxed">
              Reviews requisition validity and approves expenditure requests under $50,000 against departmental operational budget lines.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#121212]/15 space-y-1.5">
            <div className="font-semibold text-sm text-[#121212]">Procurement Officers</div>
            <p className="text-[#121212]/70 leading-relaxed">
              Solicits vendor quotations, compares bids using the scoring matrix, generates commercial POs, and assigns approved suppliers.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#121212]/15 space-y-1.5">
            <div className="font-semibold text-sm text-[#121212]">Supplier Partners</div>
            <p className="text-[#121212]/70 leading-relaxed">
              Accepts binding PO contracts, prepares order packages, and initiates dispatch events with third-party logistics courier tracking.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#121212]/15 space-y-1.5">
            <div className="font-semibold text-sm text-[#121212]">Logistics & Couriers</div>
            <p className="text-[#121212]/70 leading-relaxed">
              Records transit waypoint events, provides live status updates, and handles physical delivery sign-offs at receiving docks.
            </p>
          </div>

          <div className="p-4 bg-white border border-[#121212]/15 space-y-1.5">
            <div className="font-semibold text-sm text-[#121212]">Executive Admins & CEO</div>
            <p className="text-[#121212]/70 leading-relaxed">
              Maintains master category catalogs, defines global scoring weights, performs Tier 3 emergency overrides, and audits compliance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

