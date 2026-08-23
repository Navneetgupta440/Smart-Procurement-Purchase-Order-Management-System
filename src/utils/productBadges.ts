import { Product } from '../types/procurement';

export interface ProductBadgeInfo {
  label: string;
  type: 'LUXURY_CAR' | 'EQUIPMENT' | 'SUPERBIKE' | 'HIGH_VALUE_TECH' | 'LUXURY_WEAR' | 'HIGH_VALUE' | 'STANDARD';
  pillBg: string;
  pillText: string;
  pillBorder: string;
  glowClass?: string;
  categoryTag?: string;
  isHighValue: boolean;
  requiresSpecialApproval?: boolean;
}

/**
 * Evaluates a product and returns its specific badge metadata for visual distinction
 * specifically highlighting high-value items like 'Luxury Car', 'Equipment', etc.
 */
export function getProductBadgeInfo(product: Product): ProductBadgeInfo | null {
  // If product has explicit badge / badgeType from database
  if (product.badge) {
    const customLabel = product.badge;
    const isCar = customLabel.toLowerCase().includes('car') || product.categoryId === 'cat-08';
    const isEquipment = customLabel.toLowerCase().includes('equipment') || product.categoryId === 'cat-10';

    if (isCar) {
      return {
        label: customLabel,
        type: 'LUXURY_CAR',
        pillBg: 'bg-[#1C1813]',
        pillText: 'text-amber-300',
        pillBorder: 'border-amber-500/60',
        glowClass: 'shadow-[0_0_10px_rgba(245,208,97,0.15)]',
        categoryTag: 'VIP High-Value Fleet',
        isHighValue: true,
        requiresSpecialApproval: true
      };
    }

    if (isEquipment) {
      return {
        label: customLabel,
        type: 'EQUIPMENT',
        pillBg: 'bg-[#1F1912]',
        pillText: 'text-orange-300',
        pillBorder: 'border-orange-500/60',
        glowClass: 'shadow-[0_0_10px_rgba(249,115,22,0.15)]',
        categoryTag: 'Industrial Heavy Asset',
        isHighValue: true,
        requiresSpecialApproval: true
      };
    }
  }

  const categoryName = (product.categoryName || '').toUpperCase();
  const categoryId = product.categoryId || '';
  const name = (product.name || '').toUpperCase();
  const code = (product.productCode || '').toUpperCase();
  const price = product.unitPrice || 0;

  // 1. Luxury Cars (Category cat-08 or Car / Vehicle / Armored / Fleet keywords or price >= 5,000,000)
  if (
    categoryId === 'cat-08' ||
    categoryName.includes('LUXURY CAR') ||
    categoryName.includes('CAR') ||
    code.startsWith('PRD-CAR-') ||
    name.includes('ROLLS-ROYCE') ||
    name.includes('BENTLEY') ||
    name.includes('PORSCHE') ||
    name.includes('FERRARI') ||
    name.includes('BMW I7') ||
    name.includes('MERCEDES-MAYBACH') ||
    name.includes('DEFENDER 130') ||
    name.includes('RANGE ROVER') ||
    name.includes('AUDI E-TRON GT') ||
    (price >= 5000000 && (name.includes('SEDAN') || name.includes('SUV') || name.includes('COUPE')))
  ) {
    return {
      label: 'Luxury Car',
      type: 'LUXURY_CAR',
      pillBg: 'bg-[#181510]',
      pillText: 'text-amber-300',
      pillBorder: 'border-amber-500/70',
      glowClass: 'shadow-[0_0_12px_rgba(245,208,97,0.2)]',
      categoryTag: 'VIP Executive Fleet • CapEx Tier 1',
      isHighValue: true,
      requiresSpecialApproval: true
    };
  }

  // 2. Heavy / Industrial Equipment (Category cat-10 or Equipment / Excavator / Machinery / CNC / Laser / Forklift)
  if (
    categoryId === 'cat-10' ||
    categoryName.includes('EQUIPMENT') ||
    categoryName.includes('MACHINERY') ||
    code.startsWith('PRD-EQP-') ||
    code.startsWith('PRD-EQUP-') ||
    name.includes('EXCAVATOR') ||
    name.includes('FIBER LASER') ||
    name.includes('FORKLIFT') ||
    name.includes('3D PRINTER') ||
    name.includes('CNC') ||
    name.includes('INDUSTRIAL CRANE') ||
    name.includes('METAL PRINTER') ||
    name.includes('CLEANROOM')
  ) {
    return {
      label: 'Equipment',
      type: 'EQUIPMENT',
      pillBg: 'bg-[#1E1812]',
      pillText: 'text-orange-300',
      pillBorder: 'border-orange-500/70',
      glowClass: 'shadow-[0_0_12px_rgba(249,115,22,0.2)]',
      categoryTag: 'Industrial Plant Asset • CapEx Tier 2',
      isHighValue: true,
      requiresSpecialApproval: true
    };
  }

  // 3. Superbikes & High-Performance Mobility (Category cat-09 or Superbike / Ducati / Kawasaki / Hayabusa / BMW M 1000)
  if (
    categoryId === 'cat-09' ||
    categoryName.includes('BIKE') ||
    code.startsWith('PRD-BIK-') ||
    name.includes('DUCATI') ||
    name.includes('KAWASAKI NINJA') ||
    name.includes('HAYABUSA') ||
    name.includes('YAMAHA YZF-R1M') ||
    name.includes('BMW M 1000') ||
    (price >= 1000000 && name.includes('BIKE'))
  ) {
    return {
      label: price >= 500000 ? 'Superbike' : 'High-End Bike',
      type: 'SUPERBIKE',
      pillBg: 'bg-[#1D1111]',
      pillText: 'text-rose-300',
      pillBorder: 'border-rose-500/70',
      glowClass: 'shadow-[0_0_10px_rgba(244,63,94,0.18)]',
      categoryTag: 'High-Performance Mobility',
      isHighValue: price >= 300000,
      requiresSpecialApproval: price >= 1000000
    };
  }

  // 4. Enterprise Server / Quantum / Heavy Compute (price >= 400,000 in Computers / Laptops / Network)
  if (
    price >= 400000 &&
    (categoryId === 'cat-01' || categoryId === 'cat-03' || name.includes('SERVER') || name.includes('CLUSTER') || name.includes('POWEREDGE') || name.includes('DGX'))
  ) {
    return {
      label: 'Enterprise Compute',
      type: 'HIGH_VALUE_TECH',
      pillBg: 'bg-[#0E1726]',
      pillText: 'text-cyan-300',
      pillBorder: 'border-cyan-500/70',
      glowClass: 'shadow-[0_0_10px_rgba(6,182,212,0.18)]',
      categoryTag: 'Mission-Critical Infrastructure',
      isHighValue: true,
      requiresSpecialApproval: true
    };
  }

  // 5. Luxury Horology & Bespoke Apparel (Rolex, Montblanc, Savile Row, Loro Piana or price >= 80,000 in Luxury Wears)
  if (
    categoryId === 'cat-12' ||
    categoryName.includes('LUXURY WEAR') ||
    name.includes('ROLEX') ||
    name.includes('MONTBLANC') ||
    name.includes('SAVILE ROW') ||
    name.includes('LORO PIANA') ||
    name.includes('HERMÈS') ||
    name.includes('BRUNELLO')
  ) {
    return {
      label: price >= 500000 ? 'Luxury Horology' : 'Luxury Wear',
      type: 'LUXURY_WEAR',
      pillBg: 'bg-[#0E1D19]',
      pillText: 'text-emerald-300',
      pillBorder: 'border-emerald-500/70',
      glowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.18)]',
      categoryTag: 'Executive Bespoke Grade',
      isHighValue: price >= 100000,
      requiresSpecialApproval: price >= 500000
    };
  }

  // 6. Generic High Value Item (Any item with price >= ₹100,000 or flagged isHighValue)
  if (price >= 100000 || product.isHighValue) {
    return {
      label: 'High-Value Asset',
      type: 'HIGH_VALUE',
      pillBg: 'bg-[#18181B]',
      pillText: 'text-zinc-200',
      pillBorder: 'border-zinc-500/70',
      glowClass: 'shadow-xs',
      categoryTag: 'High Capital Asset',
      isHighValue: true,
      requiresSpecialApproval: price >= 200000
    };
  }

  return null;
}
