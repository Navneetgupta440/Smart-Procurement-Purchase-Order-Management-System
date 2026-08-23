import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  FileCheck, 
  Check, 
  X,
  Layers,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { PurchaseRequest } from '../../types/procurement';

interface Props {
  onRejectRequest?: (pr: PurchaseRequest) => void;
  onRejectPrompt?: (pr: PurchaseRequest) => void;
  onViewRequest?: (pr: PurchaseRequest) => void;
}

export const ManagerDashboard: React.FC<Props> = ({ 
  onRejectRequest, 
  onRejectPrompt, 
  onViewRequest 
}) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [actingId, setActingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReject = onRejectRequest || onRejectPrompt || (() => {});

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const pendingRequests = state.purchaseRequests.filter(r => r.status === 'PENDING_APPROVAL');
  const pastApprovals = state.auditLogs.filter(a => a.action === 'APPROVE_REQUEST' || a.action === 'REJECT_REQUEST');

  const handleApprove = (pr: PurchaseRequest) => {
    setActingId(pr.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = procurementStore.approvePurchaseRequest(pr.id, `Approved by ${state.currentUser.name} (${state.currentUser.role})`);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(null), 5000);
    }
    setActingId(null);
  };

  return (
    <div id="manager-dashboard" className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Departmental Governance & Budget Authorization
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">Tier 1 & Tier 2 Workflows</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Authorization Console
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Review incoming procurement requisitions from your department. Authorize spend within prescribed policy 
            thresholds or submit formal audit rejections.
          </p>
        </div>
        <div className="text-right p-5 bg-[#F9F7F2] border border-[#121212]/20 min-w-[200px]">
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Awaiting Decision</p>
          <h2 className="text-3xl font-serif font-normal text-[#121212] mt-1">{pendingRequests.length} Requisitions</h2>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-[#FFFFFF] border border-[#121212] text-[#121212] text-xs font-sans flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#121212] shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-[#FFFFFF] border border-[#121212] text-[#121212] text-xs font-sans flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#121212] shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Pending Approval Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Verification Queue</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Requisitions Pending Review ({pendingRequests.length})
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Separation of concerns enforced</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#121212]/20 p-16 text-center">
            <FileCheck className="w-10 h-10 text-[#121212]/30 mx-auto mb-3 stroke-[1.2]" />
            <h4 className="font-serif text-lg text-[#121212]">All Requisitions Cleared</h4>
            <p className="text-xs font-sans text-[#121212]/60 mt-1 max-w-md mx-auto">
              There are no pending purchase requisitions awaiting management sign-off in this cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map(req => {
              const isOwn = req.requestedBy === state.currentUser.id;
              return (
                <div 
                  key={req.id} 
                  className="bg-[#FFFFFF] border border-[#121212]/20 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#121212]/40 transition"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-medium text-xs bg-[#F4F0E8] text-[#121212] px-2.5 py-0.5 border border-[#121212]/15">
                        {req.requestNumber}
                      </span>
                      <span className="px-2 py-0.5 border border-[#121212]/20 text-[10px] font-sans uppercase tracking-wider text-[#121212]">
                        {req.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F9F7F2] text-[#121212] border border-[#121212]/20 text-[10px] font-sans uppercase tracking-wider">
                        Tier {req.currentApprovalLevel} of {req.requiredApprovalLevel} Required
                      </span>
                      {isOwn && (
                        <span className="px-2 py-0.5 border border-[#121212] text-[#121212] text-[10px] font-sans uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Cannot self-approve
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xl font-serif font-normal text-[#121212]">
                        {req.items.map(i => `${i.quantity}x ${i.productName}`).join(' + ')}
                      </h4>
                      <p className="text-xs font-sans text-[#121212]/80 mt-1">
                        <strong className="text-[#121212]">Justification:</strong> {req.reason}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-xs text-[#121212]/60 pt-2 border-t border-[#121212]/10 font-sans">
                      <span>Requester: <strong className="text-[#121212]">{req.requestedByName}</strong> ({req.department})</span>
                      <span>Submitted: <strong className="text-[#121212]">{new Date(req.submittedAt).toLocaleDateString()}</strong></span>
                      <span>Est. Amount: <strong className="text-[#121212] font-serif text-sm">₹{req.estimatedAmount.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#121212]/10">
                    <button
                      onClick={() => handleReject(req)}
                      className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-red-300 font-sans uppercase tracking-[0.15em] text-[11px] font-medium flex items-center gap-2 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      disabled={isOwn || actingId === req.id}
                      onClick={() => handleApprove(req)}
                      className={`px-5 py-2.5 font-sans uppercase tracking-[0.2em] text-[11px] font-medium flex items-center gap-2 transition cursor-pointer ${
                        isOwn 
                          ? 'bg-[#EAE5D9] text-[#121212]/40 border border-[#121212]/20 cursor-not-allowed' 
                          : 'bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {req.currentApprovalLevel < req.requiredApprovalLevel ? 'Authorize & Escalate' : 'Authorize Requisition'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Audit Actions */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Audit Trail</span>
            <h3 className="text-xl font-serif font-normal text-[#121212]">Recent Authorization & Rejection Events</h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Immutable Ledger</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#121212]">
            <thead className="bg-[#F4F0E8] border-b border-[#121212]/15 font-sans text-[10px] uppercase tracking-[0.2em] text-[#121212]/60">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Authorizer</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Remarks / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212]/10 font-sans">
              {pastApprovals.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-[#F9F7F2]/60">
                  <td className="py-3 px-4 font-mono text-[#121212]/60">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 font-medium text-[#121212]">{log.userName} <span className="text-[10px] text-[#121212]/50">({log.userRole})</span></td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 border border-[#121212]/20 text-[10px] font-sans uppercase tracking-wider bg-white">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#121212]">{log.entityId}</td>
                  <td className="py-3 px-4 font-serif italic text-[#121212]/80">{log.newValue || log.oldValue || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
