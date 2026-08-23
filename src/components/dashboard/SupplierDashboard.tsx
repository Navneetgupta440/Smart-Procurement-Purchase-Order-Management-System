import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  PackageCheck, 
  Send, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { PurchaseOrder } from '../../types/procurement';

interface Props {
  onViewPO: (po: PurchaseOrder) => void;
  onRejectPO: (po: PurchaseOrder) => void;
}

export const SupplierDashboard: React.FC<Props> = ({ onViewPO, onRejectPO }) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [selectedPOForDispatch, setSelectedPOForDispatch] = useState<PurchaseOrder | null>(null);
  const [carrier, setCarrier] = useState('SpeedExpress Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const myPOs = state.purchaseOrders.filter(po => 
    po.supplierId === state.currentUser.id || 
    state.currentUser.role === 'SUPPLIER' || 
    po.supplierName.toLowerCase().includes('abc')
  );

  const handleAccept = (po: PurchaseOrder) => {
    const res = procurementStore.acceptPurchaseOrder(po.id);
    if (res.success) {
      setMessage(res.message);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleStartProcess = (po: PurchaseOrder) => {
    const res = procurementStore.startOrderProcessing(po.id);
    if (res.success) {
      setMessage(res.message);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleConfirmDispatch = () => {
    if (!selectedPOForDispatch) return;
    const res = procurementStore.dispatchPurchaseOrder(selectedPOForDispatch.id, {
      carrier,
      trackingNumber: trackingNumber || `TRK-IND-${Math.floor(10000 + Math.random() * 90000)}`
    });
    if (res.success) {
      setMessage(res.message);
      setSelectedPOForDispatch(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div id="supplier-dashboard" className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Vendor Supplier Portal — {state.currentUser.name}
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">Fulfillment & Consignment Hub</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Supplier Fulfillment Desk
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Accept issued enterprise purchase orders, trigger factory packaging, and dispatch consignments with real-time tracking IDs.
          </p>
        </div>
        <div className="text-right p-5 bg-[#F9F7F2] border border-[#121212]/20 min-w-[200px]">
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Assigned Orders</p>
          <h3 className="text-3xl font-serif font-normal text-[#121212] mt-1">{myPOs.length} Active</h3>
        </div>
      </div>

      {/* Status Notice */}
      {message && (
        <div className="p-4 bg-[#FFFFFF] border border-[#121212] text-[#121212] text-xs font-sans flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-[#121212] shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Order Manifest</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Purchase Orders Assigned to Your Organization
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">SLA Tracking Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#121212]">
            <thead className="bg-[#F4F0E8] border-b border-[#121212]/15 font-sans text-[10px] uppercase tracking-[0.2em] text-[#121212]/60">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Total (incl. 18% GST)</th>
                <th className="py-3 px-4">Delivery SLA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212]/10 font-sans">
              {myPOs.map(po => (
                <tr key={po.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#121212]">{po.poNumber}</td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-[#121212]/80">
                    {po.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </td>
                  <td className="py-3.5 px-4 font-serif">₹{po.subtotal.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-serif font-medium text-sm text-[#121212]">₹{po.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 border border-[#121212]/20 text-[9px] font-sans uppercase tracking-wider bg-white">
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {po.status === 'SENT_TO_SUPPLIER' && (
                      <>
                        <button
                          onClick={() => handleAccept(po)}
                          className="px-3 py-1 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] font-medium transition cursor-pointer"
                        >
                          Accept PO
                        </button>
                        <button
                          onClick={() => onRejectPO(po)}
                          className="px-3 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-300 text-[10px] font-sans uppercase tracking-[0.15em] font-medium transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {po.status === 'SUPPLIER_ACCEPTED' && (
                      <button
                        onClick={() => handleStartProcess(po)}
                        className="px-3 py-1 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] font-medium transition cursor-pointer"
                      >
                        Start Processing
                      </button>
                    )}

                    {po.status === 'PROCESSING' && (
                      <button
                        onClick={() => {
                          setSelectedPOForDispatch(po);
                          setTrackingNumber(`TRK-IND-${Math.floor(10000 + Math.random() * 90000)}`);
                        }}
                        className="px-3.5 py-1 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] font-medium transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Dispatch Order
                      </button>
                    )}

                    {(po.status === 'DISPATCHED' || po.status === 'IN_TRANSIT' || po.status === 'DELIVERED' || po.status === 'COMPLETED') && (
                      <button
                        onClick={() => onViewPO(po)}
                        className="px-3 py-1 bg-white border border-[#121212] hover:bg-[#121212] hover:text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] transition cursor-pointer"
                      >
                        View Shipment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {selectedPOForDispatch && (
        <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#F9F7F2] border border-[#121212] max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Consignment Handover</span>
                <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
                  Dispatch PO: {selectedPOForDispatch.poNumber}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPOForDispatch(null)}
                className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/70 block mb-1">
                  Logistics Carrier Provider
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 text-[#121212]"
                  placeholder="e.g. SpeedExpress, BlueDart, Delhivery"
                />
              </div>

              <div>
                <label className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/70 block mb-1">
                  Airway Bill / Tracking Code
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#121212]/30 font-mono text-[#121212] font-bold"
                />
              </div>

              <div className="p-4 bg-white border border-[#121212]/15 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[#121212]/60">Destination Address:</p>
                <p className="text-xs font-serif text-[#121212]">
                  SmartProcure Central Receiving Dock, Floor 4, Cyber City, Gurugram, HR, 122002
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#121212]/15">
              <button
                onClick={() => setSelectedPOForDispatch(null)}
                className="px-4 py-2.5 border border-[#121212]/30 bg-white hover:bg-[#F4F0E8] text-[#121212] text-[10px] font-sans uppercase tracking-[0.15em] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-5 py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] font-sans uppercase tracking-[0.2em] font-medium flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
