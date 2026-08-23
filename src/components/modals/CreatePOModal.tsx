import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck, Plus, Trash2, X } from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { PurchaseRequest, Product, Supplier } from '../../types/procurement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchaseRequest?: PurchaseRequest;
  preselectedProductId?: string;
}

export const CreatePOModal: React.FC<Props> = ({ isOpen, onClose, purchaseRequest, preselectedProductId }) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(state.suppliers[0]?.id || '');
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    setState(procurementStore.getState());
  }, [isOpen]);

  useEffect(() => {
    if (purchaseRequest) {
      setItems(purchaseRequest.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.estimatedUnitPrice
      })));
      setRemarks(`Generated for approved purchase requisition ${purchaseRequest.requestNumber}.`);
      
      // Auto recommend top supplier for the first product
      if (purchaseRequest.items[0]) {
        const recs = procurementStore.getSupplierRecommendations(purchaseRequest.items[0].productId);
        if (recs[0]) {
          setSelectedSupplierId(recs[0].supplier.id);
          setDeliveryDays(recs[0].supplier.averageLeadDays);
        }
      }
    } else if (preselectedProductId) {
      const prod = state.products.find(p => p.id === preselectedProductId);
      const recs = procurementStore.getSupplierRecommendations(preselectedProductId);
      setItems([{
        productId: preselectedProductId,
        quantity: prod ? Math.max(10, prod.minimumStock * 2 - prod.availableQuantity) : 10,
        unitPrice: prod ? prod.unitPrice : 1000
      }]);
      if (recs[0]) {
        setSelectedSupplierId(recs[0].supplier.id);
        setDeliveryDays(recs[0].supplier.averageLeadDays);
      }
      setRemarks(`Smart restock order for low-inventory SKU.`);
    } else {
      setItems([{
        productId: state.products[0]?.id || '',
        quantity: 5,
        unitPrice: state.products[0]?.unitPrice || 1000
      }]);
    }
  }, [purchaseRequest, preselectedProductId, isOpen]);

  if (!isOpen) return null;

  const selectedSupplier = state.suppliers.find(s => s.id === selectedSupplierId) || state.suppliers[0];

  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * (item.quantity || 1)), 0);
  const tax = Math.round(subtotal * 0.18);
  const discount = subtotal > 100000 ? 5000 : 0;
  const shipping = 1500;
  const total = subtotal + tax - discount + shipping;

  const handleAddItem = () => {
    const p = state.products[0];
    setItems([...items, { productId: p.id, quantity: 1, unitPrice: p.unitPrice }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    if (field === 'productId') {
      const p = state.products.find(prod => prod.id === val);
      updated[index] = { ...updated[index], productId: val, unitPrice: p ? p.unitPrice : 1000 };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    procurementStore.createPurchaseOrder({
      purchaseRequestId: purchaseRequest?.id,
      supplierId: selectedSupplierId,
      items,
      expectedDeliveryDays: deliveryDays,
      remarks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Purchase Order Generation</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Issue Purchase Order (PO)
            </h3>
            <p className="text-xs font-serif italic text-[#121212]/60 mt-1">
              {purchaseRequest ? `Converting Requisition ${purchaseRequest.requestNumber}` : 'Direct Procurement Order'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Supplier Selector */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Target Vendor / Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={e => {
                setSelectedSupplierId(e.target.value);
                const s = state.suppliers.find(sup => sup.id === e.target.value);
                if (s) setDeliveryDays(s.averageLeadDays);
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212]"
            >
              {state.suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.companyName} • Rating: {s.rating}★ • Avg Lead: {s.averageLeadDays}d ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70">Line Items & Pricing</label>
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
                const prod = state.products.find(p => p.id === item.productId);
                const lineSub = item.unitPrice * (item.quantity || 1);
                return (
                  <div key={idx} className="p-3 bg-white border border-[#121212]/20 flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#121212]/30 text-xs bg-white text-[#121212]"
                      >
                        {state.products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.productCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 border border-[#121212]/30 text-xs bg-white text-[#121212] font-mono text-center"
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-[#121212]/30 text-xs bg-white text-[#121212] font-mono text-right"
                      />
                    </div>

                    <div className="w-24 text-right font-serif text-sm text-[#121212]">
                      ₹{lineSub.toLocaleString()}
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

          {/* Delivery & Remarks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={deliveryDays}
                onChange={e => setDeliveryDays(parseInt(e.target.value) || 3)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212] font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Tax & Freight Calculation</label>
              <input
                type="text"
                disabled
                value="18% GST + Flat Courier Logistics"
                className="w-full px-3.5 py-2.5 bg-[#EAE5D9]/50 border border-[#121212]/20 text-[#121212]/70"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">PO Instructions / Notes</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212] focus:outline-hidden focus:border-[#121212]"
              placeholder="Terms, delivery instructions, packaging specifications..."
            />
          </div>

          {/* Calculation Summary */}
          <div className="p-4 bg-white border border-[#121212]/20 space-y-2 text-xs">
            <div className="flex justify-between text-[#121212]/70">
              <span>Subtotal:</span>
              <span className="font-serif">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#121212]/70">
              <span>GST (18%):</span>
              <span className="font-serif">+ ₹{tax.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#121212]">
                <span>Enterprise Volume Discount:</span>
                <span className="font-serif">- ₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[#121212]/70">
              <span>Standard Logistics Dispatch:</span>
              <span className="font-serif">+ ₹{shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#121212] font-semibold text-sm pt-2 border-t border-[#121212]/10">
              <span>Net PO Amount:</span>
              <span className="font-serif text-base">₹{total.toLocaleString()}</span>
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
              Issue & Dispatch Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
