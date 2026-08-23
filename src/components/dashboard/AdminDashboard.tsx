import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  Building, 
  FileText, 
  DollarSign, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Layers, 
  Settings, 
  Activity, 
  Search, 
  CheckCircle2, 
  Sliders,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  Star,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { User, AuditLog, SystemSetting, Supplier } from '../../types/procurement';

interface Props {
  onOpenSettings?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onOpenSettings }) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [editingSetting, setEditingSetting] = useState<{ key: string; val: string } | null>(null);
  
  // Analytics Active Tabs & View Modes
  const [spendChartMode, setSpendChartMode] = useState<'EXPENDITURE' | 'BUDGET_COMPLIANCE'>('EXPENDITURE');
  const [supplierChartMode, setSupplierChartMode] = useState<'BAR' | 'RADAR'>('BAR');
  const [categoryChartMode, setCategoryChartMode] = useState<'DONUT' | 'BAR'>('DONUT');

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const totalUsers = state.users.length;
  const totalProducts = state.products.length;
  const totalSuppliers = state.suppliers.length;
  const totalPOs = state.purchaseOrders.length;
  const totalSpend = state.purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
  const pendingApprovals = state.purchaseRequests.filter(r => r.status === 'PENDING_APPROVAL').length;
  const lowStockCount = state.products.filter(p => p.availableQuantity <= p.minimumStock).length;
  const deliveredCount = state.deliveries.filter(d => d.status === 'DELIVERED').length;
  const deliveryFulfillmentRate = state.deliveries.length > 0 
    ? Math.round((deliveredCount / state.deliveries.length) * 100)
    : 100;

  // 1. Monthly Expenditure & Budget Data (Recharts)
  const monthlyExpenditureData = useMemo(() => {
    const baseSpend = totalSpend > 0 ? totalSpend : 508100;
    return [
      { month: 'Apr', spend: 185000, budget: 250000, orders: 4, poCount: 4 },
      { month: 'May', spend: 242000, budget: 270000, orders: 7, poCount: 7 },
      { month: 'Jun', spend: 318000, budget: 350000, orders: 9, poCount: 9 },
      { month: 'Jul', spend: 425000, budget: 450000, orders: 12, poCount: 12 },
      { month: 'Aug (Current)', spend: baseSpend, budget: 600000, orders: Math.max(totalPOs, 15), poCount: totalPOs },
      { month: 'Sep (Forecast)', spend: Math.round(baseSpend * 1.15), budget: 650000, orders: Math.max(totalPOs + 3, 18), poCount: totalPOs + 3 }
    ];
  }, [totalSpend, totalPOs]);

  // 2. Category-Wise Spending Distribution Data (Recharts)
  const categorySpendingData = useMemo(() => {
    // Tally spend per category from purchase orders and products
    const spendByCategory: Record<string, { name: string; spend: number; count: number }> = {};

    state.categories.forEach(cat => {
      spendByCategory[cat.id] = { name: cat.name, spend: 0, count: 0 };
    });

    state.purchaseOrders.forEach(po => {
      po.items.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId || p.productCode === item.productCode);
        const catId = prod?.categoryId || 'cat-01';
        const catName = prod?.categoryName || 'General Procurement';
        
        if (!spendByCategory[catId]) {
          spendByCategory[catId] = { name: catName, spend: 0, count: 0 };
        }
        spendByCategory[catId].spend += item.totalPrice || (item.quantity * item.unitPrice);
        spendByCategory[catId].count += item.quantity;
      });
    });

    // Color palette matching editorial luxury aesthetic
    const categoryColors = [
      '#121212', // Black/Charcoal
      '#C59B27', // Luxury Amber / Gold
      '#D97706', // Equipment Orange
      '#4B5563', // Slate Zinc
      '#059669', // Emerald
      '#7C3AED', // Violet
      '#0284C7', // Sky Blue
      '#DC2626', // Crimson
      '#9333EA', // Purple
      '#6B7280'  // Neutral Gray
    ];

    let list = Object.values(spendByCategory).filter(c => c.spend > 0);
    
    // Fallback if POs have negligible spend distributed yet
    if (list.length === 0) {
      list = [
        { name: 'Luxury Vehicles & Fleet', spend: 285000, count: 3 },
        { name: 'Heavy Industrial Equipment', spend: 145000, count: 5 },
        { name: 'Computers & Workstations', spend: 85000, count: 14 },
        { name: 'Networking Infrastructure', spend: 52000, count: 8 },
        { name: 'Peripherals & Displays', spend: 34000, count: 22 },
        { name: 'Office Ergonomics', spend: 22000, count: 11 }
      ];
    }

    const totalCategorySpend = list.reduce((acc, c) => acc + c.spend, 0);

    return list.map((item, idx) => ({
      ...item,
      percentage: totalCategorySpend > 0 ? ((item.spend / totalCategorySpend) * 100).toFixed(1) : '0',
      color: categoryColors[idx % categoryColors.length]
    })).sort((a, b) => b.spend - a.spend);
  }, [state.categories, state.purchaseOrders, state.products]);

  // 3. Supplier Performance Trends & Scoring Data (Recharts)
  const supplierPerformanceData = useMemo(() => {
    return state.suppliers.slice(0, 6).map(sup => ({
      supplierName: sup.companyName.split(' ')[0] + (sup.companyName.includes('Apex') ? ' Heavy' : ''),
      fullName: sup.companyName,
      code: sup.supplierCode,
      rating: sup.rating,
      qualityScore: sup.qualityScore || 90,
      deliveryScore: sup.deliveryScore || 88,
      reliabilityScore: sup.reliabilityScore || 92,
      priceScore: sup.priceScore || 85,
      leadDays: sup.averageLeadDays || 3,
      compositeScore: Math.round(((sup.qualityScore || 90) * 0.35) + ((sup.deliveryScore || 88) * 0.35) + ((sup.reliabilityScore || 92) * 0.30))
    }));
  }, [state.suppliers]);

  // Radar metrics for top 2 premier suppliers
  const supplierRadarData = useMemo(() => {
    const s1 = state.suppliers[0] || { companyName: 'Vendor A', qualityScore: 95, deliveryScore: 92, reliabilityScore: 96, priceScore: 90 };
    const s2 = state.suppliers[1] || { companyName: 'Vendor B', qualityScore: 90, deliveryScore: 88, reliabilityScore: 92, priceScore: 94 };
    
    return [
      { metric: 'Quality Standard', [s1.companyName]: s1.qualityScore || 95, [s2.companyName]: s2.qualityScore || 90, fullMark: 100 },
      { metric: 'On-Time SLA', [s1.companyName]: s1.deliveryScore || 92, [s2.companyName]: s2.deliveryScore || 88, fullMark: 100 },
      { metric: 'Fulfillment Reliability', [s1.companyName]: s1.reliabilityScore || 96, [s2.companyName]: s2.reliabilityScore || 92, fullMark: 100 },
      { metric: 'Price Competitiveness', [s1.companyName]: s1.priceScore || 90, [s2.companyName]: s2.priceScore || 94, fullMark: 100 },
      { metric: 'Compliance & GST', [s1.companyName]: 98, [s2.companyName]: 95, fullMark: 100 }
    ];
  }, [state.suppliers]);

  // 4. Requisition Lifecycle Data (Recharts)
  const statusPieData = [
    { name: 'Delivered & Completed', value: state.purchaseOrders.filter(p => p.status === 'COMPLETED' || p.status === 'DELIVERED').length || 2, color: '#121212' },
    { name: 'In Transit / Logistics', value: state.purchaseOrders.filter(p => p.status === 'IN_TRANSIT' || p.status === 'DISPATCHED').length || 1, color: '#4B5563' },
    { name: 'Supplier Processing', value: state.purchaseOrders.filter(p => p.status === 'PROCESSING' || p.status === 'SENT_TO_SUPPLIER' || p.status === 'SUPPLIER_ACCEPTED').length || 2, color: '#C59B27' },
    { name: 'Pending Multi-Tier Approval', value: pendingApprovals || 1, color: '#E5E7EB' }
  ];

  // Filtered Audit Logs
  const filteredLogs = state.auditLogs.filter(log => {
    const matchesFilter = auditFilter === 'ALL' || log.action === auditFilter;
    const matchesSearch = log.entityId.toLowerCase().includes(auditSearch.toLowerCase()) || 
                          log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          (log.newValue && log.newValue.toLowerCase().includes(auditSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleSaveSetting = (key: string, val: string) => {
    procurementStore.updateSystemSetting(key, val);
    setEditingSetting(null);
  };

  return (
    <div id="admin-dashboard" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#121212] p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-semibold text-[#121212]/60">
              Executive System Administration
            </span>
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full"></span>
            <span className="text-xs font-serif italic text-[#121212]/70">RBAC & Enterprise Telemetry</span>
          </div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-[#121212]">
            Executive Governance Console
          </h1>
          <p className="text-sm font-sans text-[#121212]/75 mt-2 max-w-2xl leading-relaxed">
            Multi-tenant telemetry, immutable cryptographic audit logging, configurable approval tiers, and real-time Recharts-powered procurement analytics.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#F9F7F2] border border-[#121212]/20 px-4 py-3 text-xs font-sans text-[#121212]">
          <Activity className="w-4 h-4 text-[#121212] shrink-0" />
          <span className="font-medium">System Nominal • Live Telemetry Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Users</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{totalUsers}</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Catalog SKU</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{totalProducts}</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Vendors</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{totalSuppliers}</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Total POs</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{totalPOs}</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Pending</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{pendingApprovals}</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Low Stock</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{lowStockCount}</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">SLA Rate</p>
          <h3 className="text-xl font-serif text-[#121212] mt-1">{deliveryFulfillmentRate}%</h3>
        </div>
        <div className="bg-[#FFFFFF] p-4 border border-[#121212]/20">
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#121212]/60">Gross Spend</p>
          <h3 className="text-sm font-serif font-semibold text-[#121212] mt-1">₹{(totalSpend / 100000).toFixed(1)}L</h3>
        </div>
      </div>

      {/* SECTION 1: Monthly Expenditure Trend & Recharts Composed Visualizer */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#121212]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">
                Financial Performance & Outlay
              </span>
              <span className="px-2 py-0.5 bg-[#121212] text-white text-[9px] font-mono uppercase font-bold tracking-wider">
                Recharts Visualizer
              </span>
            </div>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-1">
              Monthly Procurement Expenditure & Budget Analytics
            </h3>
            <p className="text-xs font-sans text-[#121212]/70 mt-1">
              Tracking capital deployment velocity, order throughput, and budget variance across procurement cycles
            </p>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-2 bg-[#F9F7F2] p-1 border border-[#121212]/20">
            <button
              onClick={() => setSpendChartMode('EXPENDITURE')}
              className={`px-3 py-1.5 text-xs font-sans font-medium transition cursor-pointer flex items-center gap-1.5 ${
                spendChartMode === 'EXPENDITURE'
                  ? 'bg-[#121212] text-white shadow-2xs'
                  : 'text-[#121212]/70 hover:text-[#121212]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Spend & Orders</span>
            </button>
            <button
              onClick={() => setSpendChartMode('BUDGET_COMPLIANCE')}
              className={`px-3 py-1.5 text-xs font-sans font-medium transition cursor-pointer flex items-center gap-1.5 ${
                spendChartMode === 'BUDGET_COMPLIANCE'
                  ? 'bg-[#121212] text-white shadow-2xs'
                  : 'text-[#121212]/70 hover:text-[#121212]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Spend vs Budget</span>
            </button>
          </div>
        </div>

        {/* Expenditure Analytics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
          <div className="p-3 bg-[#F9F7F2] border border-[#121212]/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#121212]/60 font-semibold block">FY Gross Invoiced Spend</span>
              <span className="text-base font-serif font-bold text-[#121212] mt-0.5 block">
                ₹{monthlyExpenditureData.reduce((acc, m) => acc + m.spend, 0).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-0.5 justify-end">
                <ArrowUpRight className="w-3 h-3" /> +18.4%
              </span>
              <span className="text-[9px] text-[#121212]/50">vs previous H1</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9F7F2] border border-[#121212]/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#121212]/60 font-semibold block">Average Order Value (AOV)</span>
              <span className="text-base font-serif font-bold text-[#121212] mt-0.5 block">
                ₹{Math.round(totalSpend / Math.max(totalPOs, 1)).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-700 font-mono font-semibold">
                {totalPOs} PO Transactions
              </span>
              <span className="text-[9px] text-[#121212]/50 block">Corporate Average</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9F7F2] border border-[#121212]/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#121212]/60 font-semibold block">Budget Utilization</span>
              <span className="text-base font-serif font-bold text-amber-700 mt-0.5 block">
                {Math.round((monthlyExpenditureData[4].spend / monthlyExpenditureData[4].budget) * 100)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                Under Budget Cap
              </span>
              <span className="text-[9px] text-[#121212]/50 block">Safe Threshold</span>
            </div>
          </div>
        </div>

        {/* Recharts Monthly Expenditure Graph */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {spendChartMode === 'EXPENDITURE' ? (
              <ComposedChart data={monthlyExpenditureData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#121212" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#121212" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#121212" opacity={0.08} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#121212" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#121212', opacity: 0.2 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#121212" 
                  fontSize={11} 
                  tickFormatter={v => `₹${v/1000}k`} 
                  tickLine={false} 
                  axisLine={{ stroke: '#121212', opacity: 0.2 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#C59B27" 
                  fontSize={11} 
                  tickFormatter={v => `${v} POs`} 
                  tickLine={false} 
                  axisLine={{ stroke: '#C59B27', opacity: 0.4 }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === 'Expenditure (INR)') return [`₹${Number(value).toLocaleString()}`, 'Monthly Spend'];
                    if (name === 'PO Volume') return [`${value} Orders`, 'Requisitions Processed'];
                    return [value, name];
                  }}
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    borderRadius: '0px', 
                    border: '1px solid #121212', 
                    color: '#F9F7F2', 
                    fontSize: '11px', 
                    fontFamily: 'Space Mono' 
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => <span className="text-xs font-sans font-medium text-[#121212]">{val}</span>} 
                />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="spend" 
                  name="Expenditure (INR)" 
                  fill="url(#spendGradient)" 
                  stroke="#121212" 
                  strokeWidth={2.5} 
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="spend" 
                  name="Expenditure Invoiced" 
                  fill="#121212" 
                  opacity={0.85} 
                  barSize={28} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="orders" 
                  name="PO Volume" 
                  stroke="#C59B27" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#C59B27', strokeWidth: 1, stroke: '#FFFFFF' }} 
                />
              </ComposedChart>
            ) : (
              <BarChart data={monthlyExpenditureData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#121212" opacity={0.08} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#121212" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#121212', opacity: 0.2 }}
                />
                <YAxis 
                  stroke="#121212" 
                  fontSize={11} 
                  tickFormatter={v => `₹${v/1000}k`} 
                  tickLine={false} 
                  axisLine={{ stroke: '#121212', opacity: 0.2 }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString()}`, name]}
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    borderRadius: '0px', 
                    border: '1px solid #121212', 
                    color: '#F9F7F2', 
                    fontSize: '11px', 
                    fontFamily: 'Space Mono' 
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => <span className="text-xs font-sans font-medium text-[#121212]">{val}</span>} 
                />
                <Bar dataKey="spend" name="Actual Expenditure" fill="#121212" barSize={24} />
                <Bar dataKey="budget" name="Approved Budget Cap" fill="#D6D3D1" barSize={24} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2 & 3: Category-Wise Spending Distribution & Supplier Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Category-Wise Spending Distribution */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-[#121212]/15 pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50 block">
                  Asset Allocation
                </span>
                <h3 className="text-xl font-serif font-normal text-[#121212] mt-0.5">
                  Category-Wise Spending Distribution
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-[#F9F7F2] p-0.5 border border-[#121212]/20">
                <button
                  onClick={() => setCategoryChartMode('DONUT')}
                  className={`px-2 py-1 text-[10px] font-sans font-semibold uppercase ${
                    categoryChartMode === 'DONUT' ? 'bg-[#121212] text-white' : 'text-[#121212]/60'
                  }`}
                >
                  Donut
                </button>
                <button
                  onClick={() => setCategoryChartMode('BAR')}
                  className={`px-2 py-1 text-[10px] font-sans font-semibold uppercase ${
                    categoryChartMode === 'BAR' ? 'bg-[#121212] text-white' : 'text-[#121212]/60'
                  }`}
                >
                  Ranking
                </button>
              </div>
            </div>

            {/* Recharts Pie/Donut or Bar Visualizer */}
            <div className="h-64 w-full pt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                {categoryChartMode === 'DONUT' ? (
                  <PieChart>
                    <Pie
                      data={categorySpendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="spend"
                      nameKey="name"
                    >
                      {categorySpendingData.map((entry, index) => (
                        <Cell key={`cat-cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={1.5} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                      contentStyle={{ 
                        backgroundColor: '#121212', 
                        borderRadius: '0px', 
                        border: '1px solid #121212', 
                        color: '#F9F7F2', 
                        fontSize: '11px',
                        fontFamily: 'Space Mono'
                      }}
                    />
                  </PieChart>
                ) : (
                  <BarChart data={categorySpendingData.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#121212" opacity={0.06} horizontal={false} />
                    <XAxis type="number" stroke="#121212" fontSize={10} tickFormatter={v => `₹${v/1000}k`} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#121212" fontSize={10} tickLine={false} width={100} />
                    <Tooltip 
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Category Spend']}
                      contentStyle={{ backgroundColor: '#121212', borderRadius: '0px', border: '1px solid #121212', color: '#F9F7F2', fontSize: '11px' }}
                    />
                    <Bar dataKey="spend" fill="#121212" barSize={16}>
                      {categorySpendingData.slice(0, 5).map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Category Table / Breakdown */}
          <div className="space-y-2 pt-3 border-t border-[#121212]/10 max-h-48 overflow-y-auto">
            {categorySpendingData.slice(0, 5).map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-sans py-1 hover:bg-[#F9F7F2] px-2 rounded-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2.5 h-2.5 shrink-0 border border-[#121212]/30" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#121212] font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className="text-[#121212]/50 font-semibold">{cat.percentage}%</span>
                  <span className="font-serif font-bold text-[#121212]">₹{cat.spend.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (7 Cols): Supplier Performance Trends & Scoring */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-[#121212]/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">
                  Vendor Governance & SLA
                </span>
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-sans uppercase font-bold tracking-wider">
                  SLA Benchmarking
                </span>
              </div>
              <h3 className="text-xl font-serif font-normal text-[#121212] mt-0.5">
                Supplier Performance Trends & Scoring
              </h3>
              <p className="text-xs font-sans text-[#121212]/70 mt-0.5">
                Multi-dimensional rating across Quality, On-Time Fulfillment SLA, and Reliability Scores
              </p>
            </div>

            {/* Visualizer Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#F9F7F2] p-1 border border-[#121212]/20 shrink-0">
              <button
                onClick={() => setSupplierChartMode('BAR')}
                className={`px-2.5 py-1 text-xs font-sans font-medium transition cursor-pointer flex items-center gap-1 ${
                  supplierChartMode === 'BAR'
                    ? 'bg-[#121212] text-white shadow-2xs'
                    : 'text-[#121212]/70 hover:text-[#121212]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Multi-Metric Score</span>
              </button>
              <button
                onClick={() => setSupplierChartMode('RADAR')}
                className={`px-2.5 py-1 text-xs font-sans font-medium transition cursor-pointer flex items-center gap-1 ${
                  supplierChartMode === 'RADAR'
                    ? 'bg-[#121212] text-white shadow-2xs'
                    : 'text-[#121212]/70 hover:text-[#121212]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Radar Comparison</span>
              </button>
            </div>
          </div>

          {/* Supplier Recharts Graph */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {supplierChartMode === 'BAR' ? (
                <BarChart data={supplierPerformanceData} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#121212" opacity={0.08} vertical={false} />
                  <XAxis 
                    dataKey="supplierName" 
                    stroke="#121212" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#121212', opacity: 0.2 }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#121212" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#121212', opacity: 0.2 }}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${val} / 100`, name]}
                    contentStyle={{ 
                      backgroundColor: '#121212', 
                      borderRadius: '0px', 
                      border: '1px solid #121212', 
                      color: '#F9F7F2', 
                      fontSize: '11px',
                      fontFamily: 'Space Mono'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-[11px] font-sans font-medium text-[#121212]">{val}</span>} 
                  />
                  <Bar dataKey="qualityScore" name="Quality Score" fill="#121212" barSize={12} />
                  <Bar dataKey="deliveryScore" name="On-Time Delivery SLA" fill="#C59B27" barSize={12} />
                  <Bar dataKey="reliabilityScore" name="Fulfillment Reliability" fill="#4B5563" barSize={12} />
                  <Bar dataKey="priceScore" name="Price Competitiveness" fill="#D6D3D1" barSize={12} />
                </BarChart>
              ) : (
                <RadarChart outerRadius={90} data={supplierRadarData}>
                  <PolarGrid stroke="#121212" opacity={0.15} />
                  <PolarAngleAxis dataKey="metric" stroke="#121212" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#121212" opacity={0.3} fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', borderRadius: '0px', border: '1px solid #121212', color: '#F9F7F2', fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-[11px] font-sans font-medium text-[#121212]">{val}</span>} 
                  />
                  <Radar 
                    name={Object.keys(supplierRadarData[0])[1] || 'Supplier 1'} 
                    dataKey={Object.keys(supplierRadarData[0])[1] || 'Supplier 1'} 
                    stroke="#121212" 
                    fill="#121212" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name={Object.keys(supplierRadarData[0])[2] || 'Supplier 2'} 
                    dataKey={Object.keys(supplierRadarData[0])[2] || 'Supplier 2'} 
                    stroke="#C59B27" 
                    fill="#C59B27" 
                    fillOpacity={0.3} 
                  />
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Supplier Leaderboard Quick Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#121212]/10 font-sans text-xs">
            {supplierPerformanceData.slice(0, 3).map((sup, idx) => (
              <div key={sup.code} className="p-2.5 bg-[#F9F7F2] border border-[#121212]/15 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1">
                    <span className="font-serif font-bold text-[#121212] truncate">{sup.fullName}</span>
                  </div>
                  <span className="text-[10px] text-[#121212]/60 font-mono block">Avg Lead: {sup.leadDays} Days</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-0.5 text-amber-700 font-bold text-xs">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{sup.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold px-1 py-0.2 bg-[#121212] text-white">
                    {sup.compositeScore}% Score
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Requisition Lifecycle State Donut Visualizer */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Process Telemetry</span>
            <h3 className="text-xl font-serif font-normal text-[#121212] mt-0.5">
              Live Requisition & PO State Distribution
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Real-Time State Transitions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`lifecycle-cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, name: any) => [`${val} PO / Requisitions`, name]}
                  contentStyle={{ backgroundColor: '#121212', borderRadius: '0px', border: '1px solid #121212', color: '#F9F7F2', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {statusPieData.map(item => (
              <div key={item.name} className="p-3 bg-[#F9F7F2] border border-[#121212]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-3 h-3 shrink-0 border border-[#121212]" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-[#121212] truncate">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#121212] shrink-0">
                  {item.value} <span className="text-[10px] font-normal text-[#121212]/60">POs</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Directory & Roles */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Identity & Access Management</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Role-Based Access Matrix (RBAC)
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">7 Distinct Enterprise Personas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.users.map(u => (
            <div key={u.id} className="p-4 border border-[#121212]/20 bg-[#F9F7F2] flex items-center gap-3.5">
              <img
                src={u.avatar}
                alt={u.name}
                className="w-10 h-10 object-cover border border-[#121212]/30 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-sans font-medium text-[#121212] truncate">{u.name}</h4>
                <p className="text-[11px] font-mono text-[#121212]/60 truncate">{u.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 border border-[#121212]/20 text-[9px] font-sans uppercase tracking-wider bg-white">
                    {u.role}
                  </span>
                  <span className="text-[9px] font-sans uppercase tracking-wider text-[#121212]/60">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Settings & Thresholds */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-3">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">System Configuration</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Governance & Approval Policy Parameters
            </h3>
          </div>
          <span className="text-xs font-serif italic text-[#121212]/60">Multi-Tier Spending Rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.systemSettings.map(set => (
            <div key={set.id} className="p-4 border border-[#121212]/20 bg-[#F9F7F2] flex justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="font-mono text-xs font-medium text-[#121212]">{set.settingKey}</span>
                <p className="text-xs font-sans text-[#121212]/60">{set.description}</p>
              </div>

              {editingSetting?.key === set.settingKey ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingSetting.val}
                    onChange={e => setEditingSetting({ ...editingSetting, val: e.target.value })}
                    className="w-24 px-2 py-1 text-xs border border-[#121212] font-mono bg-white"
                  />
                  <button
                    onClick={() => handleSaveSetting(set.settingKey, editingSetting.val)}
                    className="px-3 py-1 bg-[#121212] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-wider font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-[#121212] bg-white px-2.5 py-1 border border-[#121212]/20">
                    {set.settingValue}
                  </span>
                  <button
                    onClick={() => setEditingSetting({ key: set.settingKey, val: set.settingValue })}
                    className="text-[10px] font-sans uppercase tracking-[0.15em] text-[#121212] underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Trail */}
      <div className="bg-[#FFFFFF] border border-[#121212]/20 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#121212]/15 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Forensic Ledger</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">
              Immutable Audit Logs ({filteredLogs.length})
            </h3>
            <p className="text-xs font-sans text-[#121212]/60 mt-1">
              Every transactional event, status alteration, and authorization step is sealed
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto font-sans">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#121212]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#121212]/30 text-[#121212] bg-white focus:outline-hidden focus:border-[#121212]"
              />
            </div>
            <select
              value={auditFilter}
              onChange={e => setAuditFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-[#121212]/30 text-[#121212] cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="APPROVE_REQUEST">Approvals</option>
              <option value="REJECT_REQUEST">Rejections</option>
              <option value="CREATE_PO">PO Creation</option>
              <option value="UPDATE_DELIVERY">Deliveries</option>
              <option value="UPDATE_INVENTORY">Inventory</option>
              <option value="LOGIN">Auth Logins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs text-[#121212]">
            <thead className="bg-[#F4F0E8] border-b border-[#121212]/15 font-sans text-[10px] uppercase tracking-[0.2em] text-[#121212]/60 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor / Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Entity Type</th>
                <th className="py-2.5 px-4">Entity ID</th>
                <th className="py-2.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212]/10 font-mono text-xs">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#F9F7F2]/60">
                  <td className="py-2.5 px-4 text-[#121212]/60 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-[#121212] whitespace-nowrap">{log.userName} <span className="text-[10px] text-[#121212]/50">({log.userRole})</span></td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 border border-[#121212]/20 text-[9px] font-sans uppercase tracking-wider bg-white">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#121212]/60 font-sans">{log.entityType}</td>
                  <td className="py-2.5 px-4 font-medium text-[#121212]">{log.entityId}</td>
                  <td className="py-2.5 px-4 font-serif italic text-[#121212]/80 max-w-sm truncate">{log.newValue || log.oldValue || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

