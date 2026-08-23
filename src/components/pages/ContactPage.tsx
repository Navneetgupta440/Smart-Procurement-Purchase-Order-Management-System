import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Headphones, 
  Building, 
  ShieldCheck,
  MessageSquare,
  Linkedin,
  Github,
  Globe,
  ExternalLink
} from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Procurement Desk');
  const [category, setCategory] = useState('Purchase Order Status');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the 3-Tier Multi-Level Approval routing operate?',
      a: 'Purchase Requests under $50,000 are automatically routed to the Department Manager (Tier 1). Requisitions between $50,000 and $100,000 require secondary approval from the Procurement Manager (Tier 2). Requests exceeding $100,000 require final Tier 3 Executive Admin authorization.'
    },
    {
      q: 'How are candidate supplier quotations ranked and scored?',
      a: 'The SmartProcure scoring engine computes a composite weighted score using: Unit Price (35%), Product Quality Rating (20%), Lead Delivery Time (20%), Vendor Track Record (15%), and Reliability Score (10%). The highest scoring supplier is highlighted with the "Preferred Vendor" badge.'
    },
    {
      q: 'How is warehouse stock synchronized when a delivery arrives?',
      a: 'When the Logistics Courier marks a delivery as "DELIVERED", the system updates the delivery record, generates an immutable INVENTORY_IN transaction in the database, and increments the product available stock in the central warehouse.'
    },
    {
      q: 'Can I simulate different stakeholder roles without logging out?',
      a: 'Yes! You can instantly switch among all 7 personas (Employee, Manager, Procurement Officer, Supplier, Logistics, Customer, Admin) using the top Role Persona bar or the Sign In / Switch modal at any time.'
    },
    {
      q: 'How do I export the entire Spring Boot + React project code as a ZIP?',
      a: 'Click the "Download ZIP" button in the top action bar. The in-browser JSZip packager compiles all Java backend controllers, repositories, entities, Flyway migrations, and React frontend sources into a deployable ZIP archive.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `TCK-${Date.now().toString().slice(-6)}`;
      const time = new Date().toLocaleTimeString();

      // Log notification and audit in store
      procurementStore.sendNotification(
        'ADMIN',
        `Support Ticket: ${category} (${ticketId})`,
        `Submitted by ${name} (${email}) - Department: ${department}. Priority: ${priority}.`,
        'IN_APP',
        'SUPPORT_TICKET'
      );

      setIsSubmitting(false);
      setSubmittedTicket({ id: ticketId, time });
      setMessage('');
    }, 400);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Header */}
      <section className="bg-white border border-[#121212] p-8 sm:p-12 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121212]/5 border border-[#121212]/20 text-[#121212] text-[10px] font-sans uppercase tracking-[0.25em] font-semibold">
          <Headphones className="w-3.5 h-3.5" />
          <span>Enterprise Procurement Support & Inquiries</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#121212] leading-tight">
          Connect with the SmartProcure Operations Team
        </h1>
        <p className="text-sm sm:text-base text-[#121212]/75 font-sans leading-relaxed max-w-3xl">
          Have inquiries regarding purchase request approvals, supplier onboarding, commercial contracts, or platform integration? Submit a support ticket or reach out to our dedicated department desks.
        </p>
      </section>

      {/* Main Grid: Contact Form & Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Submission Form */}
        <div className="lg:col-span-2 bg-white border border-[#121212] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#121212]/15 pb-4">
            <h2 className="font-serif text-xl sm:text-2xl text-[#121212]">
              Submit an Enterprise Support Request
            </h2>
            <p className="text-xs text-[#121212]/60 font-sans mt-1">
              Your inquiry will be logged directly into our central ticket management ledger
            </p>
          </div>

          {submittedTicket ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-serif text-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Ticket Generated: #{submittedTicket.id}</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                Thank you, <strong>{name}</strong>. Your ticket has been logged into the procurement queue at {submittedTicket.time}. A member of our {department} team will review your message shortly.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 px-4 py-2 bg-[#121212] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.1em] font-semibold cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.vance@company.com"
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Target Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none"
                  >
                    <option value="Procurement Desk">Procurement Desk</option>
                    <option value="Vendor Relations">Vendor Relations</option>
                    <option value="Logistics & Dispatch">Logistics & Dispatch</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="IT & Platform Support">IT & Platform Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none"
                  >
                    <option value="Purchase Order Status">Purchase Order Status</option>
                    <option value="Approval Escalation">Approval Escalation</option>
                    <option value="Supplier Quote Discrepancy">Supplier Quote Discrepancy</option>
                    <option value="Waybill & Delivery Issue">Waybill & Delivery Issue</option>
                    <option value="Catalog Item Request">Catalog Item Request</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none"
                  >
                    <option value="LOW">Low (Routine)</option>
                    <option value="MEDIUM">Medium (Normal)</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="URGENT">Urgent (Blocker)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                  Message Details & Context *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, referencing any specific PR or PO numbers if applicable..."
                  className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none resize-y"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Request...' : 'Dispatch Ticket to Support Desk'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Global Hubs & Department Directory */}
        <div className="space-y-4">
          {/* Executive Office of the CEO Card */}
          <div className="bg-amber-50/80 border-2 border-amber-400 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-300 pb-2">
              <div className="flex items-center gap-2 font-serif text-sm font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700 fill-amber-500" />
                <span>Executive Office of the CEO & Founder</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 uppercase tracking-wider">
                Live Channels
              </span>
            </div>
            <div className="space-y-2 text-xs text-amber-950 font-sans">
              <div className="font-semibold text-sm text-[#121212]">Navneet Gupta</div>
              <div className="text-[11px] text-[#121212]/75 font-serif italic">Founder & Chief Executive Officer (CEO)</div>
              
              <div className="flex items-center gap-1.5 pt-1">
                <Mail className="w-3.5 h-3.5 text-amber-800" />
                <a href="mailto:indianavneetgupta33@gmail.com" className="font-mono hover:underline font-medium">
                  indianavneetgupta33@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-800" />
                <a href="tel:+917317567350" className="font-mono hover:underline font-medium">
                  +91-7317567350
                </a>
              </div>

              {/* Real-time social & live links */}
              <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center gap-1.5">
                <a
                  href="https://www.linkedin.com/in/navneet-gupta-4a1644297"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-[#0077b5] hover:bg-[#005f93] text-white text-[11px] font-sans font-semibold flex items-center gap-1 transition shadow-2xs"
                  title="LinkedIn: Navneet Gupta"
                >
                  <Linkedin className="w-3 h-3" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </a>
                <a
                  href="https://github.com/Navneetgupta440"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-[#24292e] hover:bg-black text-white text-[11px] font-sans font-semibold flex items-center gap-1 transition shadow-2xs"
                  title="GitHub: Navneetgupta440"
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </a>
                <a
                  href="https://portfolio-ng440.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-sans font-semibold flex items-center gap-1 transition shadow-2xs"
                  title="Live Portfolio: portfolio-ng440.netlify.app"
                >
                  <Globe className="w-3 h-3" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#F4F0E8] border border-[#121212] p-6 space-y-4">
            <h3 className="font-serif text-lg text-[#121212] border-b border-[#121212]/15 pb-2">
              Operational Department Desks
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-[#121212]/15 space-y-1">
                <div className="font-semibold text-[#121212]">Central Procurement Desk</div>
                <div className="text-[#121212]/70 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> procurement@smartprocure.io
                </div>
                <div className="text-[#121212]/70 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> +1 (800) 555-0199 (Ext. 1)
                </div>
              </div>

              <div className="p-3 bg-white border border-[#121212]/15 space-y-1">
                <div className="font-semibold text-[#121212]">Vendor & Supplier Relations</div>
                <div className="text-[#121212]/70 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> vendors@smartprocure.io
                </div>
                <div className="text-[#121212]/70 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> +1 (800) 555-0199 (Ext. 2)
                </div>
              </div>

              <div className="p-3 bg-white border border-[#121212]/15 space-y-1">
                <div className="font-semibold text-[#121212]">Central Dock Logistics Hub</div>
                <div className="text-[#121212]/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Bay 4, Industrial Hub, Chicago IL
                </div>
                <div className="text-[#121212]/70 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Mon-Fri: 06:00 - 22:00 CST
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#121212] p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-serif text-sm font-semibold text-[#121212]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SLA Response Guarantee</span>
            </div>
            <p className="text-[#121212]/75 leading-relaxed font-sans">
              Critical PO blocker tickets are acknowledged within 15 minutes by on-duty Procurement Managers.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Accordion) */}
      <section className="bg-white border border-[#121212] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#121212]/15 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-[0.2em] font-bold text-[#121212]/60 mb-1">
            <HelpCircle className="w-4 h-4 text-[#121212]" />
            <span>Knowledge Base & FAQs</span>
          </div>
          <h2 className="font-serif text-2xl text-[#121212]">
            Frequently Asked Technical & Workflow Questions
          </h2>
        </div>

        <div className="divide-y divide-[#121212]/15 border border-[#121212]/20">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-[#F9F7F2]">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-serif text-sm font-semibold text-[#121212] hover:bg-white transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#121212]/60" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-[#121212]/80 leading-relaxed font-sans bg-white border-t border-[#121212]/10 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
