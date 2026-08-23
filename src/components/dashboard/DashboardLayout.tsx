import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Award, 
  Package, 
  Truck, 
  ShoppingCart, 
  ShieldCheck, 
  Plus, 
  SendHorizontal, 
  Sparkles, 
  Layers, 
  Code2, 
  FolderArchive, 
  UserCheck, 
  RotateCcw, 
  ArrowRight, 
  Activity, 
  Database,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Zap,
  Sliders
} from 'lucide-react';
import { ProcurementState, procurementStore } from '../../services/procurementStore';
import { RoleType, Product, PurchaseRequest, PurchaseOrder } from '../../types/procurement';
import { HeaderQuickActionsWidget } from './HeaderQuickActionsWidget';

interface DashboardLayoutProps {
  state: ProcurementState;
  onSelectRole: (role: RoleType) => void;
  onOpenNewRequest: (product?: Product) => void;
  onOpenCreatePO: (pr?: PurchaseRequest, prodId?: string) => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenWalkthrough: () => void;
  onOpenArchitecture: () => void;
  onOpenApiExplorer: () => void;
  onOpenWorkflow: () => void;
  onOpenZip: () => void;
  onNavigateTab: (tab: 'home' | 'workspace' | 'catalog' | 'about' | 'contact') => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  state,
  onSelectRole,
  onOpenNewRequest,
  onOpenCreatePO,
  onOpenAuthModal,
  onOpenWalkthrough,
  onOpenArchitecture,
  onOpenApiExplorer,
  onOpenWorkflow,
  onOpenZip,
  onNavigateTab,
  children
}) => {
  const [isGridControlOpen, setIsGridControlOpen] = useState(true);

  // Live KPI metrics
  const pendingPRCount = state.purchaseRequests.filter(
    pr => pr.status === 'SUBMITTED' || pr.status === 'PENDING_APPROVAL' || pr.status === 'DRAFT'
  ).length;
  const approvedPRCount = state.purchaseRequests.filter(
    pr => pr.status === 'APPROVED'
  ).length;
  const activePOCount = state.purchaseOrders.length;
  const activeDeliveryCount = state.deliveries.filter(
    d => d.status !== 'DELIVERED' && d.status !== 'FAILED'
  ).length;
  const lowStockCount = state.products.filter(
    p => p.availableQuantity <= p.minimumStock
  ).length;
  const totalSpend = state.purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

  // Defined Workspaces with role-specific live data badges
  const roleWorkspaces: {
    role: RoleType;
    title: string;
    shortTitle: string;
    department: string;
    badge: string;
    countBadge: string | number;
    icon: React.ReactNode;
    colorAccent: string;
    description: string;
  }[] = [
    {
      role: 'EMPLOYEE',
      title: 'Employee Requester',
      shortTitle: 'Requester',
      department: 'Engineering / Ops',
      badge: 'Tier 1 Requisition',
      countBadge: `${state.purchaseRequests.length} PRs`,
      icon: <FileText className="w-4 h-4 text-blue-700" />,
      colorAccent: 'border-l-blue-600',
      description: 'Draft purchase requests & track approvals'
    },
    {
      role: 'MANAGER',
      title: 'Department Manager',
      shortTitle: 'Manager',
      department: 'Governance & Budget',
      badge: 'Tier 1 Sign-Off',
      countBadge: `${pendingPRCount} Pending`,
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-700" />,
      colorAccent: 'border-l-indigo-600',
      description: 'Review departmental requests & spend limits'
    },
    {
      role: 'PROCUREMENT_OFFICER',
      title: 'Procurement Officer',
      shortTitle: 'Procurement',
      department: 'Supply Chain Desk',
      badge: 'Vendor Scoring & PO',
      countBadge: `${approvedPRCount} Ready`,
      icon: <Award className="w-4 h-4 text-emerald-700" />,
      colorAccent: 'border-l-emerald-600',
      description: 'Algorithmically score quotes & issue POs'
    },
    {
      role: 'SUPPLIER',
      title: 'Vendor / Supplier',
      shortTitle: 'Supplier',
      department: 'External B2B Partner',
      badge: 'Order Fulfillment',
      countBadge: `${activePOCount} Orders`,
      icon: <Package className="w-4 h-4 text-amber-700" />,
      colorAccent: 'border-l-amber-600',
      description: 'Accept orders & dispatch waybill shipments'
    },
    {
      role: 'DELIVERY_PERSONNEL',
      title: 'Logistics & Courier',
      shortTitle: 'Logistics',
      department: 'Last-Mile Freight',
      badge: 'Real-time GPS',
      countBadge: `${activeDeliveryCount} In Route`,
      icon: <Truck className="w-4 h-4 text-sky-700" />,
      colorAccent: 'border-l-sky-600',
      description: 'Update waybill checkpoints & confirm delivery'
    },
    {
      role: 'CUSTOMER',
      title: 'Enterprise Customer',
      shortTitle: 'Customer',
      department: 'Corporate B2B Store',
      badge: 'Hardware Catalog',
      countBadge: `${state.products.length} SKUs`,
      icon: <ShoppingCart className="w-4 h-4 text-violet-700" />,
      colorAccent: 'border-l-violet-600',
      description: 'Browse standard hardware & material assets'
    },
    {
      role: 'ADMIN',
      title: 'Executive Admin',
      shortTitle: 'Executive Admin',
      department: 'Governance & RBAC',
      badge: 'Tier 3 / Telemetry',
      countBadge: `${state.auditLogs.length} Events`,
      icon: <ShieldCheck className="w-4 h-4 text-slate-900" />,
      colorAccent: 'border-l-slate-900',
      description: 'Inspect PostgreSQL schemas & audit logs'
    }
  ];

  // Quick Action Items with category tags
  const quickActionsList = [
    {
      id: 'action-new-pr',
      label: 'New Requisition',
      description: 'Draft purchase request',
      icon: <Plus className="w-4 h-4 text-emerald-700" />,
      category: 'Procurement',
      onClick: () => onOpenNewRequest()
    },
    {
      id: 'action-issue-po',
      label: 'Issue Purchase Order',
      description: 'Generate commercial PO',
      icon: <SendHorizontal className="w-4 h-4 text-blue-700" />,
      category: 'Procurement',
      onClick: () => onOpenCreatePO()
    },
    {
      id: 'action-catalog',
      label: 'Browse Catalog',
      description: 'View 26 verified SKUs',
      icon: <Package className="w-4 h-4 text-violet-700" />,
      category: 'Assets',
      onClick: () => onNavigateTab('catalog')
    },
    {
      id: 'action-simulator',
      label: '7-Stage Simulator',
      description: 'Interactive procurement run',
      icon: <Sparkles className="w-4 h-4 text-amber-700" />,
      category: 'Demo',
      onClick: onOpenWalkthrough
    },
    {
      id: 'action-architecture',
      label: '20-Step Architecture',
      description: 'Spring Boot 3.3.x spec',
      icon: <Layers className="w-4 h-4 text-indigo-700" />,
      category: 'Engineering',
      onClick: onOpenArchitecture
    },
    {
      id: 'action-api',
      label: 'REST API Explorer',
      description: 'Test live endpoints',
      icon: <Code2 className="w-4 h-4 text-rose-700" />,
      category: 'API',
      onClick: onOpenApiExplorer
    },
    {
      id: 'action-workflow',
      label: 'Governance Matrix',
      description: 'Approval policy diagrams',
      icon: <Sliders className="w-4 h-4 text-teal-700" />,
      category: 'Policy',
      onClick: onOpenWorkflow
    },
    {
      id: 'action-auth',
      label: 'Switch Persona',
      description: 'Change credentials',
      icon: <UserCheck className="w-4 h-4 text-stone-800" />,
      category: 'Auth',
      onClick: () => onOpenAuthModal('signin')
    },
    {
      id: 'action-zip',
      label: 'Export Code (.ZIP)',
      description: 'Download full repository',
      icon: <FolderArchive className="w-4 h-4 text-slate-800" />,
      category: 'Export',
      onClick: onOpenZip
    },
    {
      id: 'action-reset',
      label: 'Reset Demo Data',
      description: 'Restore seed state',
      icon: <RotateCcw className="w-4 h-4 text-amber-800" />,
      category: 'Store',
      onClick: () => procurementStore.resetData()
    }
  ];

  const currentWorkspace = roleWorkspaces.find(w => w.role === state.currentUser.role) || roleWorkspaces[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Active Persona Context & Quick Toggles */}
      <section className="bg-white border border-[#121212] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#121212]/5 border border-[#121212]/20 text-[10px] font-sans uppercase tracking-[0.2em] font-semibold text-[#121212]">
                <LayoutGrid className="w-3 h-3" />
                Active Workspace
              </span>
              <span className="text-xs font-mono text-[#121212]/60">
                {currentWorkspace.department} &bull; {currentWorkspace.badge}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#121212] font-normal">
              {state.currentUser.name}
              <span className="font-sans text-base font-normal text-[#121212]/70 ml-2.5">
                ({currentWorkspace.title})
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#121212]/10">
            <button
              onClick={() => onOpenAuthModal('signin')}
              className="px-3.5 py-2 bg-[#F9F7F2] hover:bg-[#EBE5DB] text-[#121212] border border-[#121212]/30 text-xs font-sans uppercase tracking-[0.1em] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch Persona</span>
            </button>

            <button
              onClick={() => setIsGridControlOpen(!isGridControlOpen)}
              className="px-3 py-2 bg-white hover:bg-[#F2EDE4] text-[#121212] border border-[#121212]/20 text-xs font-sans uppercase tracking-[0.1em] font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Toggle Workspaces & Quick Actions Command Grid"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{isGridControlOpen ? 'Hide Hub Grid' : 'Show Hub Grid'}</span>
              {isGridControlOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Role-Specific Header Quick Actions Widget */}
        <div className="pt-3 border-t border-[#121212]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F9F7F2]/60 p-3 border border-[#121212]/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-semibold text-[#121212]/60 whitespace-nowrap">
              Role Actions:
            </span>
          </div>
          <HeaderQuickActionsWidget
            state={state}
            onOpenNewRequest={onOpenNewRequest}
            onOpenCreatePO={onOpenCreatePO}
            onOpenAuthModal={onOpenAuthModal}
            onOpenWalkthrough={onOpenWalkthrough}
            onOpenArchitecture={onOpenArchitecture}
            onOpenApiExplorer={onOpenApiExplorer}
            onOpenWorkflow={onOpenWorkflow}
            onOpenZip={onOpenZip}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </section>

      {/* Flexible CSS Grid Hub: Adapts seamlessly across Desktop (12-col / multi-col) and Tablet (2-col) */}
      {isGridControlOpen && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          {/* Workspaces Selector Card (Desktop: 7 cols, Tablet: 1 col full / half) */}
          <div className="md:col-span-2 lg:col-span-7 bg-[#FFFFFF] border border-[#121212] p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#121212]" />
                  <h2 className="font-serif text-lg text-[#121212] font-medium">Workspaces</h2>
                </div>
                <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60">
                  7 Stakeholder Roles
                </span>
              </div>

              {/* Sub-grid of role cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {roleWorkspaces.map(ws => {
                  const isActive = state.currentUser.role === ws.role;
                  return (
                    <button
                      key={ws.role}
                      onClick={() => onSelectRole(ws.role)}
                      className={`p-3 text-left border transition-all duration-150 flex flex-col justify-between cursor-pointer group ${
                        isActive
                          ? 'bg-[#121212] text-[#F9F7F2] border-[#121212] ring-1 ring-[#121212] shadow-xs'
                          : 'bg-[#F9F7F2] text-[#121212] border-[#121212]/15 hover:border-[#121212] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className={`p-1 border ${isActive ? 'bg-white/10 border-white/20' : 'bg-white border-[#121212]/15'}`}>
                            {ws.icon}
                          </div>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-medium ${
                              isActive ? 'bg-white/20 text-white' : 'bg-white border border-[#121212]/15 text-[#121212]/80'
                            }`}
                          >
                            {ws.countBadge}
                          </span>
                        </div>
                        <h3 className="font-serif text-xs font-semibold leading-tight line-clamp-1">
                          {ws.title}
                        </h3>
                        <p className={`text-[11px] font-sans leading-tight mt-0.5 line-clamp-1 ${isActive ? 'text-white/70' : 'text-[#121212]/60'}`}>
                          {ws.description}
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-sans uppercase tracking-wider font-semibold">
                        <span>{isActive ? 'Current View' : 'Select'}</span>
                        <ArrowRight className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-white' : 'text-[#121212]/60'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#121212]/10 flex items-center justify-between text-[11px] text-[#121212]/70 font-sans">
              <span>Instant persona switching with PostgreSQL RBAC role isolation</span>
              <span className="font-mono text-[10px] text-[#121212]/50">Zero-reload state</span>
            </div>
          </div>

          {/* Quick Actions Panel (Desktop: 5 cols, Tablet: 1 col full / half) */}
          <div className="md:col-span-2 lg:col-span-5 bg-[#F4F0E8] border border-[#121212] p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-700" />
                  <h2 className="font-serif text-lg text-[#121212] font-medium">Quick Actions</h2>
                </div>
                <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212]/60">
                  Command Hub
                </span>
              </div>

              {/* Sub-grid of action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {quickActionsList.map(action => (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    className="p-2.5 bg-white border border-[#121212]/15 hover:border-[#121212] hover:bg-[#F9F7F2] text-left transition-all duration-150 flex items-start gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <div className="p-1.5 bg-[#F9F7F2] border border-[#121212]/10 shrink-0 group-hover:scale-105 transition-transform">
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold font-sans text-[#121212] truncate group-hover:text-black">
                        {action.label}
                      </div>
                      <div className="text-[10px] font-sans text-[#121212]/60 truncate mt-0.5">
                        {action.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#121212]/15 flex items-center justify-between text-[11px] text-[#121212]/70 font-sans">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#121212]/60" />
                <span>Flyway V1/V2 Seed Active</span>
              </div>
              <button
                onClick={() => onNavigateTab('about')}
                className="text-[11px] font-medium text-[#121212] hover:underline cursor-pointer"
              >
                Founder Spec &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Live KPI Metric Ribbon: Responsive 2-col to 6-col grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#121212]/20 p-3.5 space-y-0.5">
          <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Requisitions
          </span>
          <div className="text-xl font-serif font-bold text-[#121212]">{state.purchaseRequests.length}</div>
          <div className="text-[10px] text-[#121212]/60">{pendingPRCount} pending tiers</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-3.5 space-y-0.5">
          <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Purchase Orders
          </span>
          <div className="text-xl font-serif font-bold text-[#121212]">{activePOCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Commercial Binding</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-3.5 space-y-0.5">
          <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Active Freight
          </span>
          <div className="text-xl font-serif font-bold text-[#121212]">{activeDeliveryCount}</div>
          <div className="text-[10px] text-sky-700 font-medium">In Route & Waybills</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-3.5 space-y-0.5">
          <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Total Spend
          </span>
          <div className="text-xl font-serif font-bold text-[#121212]">
            ${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-[#121212]/60">Authorized Volume</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-3.5 space-y-0.5">
          <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Verified Vendors
          </span>
          <div className="text-xl font-serif font-bold text-[#121212]">{state.suppliers.length}</div>
          <div className="text-[10px] text-[#121212]/60">5-Metric Scoring</div>
        </div>

        <div className="bg-white border border-[#121212]/20 p-3.5 space-y-0.5">
          <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/60 font-semibold">
            Stock Buffer
          </span>
          <div className="text-xl font-serif font-bold text-[#121212]">{state.products.length} SKUs</div>
          <div className={`text-[10px] font-medium ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {lowStockCount > 0 ? `${lowStockCount} low stock alerts` : '100% optimal stock'}
          </div>
        </div>
      </section>

      {/* Active Role Dashboard Container */}
      <section className="bg-transparent">
        {children}
      </section>
    </div>
  );
};
