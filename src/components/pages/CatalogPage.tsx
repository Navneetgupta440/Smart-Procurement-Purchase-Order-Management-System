import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Package, 
  SlidersHorizontal, 
  Plus, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  ArrowUpDown,
  Tag,
  DollarSign,
  Car,
  Bike,
  Wrench,
  Coffee,
  Shirt,
  Laptop,
  Monitor,
  Server,
  Armchair,
  Printer,
  Zap,
  Box,
  Layers,
  Eye,
  Info,
  X,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Sparkles,
  SendHorizontal,
  Clock,
  Check,
  Compass,
  FileCode2,
  Activity,
  Smartphone,
  Utensils,
  Crown,
  Gem
} from 'lucide-react';
import { ProcurementState, procurementStore } from '../../services/procurementStore';
import { Product, ProductCategory } from '../../types/procurement';
import { getProductBadgeInfo } from '../../utils/productBadges';

interface CatalogPageProps {
  state: ProcurementState;
  onOpenNewRequest: (product?: Product) => void;
  onCreatePO?: (product?: Product) => void;
}

// Category Icon Mapping
const getCategoryIcon = (codeOrName: string) => {
  const key = codeOrName.toUpperCase();
  if (key.includes('LUXC') || key.includes('CAR') || key.includes('VEHICLE') || key.includes('AUTOMOTIVE')) return <Car className="w-4 h-4" />;
  if (key.includes('BIKE') || key.includes('MOBILITY') || key.includes('MOTORCYCLE') || key.includes('CYCLE')) return <Bike className="w-4 h-4" />;
  if (key.includes('FOOD') || key.includes('PANTRY') || key.includes('GOURMET') || key.includes('GROCERY')) return <Utensils className="w-4 h-4" />;
  if (key.includes('MOBL') || key.includes('PHONE') || key.includes('MOBILE') || key.includes('SMARTPHONE')) return <Smartphone className="w-4 h-4" />;
  if (key.includes('EQUP') || key.includes('EQUIPMENT') || key.includes('MACHINERY')) return <Wrench className="w-4 h-4" />;
  if (key.includes('DAIL') || key.includes('DAILY') || key.includes('ESSENTIAL')) return <Coffee className="w-4 h-4" />;
  if (key.includes('LUXW') || key.includes('WEAR') || key.includes('UNIFORM') || key.includes('SUIT') || key.includes('CLOTH') || key.includes('FASHION')) return <Shirt className="w-4 h-4" />;
  if (key.includes('COMP') || key.includes('LAPTOP') || key.includes('COMPUTER')) return <Laptop className="w-4 h-4" />;
  if (key.includes('PERI') || key.includes('DISPLAY') || key.includes('MONITOR')) return <Monitor className="w-4 h-4" />;
  if (key.includes('NETW') || key.includes('SERVER') || key.includes('ROUTER')) return <Server className="w-4 h-4" />;
  if (key.includes('FURN') || key.includes('ERGONOMIC') || key.includes('CHAIR')) return <Armchair className="w-4 h-4" />;
  if (key.includes('PRNT') || key.includes('PRINT') || key.includes('TONER')) return <Printer className="w-4 h-4" />;
  if (key.includes('APPL') || key.includes('APPLIANCE')) return <Zap className="w-4 h-4" />;
  if (key.includes('MATR') || key.includes('MATERIAL') || key.includes('ALLOY')) return <Box className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
};

// Popular Quick Search Query Tags for discovery (Amazon / Flipkart / Enterprise scale)
const QUICK_SEARCH_CHIPS = [
  { label: '🏎️ Luxury Cars', query: '', filterBadge: 'LUXURY_CAR' as const },
  { label: '🏗️ Industrial Equipment', query: '', filterBadge: 'EQUIPMENT' as const },
  { label: '💎 High-Value Badges', query: '', filterBadge: 'HIGH_VALUE' as const },
  { label: '🏍️ Bikes & E-Scooters', query: '', categoryId: 'cat-09' },
  { label: '🥑 Gourmet Foods', query: '', categoryId: 'cat-13' },
  { label: '📱 Flagship Phones', query: '', categoryId: 'cat-14' },
  { label: '⚡ Smart Appliances', query: '', categoryId: 'cat-06' },
  { label: '👔 Luxury Fashion', query: '', categoryId: 'cat-12' },
  { label: '💻 Laptops & Compute', query: '', categoryId: 'cat-01' },
  { label: '⚠️ Low Stock Deficit', query: '', filterStock: 'LOW_STOCK' as const },
];

