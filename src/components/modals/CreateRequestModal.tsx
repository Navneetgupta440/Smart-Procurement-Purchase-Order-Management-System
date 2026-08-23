import React, { useState } from 'react';
import { Plus, Trash2, X, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';
import { Product, Priority } from '../../types/procurement';

interface Props {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product;
}

export const CreateRequestModal: React.FC<Props> = ({ products, isOpen, onClose, preselectedProduct }) => {
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: preselectedProduct ? preselectedProduct.id : (products[0]?.id || ''), quantity: 5 }
  ]);
  const [department, setDepartment] = useState('Product Engineering');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [reason, setReason] = useState('Required for team expansion and hardware onboarding.');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const totalEst = items.reduce((acc, item) => {
    const p = products.find(prod => prod.id === item.productId);
    return acc + ((p ? p.unitPrice : 0) * (item.quantity || 1));
  }, 0);

  let requiredTier = 1;
  if (totalEst > 100000) requiredTier = 3;
  else if (totalEst >= 15000) requiredTier = 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => i.quantity <= 0)) {
      setError('Item quantity must be greater than zero.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a justification reason.');
      return;
    }

    procurementStore.createPurchaseRequest({
      items,
      department,
      priority,
      reason
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Requisition Initiation</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">New Purchase Requisition</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Department & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212]"
              >
                <option value="Product Engineering">Product Engineering</option>
                <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                <option value="QA & Testing Lab">QA & Testing Lab</option>
                <option value="Design & UX">Design & UX</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Urgency Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT (Expedited)</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70">Requested Line Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] text-[#121212] uppercase tracking-wider font-semibold underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                const sub = (prod ? prod.unitPrice : 0) * (item.quantity || 1);
                return (
                  <div key={idx} className="p-3 bg-white border border-[#121212]/20 flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#121212]/30 text-xs bg-white text-[#121212]"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.unitPrice.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 border border-[#121212]/30 text-xs bg-white text-[#121212] font-mono text-center"
                      />
                    </div>

                    <div className="w-24 text-right font-serif text-sm text-[#121212]">
                      ₹{sub.toLocaleString()}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[#121212]/40 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Business Reason & Justification</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="State the objective or project for which these items are needed..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212] focus:outline-hidden focus:border-[#121212]"
            />
          </div>

          {/* Tier Preview Card */}
          <div className="p-4 bg-white border border-[#121212]/20 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] uppercase tracking-wider text-[#121212]/60">Total Estimated Cost:</span>
              <span className="text-xl font-serif text-[#121212]">₹{totalEst.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-serif italic text-[#121212]/70 pt-2 border-t border-[#121212]/10">
              <ShieldCheck className="w-4 h-4 text-[#121212] shrink-0" />
              <span>
                {requiredTier === 1 && 'Requires 1 Approval: Manager authorization (< ₹15,000)'}
                {requiredTier === 2 && 'Requires 2 Approvals: Manager → Procurement Manager (₹15,000 - ₹1,00,000)'}
                {requiredTier === 3 && 'Requires 3 Approvals: Manager → Procurement → Executive Admin (> ₹1,00,000)'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#121212]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#121212]/30 bg-white hover:bg-[#F4F0E8] text-[#121212] text-[10px] uppercase tracking-[0.15em] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] uppercase tracking-[0.2em] font-medium transition cursor-pointer"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
