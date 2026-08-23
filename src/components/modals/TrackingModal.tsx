import React from 'react';
import { Truck, MapPin, CheckCircle, Clock, Navigation, X, Building, ShieldCheck } from 'lucide-react';
import { Delivery, PurchaseOrder } from '../../types/procurement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  delivery?: Delivery | null;
  purchaseOrder?: PurchaseOrder | null;
}

export const TrackingModal: React.FC<Props> = ({ isOpen, onClose, delivery, purchaseOrder }) => {
  if (!isOpen || (!delivery && !purchaseOrder)) return null;

  const trackingNum = delivery?.trackingNumber || purchaseOrder?.trackingNumber || 'TRK-IND-99201';
  const carrier = delivery?.carrier || 'SpeedExpress Logistics';
  const history = delivery?.trackingHistory || [
    {
      id: 'mock-1',
      deliveryId: 'del-1',
      status: 'CREATED',
      location: 'Vendor Central Hub',
      remarks: 'Package booked and airway bill generated.',
      updatedBy: 'System',
      eventTime: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'mock-2',
      deliveryId: 'del-1',
      status: 'IN_TRANSIT',
      location: 'Delhi Airport Sorting Dock',
      remarks: 'Line-haul freight en route to destination hub.',
      updatedBy: 'Logistics Courier',
      eventTime: new Date().toISOString()
    }
  ];

  const currentStatus = delivery?.status || purchaseOrder?.status || 'IN_TRANSIT';

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-lg w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Consignment Waybill</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">Shipment Milestones</h3>
            <p className="text-xs font-mono font-medium text-[#121212] mt-1">{trackingNum} • {carrier}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        {/* Current Summary */}
        <div className="p-4 bg-white border border-[#121212]/20 flex justify-between items-center text-xs font-sans">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#121212]/60">Current Status</p>
            <h4 className="text-base font-serif text-[#121212] mt-0.5">{currentStatus.replace(/_/g, ' ')}</h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[#121212]/60">PO Reference</p>
            <h4 className="text-xs font-mono font-medium text-[#121212] mt-0.5">
              {delivery?.poNumber || purchaseOrder?.poNumber || 'PO-2026-00125'}
            </h4>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-[#121212]/70">Custody Milestones</h4>
          
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#121212]/30">
            {history.map((item, idx) => (
              <div key={item.id} className="relative group font-sans">
                <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border border-[#121212] flex items-center justify-center ${
                  idx === history.length - 1 ? 'bg-[#121212]' : 'bg-[#EAE5D9]'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${idx === history.length - 1 ? 'bg-white' : 'bg-[#121212]'}`} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm text-[#121212]">{item.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono text-[#121212]/50">
                      {new Date(item.eventTime).toLocaleTimeString()} • {new Date(item.eventTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#121212]/80 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#121212]/50" /> {item.location}
                  </p>
                  <p className="text-[11px] font-serif italic text-[#121212]/60">"{item.remarks}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 bg-white border border-[#121212]/20 flex items-center gap-2 text-xs font-serif italic text-[#121212]/75">
          <ShieldCheck className="w-4 h-4 text-[#121212] shrink-0" />
          <span>Real-time webhook sync active. Confirmation updates warehouse inventory automatically.</span>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#121212]/15">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#121212] text-[#F9F7F2] border border-[#121212] text-[10px] font-sans uppercase tracking-[0.2em] font-medium hover:bg-[#2A2A2A] cursor-pointer"
          >
            Close Waybill
          </button>
        </div>
      </div>
    </div>
  );
};