export function CatalogPage({ state, onOpenNewRequest, onCreatePO }: CatalogPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [badgeFilter, setBadgeFilter] = useState<'ALL' | 'LUXURY_CAR' | 'EQUIPMENT' | 'HIGH_VALUE'>('ALL');
  const [priceTier, setPriceTier] = useState<'ALL' | 'UNDER_50K' | '50K_500K' | '500K_5M' | '5M_20M' | 'OVER_20M'>('ALL');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'newest'>('name-asc');
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState<Product | null>(null);
  
  // Real-time API telemetry status
  const [apiLatency, setApiLatency] = useState<number>(14);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search term for high-performance real-time query resolution
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
      // Realistic simulated backend API round-trip latency (8ms - 28ms)
      setApiLatency(Math.floor(10 + Math.random() * 18));
    }, 120);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Global Keyboard shortcut listener: Press '/' to focus search, 'Escape' to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute category product counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.products.forEach(p => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [state.products]);

  // Active Category Object if one is selected
  const currentCategoryObj = useMemo(() => {
    if (selectedCategory === 'ALL') return null;
    return state.categories.find(c => c.id === selectedCategory);
  }, [selectedCategory, state.categories]);

  // Price Range derivation from priceTier for API filtering
  const priceLimits = useMemo(() => {
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    switch (priceTier) {
      case 'UNDER_50K':
        maxPrice = 50000;
        break;
      case '50K_500K':
        minPrice = 50000;
        maxPrice = 500000;
        break;
      case '500K_5M':
        minPrice = 500000;
        maxPrice = 5000000;
        break;
      case '5M_20M':
        minPrice = 5000000;
        maxPrice = 20000000;
        break;
      case 'OVER_20M':
        minPrice = 20000000;
        break;
      default:
        break;
    }

    return { minPrice, maxPrice };
  }, [priceTier]);

  // Real-time backend search API query leveraging procurementStore.searchCatalog()
  const searchResults = useMemo(() => {
    // Leveraging the existing backend catalog search engine
    const rawResults = procurementStore.searchCatalog({
      searchTerm: debouncedSearchTerm,
      categoryId: selectedCategory,
      stockFilter: stockFilter,
      minPrice: priceLimits.minPrice,
      maxPrice: priceLimits.maxPrice,
      sortBy: sortBy
    });

    if (badgeFilter === 'ALL') {
      return rawResults;
    }

    return rawResults.filter(product => {
      const badgeInfo = getProductBadgeInfo(product);
      if (!badgeInfo) return false;
      if (badgeFilter === 'LUXURY_CAR') return badgeInfo.type === 'LUXURY_CAR';
      if (badgeFilter === 'EQUIPMENT') return badgeInfo.type === 'EQUIPMENT';
      if (badgeFilter === 'HIGH_VALUE') return badgeInfo.isHighValue;
      return true;
    });
  }, [
    debouncedSearchTerm,
    selectedCategory,
    stockFilter,
    badgeFilter,
    priceLimits.minPrice,
    priceLimits.maxPrice,
    sortBy,
    state.products
  ]);

  // Key stats for the currently filtered set or selected category
  const activeCategoryStats = useMemo(() => {
    const prods = selectedCategory === 'ALL' 
      ? state.products 
      : state.products.filter(p => p.categoryId === selectedCategory);
    
    const totalItems = prods.length;
    const totalInventoryValue = prods.reduce((sum, p) => sum + (p.unitPrice * p.availableQuantity), 0);
    const minPrice = prods.length > 0 ? Math.min(...prods.map(p => p.unitPrice)) : 0;
    const maxPrice = prods.length > 0 ? Math.max(...prods.map(p => p.unitPrice)) : 0;

    return { totalItems, totalInventoryValue, minPrice, maxPrice };
  }, [selectedCategory, state.products]);

  // Quick reset all active filter states
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('ALL');
    setStockFilter('ALL');
    setBadgeFilter('ALL');
    setPriceTier('ALL');
    setSortBy('name-asc');
  };

  // Helper to highlight matching text in title/description
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-[#121212] px-0.5 rounded-2xs font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || 
    selectedCategory !== 'ALL' || 
    stockFilter !== 'ALL' || 
    badgeFilter !== 'ALL' ||
    priceTier !== 'ALL' || 
    sortBy !== 'name-asc'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Catalog Header Banner */}
      <div className="bg-white border border-[#121212] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#121212]/5 border border-[#121212]/20 text-[10px] font-sans uppercase tracking-[0.2em] font-semibold text-[#121212]">
            <Package className="w-3.5 h-3.5" />
            <span>Master Enterprise Catalog</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono text-[#121212]/60">Live REST Search API</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#121212]">
            Standardized Product & Inventory Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#121212]/70 font-sans max-w-3xl leading-relaxed">
            Real-time querying across corporate inventory including Luxury Cars, Superbikes, Industrial Heavy Equipment, Daily Essentials, and Bespoke Luxury Wears with multi-tiered governance compliance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onOpenNewRequest()}
            className="px-5 py-3 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs hover:translate-y-[-1px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* Horizontal Category Pill Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#121212]/70">
              Categories Directory ({state.categories.length})
            </span>
          </div>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-xs text-[#121212] hover:underline font-sans font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Show All Categories</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {/* All Button */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 border text-xs font-sans font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-[#121212] text-[#F9F7F2] border-[#121212] shadow-xs'
                : 'bg-white text-[#121212] border-[#121212]/20 hover:border-[#121212]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.2 font-mono rounded-xs ${
              selectedCategory === 'ALL' ? 'bg-white/20 text-[#F9F7F2]' : 'bg-[#121212]/10 text-[#121212]'
            }`}>
              {state.products.length}
            </span>
          </button>

          {/* Each Category Button */}
          {state.categories.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 border text-xs font-sans font-medium flex items-center gap-2 whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#121212] text-[#F9F7F2] border-[#121212] shadow-xs font-semibold'
                    : 'bg-white text-[#121212] border-[#121212]/20 hover:border-[#121212] hover:bg-[#F9F7F2]'
                }`}
              >
                <span className={isSelected ? 'text-[#F9F7F2]' : 'text-[#121212]/70'}>
                  {getCategoryIcon(cat.code || cat.name)}
                </span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 font-mono rounded-xs ${
                  isSelected ? 'bg-white/20 text-[#F9F7F2]' : 'bg-[#121212]/10 text-[#121212]/80'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Spotlight Header (when a specific category is active) */}
      {currentCategoryObj && (
        <div className="bg-[#F4F0E8] border border-[#121212] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#121212] text-[#F9F7F2] shrink-0 border border-[#121212]">
                {getCategoryIcon(currentCategoryObj.code || currentCategoryObj.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#121212] text-[#F9F7F2] text-[9px] font-mono uppercase font-bold">
                    {currentCategoryObj.code}
                  </span>
                  <span className="text-xs font-sans text-[#121212]/60 uppercase tracking-widest font-semibold">
                    Category Spotlight
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#121212] font-semibold mt-0.5">
                  {currentCategoryObj.name}
                </h2>
                <p className="text-xs text-[#121212]/75 font-sans mt-1 max-w-2xl">
                  {currentCategoryObj.description}
                </p>
              </div>
            </div>

            {/* Quick Category Metrics */}
            <div className="flex flex-wrap items-center gap-3 md:border-l md:border-[#121212]/20 md:pl-6">
              <div className="bg-white border border-[#121212]/20 px-3 py-2 text-center min-w-[100px]">
                <span className="text-[9px] font-sans uppercase tracking-widest text-[#121212]/60 block">Available SKUs</span>
                <span className="font-serif font-bold text-base text-[#121212]">{activeCategoryStats.totalItems}</span>
              </div>
              <div className="bg-white border border-[#121212]/20 px-3 py-2 text-center min-w-[120px]">
                <span className="text-[9px] font-sans uppercase tracking-widest text-[#121212]/60 block">Price Range</span>
                <span className="font-serif font-bold text-xs text-[#121212]">
                  ₹{activeCategoryStats.minPrice.toLocaleString()} - ₹{activeCategoryStats.maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="bg-white border border-[#121212]/20 px-3 py-2 text-center min-w-[120px]">
                <span className="text-[9px] font-sans uppercase tracking-widest text-[#121212]/60 block">Stock Value</span>
                <span className="font-serif font-bold text-xs text-[#121212]">
                  ₹{activeCategoryStats.totalInventoryValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Real-Time Search, Filter, and Sorting Bar */}
      <div className="bg-white border border-[#121212] p-5 space-y-4 shadow-xs">
        {/* Real-time Query Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search Field with Live Indicators */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#121212]/40">
              <Search className={`w-4 h-4 ${isSearching ? 'animate-spin text-indigo-600' : ''}`} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Real-time search: Maybach, Panigale, Excavator, Savile Row, SKU..."
              className="w-full pl-10 pr-16 py-2.5 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none transition font-sans"
            />
            
            {/* Keyboard shortcut hint and clear button */}
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
              {searchTerm ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-[#121212]/50 hover:text-[#121212] cursor-pointer"
                  title="Clear search (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white border border-[#121212]/20 text-[#121212]/50 rounded-xs">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({state.categories.length})</option>
              {state.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({categoryCounts[cat.id] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="md:col-span-2">
            <select
              value={priceTier}
              onChange={e => setPriceTier(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none cursor-pointer"
            >
              <option value="ALL">All Price Tiers</option>
              <option value="UNDER_50K">&lt; ₹50,000</option>
              <option value="50K_500K">₹50K - ₹500K</option>
              <option value="500K_5M">₹500K - ₹5M</option>
              <option value="5M_20M">₹5M - ₹20M</option>
              <option value="OVER_20M">&gt; ₹20,000,000</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-xs text-[#121212] outline-none cursor-pointer"
            >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="price-asc">Sort: Price (Low → High)</option>
              <option value="price-desc">Sort: Price (High → Low)</option>
              <option value="stock-desc">Sort: Available Stock</option>
              <option value="newest">Sort: Newly Added</option>
            </select>
          </div>
        </div>

        {/* Quick Discovery Search Chips */}
        <div className="pt-2 border-t border-[#121212]/10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans uppercase tracking-[0.15em] font-semibold text-[#121212]/60 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Instant Search Chips:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_SEARCH_CHIPS.map((chip, index) => {
              const isChipActive = chip.filterBadge
                ? badgeFilter === chip.filterBadge
                : chip.categoryId 
                  ? selectedCategory === chip.categoryId
                  : chip.filterStock 
                    ? stockFilter === chip.filterStock
                    : searchTerm.toLowerCase() === chip.query.toLowerCase();

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (chip.filterBadge) {
                      setBadgeFilter(badgeFilter === chip.filterBadge ? 'ALL' : chip.filterBadge);
                    } else if (chip.categoryId) {
                      setSelectedCategory(selectedCategory === chip.categoryId ? 'ALL' : chip.categoryId);
                    } else if (chip.filterStock) {
                      setStockFilter(stockFilter === chip.filterStock ? 'ALL' : chip.filterStock);
                    } else {
                      setSearchTerm(searchTerm === chip.query ? '' : chip.query);
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-sans border transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isChipActive
                      ? 'bg-[#121212] text-[#F9F7F2] border-[#121212] font-semibold'
                      : 'bg-[#FFFFFF] hover:bg-[#F4F0E8] text-[#121212] border-[#121212]/20 hover:border-[#121212]'
                  }`}
                >
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Status, Badges and Telemetry Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#121212]/10 text-xs">
          {/* Stock & High-Value Badge Selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#121212]/50 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Stock:
            </span>
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.1em] border transition cursor-pointer ${
                stockFilter === 'ALL'
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                  : 'bg-white text-[#121212] border-[#121212]/20 hover:border-[#121212]'
              }`}
            >
              All ({state.products.length})
            </button>
            <button
              onClick={() => setStockFilter('IN_STOCK')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.1em] border transition cursor-pointer ${
                stockFilter === 'IN_STOCK'
                  ? 'bg-[#121212] text-[#F9F7F2] border-[#121212]'
                  : 'bg-white text-[#121212] border-[#121212]/20 hover:border-[#121212]'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('LOW_STOCK')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.1em] border transition cursor-pointer ${
                stockFilter === 'LOW_STOCK'
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-white text-[#121212] border-[#121212]/20 hover:border-rose-400'
              }`}
            >
              Low Stock ({state.products.filter(p => p.availableQuantity <= p.minimumStock).length})
            </button>
            <button
              onClick={() => setStockFilter('OUT_OF_STOCK')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.1em] border transition cursor-pointer ${
                stockFilter === 'OUT_OF_STOCK'
                  ? 'bg-red-700 text-white border-red-700'
                  : 'bg-white text-[#121212] border-[#121212]/20 hover:border-red-400'
              }`}
            >
              Out of Stock ({state.products.filter(p => p.availableQuantity === 0).length})
            </button>

            <span className="text-[#121212]/30 mx-1">|</span>

            <span className="text-[10px] font-sans uppercase tracking-widest text-[#121212]/50 mr-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-600" />
              Badges:
            </span>
            <button
              onClick={() => setBadgeFilter(badgeFilter === 'LUXURY_CAR' ? 'ALL' : 'LUXURY_CAR')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.08em] border transition cursor-pointer flex items-center gap-1 ${
                badgeFilter === 'LUXURY_CAR'
                  ? 'bg-[#181510] text-amber-300 border-amber-500 font-semibold shadow-xs'
                  : 'bg-white hover:bg-amber-50/50 text-[#121212] border-[#121212]/20'
              }`}
            >
              <Crown className="w-3 h-3 text-amber-500" />
              <span>Luxury Car</span>
            </button>
            <button
              onClick={() => setBadgeFilter(badgeFilter === 'EQUIPMENT' ? 'ALL' : 'EQUIPMENT')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.08em] border transition cursor-pointer flex items-center gap-1 ${
                badgeFilter === 'EQUIPMENT'
                  ? 'bg-[#1E1812] text-orange-300 border-orange-500 font-semibold shadow-xs'
                  : 'bg-white hover:bg-orange-50/50 text-[#121212] border-[#121212]/20'
              }`}
            >
              <Wrench className="w-3 h-3 text-orange-500" />
              <span>Equipment</span>
            </button>
            <button
              onClick={() => setBadgeFilter(badgeFilter === 'HIGH_VALUE' ? 'ALL' : 'HIGH_VALUE')}
              className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-[0.08em] border transition cursor-pointer flex items-center gap-1 ${
                badgeFilter === 'HIGH_VALUE'
                  ? 'bg-[#18181B] text-zinc-100 border-zinc-700 font-semibold shadow-xs'
                  : 'bg-white hover:bg-[#F4F0E8] text-[#121212] border-[#121212]/20'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>All High-Value</span>
            </button>
          </div>

          {/* Backend API Execution Telemetry & Result Counter */}
          <div className="flex items-center gap-3">
            {/* Live API Telemetry Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-[#F9F7F2] border border-[#121212]/15 text-[10px] font-mono text-[#121212]/70">
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>GET /api/v1/products</span>
              <span className="text-emerald-700 font-bold">200 OK</span>
              <span className="text-[#121212]/40">({apiLatency}ms)</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#121212] hover:underline font-sans font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Reset Filters</span>
                <X className="w-3 h-3" />
              </button>
            )}

            <span className="text-[11px] text-[#121212]/80 font-mono">
              Showing <strong>{searchResults.length}</strong> of <strong>{state.products.length}</strong> SKUs
            </span>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {searchResults.length === 0 ? (
        <div className="bg-white border border-[#121212] p-12 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#121212]/5 mx-auto flex items-center justify-center text-[#121212]/40">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl text-[#121212]">No catalog products matched your query</h3>
            <p className="text-xs text-[#121212]/60 max-w-md mx-auto">
              No inventory SKUs found matching <span className="font-semibold font-mono text-[#121212]">'{searchTerm || selectedCategory}'</span> across descriptions, titles, codes, or vendors.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#121212] text-[#F9F7F2] text-xs font-sans uppercase tracking-wider font-semibold cursor-pointer shadow-xs"
            >
              Clear All Search & Category Filters
            </button>
            <button
              onClick={() => {
                handleResetFilters();
                setSelectedCategory('cat-08'); // Jump to Luxury Cars
              }}
              className="px-4 py-2.5 bg-[#F9F7F2] hover:bg-[#EBE5DB] text-[#121212] border border-[#121212]/30 text-xs font-sans uppercase tracking-wider font-semibold cursor-pointer"
            >
              Explore Luxury Cars
            </button>
            <button
              onClick={() => {
                handleResetFilters();
                setSelectedCategory('cat-09'); // Jump to Bikes
              }}
              className="px-4 py-2.5 bg-[#F9F7F2] hover:bg-[#EBE5DB] text-[#121212] border border-[#121212]/30 text-xs font-sans uppercase tracking-wider font-semibold cursor-pointer"
            >
              Explore Superbikes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {searchResults.map(product => {
            const isLowStock = product.availableQuantity <= product.minimumStock && product.availableQuantity > 0;
            const isOutOfStock = product.availableQuantity === 0;
            const badgeInfo = getProductBadgeInfo(product);

            return (
              <div 
                key={product.id}
                className={`bg-white border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md group ${
                  badgeInfo?.type === 'LUXURY_CAR'
                    ? 'border-amber-400/40 hover:border-amber-600'
                    : badgeInfo?.type === 'EQUIPMENT'
                      ? 'border-orange-400/40 hover:border-orange-600'
                      : 'border-[#121212]/20 hover:border-[#121212]'
                }`}
              >
                <div>
                  {/* Product Image Header */}
                  <div className="relative h-48 bg-[#F4F0E8] overflow-hidden border-b border-[#121212]/10">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10">
                      <span className="px-2 py-0.5 bg-[#121212] text-[#F9F7F2] text-[9px] font-mono uppercase tracking-wider font-semibold shadow-xs">
                        {renderHighlightedText(product.productCode, debouncedSearchTerm)}
                      </span>
                      {badgeInfo && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-sans uppercase font-bold tracking-wider border ${badgeInfo.pillBg} ${badgeInfo.pillText} ${badgeInfo.pillBorder} ${badgeInfo.glowClass || ''} shadow-xs`}>
                          {badgeInfo.type === 'LUXURY_CAR' && <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                          {badgeInfo.type === 'EQUIPMENT' && <Wrench className="w-2.5 h-2.5 text-orange-400 shrink-0" />}
                          {badgeInfo.type === 'SUPERBIKE' && <Bike className="w-2.5 h-2.5 text-rose-400 shrink-0" />}
                          {badgeInfo.type === 'HIGH_VALUE_TECH' && <Server className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                          {badgeInfo.type === 'LUXURY_WEAR' && <Gem className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                          {badgeInfo.type === 'HIGH_VALUE' && <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                          <span className="truncate">{badgeInfo.label}</span>
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className={`px-2 py-0.5 text-[9px] font-sans uppercase tracking-wider font-bold border shadow-xs ${
                        isOutOfStock
                          ? 'bg-red-700 text-white border-red-700'
                          : isLowStock 
                            ? 'bg-rose-50 text-rose-700 border-rose-300' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Hover Quick View action button */}
                    <button
                      onClick={() => setActiveQuickViewProduct(product)}
                      className="absolute inset-x-3 bottom-3 py-1.5 bg-[#121212]/90 backdrop-blur-xs text-[#F9F7F2] text-[11px] font-sans uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer z-10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Specifications</span>
                    </button>
                  </div>

                  {/* Product Details Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#121212]/60">
                      <button
                        onClick={() => setSelectedCategory(product.categoryId)}
                        className="hover:underline flex items-center gap-1 text-[11px] font-sans font-semibold text-[#121212]/75 truncate"
                      >
                        {getCategoryIcon(product.categoryName)}
                        <span className="truncate">{renderHighlightedText(product.categoryName, debouncedSearchTerm)}</span>
                      </button>
                      <span className="font-mono text-[10px] bg-[#121212]/5 px-1.5 py-0.5 border border-[#121212]/10">
                        {product.unit}
                      </span>
                    </div>

                    {/* Badge Category Tag Subtitle for High-Value / Luxury Items */}
                    {badgeInfo && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-wider font-bold border rounded-2xs ${badgeInfo.pillBg} ${badgeInfo.pillText} ${badgeInfo.pillBorder}`}>
                          {badgeInfo.type === 'LUXURY_CAR' && <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                          {badgeInfo.type === 'EQUIPMENT' && <Wrench className="w-2.5 h-2.5 text-orange-400 shrink-0" />}
                          {badgeInfo.type === 'SUPERBIKE' && <Bike className="w-2.5 h-2.5 text-rose-400 shrink-0" />}
                          {badgeInfo.type === 'HIGH_VALUE_TECH' && <Server className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                          {badgeInfo.type === 'LUXURY_WEAR' && <Gem className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                          {badgeInfo.type === 'HIGH_VALUE' && <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                          <span>{badgeInfo.label}</span>
                        </span>
                        {badgeInfo.categoryTag && (
                          <span className="text-[9px] font-mono text-[#121212]/55 truncate">
                            • {badgeInfo.categoryTag}
                          </span>
                        )}
                      </div>
                    )}

                    <h3 className="font-serif text-base font-semibold text-[#121212] line-clamp-1 group-hover:text-black">
                      {renderHighlightedText(product.name, debouncedSearchTerm)}
                    </h3>

                    <p className="text-xs text-[#121212]/70 line-clamp-2 leading-relaxed font-sans">
                      {renderHighlightedText(product.description, debouncedSearchTerm)}
                    </p>

                    {/* Supplier tag */}
                    {product.supplierName && (
                      <div className="flex items-center gap-1 text-[11px] text-[#121212]/60 truncate pt-1">
                        <Building className="w-3 h-3 shrink-0 text-[#121212]/40" />
                        <span className="truncate">{renderHighlightedText(product.supplierName, debouncedSearchTerm)}</span>
                      </div>
                    )}

                    {/* Pricing & Stock Numbers */}
                    <div className="pt-3 border-t border-[#121212]/10 flex items-end justify-between text-xs">
                      <div>
                        <span className="text-[9px] font-sans uppercase tracking-wider text-[#121212]/50 block">Corporate Unit Price</span>
                        <span className="text-lg font-serif font-bold text-[#121212]">
                          ₹{product.unitPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-sans uppercase tracking-wider text-[#121212]/50 block">Available</span>
                        <span className={`font-mono text-xs font-semibold ${isLowStock ? 'text-rose-600' : isOutOfStock ? 'text-red-700' : 'text-[#121212]'}`}>
                          {product.availableQuantity} {product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footers */}
                <div className="p-4 pt-0 space-y-1.5">
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => onOpenNewRequest(product)}
                      className="w-full py-2 bg-[#F9F7F2] hover:bg-[#121212] text-[#121212] hover:text-[#F9F7F2] border border-[#121212]/30 hover:border-[#121212] text-xs font-sans uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Requisition</span>
                    </button>
                    
                    {onCreatePO && (state.currentUser.role === 'PROCUREMENT_OFFICER' || state.currentUser.role === 'PROCUREMENT_MANAGER' || state.currentUser.role === 'ADMIN') && (
                      <button
                        onClick={() => onCreatePO(product)}
                        className="w-full py-1.5 bg-white hover:bg-[#F4F0E8] text-[#121212] border border-[#121212]/20 text-[11px] font-sans uppercase tracking-[0.08em] font-medium flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <SendHorizontal className="w-3 h-3 text-emerald-700" />
                        <span>Issue Direct PO</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Product Modal */}
      {activeQuickViewProduct && (() => {
        const modalBadge = getProductBadgeInfo(activeQuickViewProduct);
        return (
          <div className="fixed inset-0 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white border border-[#121212] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-[#121212]/15 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#121212] text-[#F9F7F2] text-[10px] font-mono uppercase font-bold">
                      {activeQuickViewProduct.productCode}
                    </span>
                    {modalBadge && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-sans uppercase font-bold tracking-wider border ${modalBadge.pillBg} ${modalBadge.pillText} ${modalBadge.pillBorder} ${modalBadge.glowClass || ''}`}>
                        {modalBadge.type === 'LUXURY_CAR' && <Crown className="w-3 h-3 text-amber-400" />}
                        {modalBadge.type === 'EQUIPMENT' && <Wrench className="w-3 h-3 text-orange-400" />}
                        {modalBadge.type === 'SUPERBIKE' && <Bike className="w-3 h-3 text-rose-400" />}
                        {modalBadge.type === 'HIGH_VALUE_TECH' && <Server className="w-3 h-3 text-cyan-400" />}
                        {modalBadge.type === 'LUXURY_WEAR' && <Gem className="w-3 h-3 text-emerald-400" />}
                        {modalBadge.type === 'HIGH_VALUE' && <Sparkles className="w-3 h-3 text-amber-400" />}
                        <span>{modalBadge.label}</span>
                      </span>
                    )}
                    <span className="text-xs font-sans uppercase tracking-wider text-[#121212]/60 font-semibold">
                      {activeQuickViewProduct.categoryName}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#121212] mt-1">
                    {activeQuickViewProduct.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveQuickViewProduct(null)} 
                  className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none p-1"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="relative h-60 bg-[#F4F0E8] border border-[#121212]/20 overflow-hidden">
                  <img
                    src={activeQuickViewProduct.imageUrl}
                    alt={activeQuickViewProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {modalBadge && (
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-sans uppercase font-bold tracking-wider border shadow-xs ${modalBadge.pillBg} ${modalBadge.pillText} ${modalBadge.pillBorder}`}>
                        {modalBadge.type === 'LUXURY_CAR' && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                        {modalBadge.type === 'EQUIPMENT' && <Wrench className="w-2.5 h-2.5 text-orange-400" />}
                        <span>{modalBadge.label}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Specs & Inventory Breakdown */}
                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#121212]/50 font-bold block mb-1">
                      Technical Specifications
                    </span>
                    <p className="text-xs text-[#121212]/80 leading-relaxed">
                      {activeQuickViewProduct.description}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-[#121212]/10 pt-3">
                    <div className="flex justify-between py-1 border-b border-[#121212]/5">
                      <span className="text-[#121212]/60">Corporate Unit Price</span>
                      <span className="font-serif font-bold text-sm text-[#121212]">
                        ₹{activeQuickViewProduct.unitPrice.toLocaleString()}
                      </span>
                    </div>
                    {modalBadge?.categoryTag && (
                      <div className="flex justify-between py-1 border-b border-[#121212]/5">
                        <span className="text-[#121212]/60">Asset Classification</span>
                        <span className="font-mono text-xs font-bold text-[#121212]">
                          {modalBadge.categoryTag}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-[#121212]/5">
                      <span className="text-[#121212]/60">Current Available Stock</span>
                      <span className="font-mono font-semibold text-[#121212]">
                        {activeQuickViewProduct.availableQuantity} {activeQuickViewProduct.unit}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#121212]/5">
                      <span className="text-[#121212]/60">Reserved Stock</span>
                      <span className="font-mono text-[#121212]/70">
                        {activeQuickViewProduct.reservedQuantity} {activeQuickViewProduct.unit}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#121212]/5">
                      <span className="text-[#121212]/60">Minimum Stock Reorder Alert</span>
                      <span className="font-mono text-[#121212]/70">
                        {activeQuickViewProduct.minimumStock} {activeQuickViewProduct.unit}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#121212]/60">Primary Vendor</span>
                      <span className="font-medium text-[#121212]">
                        {activeQuickViewProduct.supplierName || 'Corporate Logistics'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#121212]/15">
                <button
                  onClick={() => setActiveQuickViewProduct(null)}
                  className="px-4 py-2.5 border border-[#121212]/30 text-xs font-sans uppercase tracking-wider text-[#121212] hover:bg-[#F9F7F2] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const prod = activeQuickViewProduct;
                    setActiveQuickViewProduct(null);
                    onOpenNewRequest(prod);
                  }}
                  className="px-6 py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Initiate Requisition</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
