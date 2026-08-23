import React, { useState } from 'react';
import { 
  Plus, 
  SendHorizontal, 
  CheckCircle2, 
  Truck, 
  Package, 
  ShoppingCart, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Zap, 
  RotateCcw, 
  Clock, 
  FileText, 
  Layers, 
  ChevronDown, 
  Eye, 
  AlertCircle,
  Download,
  Search,
  CheckCheck
} from 'lucide-react';
import { ProcurementState, procurementStore } from '../../services/procurementStore';
import { RoleType, Product, PurchaseRequest, PurchaseOrder, Delivery } from '../../types/procurement';

interface HeaderQuickActionsWidgetProps {
  state: ProcurementState;
  onOpenNewRequest: (product?: Product) => void;
  onOpenCreatePO: (pr?: PurchaseRequest, prodId?: string) => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenWalkthrough: () => void;
  onOpenArchitecture: () => void;
  onOpenApiExplorer: () => void;
  onOpenWorkflow: () => void;
  onOpenZip: () => void;
  onNavigateTab: (tab: 'home' | 'workspace' | 'catalog' | 'about' | 'contact') => void;
}

export const HeaderQuickActionsWidget: React.FC<HeaderQuickActionsWidgetProps> = ({
  state,
  onOpenNewRequest,
  onOpenCreatePO,
  onOpenAuthModal,
  onOpenWalkthrough,
  onOpenArchitecture,
  onOpenApiExplorer,
  onOpenWorkflow,
  onOpenZip,
  onNavigateTab
}) => {
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const triggerFeedback = (message: string, type: 'success' | 'info' = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  const role = state.currentUser.role;

  // Filter relevant items for role-specific tasks
  const pendingPRs = state.purchaseRequests.filter(
    pr => pr.status === 'SUBMITTED' || pr.status === 'PENDING_APPROVAL'
  );
  const approvedPRs = state.purchaseRequests.filter(pr => pr.status === 'APPROVED');
  const pendingSupplierPOs = state.purchaseOrders.filter(po => po.status === 'ISSUED');
  const activeDeliveries = state.deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'FAILED');
  const lowStockProducts = state.products.filter(p => p.availableQuantity <= p.minimumStock);

  // 1-Click Action Handlers
  const handleManagerQuickApprove = () => {
    if (pendingPRs.length === 0) {
      triggerFeedback('No pending requisitions waiting for managerial sign-off', 'info');
      return;
    }
    const targetPR = pendingPRs[0];
    const res = procurementStore.approvePurchaseRequest(targetPR.id, 'Fast-approved via Quick Actions Header Widget');
    if (res.success) {
      triggerFeedback(`Requisition ${targetPR.prNumber} approved successfully!`);
    } else {
      triggerFeedback(res.message, 'info');
    }
  };

  const handleManagerBatchApprove = () => {
    if (pendingPRs.length === 0) {
      triggerFeedback('No pending requisitions to approve', 'info');
      return;
    }
    let approvedCount = 0;
    pendingPRs.forEach(pr => {
      const res = procurementStore.approvePurchaseRequest(pr.id, 'Batch approved via Quick Actions Widget (<$5,000 policy)');
      if (res.success) approvedCount++;
    });
    triggerFeedback(`Batch approved ${approvedCount} requisition(s) under managerial sign-off policy.`);
  };

  const handleSupplierQuickAccept = () => {
    if (pendingSupplierPOs.length === 0) {
      triggerFeedback('All current purchase orders are already acknowledged', 'info');
      return;
    }
    const targetPO = pendingSupplierPOs[0];
    const res = procurementStore.acceptPurchaseOrder(targetPO.id);
    if (res.success) {
      triggerFeedback(`Purchase Order ${targetPO.poNumber} accepted and queued for production dispatch.`);
    } else {
      triggerFeedback(res.message, 'info');
    }
  };

  const handleSupplierQuickDispatch = () => {
    const acceptedPOs = state.purchaseOrders.filter(po => po.status === 'ACCEPTED' || po.status === 'PROCESSING');
    if (acceptedPOs.length === 0) {
      triggerFeedback('No accepted orders currently waiting for dispatch. Accept an order first.', 'info');
      return;
    }
    const targetPO = acceptedPOs[0];
    const trackingNum = `WAYBILL-EXP-${Math.floor(100000 + Math.random() * 900000)}`;
    const res = procurementStore.dispatchPurchaseOrder(targetPO.id, {
      carrier: 'DHL Express Freight',
      trackingNumber: trackingNum
    });
    if (res.success) {
      triggerFeedback(`PO ${targetPO.poNumber} dispatched! Waybill generated: ${trackingNum}`);
    } else {
      triggerFeedback(res.message, 'info');
    }
  };

  const handleDeliveryAdvanceStatus = () => {
    if (activeDeliveries.length === 0) {
      triggerFeedback('No active freight in transit', 'info');
      return;
    }
    const targetDelivery = activeDeliveries[0];
    let nextStatus = targetDelivery.status;
    let nextLoc = 'Regional Distribution Hub (En Route)';
    let remark = 'Transit checkpoint updated via Logistics Quick Actions';

    if (targetDelivery.status === 'CREATED' || targetDelivery.status === 'PICKED_UP') {
      nextStatus = 'IN_TRANSIT';
      nextLoc = 'Interstate Freight Corridor (Speed: 65mph)';
      remark = 'Freight cleared dispatch depot and is in transit';
    } else if (targetDelivery.status === 'IN_TRANSIT') {
      nextStatus = 'OUT_FOR_DELIVERY';
      nextLoc = 'Local Last-Mile Hub (Driver Assigned)';
      remark = 'Out for delivery on courier route';
    } else if (targetDelivery.status === 'OUT_FOR_DELIVERY') {
      nextStatus = 'DELIVERED';
      nextLoc = 'Corporate Headquarters Receiving Dock 4';
      remark = 'Goods inspected and received. Inventory automatically reconciled.';
    }

    const res = procurementStore.updateDeliveryStatus(targetDelivery.id, nextStatus, nextLoc, remark);
    if (res.success) {
      triggerFeedback(`Delivery ${targetDelivery.deliveryNumber} status updated to: ${nextStatus.replace('_', ' ')}`);
    } else {
      triggerFeedback(res.message, 'info');
    }
  };

  const handleAutoScoreDeficit = () => {
    if (lowStockProducts.length > 0) {
      const topDeficit = lowStockProducts[0];
      onOpenCreatePO(undefined, topDeficit.id);
    } else if (approvedPRs.length > 0) {
      onOpenCreatePO(approvedPRs[0], undefined);
    } else {
      onOpenCreatePO();
    }
  };

  // Build role-specific quick action configuration
  const getRoleActions = () => {
    switch (role) {
      case 'PROCUREMENT_OFFICER':
      case 'PROCUREMENT_MANAGER':
        return {
          badge: `${approvedPRs.length} PRs Ready`,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          primary: {
            label: 'Submit PO',
            subLabel: approvedPRs.length > 0 ? `(${approvedPRs.length} Approved PRs)` : 'New Commercial PO',
            icon: <SendHorizontal className="w-3.5 h-3.5" />,
            onClick: () => {
              if (approvedPRs.length > 0) {
                onOpenCreatePO(approvedPRs[0]);
              } else {
                onOpenCreatePO();
              }
            }
          },
          quickChips: [
            {
              id: 'proc-auto-score',
              label: 'Auto-Score Deficit SKU',
              icon: <Sparkles className="w-3 h-3 text-amber-600" />,
              onClick: handleAutoScoreDeficit
            },
            {
              id: 'proc-new-pr',
              label: '+ Requisition',
              icon: <Plus className="w-3 h-3 text-blue-600" />,
              onClick: () => onOpenNewRequest()
            },
            {
              id: 'proc-catalog',
              label: 'Vendor Catalog',
              icon: <Package className="w-3 h-3 text-violet-600" />,
              onClick: () => onNavigateTab('catalog')
            }
          ]
        };

      case 'MANAGER':
        return {
          badge: `${pendingPRs.length} Pending Sign-Off`,
          badgeColor: pendingPRs.length > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primary: {
            label: 'Quick Approve PR',
            subLabel: pendingPRs.length > 0 ? pendingPRs[0].prNumber : 'All Approved',
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            onClick: handleManagerQuickApprove
          },
          quickChips: [
            {
              id: 'mgr-batch-approve',
              label: 'Batch Sign-Off (<$5k)',
              icon: <CheckCheck className="w-3 h-3 text-emerald-600" />,
              onClick: handleManagerBatchApprove
            },
            {
              id: 'mgr-new-req',
              label: '+ Dept Request',
              icon: <Plus className="w-3 h-3 text-indigo-600" />,
              onClick: () => onOpenNewRequest()
            },
            {
              id: 'mgr-workflow',
              label: 'Policy Matrix',
              icon: <Layers className="w-3 h-3 text-teal-600" />,
              onClick: onOpenWorkflow
            }
          ]
        };

      case 'SUPPLIER':
        return {
          badge: `${pendingSupplierPOs.length} POs Awaiting Acceptance`,
          badgeColor: pendingSupplierPOs.length > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          primary: {
            label: 'Accept Pending PO',
            subLabel: pendingSupplierPOs.length > 0 ? pendingSupplierPOs[0].poNumber : 'All Accepted',
            icon: <Check className="w-3.5 h-3.5" />,
            onClick: handleSupplierQuickAccept
          },
          quickChips: [
            {
              id: 'sup-dispatch',
              label: 'Dispatch Waybill',
              icon: <Truck className="w-3 h-3 text-sky-600" />,
              onClick: handleSupplierQuickDispatch
            },
            {
              id: 'sup-catalog',
              label: 'Supply Inventory',
              icon: <Package className="w-3 h-3 text-amber-600" />,
              onClick: () => onNavigateTab('catalog')
            }
          ]
        };

      case 'DELIVERY_PERSONNEL':
      case 'DELIVERY_AGENT':
        return {
          badge: `${activeDeliveries.length} Active Waybills`,
          badgeColor: activeDeliveries.length > 0 ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          primary: {
            label: 'Advance Delivery Checkpoint',
            subLabel: activeDeliveries.length > 0 ? activeDeliveries[0].deliveryNumber : 'No Active Freight',
            icon: <Truck className="w-3.5 h-3.5" />,
            onClick: handleDeliveryAdvanceStatus
          },
          quickChips: [
            {
              id: 'del-confirm-pod',
              label: 'Confirm POD Drop-Off',
              icon: <CheckCheck className="w-3 h-3 text-emerald-600" />,
              onClick: handleDeliveryAdvanceStatus
            },
            {
              id: 'del-catalog',
              label: 'Warehouse Stock',
              icon: <Package className="w-3 h-3 text-violet-600" />,
              onClick: () => onNavigateTab('catalog')
            }
          ]
        };

      case 'CUSTOMER':
        return {
          badge: `${state.products.length} SKUs Available`,
          badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
          primary: {
            label: 'Order Hardware Asset',
            subLabel: 'Request Equipment',
            icon: <ShoppingCart className="w-3.5 h-3.5" />,
            onClick: () => onOpenNewRequest()
          },
          quickChips: [
            {
              id: 'cust-catalog',
              label: 'Browse Catalog',
              icon: <Package className="w-3 h-3 text-violet-600" />,
              onClick: () => onNavigateTab('catalog')
            },
            {
              id: 'cust-simulator',
              label: '7-Stage Walkthrough',
              icon: <Sparkles className="w-3 h-3 text-amber-600" />,
              onClick: onOpenWalkthrough
            }
          ]
        };

      case 'ADMIN':
        return {
          badge: 'Executive Root Access',
          badgeColor: 'bg-slate-900 text-white border-slate-900',
          primary: {
            label: 'Submit PO / PR',
            subLabel: 'Direct Admin Action',
            icon: <SendHorizontal className="w-3.5 h-3.5" />,
            onClick: () => onOpenCreatePO()
          },
          quickChips: [
            {
              id: 'adm-new-pr',
              label: '+ Requisition',
              icon: <Plus className="w-3 h-3 text-blue-600" />,
              onClick: () => onOpenNewRequest()
            },
            {
              id: 'adm-api',
              label: 'REST API Explorer',
              icon: <Layers className="w-3 h-3 text-indigo-600" />,
              onClick: onOpenApiExplorer
            },
            {
              id: 'adm-reseed',
              label: 'Reset DB Seed',
              icon: <RotateCcw className="w-3 h-3 text-rose-600" />,
              onClick: () => {
                procurementStore.resetData();
                triggerFeedback('PostgreSQL demo database reseeded to clean baseline state.');
              }
            }
          ]
        };

      case 'EMPLOYEE':
      default:
        return {
          badge: `${state.purchaseRequests.length} Requisitions`,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          primary: {
            label: 'Submit Requisition',
            subLabel: 'New Purchase Request',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => onOpenNewRequest()
          },
          quickChips: [
            {
              id: 'emp-catalog',
              label: 'Browse SKUs',
              icon: <Package className="w-3 h-3 text-violet-600" />,
              onClick: () => onNavigateTab('catalog')
            },
            {
              id: 'emp-walkthrough',
              label: 'Interactive Simulator',
              icon: <Sparkles className="w-3 h-3 text-amber-600" />,
              onClick: onOpenWalkthrough
            }
          ]
        };
    }
  };

  const roleActions = getRoleActions();

  return (
    <div className="relative">
      {/* Action Execution Toast Alert Banner */}
      {actionFeedback && (
        <div 
          role="status" 
          aria-live="polite"
          className={`mb-3 px-3.5 py-2.5 border text-xs font-sans flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
            actionFeedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-600' 
              : 'bg-blue-50 text-blue-900 border-blue-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
          <button 
            onClick={() => setActionFeedback(null)}
            className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-70 hover:opacity-100 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Role Quick Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-semibold border ${roleActions.badgeColor}`}>
          <Zap className="w-3 h-3" />
          <span>{roleActions.badge}</span>
        </span>

        {/* Primary Role-Specific Task Trigger Button */}
        <button
          onClick={roleActions.primary.onClick}
          className="px-4 py-2 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-xs font-sans uppercase tracking-[0.1em] font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs hover:translate-y-[-1px] active:translate-y-0"
          title={`Perform role-specific task for ${role.replace('_', ' ')}`}
        >
          {roleActions.primary.icon}
          <span className="font-bold">{roleActions.primary.label}</span>
          <span className="hidden sm:inline-block text-[10px] font-normal text-white/70 border-l border-white/20 pl-2">
            {roleActions.primary.subLabel}
          </span>
        </button>

        {/* Secondary Role Action Chips (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-1.5">
          {roleActions.quickChips.map(chip => (
            <button
              key={chip.id}
              onClick={chip.onClick}
              className="px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F0E8] text-[#121212] border border-[#121212]/20 hover:border-[#121212] text-xs font-sans font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {chip.icon}
              <span className="text-[11px]">{chip.label}</span>
            </button>
          ))}
        </div>

        {/* More Actions Dropdown Menu Button */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2.5 py-2 bg-white hover:bg-[#F2EDE4] text-[#121212] border border-[#121212]/30 text-xs font-sans font-semibold flex items-center gap-1 transition cursor-pointer"
            title="More Quick Actions"
            aria-expanded={isDropdownOpen}
          >
            <span className="text-[11px] font-sans uppercase tracking-wider">Quick Actions</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Action Popover Menu */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#121212] shadow-lg z-50 p-2 space-y-1 animate-in fade-in duration-150">
                <div className="px-2 py-1 border-b border-[#121212]/10 mb-1">
                  <span className="text-[10px] font-sans uppercase tracking-[0.15em] font-semibold text-[#121212]/60">
                    Role-Specific Tasks ({role.replace('_', ' ')})
                  </span>
                </div>

                {/* Primary Action inside menu */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    roleActions.primary.onClick();
                  }}
                  className="w-full text-left px-2.5 py-2 bg-[#F9F7F2] hover:bg-[#EBE5DB] text-[#121212] text-xs font-sans font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {roleActions.primary.icon}
                    <span>{roleActions.primary.label}</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#121212]/60">Primary</span>
                </button>

                {/* Secondary chips in menu */}
                {roleActions.quickChips.map(chip => (
                  <button
                    key={`menu-${chip.id}`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      chip.onClick();
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#F9F7F2] text-[#121212] text-xs font-sans flex items-center gap-2 cursor-pointer transition"
                  >
                    {chip.icon}
                    <span>{chip.label}</span>
                  </button>
                ))}

                <div className="pt-1 mt-1 border-t border-[#121212]/10">
                  <span className="text-[9px] font-sans uppercase tracking-[0.15em] text-[#121212]/50 px-2">
                    General Utilities
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenAuthModal('signin');
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#F9F7F2] text-[#121212] text-xs font-sans flex items-center justify-between cursor-pointer"
                >
                  <span>Switch Role Persona</span>
                  <span className="text-[10px] font-mono text-[#121212]/50">RBAC</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenZip();
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#F9F7F2] text-[#121212] text-xs font-sans flex items-center justify-between cursor-pointer"
                >
                  <span>Export Source Code</span>
                  <span className="text-[10px] font-mono text-[#121212]/50">.ZIP</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
