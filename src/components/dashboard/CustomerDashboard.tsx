import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Check, 
  Truck, 
  Star, 
  ArrowRight, 
  Package, 
  Layers
} from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { Product, PurchaseOrder } from '../../types/procurement';

interface Props {
  onRequestProduct: (product: Product) => void;
  onViewPO: (po: PurchaseOrder) => void;
}

export const CustomerDashboard: React.FC<Props> = ({ onRequestProduct, onViewPO }) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const filteredProducts = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.productCode.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const completedOrActiveOrders = state.purchaseOrders.slice(0, 4);

  return (
    <div id="customer-dashboard" className="space-y-8">
      {/* Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Enterprise Catalog & Requisitions
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">Verified Hardware & IT Asset Catalog</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Hardware & Asset Catalog
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Browse verified institutional catalog items with pre-negotiated tier rates, certified warranties, and real-time inventory levels.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#121212]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by keyword or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs font-sans border border-[#121212]/30 text-[#121212] placeholder-[#121212]/40 focus:outline-hidden focus:border-[#121212]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 font-sans">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-medium whitespace-nowrap transition cursor-pointer border ${
              selectedCat === 'ALL' 
                ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]' 
                : 'bg-white text-[#121212] border-[#121212]/20 hover:border-[#121212]'
            }`}
          >
            All Collections
          </button>
          {state.categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-medium whitespace-nowrap transition cursor-pointer border ${
                selectedCat === c.id 
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]' 
                  : 'bg-white text-[#121212] border-[#121212]/20 hover:border-[#121212]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(prod => {
          const isLow = prod.availableQuantity <= prod.minimumStock;
          return (
            <div key={prod.id} className="bg-[#FFFFFF] border border-[#121212]/20 hover:border-[#121212] transition-colors flex flex-col justify-between">
              <div>
                <div className="h-48 bg-[#F4F0E8] relative overflow-hidden border-b border-[#121212]/10">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 bg-[#121212] text-[#F9F7F2] text-[9px] font-mono font-medium px-2 py-0.5 border border-[#121212]">
                    {prod.productCode}
                  </span>
                  {isLow && (
                    <span className="absolute top-3 right-3 bg-white text-[#121212] text-[9px] font-sans uppercase tracking-wider font-semibold px-2 py-0.5 border border-[#121212]">
                      Low Stock: {prod.availableQuantity} Left
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">
                    {prod.categoryName}
                  </div>
                  <h4 className="font-serif text-lg text-[#121212] line-clamp-1">{prod.name}</h4>
                  <p className="text-xs font-sans text-[#121212]/70 line-clamp-2 leading-relaxed">{prod.description}</p>
                  
                  <div className="pt-2 flex justify-between items-center text-xs font-sans border-t border-[#121212]/10">
                    <span className="text-[#121212]/60">Supplier Partner:</span>
                    <span className="font-medium text-[#121212]">{prod.supplierName}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#F9F7F2] border-t border-[#121212]/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-sans uppercase tracking-wider text-[#121212]/50 block">Standard Rate</span>
                  <span className="text-lg font-serif text-[#121212]">₹{prod.unitPrice.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => onRequestProduct(prod)}
                  className="px-4 py-2 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] font-sans uppercase tracking-[0.15em] font-medium flex items-center gap-2 transition cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Procure Item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Tracking */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Order History</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Recent Orders & Live Logistics Milestones
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Dispatched Orders</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedOrActiveOrders.map(po => (
            <div key={po.id} className="p-5 border border-[#121212]/20 bg-[#F9F7F2] flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-xs bg-white px-2 py-0.5 border border-[#121212]/20">{po.poNumber}</span>
                  <span className="px-2 py-0.5 border border-[#121212]/20 text-[9px] font-sans uppercase tracking-wider bg-white">
                    {po.status}
                  </span>
                </div>
                <p className="text-xs font-serif text-[#121212] mt-1.5">{po.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</p>
                <p className="text-[11px] font-sans text-[#121212]/60 mt-0.5">
                  Total: <strong className="text-[#121212] font-serif">₹{po.totalAmount.toLocaleString()}</strong> • AWB: <strong className="font-mono text-[#121212]">{po.trackingNumber || 'Pending'}</strong>
                </p>
              </div>
              <button
                onClick={() => onViewPO(po)}
                className="px-3.5 py-1.5 bg-white border border-[#121212] hover:bg-[#121212] hover:text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.15em] transition cursor-pointer"
              >
                Track
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
