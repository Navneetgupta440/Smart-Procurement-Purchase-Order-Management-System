import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';
import { PurchaseRequest, PurchaseOrder } from '../../types/procurement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchaseRequest?: PurchaseRequest | null;
  purchaseOrder?: PurchaseOrder | null;
}

export const RejectModal: React.FC<Props> = ({ isOpen, onClose, purchaseRequest, purchaseOrder }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || (!purchaseRequest && !purchaseOrder)) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('A mandatory business justification reason is required for compliance audit logs.');
      return;
    }

    if (purchaseRequest) {
      const res = procurementStore.rejectPurchaseRequest(purchaseRequest.id, reason);
      if (!res.success) {
        setError(res.message);
        return;
      }
    } else if (purchaseOrder) {
      const res = procurementStore.rejectPurchaseOrder(purchaseOrder.id, reason);
      if (!res.success) {
        setError(res.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-red-700 font-semibold">Audit Exception</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Reject {purchaseRequest ? `Requisition (${purchaseRequest.requestNumber})` : `Order (${purchaseOrder?.poNumber})`}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3 bg-white border border-red-300 text-red-700 text-xs font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 text-xs font-sans">
          <p className="text-[#121212]/75 leading-relaxed">
            Please enter the formal justification for rejecting this {purchaseRequest ? 'requisition' : 'purchase order'}. 
            This statement is permanently recorded into the forensic ledger.
          </p>

          <textarea
            rows={3}
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Exceeds quarterly budget allocation, duplicate request, or alternative vendor preferred..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212] focus:outline-hidden focus:border-[#121212]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#121212]/15">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#121212]/30 bg-white hover:bg-[#F4F0E8] text-[#121212] text-[10px] uppercase tracking-[0.15em] font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-[#F9F7F2] border border-red-800 text-[10px] uppercase tracking-[0.2em] font-medium cursor-pointer transition shadow-xs"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};
