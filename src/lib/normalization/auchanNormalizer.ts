/**
 * Auchan-specific data normalizer
 * Maps Auchan's scraped field names to our unified RawVendorProduct format
 */
import { RawVendorProduct } from '@/types/product';

interface AuchanRawProduct {
  description: string; // Image URL
  description_1: string; // Product URL
  description_2: string; // Product name
  undefined?: string | null; // Unit price like "6,99 lei/l" (null if out of stock)
  price: string | null; // Price integer part like "6" (null if out of stock)
  price_1: string | null; // Price decimal part like "99" (null if out of stock)
}

/**
 * Normalize Auchan scraped data to unified format
 */
export function normalizeAuchanProduct(auchanProduct: AuchanRawProduct): RawVendorProduct | null {
  const inStock = determineStockStatus(auchanProduct.price, auchanProduct.price_1);
  
  // Skip out-of-stock products (no price available)
  if (!inStock) {
    return null;
  }
  
  const price = buildFullPrice(auchanProduct.price, auchanProduct.price_1);
  
  // Debug logging for price issues
  if (auchanProduct.description_2?.toLowerCase().includes('cappy')) {
    console.log('🔍 Auchan Cappy Debug:', {
      name: auchanProduct.description_2,
      priceInt: auchanProduct.price,
      priceDec: auchanProduct.price_1,
      finalPrice: price,
      inStock: inStock,
      unitPrice: auchanProduct.undefined
    });
  }
  
  return {
    name: auchanProduct.description_2 || '',
    brand: extractBrandFromName(auchanProduct.description_2),
    price: price,
    size: extractSizeFromName(auchanProduct.description_2),
    unit: extractUnitFromUnitPrice(auchanProduct.undefined),
    url: auchanProduct.description_1,
    image: auchanProduct.description,
    category: 'Other', // Will be overridden by dataLoader
    inStock: true, // Always true since we filter out false ones
    promoLabel: undefined,
    // Additional fields
    unitPrice: auchanProduct.undefined
  };
}

/**
 * Build full price from integer and decimal parts
 */
function buildFullPrice(integerPart: string | null, decimalPart: string | null): string {
  // Handle null values (out of stock products)
  if (integerPart === null || decimalPart === null) return '0,00 lei';
  if (!integerPart || !decimalPart) return '0,00 lei';
  
  // Handle empty strings or just whitespace
  const cleanInt = integerPart.trim();
  const cleanDec = decimalPart.trim();
  
  if (!cleanInt || !cleanDec || cleanInt === '' || cleanDec === '') {
    return '0,00 lei';
  }
  
  return `${cleanInt},${cleanDec} lei`;
}

/**
 * Extract brand from product name (first word usually)
 */
function extractBrandFromName(name: string): string | undefined {
  if (!name) return undefined;
  
  const words = name.trim().split(' ');
  if (words.length > 1) {
    return words[0];
  }
  
  return undefined;
}

/**
 * Extract size from product name (look for patterns like "1 l", "500g", etc.)
 */
function extractSizeFromName(name: string): string | undefined {
  if (!name) return undefined;
  
  // Look for size patterns in the name
  const sizePatterns = [
    /(\d+(?:[.,]\d+)?)\s*l(?:\s|$)/gi,     // 1l, 1.5l, 2,5l
    /(\d+(?:[.,]\d+)?)\s*ml(?:\s|$)/gi,    // 500ml, 250ml
    /(\d+(?:[.,]\d+)?)\s*kg(?:\s|$)/gi,    // 1kg, 0.5kg
    /(\d+(?:[.,]\d+)?)\s*g(?:\s|$)/gi,     // 500g, 100g
    /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*[gml]/gi // 2x500ml, 6x250g
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
 * Determine if product is in stock based on price availability
 */
function determineStockStatus(priceInt: string | null, priceDec: string | null): boolean {
  // If price is null, product is out of stock
  return priceInt !== null && priceDec !== null;
}

/**
 * Extract unit from unit price string like "6,99 lei/l"
 */
function extractUnitFromUnitPrice(unitPrice: string | null): string | undefined {
  if (!unitPrice) return 'buc';
  
  const normalized = unitPrice.toLowerCase();
  
  if (normalized.includes('/l')) return 'l';
  if (normalized.includes('/kg')) return 'kg';
  if (normalized.includes('/ml')) return 'ml';
  if (normalized.includes('/g')) return 'g';
  
  return 'buc';
}
