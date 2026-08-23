import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ArrowRight, 
  Package, 
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { Delivery, DeliveryStatus } from '../../types/procurement';

interface Props {
  onViewDelivery: (d: Delivery) => void;
}

export const DeliveryDashboard: React.FC<Props> = ({ onViewDelivery }) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [nextStatus, setNextStatus] = useState<DeliveryStatus>('IN_TRANSIT');
  const [locationInput, setLocationInput] = useState('');
  const [remarksInput, setRemarksInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const deliveries = state.deliveries;
  const activeDeliveries = deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'FAILED');
  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED');

  const statusProgression: DeliveryStatus[] = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const getNextStatus = (current: DeliveryStatus): DeliveryStatus => {
    const idx = statusProgression.indexOf(current);
    if (idx >= 0 && idx < statusProgression.length - 1) {
      return statusProgression[idx + 1];
    }
    return 'DELIVERED';
  };

  const handleFastAdvance = (del: Delivery) => {
    const target = getNextStatus(del.status);
    let loc = 'Transit Hub';
    let rem = `Updated to ${target}`;
    if (target === 'IN_TRANSIT') { loc = 'Delhi Regional Airport Cargo Terminal'; rem = 'Line haul freight en route.'; }
    if (target === 'OUT_FOR_DELIVERY') { loc = 'Gurugram Express Dispatch Station'; rem = 'Out with delivery agent for doorstep drop.'; }
    if (target === 'DELIVERED') { loc = 'SmartProcure Receiving Dock Gate 2'; rem = 'Package handed over and inventory reconciled.'; }

    const res = procurementStore.updateDeliveryStatus(del.id, target, loc, rem);
    if (res.success) {
      setMessage(res.message);
      if (target === 'DELIVERED') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div id="delivery-dashboard" className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Logistics & Courier Desk — Courier Agent Console
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">Last-Mile Freight & Custody</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Consignment Logistics Desk
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Record physical transit checkpoints and custody handovers. Finalizing delivery automatically reconciles and increments central warehouse stock.
          </p>
        </div>
        <div className="text-right p-5 bg-[#F9F7F2] border border-[#121212]/20 min-w-[200px]">
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Active Consignments</p>
          <h3 className="text-3xl font-serif font-normal text-[#121212] mt-1">{activeDeliveries.length} In Transit</h3>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-[#FFFFFF] border border-[#121212] text-[#121212] text-xs font-sans flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#121212] shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Active Deliveries */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">In-Transit Freight</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Active Shipments in Route ({activeDeliveries.length})
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Real-time GPS Milestones</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#121212]/20 p-16 text-center">
            <Truck className="w-10 h-10 text-[#121212]/30 mx-auto mb-3 stroke-[1.2]" />
            <h4 className="font-serif text-lg text-[#121212]">No Active Consignments in Transit</h4>
            <p className="text-xs font-sans text-[#121212]/60 mt-1 max-w-sm mx-auto">
              New parcels will appear here once vendors dispatch purchase orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeDeliveries.map(del => {
              const currentStepIdx = statusProgression.indexOf(del.status);
              return (
                <div key={del.id} className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#121212]/10 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-[#121212] text-sm">{del.trackingNumber}</span>
                        <span className="px-2.5 py-0.5 border border-[#121212] text-[#121212] font-sans text-[10px] uppercase tracking-wider font-semibold bg-[#F9F7F2]">
                          {del.carrier}
                        </span>
                        <span className="text-xs font-sans text-[#121212]/60">PO Ref: <strong className="font-mono text-[#121212]">{del.poNumber}</strong></span>
                      </div>
                      <p className="text-xs font-sans text-[#121212]/75 mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#121212]/50" /> Destination: {del.shippingAddress}, {del.city}, {del.state}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onViewDelivery(del)}
                        className="px-3.5 py-2 bg-white border border-[#121212]/30 hover:border-[#121212] text-[#121212] text-[10px] font-sans uppercase tracking-[0.15em] font-medium cursor-pointer transition"
                      >
                        Timeline ({del.trackingHistory.length})
                      </button>
                      <button
                        onClick={() => handleFastAdvance(del)}
                        className="px-4 py-2 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] font-sans uppercase tracking-[0.2em] font-medium flex items-center gap-2 cursor-pointer transition shadow-xs"
                      >
                        Advance &rarr; {getNextStatus(del.status)}
                      </button>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {statusProgression.map((st, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={st} className="space-y-1.5">
                            <div className={`h-1.5 transition-colors ${
                              isDone ? 'bg-[#121212]' : 'bg-[#EAE5D9]'
                            }`} />
                            <span className={`text-[9px] block font-sans uppercase tracking-wider truncate ${
                              isCurrent ? 'text-[#121212] font-bold' : isDone ? 'text-[#121212]/80' : 'text-[#121212]/30'
                            }`}>
                              {st.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Latest Milestone Note */}
                  {del.trackingHistory.length > 0 && (
                    <div className="p-3.5 bg-[#F9F7F2] border border-[#121212]/15 text-xs font-sans flex justify-between items-center text-[#121212]">
                      <div>
                        <strong>Latest Checkpoint:</strong> {del.trackingHistory[del.trackingHistory.length - 1].location}
                        <span className="font-serif italic text-[#121212]/60 ml-2">"{del.trackingHistory[del.trackingHistory.length - 1].remarks}"</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#121212]/50">
                        {new Date(del.trackingHistory[del.trackingHistory.length - 1].eventTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Shipments */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Completed Custody</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Delivered & Inventory-Reconciled Consignments ({completedDeliveries.length})
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Stock Auto-Updated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#121212]">
            <thead className="bg-[#F4F0E8] border-b border-[#121212]/15 font-sans text-[10px] uppercase tracking-[0.2em] text-[#121212]/60">
              <tr>
                <th className="py-3 px-4">Tracking #</th>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Delivery Timestamp</th>
                <th className="py-3 px-4">Warehouse Stock</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212]/10 font-sans">
              {completedDeliveries.map(d => (
                <tr key={d.id} className="hover:bg-[#F9F7F2]/60">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#121212]">{d.trackingNumber}</td>
                  <td className="py-3.5 px-4 font-mono">{d.poNumber}</td>
                  <td className="py-3.5 px-4">{d.carrier}</td>
                  <td className="py-3.5 px-4 font-serif">{new Date(d.actualDeliveryDate || d.updatedAt).toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 border border-[#121212]/20 font-sans text-[9px] uppercase tracking-wider bg-white">
                      ✓ Auto-Incremented
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewDelivery(d)}
                      className="px-3 py-1 bg-white border border-[#121212] hover:bg-[#121212] hover:text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] transition cursor-pointer"
                    >
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
