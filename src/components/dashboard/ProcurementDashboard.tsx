import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  Star, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Plus, 
  ArrowRight, 
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { PurchaseRequest, PurchaseOrder, Product, Supplier, SupplierRecommendation } from '../../types/procurement';

interface Props {
  onCreatePO: (pr?: PurchaseRequest, preselectedProductId?: string) => void;
  onViewPO: (po: PurchaseOrder) => void;
  onRejectRequest?: (pr: PurchaseRequest) => void;
}

export const ProcurementDashboard: React.FC<Props> = ({ onCreatePO, onViewPO, onRejectRequest }) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [selectedProductForScoring, setSelectedProductForScoring] = useState<string>(state.products[0]?.id || '');
  const [showWeightSliders, setShowWeightSliders] = useState(false);

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const lowStockProducts = state.products.filter(p => p.availableQuantity <= p.minimumStock);
  const approvedRequests = state.purchaseRequests.filter(r => r.status === 'APPROVED');
  const activePOs = state.purchaseOrders;

  const recommendations = selectedProductForScoring 
    ? procurementStore.getSupplierRecommendations(selectedProductForScoring)
    : [];

  const selectedProd = state.products.find(p => p.id === selectedProductForScoring);

  const handleWeightChange = (key: keyof typeof state.scoringWeights, val: number) => {
    procurementStore.updateScoringWeights({ [key]: val });
  };

  return (
    <div id="procurement-dashboard" className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Procurement & Supply Chain Management
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">Algorithmic Vendor Selection</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Procurement Operations
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Automated low-inventory thresholds, multi-factor supplier evaluation matrices, and purchase order fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onCreatePO()}
            className="flex items-center gap-3 px-6 py-3.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] font-sans uppercase tracking-[0.2em] text-xs font-medium transition cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#F4F0E8] border border-[#121212]/20 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#121212]/15 pb-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-[#121212]" />
              <h3 className="font-serif text-lg text-[#121212]">
                Inventory Deficit Alerts ({lowStockProducts.length} SKU Below Safety Buffer)
              </h3>
            </div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">
              stock &le; threshold
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStockProducts.map(p => {
              const shortfall = p.minimumStock * 2 - p.availableQuantity;
              return (
                <div key={p.id} className="bg-[#FFFFFF] p-5 border border-[#121212]/20 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#121212]/60">{p.productCode}</span>
                      <span className="px-2 py-0.5 border border-[#121212] text-[#121212] text-[9px] font-sans uppercase tracking-wider font-semibold">
                        {p.availableQuantity} in Stock
                      </span>
                    </div>
                    <h4 className="font-serif text-lg text-[#121212] mt-1.5">{p.name}</h4>
                    <p className="text-xs font-sans text-[#121212]/60 mt-1">
                      Min Threshold: {p.minimumStock} • Target: {p.minimumStock * 2}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#121212]/10">
                    <span className="text-xs font-serif italic text-[#121212]">Shortfall: {shortfall} {p.unit}</span>
                    <button
                      onClick={() => {
                        setSelectedProductForScoring(p.id);
                        onCreatePO(undefined, p.id);
                      }}
                      className="px-3.5 py-1.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] font-medium transition cursor-pointer"
                    >
                      Restock PO &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Approved Requests Waiting for PO Conversion */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Conversion Queue</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Authorized Requisitions Pending PO Generation ({approvedRequests.length})
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Ready for vendor assignment</span>
        </div>

        {approvedRequests.length === 0 ? (
          <p className="text-xs font-serif italic text-[#121212]/50 py-4">No authorized requisitions awaiting PO generation at this moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedRequests.map(req => (
              <div key={req.id} className="p-5 border border-[#121212]/20 bg-[#F9F7F2] flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium bg-white px-2 py-0.5 border border-[#121212]/20">
                      {req.requestNumber}
                    </span>
                    <span className="font-serif text-sm font-medium text-[#121212]">₹{req.estimatedAmount.toLocaleString()}</span>
                  </div>
                  <h4 className="font-serif text-base text-[#121212] mt-2">
                    {req.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </h4>
                  <p className="text-xs font-sans text-[#121212]/60 mt-1">Requester: {req.requestedByName} ({req.department})</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#121212]/10">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60">All Approvals Sealed</span>
                  <button
                    onClick={() => onCreatePO(req)}
                    className="px-4 py-2 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] font-medium flex items-center gap-2 cursor-pointer transition"
                  >
                    Select Vendor & Create PO <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier Recommendation Engine */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#121212]/15 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Multi-Factor Optimization</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Supplier Evaluation Matrix
            </h3>
            <p className="text-xs font-sans text-[#121212]/65 mt-1">
              Weighted scoring: Price (35%), Quality (20%), Lead Time (20%), Rating (15%), Reliability (10%)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedProductForScoring}
              onChange={e => setSelectedProductForScoring(e.target.value)}
              className="px-3.5 py-2 text-xs font-sans bg-white border border-[#121212] text-[#121212] cursor-pointer"
            >
              {state.products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.productCode})</option>
              ))}
            </select>

            <button
              onClick={() => setShowWeightSliders(!showWeightSliders)}
              className="flex items-center gap-2 px-3.5 py-2 border border-[#121212] bg-white hover:bg-[#121212] hover:text-[#F9F7F2] text-[#121212] text-[10px] font-sans uppercase tracking-[0.15em] font-medium cursor-pointer transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showWeightSliders ? 'Hide Coefficients' : 'Adjust Coefficients'}
            </button>
          </div>
        </div>

        {/* Dynamic Weight Sliders */}
        {showWeightSliders && (
          <div className="p-5 bg-[#F4F0E8] border border-[#121212]/20 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-sans">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">
                Price ({(state.scoringWeights.priceWeight * 100).toFixed(0)}%)
              </label>
              <input 
                type="range" min="0.05" max="0.60" step="0.05" 
                value={state.scoringWeights.priceWeight}
                onChange={e => handleWeightChange('priceWeight', parseFloat(e.target.value))}
                className="w-full accent-[#121212]" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">
                Quality ({(state.scoringWeights.qualityWeight * 100).toFixed(0)}%)
              </label>
              <input 
                type="range" min="0.05" max="0.60" step="0.05" 
                value={state.scoringWeights.qualityWeight}
                onChange={e => handleWeightChange('qualityWeight', parseFloat(e.target.value))}
                className="w-full accent-[#121212]" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">
                Delivery ({(state.scoringWeights.deliveryWeight * 100).toFixed(0)}%)
              </label>
              <input 
                type="range" min="0.05" max="0.60" step="0.05" 
                value={state.scoringWeights.deliveryWeight}
                onChange={e => handleWeightChange('deliveryWeight', parseFloat(e.target.value))}
                className="w-full accent-[#121212]" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">
                Rating ({(state.scoringWeights.ratingWeight * 100).toFixed(0)}%)
              </label>
              <input 
                type="range" min="0.05" max="0.60" step="0.05" 
                value={state.scoringWeights.ratingWeight}
                onChange={e => handleWeightChange('ratingWeight', parseFloat(e.target.value))}
                className="w-full accent-[#121212]" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">
                Reliability ({(state.scoringWeights.reliabilityWeight * 100).toFixed(0)}%)
              </label>
              <input 
                type="range" min="0.05" max="0.60" step="0.05" 
                value={state.scoringWeights.reliabilityWeight}
                onChange={e => handleWeightChange('reliabilityWeight', parseFloat(e.target.value))}
                className="w-full accent-[#121212]" 
              />
            </div>
          </div>
        )}

        {/* Recommendations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.supplier.id}
              className={`p-6 border relative flex flex-col justify-between ${
                index === 0 ? 'bg-[#F9F7F2] border-[#121212]' : 'bg-[#FFFFFF] border-[#121212]/20'
              }`}
            >
              {index === 0 && (
                <span className="absolute -top-3 right-6 bg-[#121212] text-[#F9F7F2] text-[9px] font-sans uppercase tracking-[0.2em] px-3 py-0.5 border border-[#121212]">
                  Rank 1 Recommendation
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg text-[#121212]">{rec.supplier.companyName}</h4>
                  <div className="flex items-center gap-1 border border-[#121212]/20 px-2 py-0.5 text-xs font-mono font-medium">
                    <Star className="w-3 h-3 fill-[#121212] text-[#121212]" />
                    {rec.supplier.rating}
                  </div>
                </div>
                <p className="text-xs font-serif italic text-[#121212]/60 mt-0.5">{rec.supplier.city}, {rec.supplier.state}</p>

                <div className="mt-4 p-3.5 bg-white border border-[#121212]/15 space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#121212]/60">Unit Price:</span>
                    <span className="font-serif font-medium text-sm text-[#121212]">₹{rec.productSupplier.unitPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#121212]/60">Avg Lead Time:</span>
                    <span className="text-[#121212]">{rec.productSupplier.leadTimeDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#121212]/60">Quality Index:</span>
                    <span className="text-[#121212] font-mono">{rec.qualityScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#121212]/60">Delivery SLA:</span>
                    <span className="text-[#121212] font-mono">{rec.deliveryScore}/100</span>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-[#121212]/10 pt-3">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-[#121212]/60">Algorithmic Score:</span>
                  <span className="text-2xl font-serif text-[#121212]">
                    {rec.finalScore} <span className="text-xs font-sans opacity-50">/ 100</span>
                  </span>
                </div>
                <p className="text-[11px] font-serif italic text-[#121212]/75 mt-2 leading-relaxed">
                  "{rec.recommendationReason}"
                </p>
              </div>

              <button
                onClick={() => onCreatePO(undefined, selectedProductForScoring)}
                className={`mt-6 w-full py-2.5 text-[10px] font-sans uppercase tracking-[0.2em] font-medium transition cursor-pointer flex items-center justify-center gap-2 border ${
                  index === 0 
                    ? 'bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border-[#121212]' 
                    : 'bg-white hover:bg-[#121212] hover:text-[#F9F7F2] text-[#121212] border-[#121212]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Select Vendor & Issue PO
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Purchase Orders Overview */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Master Ledger</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Purchase Orders Register
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">{activePOs.length} Total Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#121212]">
            <thead className="bg-[#F4F0E8] border-b border-[#121212]/15 font-sans text-[10px] uppercase tracking-[0.2em] text-[#121212]/60">
              <tr>
                <th className="py-3 px-4">PO #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AWB / Airway Bill</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212]/10 font-sans">
              {activePOs.map(po => (
                <tr key={po.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#121212]">{po.poNumber}</td>
                  <td className="py-3.5 px-4 font-medium text-[#121212]">{po.supplierName}</td>
                  <td className="py-3.5 px-4 truncate max-w-xs text-[#121212]/80">{po.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                  <td className="py-3.5 px-4 font-serif">₹{po.subtotal.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-serif font-medium text-sm text-[#121212]">₹{po.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 border border-[#121212]/20 text-[9px] font-sans uppercase tracking-wider bg-white">
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#121212]/60">{po.trackingNumber || 'Pending Dispatch'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewPO(po)}
                      className="px-3 py-1 bg-white border border-[#121212] hover:bg-[#121212] hover:text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] transition cursor-pointer"
                    >
                      Inspect
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
