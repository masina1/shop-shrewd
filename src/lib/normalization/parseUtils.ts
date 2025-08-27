/**
 * Parsing utilities for prices, units, and sizes
 */

/**
 * Parse price from various formats (string or number)
 */
export function parsePrice(price: string | number): number {
  if (typeof price === 'number') return price;
  
  if (typeof price === 'string') {
    // Handle Romanian decimal format (comma as decimal separator)
    const cleaned = price
      .replace(/[^\d,.-]/g, '') // Remove currency symbols and text
      .replace(',', '.');       // Convert comma to dot
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

/**
 * Parse and normalize unit from vendor data
 */
export function parseUnit(unit?: string): "kg" | "l" | "buc" | "g" | "ml" {
  if (!unit) return 'buc';
  
  const normalized = unit.toLowerCase().trim();
  
  // Map various unit formats to standard units
  if (['kg', 'kilogram', 'kilo'].includes(normalized)) return 'kg';
  if (['g', 'gram', 'grame'].includes(normalized)) return 'g';
  if (['l', 'litru', 'liter', 'litre'].includes(normalized)) return 'l';
  if (['ml', 'mililitru', 'milliliter'].includes(normalized)) return 'ml';
  if (['buc', 'bucata', 'bucati', 'piece', 'pieces', 'pcs'].includes(normalized)) return 'buc';
  
  return 'buc'; // Default fallback
}

/**
 * Extract size information from size/weight strings
 */
export interface SizeInfo {
  value: number;
  unit: string;
  normalized: string;
  totalGrams?: number;
  totalMl?: number;
}

export function extractSize(sizeStr: string): SizeInfo {
  if (!sizeStr) {
    return { value: 0, unit: '', normalized: '' };
  }
  
  const str = sizeStr.toLowerCase().trim();
  
  // Pattern for matching sizes like "1L", "500g", "2x500ml", etc.
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*(g|ml|l|kg)/g, // 2x500ml
    /(\d+(?:[.,]\d+)?)\s*(g|ml|l|kg|buc|bucăți)/g               // 500g, 1L
  ];
  
  for (const pattern of patterns) {
    const matches = [...str.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      
      if (match.length === 4) {
        // Format: 2x500ml
        const multiplier = parseFloat(match[1].replace(',', '.'));
        const value = parseFloat(match[2].replace(',', '.'));
        const unit = match[3];
        const totalValue = multiplier * value;
        
        return {
          value: totalValue,
          unit,
          normalized: `${totalValue}${unit}`,
          ...convertToBaseUnits(totalValue, unit)
        };
      } else if (match.length === 3) {
        // Format: 500g, 1L
        const value = parseFloat(match[1].replace(',', '.'));
        const unit = match[2];
        
        return {
          value,
          unit,
          normalized: `${value}${unit}`,
          ...convertToBaseUnits(value, unit)
        };
      }
    }
  }
  
  return { value: 0, unit: '', normalized: sizeStr };
}

/**
 * Convert sizes to base units (grams and ml) for comparison
 */
function convertToBaseUnits(value: number, unit: string): { totalGrams?: number; totalMl?: number } {
  const result: { totalGrams?: number; totalMl?: number } = {};
  
  switch (unit.toLowerCase()) {
    case 'kg':
      result.totalGrams = value * 1000;
      break;
    case 'g':
      result.totalGrams = value;
      break;
    case 'l':
      result.totalMl = value * 1000;
      break;
    case 'ml':
      result.totalMl = value;
      break;
  }
  
  return result;
}

/**
 * Calculate unit price per kg/l when possible
 */
export function calculateUnitPrice(price: number, sizeInfo: SizeInfo): number | undefined {
  if (sizeInfo.totalGrams && sizeInfo.totalGrams > 0) {
    return (price / sizeInfo.totalGrams) * 1000; // Price per kg
  }
  
  if (sizeInfo.totalMl && sizeInfo.totalMl > 0) {
    return (price / sizeInfo.totalMl) * 1000; // Price per liter
  }
  
  return undefined;
}
