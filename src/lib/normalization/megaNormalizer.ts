/**
 * Mega Image-specific data normalizer
 * Maps Mega's scraped field names to our unified RawVendorProduct format
 */
import { RawVendorProduct } from '@/types/product';

interface MegaRawProduct {
  sc_y4jrw3_2_image?: string; // Image URL
  sc_y4jrw3_8_url?: string; // Product URL  
  span?: string; // Brand
  column_6?: string; // Product name (regular files)
  column_7?: string; // Product name (alternative)
  column_13?: string; // Product name (promotions files)
  sc_wxp2va_0?: string; // Product ID
  sc_y4jrw3_30?: string; // Quantity/Stock indicator
  sc_dqia0p_3?: string; // Unit price like "1.98 Lei/L"
  sc_dqia0p_9?: string; // Price integer part
  sc_dqia0p_10?: string; // Price decimal part
  sc_1it9fxy_3?: string; // Promotion info like "comanzi 5, platesti 4"
  sc_y4jrw3_21?: string; // Additional info like "Garantie"
}

/**
 * Normalize Mega scraped data to unified format
 */
export function normalizeMegaProduct(megaProduct: MegaRawProduct): RawVendorProduct | null {
  const name = megaProduct.column_13 || megaProduct.column_7 || megaProduct.column_6 || '';
  const brand = megaProduct.span;
  const promoInfo = megaProduct.sc_1it9fxy_3;
  
  // Skip products without price
  if (!megaProduct.sc_dqia0p_9 || !megaProduct.sc_dqia0p_10) {
    return null;
  }
  
  const price = buildFullPrice(megaProduct.sc_dqia0p_9, megaProduct.sc_dqia0p_10);
  
  return {
    name: name,
    brand: brand,
    price: price,
    size: extractSizeFromName(name),
    unit: extractUnitFromUnitPrice(megaProduct.sc_dqia0p_3),
    url: megaProduct.sc_y4jrw3_8_url,
    image: megaProduct.sc_y4jrw3_2_image,
    category: 'Other', // Will be overridden by dataLoader
    inStock: true,
    promoLabel: promoInfo,
    // Additional fields
    productId: megaProduct.sc_wxp2va_0,
    unitPrice: megaProduct.sc_dqia0p_3,
    additionalInfo: megaProduct.sc_y4jrw3_21
  };
}

/**
 * Build full price from integer and decimal parts
 */
function buildFullPrice(integerPart: string, decimalPart: string): string {
  if (!integerPart || !decimalPart) return '0,00 lei';
  
  const cleanInt = integerPart.trim();
  const cleanDec = decimalPart.trim();
  
  if (!cleanInt || !cleanDec) {
    return '0,00 lei';
  }
  
  return `${cleanInt},${cleanDec} lei`;
}

/**
 * Extract size from product name (look for patterns like "2L", "500ml", etc.)
 */
function extractSizeFromName(name: string): string | undefined {
  if (!name) return undefined;
  
  // Look for size patterns in the name
  const sizePatterns = [
    /(\d+(?:[.,]\d+)?)\s*L(?:\s|$)/gi,     // 2L, 1.5L
    /(\d+(?:[.,]\d+)?)\s*ml(?:\s|$)/gi,    // 500ml, 250ml
    /(\d+(?:[.,]\d+)?)\s*kg(?:\s|$)/gi,    // 1kg, 0.5kg
    /(\d+(?:[.,]\d+)?)\s*g(?:\s|$)/gi,     // 500g, 100g
    /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*[gmlL]/gi // 2x500ml, 6x250g
  ];
  
  for (const pattern of sizePatterns) {
    const match = pattern.exec(name);
    if (match) {
      return match[0].trim();
    }
  }
  
  return undefined;
}

/**
 * Extract unit from unit price string like "1.98 Lei/L"
 */
function extractUnitFromUnitPrice(unitPrice?: string): string | undefined {
  if (!unitPrice) return 'buc';
  
  const normalized = unitPrice.toLowerCase();
  
  if (normalized.includes('/l')) return 'l';
  if (normalized.includes('/kg')) return 'kg';
  if (normalized.includes('/ml')) return 'ml';
  if (normalized.includes('/g')) return 'g';
  
  return 'buc';
}
