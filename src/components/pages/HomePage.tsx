import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Code2, 
  Terminal, 
  FolderArchive, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  TrendingUp, 
  Package, 
  FileText, 
  UserCheck, 
  Users, 
  Clock, 
  Award,
  ChevronRight,
  Database,
  Search,
  ShoppingCart,
  SendHorizontal,
  Crown
} from 'lucide-react';
import { ProcurementState, procurementStore } from '../../services/procurementStore';
import { RoleType, Product } from '../../types/procurement';

interface HomePageProps {
  state: ProcurementState;
  onNavigateTab: (tab: 'home' | 'workspace' | 'catalog' | 'about' | 'contact') => void;
  onSelectRole: (role: RoleType) => void;
  onOpenNewRequest: (product?: Product) => void;
  onOpenWalkthrough: () => void;
  onOpenArchitecture: () => void;
  onOpenApiExplorer: () => void;
  onOpenWorkflow: () => void;
  onOpenZip: () => void;
  onOpenAuthModal: () => void;
}

export function HomePage({
  state,
  onNavigateTab,
  onSelectRole,
  onOpenNewRequest,
  onOpenWalkthrough,
  onOpenArchitecture,
  onOpenApiExplorer,
  onOpenWorkflow,
  onOpenZip,
  onOpenAuthModal
}: HomePageProps) {
  // Compute real-time KPIs from store state
  const totalPRs = state.purchaseRequests.length;
  const pendingApprovals = state.purchaseRequests.filter(pr => 
    pr.status === 'SUBMITTED' || pr.status === 'PENDING_APPROVAL' || pr.status === 'DRAFT'
  ).length;
  const totalPOs = state.purchaseOrders.length;
  const activeDeliveries = state.deliveries.filter(d => 
    d.status === 'CREATED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT' || d.status === 'OUT_FOR_DELIVERY'
  ).length;
  const totalSpend = state.purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
  const lowStockCount = state.products.filter(p => p.availableQuantity <= p.minimumStock).length;

  const roleCardList: {
    role: RoleType;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
    actionLabel: string;
  }[] = [
    {
      role: 'EMPLOYEE',
      title: 'Employee Requester',
      description: 'Create purchase requisitions, select catalog products, and track real-time approval status.',
      badge: 'Requisition Tier 1',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      actionLabel: 'Enter Requester Portal'
    },
    {
      role: 'MANAGER',
      title: 'Department Manager',
      description: 'Review departmental requests (< $50,000), approve or reject with audit remarks, and monitor budgets.',
      badge: 'Governance Level 1',
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
      actionLabel: 'Review Approvals Queue'
    },
    {
      role: 'PROCUREMENT_OFFICER',
      title: 'Procurement Officer',
      description: 'Compare supplier price quotes, evaluate weighted quality matrices, and generate commercial Purchase Orders.',
      badge: 'Vendor Scoring & PO',
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      actionLabel: 'Launch Procurement Desk'
    },
    {
      role: 'SUPPLIER',
      title: 'Vendor / Supplier',
      description: 'Receive purchase orders, accept or reject fulfillments, and dispatch shipments with tracking numbers.',
      badge: 'B2B Vendor Portal',
      icon: <Package className="w-5 h-5 text-amber-600" />,
      actionLabel: 'Manage Supplier Orders'
    },
    {
      role: 'DELIVERY_PERSONNEL',
      title: 'Logistics & Courier',
      description: 'Update waybill tracking milestones, log checkpoints, and record electronic proof of delivery.',
      badge: 'Real-time Courier GPS',
      icon: <Truck className="w-5 h-5 text-sky-600" />,
      actionLabel: 'Open Courier Dashboard'
    },
    {
      role: 'CUSTOMER',
      title: 'Enterprise Customer',
      description: 'Browse the standardized corporate store, order materials on-demand, and monitor live dispatches.',
      badge: 'Corporate B2B Store',
      icon: <ShoppingCart className="w-5 h-5 text-violet-600" />,
      actionLabel: 'Explore B2B Catalog'
    },
    {
      role: 'ADMIN',
      title: 'Executive Admin',
      description: 'Audit system logs, configure 3-tier financial limits, inspect 26-table PostgreSQL entities, and manage RBAC.',
      badge: 'Full Tier-3 Governance',
      icon: <ShieldCheck className="w-5 h-5 text-slate-900" />,
      actionLabel: 'Access Admin Console'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border border-[#121212] p-8 sm:p-12 shadow-sm">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121212]/5 border border-[#121212]/20 text-[#121212] text-[10px] font-sans uppercase tracking-[0.25em] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise 2026 • Spring Boot 3.3.x + PostgreSQL 16</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#121212] leading-[1.15]">
            Smart Procurement & Multi-Tier Purchase Order Management
          </h1>

          <p className="text-sm sm:text-base text-[#121212]/80 leading-relaxed font-sans max-w-3xl">
            An automated, auditable procurement lifecycle platform featuring dynamic multi-tier approval workflows, intelligent supplier quote scoring, synchronized inventory tracking, and seamless logistics dispatching.
          </p>

          {/* CEO & Creator Attribution Banner */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-amber-50/80 border border-amber-300 text-xs font-sans text-amber-950">
            <div className="flex items-center gap-2 font-semibold">
              <Crown className="w-4 h-4 text-amber-700 fill-amber-500" />
              <span>Conceived, Engineered & Founded by <strong>Navneet Gupta</strong> (CEO & Full-Stack Architect)</span>
            </div>
            <button
              onClick={() => onNavigateTab('about')}
              className="ml-auto text-[11px] font-bold underline hover:text-black cursor-pointer"
            >
              View Founder Profile &rarr;
            </button>
          </div>

          {/* Call to Actions / Quick Launch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => onOpenNewRequest()}
              className="px-5 py-3.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:translate-y-[-1px]"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Create Requisition</span>
            </button>

            <button
              onClick={() => onNavigateTab('catalog')}
              className="px-5 py-3.5 bg-[#F9F7F2] hover:bg-[#EBE5DB] text-[#121212] border border-[#121212] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>

            <button
              onClick={onOpenWalkthrough}
              className="px-5 py-3.5 bg-white hover:bg-[#F2EDE4] text-[#121212] border border-[#121212]/30 hover:border-[#121212] text-xs font-sans uppercase tracking-[0.15em] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#121212]" />
              <span>7-Stage Simulator</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="px-4 py-3.5 bg-white hover:bg-[#F2EDE4] text-[#121212] border border-[#121212]/30 text-xs font-sans uppercase tracking-[0.15em] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>20-Step Architecture</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Badge */}
        <div className="mt-8 pt-6 border-t border-[#121212]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#121212]/70 font-mono">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#121212]" />
            <span>26 Normalized Relational Tables</span>
          </div>
          <div>Flyway V1/V2 Migrations Active</div>
          <div>HikariCP Pooled JDBC</div>
          <div>UUIDv4 Primary Keys</div>
        </div>
      </section>

      {/* Live KPI Metric Ribbons */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#121212]/20 p-4 space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Requisitions (PR)
          </span>
          <div className="text-2xl font-serif font-bold text-[#121212]">{totalPRs}</div>
          <div className="text-[11px] text-[#121212]/60">{pendingApprovals} awaiting action</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-4 space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Purchase Orders (PO)
          </span>
          <div className="text-2xl font-serif font-bold text-[#121212]">{totalPOs}</div>
          <div className="text-[11px] text-emerald-700 font-medium">Commercial Binding</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-4 space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Active Deliveries
          </span>
          <div className="text-2xl font-serif font-bold text-[#121212]">{activeDeliveries}</div>
          <div className="text-[11px] text-sky-700 font-medium">In Transit / Waybill</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-4 space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Total Spend Volume
          </span>
          <div className="text-2xl font-serif font-bold text-[#121212]">
            ${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[#121212]/60">Across all orders</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-4 space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Verified Vendors
          </span>
          <div className="text-2xl font-serif font-bold text-[#121212]">{state.suppliers.length}</div>
          <div className="text-[11px] text-[#121212]/60">Scored on 5 metrics</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-4 space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Inventory Health
          </span>
          <div className="text-2xl font-serif font-bold text-[#121212]">{state.products.length} SKUs</div>
          <div className={`text-[11px] font-medium ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {lowStockCount > 0 ? `${lowStockCount} Low stock alerts` : 'All stocks optimal'}
          </div>
        </div>
      </section>

      {/* Interactive 5-Step Lifecycle Pipeline */}
      <section className="bg-[#F2EDE4] border border-[#121212] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#121212]">
              The Automated Procurement Pipeline
            </h2>
            <p className="text-xs text-[#121212]/70 font-sans">
              End-to-end automated governance lifecycle with immutable audit trails
            </p>
          </div>
          <button
            onClick={onOpenWalkthrough}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[11px] font-sans uppercase tracking-[0.15em] font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '01',
              title: '1. Requisition',
              role: 'Employee',
              desc: 'Select SKUs from catalog, define justification & priority, auto-route approval tiers.'
            },
            {
              step: '02',
              title: '2. Multi-Tier Approval',
              role: 'Dept Manager / Admin',
              desc: 'Review financial justification, check budget availability, approve with audit remarks.'
            },
            {
              step: '03',
              title: '3. Quote Scoring & PO',
              role: 'Procurement Officer',
              desc: 'Evaluate weighted vendor matrices (Price, Quality, Lead Time), issue signed Purchase Order.'
            },
            {
              step: '04',
              title: '4. Vendor Acceptance',
              role: 'Supplier Partner',
              desc: 'Accept or reject binding PO, start assembly, prepare dispatch waybill package.'
            },
            {
              step: '05',
              title: '5. Logistics & Receipt',
              role: 'Courier & Receiver',
              desc: 'Real-time transit updates, electronic delivery confirmation, auto-reconcile stock.'
            }
          ].map((item, idx) => (
            <div 
              key={item.step} 
              className="bg-white border border-[#121212]/20 p-4 flex flex-col justify-between hover:border-[#121212] transition shadow-2xs group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#121212] text-sm">{item.step}</span>
                  <span className="px-1.5 py-0.5 bg-[#121212]/5 text-[9px] font-sans uppercase tracking-wider font-semibold text-[#121212]/70">
                    {item.role}
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-sm text-[#121212] group-hover:text-black">
                  {item.title}
                </h3>
                <p className="text-xs text-[#121212]/70 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-[#121212]/10 text-[10px] text-[#121212]/50 font-mono">
                Stage {idx + 1} of 5
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Workspace Selector Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#121212]/20 pb-3">
          <div>
            <h2 className="font-serif text-2xl text-[#121212]">
              Interactive Role Workspaces
            </h2>
            <p className="text-xs text-[#121212]/70 font-sans">
              Switch persona instantly to experience the distinct perspective of each stakeholder
            </p>
          </div>
          <span className="text-xs font-mono text-[#121212]/60">
            Active: <strong className="text-[#121212]">{state.currentUser.role}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roleCardList.map(card => {
            const isActive = state.currentUser.role === card.role;
            return (
              <div
                key={card.role}
                className={`p-5 border transition flex flex-col justify-between ${
                  isActive 
                    ? 'bg-white border-[#121212] ring-1 ring-[#121212] shadow-sm' 
                    : 'bg-[#F9F7F2] border-[#121212]/20 hover:border-[#121212] hover:bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 bg-[#121212]/5 border border-[#121212]/15">
                      {card.icon}
                    </div>
                    <span className="px-2 py-0.5 bg-[#121212]/5 border border-[#121212]/20 text-[9px] font-sans uppercase tracking-widest font-semibold text-[#121212]/75">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg text-[#121212] font-medium">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#121212]/75 font-sans leading-relaxed mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#121212]/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectRole(card.role);
                      onNavigateTab('workspace');
                    }}
                    className={`px-3 py-1.5 text-xs font-sans uppercase tracking-[0.1em] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isActive
                        ? 'bg-[#121212] text-[#F9F7F2]'
                        : 'bg-white hover:bg-[#121212] hover:text-[#F9F7F2] text-[#121212] border border-[#121212]/30'
                    }`}
                  >
                    <span>{isActive ? 'Current Active Workspace' : card.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Catalog & Recent Activity Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Products */}
        <div className="lg:col-span-2 bg-white border border-[#121212] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3">
            <div>
              <h3 className="font-serif text-lg text-[#121212]">Featured Enterprise Catalog</h3>
              <p className="text-xs text-[#121212]/60 font-sans">Quick order items for immediate requisition</p>
            </div>
            <button
              onClick={() => onNavigateTab('catalog')}
              className="text-xs font-sans uppercase tracking-[0.1em] text-[#121212] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({state.products.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.products.slice(0, 6).map(product => (
              <div 
                key={product.id}
                className="p-3.5 border border-[#121212]/15 bg-[#F9F7F2] flex gap-3 hover:border-[#121212] transition"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 object-cover border border-[#121212]/20 shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-[#121212]/60">{product.productCode}</span>
                      <span className="text-xs font-bold text-[#121212]">
                        ₹{product.unitPrice.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-medium text-[#121212] truncate mt-0.5">{product.name}</h4>
                    <p className="text-[11px] text-[#121212]/60 truncate">{product.categoryName}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#121212]/10">
                    <span className="text-[10px] text-[#121212]/60">Stock: {product.availableQuantity}</span>
                    <button
                      onClick={() => onOpenNewRequest(product)}
                      className="px-2 py-0.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-wider font-medium cursor-pointer"
                    >
                      Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Activity Log */}
        <div className="bg-[#F4F0E8] border border-[#121212] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#121212]">Live Audit Stream</h3>
                <p className="text-xs text-[#121212]/60 font-sans">Immutable transaction ledger</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live sync active" />
            </div>

            <div className="space-y-2.5 mt-3 max-h-72 overflow-y-auto pr-1">
              {state.auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-2.5 bg-white border border-[#121212]/15 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#121212]/60">
                    <span className="font-semibold text-[#121212]">{log.userName}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-[#121212]/80 line-clamp-2">{log.newValue || log.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#121212]/15 flex items-center justify-between">
            <button
              onClick={() => {
                onSelectRole('ADMIN');
                onNavigateTab('workspace');
              }}
              className="text-xs font-sans uppercase tracking-[0.1em] text-[#121212] hover:underline font-semibold cursor-pointer"
            >
              Open Audit Console →
            </button>
            <span className="text-[10px] font-mono text-[#121212]/50">Total: {state.auditLogs.length} events</span>
          </div>
        </div>
      </section>
    </div>
  );
}
