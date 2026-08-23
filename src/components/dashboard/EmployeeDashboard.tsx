import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { PurchaseRequest, PurchaseOrder, Product } from '../../types/procurement';

interface Props {
  onNewRequest?: () => void;
  onCreateRequest?: () => void;
  onViewRequest?: (pr: PurchaseRequest) => void;
  onViewPO?: (po: PurchaseOrder) => void;
}

export const EmployeeDashboard: React.FC<Props> = ({ 
  onNewRequest, 
  onCreateRequest, 
  onViewRequest, 
  onViewPO 
}) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());

  const handleCreate = onNewRequest || onCreateRequest || (() => {});

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const myRequests = state.purchaseRequests.filter(
    r => r.requestedBy === state.currentUser.id || state.currentUser.role === 'EMPLOYEE'
  );
  const pendingRequests = myRequests.filter(r => r.status === 'PENDING_APPROVAL');
  const approvedRequests = myRequests.filter(r => r.status === 'APPROVED' || r.status === 'CONVERTED_TO_PO');
  const myPOs = state.purchaseOrders.filter(po => myRequests.some(r => r.id === po.purchaseRequestId));

  return (
    <div id="employee-dashboard" className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Department Portal — {state.currentUser.department || 'Product Engineering'}
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">Requester Console</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Welcome, {state.currentUser.name}
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Submit requisitions for team infrastructure, computing hardware, and enterprise subscriptions. 
            All submissions flow through automated multi-tier approval policies.
          </p>
        </div>
        <button
          id="btn-employee-create-pr"
          onClick={handleCreate}
          className="flex items-center gap-3 px-6 py-3.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] font-sans uppercase tracking-[0.2em] text-xs font-medium transition cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[1.5]" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-6 border border-[#121212]/15 flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#121212]/50">
            Total Requisitions
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-4xl font-serif font-normal text-[#121212]">{myRequests.length}</h3>
            <span className="text-xs font-serif italic text-[#121212]/40">Active Records</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-6 border border-[#121212]/15 flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#121212]/50">
            Pending Sign-off
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-4xl font-serif font-normal text-[#121212]">{pendingRequests.length}</h3>
            <span className="text-xs font-serif italic text-[#121212]/40">In Review</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-6 border border-[#121212]/15 flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#121212]/50">
            Approved & PO Issued
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-4xl font-serif font-normal text-[#121212]">{approvedRequests.length}</h3>
            <span className="text-xs font-serif italic text-[#121212]/40">Authorized</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-6 border border-[#121212]/15 flex flex-col justify-between">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#121212]/50">
            Cumulative Value
          </span>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-serif font-normal text-[#121212]">
              ₹{myRequests.reduce((acc, r) => acc + r.estimatedAmount, 0).toLocaleString()}
            </h3>
            <span className="text-xs font-serif italic text-[#121212]/40">INR Total</span>
          </div>
        </div>
      </div>

      {/* Approval Tier Guide Notice */}
      <div className="bg-[#F4F0E8] border border-[#121212]/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#121212] shrink-0 stroke-[1.5]" />
          <span className="font-serif italic text-sm text-[#121212]">Multi-Tier Governance Protocol:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-sans">
          <span className="px-3 py-1 bg-white border border-[#121212]/15 text-[#121212]">
            <strong>&lt; ₹15,000</strong>: Tier 1 (Dept Manager)
          </span>
          <span className="px-3 py-1 bg-white border border-[#121212]/15 text-[#121212]">
            <strong>₹15k – ₹1,00,000</strong>: Tier 2 (Procurement Officer)
          </span>
          <span className="px-3 py-1 bg-white border border-[#121212]/15 text-[#121212]">
            <strong>&gt; ₹1,00,000</strong>: Tier 3 (Executive Admin)
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 overflow-hidden">
        <div className="p-6 border-b border-[#121212]/15 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Requisition Manifest</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">My Purchase Requests</h3>
          </div>
          <button
            onClick={handleCreate}
            className="text-xs font-sans uppercase tracking-[0.15em] text-[#121212] hover:opacity-60 transition font-semibold cursor-pointer"
          >
            + Create New
          </button>
        </div>

        {myRequests.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-10 h-10 text-[#121212]/30 mx-auto mb-3 stroke-[1.2]" />
            <h4 className="font-serif text-lg text-[#121212]">No Requisitions On Record</h4>
            <p className="text-xs font-sans text-[#121212]/60 mt-1 max-w-sm mx-auto">
              Initiate a purchase request for laptops, monitors, or cloud server resources.
            </p>
            <button
              onClick={handleCreate}
              className="mt-6 px-6 py-2.5 bg-[#121212] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.2em] font-medium hover:bg-[#2A2A2A] cursor-pointer"
            >
              Draft Initial Requisition
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#121212]">
              <thead className="bg-[#F4F0E8] border-b border-[#121212]/15 font-sans text-[10px] uppercase tracking-[0.2em] text-[#121212]/60">
                <tr>
                  <th className="py-3.5 px-5">Requisition #</th>
                  <th className="py-3.5 px-5">Items & Justification</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Est. Amount</th>
                  <th className="py-3.5 px-5">Authorization Progress</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#121212]/10 font-sans">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-medium text-[#121212] text-xs">{req.requestNumber}</td>
                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-medium text-[#121212] truncate">
                        {req.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                      <div className="text-[11px] font-serif italic text-[#121212]/60 truncate mt-0.5">{req.reason}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 border border-[#121212]/20 text-[10px] font-sans uppercase tracking-wider text-[#121212]">
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-serif text-sm font-medium text-[#121212]">
                      ₹{req.estimatedAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-[#EAE5D9] h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-[#121212]"
                            style={{
                              width: req.status === 'REJECTED' ? '100%' :
                                req.status === 'APPROVED' || req.status === 'CONVERTED_TO_PO' ? '100%' :
                                `${(req.currentApprovalLevel / req.requiredApprovalLevel) * 75}%`
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-serif italic text-[#121212]/70">
                          {req.status === 'REJECTED' ? 'Rejected' :
                           req.status === 'APPROVED' || req.status === 'CONVERTED_TO_PO' ? 'Fully Approved' :
                           `Tier ${req.currentApprovalLevel} of ${req.requiredApprovalLevel}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 text-[10px] font-sans uppercase tracking-wider font-semibold border border-[#121212]/20 bg-white">
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Linked Purchase Orders Section */}
      {myPOs.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Fulfillment Pipeline</span>
              <h3 className="text-xl font-serif font-normal text-[#121212]">Linked Purchase Orders</h3>
            </div>
            <span className="text-xs font-serif italic text-[#121212]/60">{myPOs.length} Active Orders</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPOs.map(po => (
              <div key={po.id} className="p-5 border border-[#121212]/15 bg-[#F9F7F2] flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-[#121212] text-xs">{po.poNumber}</span>
                    <span className="px-2 py-0.5 border border-[#121212]/20 text-[#121212] text-[9px] uppercase tracking-wider bg-white">
                      {po.status}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[#121212] mt-1.5 font-medium">Vendor: {po.supplierName}</p>
                  <p className="text-[11px] font-serif italic text-[#121212]/70">
                    Total: ₹{po.totalAmount.toLocaleString()} • AWB: {po.trackingNumber || 'Pending Dispatch'}
                  </p>
                </div>
                {onViewPO && (
                  <button
                    onClick={() => onViewPO(po)}
                    className="px-3.5 py-1.5 bg-white border border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] font-medium transition cursor-pointer"
                  >
                    Track
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
