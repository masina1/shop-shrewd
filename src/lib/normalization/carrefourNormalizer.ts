/**
 * Carrefour-specific data normalizer
 * Maps Carrefour's scraped field names to our unified RawVendorProduct format
 */
import { RawVendorProduct } from '@/types/product';

interface CarrefourRawProduct {
  productitem_image_url?: string; // Product URL
  a?: string; // Product name
  span?: string; // Price integer part
  span_1?: string; // Price decimal part  
  span_2?: string; // Stock status like "Stoc indisponibil"
  product_image_photo_image?: string; // Image URL
  product_image_photo_description?: string; // Image description/product name
}

/**
 * Normalize Carrefour scraped data to unified format
 */
export function normalizeCarrefourProduct(carrefourProduct: CarrefourRawProduct): RawVendorProduct | null {
  const name = carrefourProduct.a || carrefourProduct.product_image_photo_description || '';
  const price = buildFullPrice(carrefourProduct.span, carrefourProduct.span_1);
  const inStock = determineStockStatus(carrefourProduct.span_2);
  
  // Skip out-of-stock products (no price available)
  if (!inStock || !carrefourProduct.span || !carrefourProduct.span_1) {
    return null;
  }
  
  return {
    name: name,
    brand: extractBrandFromName(name),
    price: price,
    size: extractSizeFromName(name),
    unit: extractUnitFromName(name),
    url: carrefourProduct.productitem_image_url,
    image: carrefourProduct.product_image_photo_image,
    category: 'Other', // Will be overridden by dataLoader
    inStock: true, // Always true since we filter out false ones
    promoLabel: undefined,
    // Additional fields
    stockStatus: carrefourProduct.span_2
  };
}

/**
 * Build full price from integer and decimal parts
 */
function buildFullPrice(integerPart?: string, decimalPart?: string): string {
  if (!integerPart || !decimalPart) return '0';
  return `${integerPart},${decimalPart} lei`;
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
 * Extract unit from product name
 */
function extractUnitFromName(name: string): string | undefined {
  if (!name) return 'buc';
  
  const normalized = name.toLowerCase();
  
  if (normalized.includes(' l ') || normalized.endsWith(' l')) return 'l';
  if (normalized.includes(' kg ') || normalized.endsWith(' kg')) return 'kg';
  if (normalized.includes(' ml ') || normalized.endsWith(' ml')) return 'ml';
  if (normalized.includes(' g ') || normalized.endsWith(' g')) return 'g';
  
  return 'buc';
}

/**
 * Determine stock status from Romanian text
 */
function determineStockStatus(stockText?: string): boolean {
  if (!stockText) return true;
  
  const normalized = stockText.toLowerCase();
  
  if (normalized.includes('indisponibil') || normalized.includes('epuizat')) {
    return false;
  }
  
  return true; // Default to in stock
}
