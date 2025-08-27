/**
 * Lidl-specific data normalizer
 * Maps Lidl's scraped field names to our unified RawVendorProduct format
 */
import { RawVendorProduct } from '@/types/product';

interface LidlRawProduct {
  odsc_tile__link: string; // Product name
  product_grid_box__brand?: string; // Brand
  price: string; // Price like "6,99Lei"
  span?: string; // Size like "1,5 L"
  price_1?: string; // Unit price like "1 L = 4,66 lei"
  price_2?: string; // Discount like "-34%"
  odsc_tile__link_url?: string; // Product URL
  odsc_image_gallery__image_image?: string; // Image URL
  odsc_image_gallery__image_description?: string; // Product description
  ods_badge__label?: string; // Availability info
  s?: string; // Original price (for promotions)
}

/**
 * Normalize Lidl scraped data to unified format
 */
export function normalizeLidlProduct(lidlProduct: LidlRawProduct): RawVendorProduct {
  return {
    name: lidlProduct.odsc_tile__link || '',
    brand: lidlProduct.product_grid_box__brand,
    price: lidlProduct.price || '', // This should be "6,99Lei"
    size: lidlProduct.span, // This should be "1,5 L"  
    unit: extractUnitFromLidlData(lidlProduct),
    url: lidlProduct.odsc_tile__link_url,
    image: lidlProduct.odsc_image_gallery__image_image,
    category: extractCategoryFromFilename(), // Will be set by dataLoader
    inStock: isLidlProductInStock(lidlProduct),
    promoLabel: lidlProduct.price_2 || undefined, // This should be "-34%"
    // Additional fields for better normalization
    description: lidlProduct.odsc_image_gallery__image_description,
    originalPrice: lidlProduct.s, // This should be "10,63 Lei"
    unitPrice: lidlProduct.price_1, // This should be "1 L = 4,66 lei"
    availability: lidlProduct.ods_badge__label
  };
}

/**
 * Extract unit from Lidl data (L, kg, etc.)
 */
function extractUnitFromLidlData(lidlProduct: LidlRawProduct): string | undefined {
  const size = lidlProduct.span;
  if (!size) return undefined;
  
  // Look for units in the size field
  if (size.includes('L') && !size.includes('ml')) return 'l';
  if (size.includes('ml')) return 'ml';
  if (size.includes('kg')) return 'kg';
  if (size.includes('g') && !size.includes('kg')) return 'g';
  
  // Check unit price for clues
  const unitPrice = lidlProduct.price_1;
  if (unitPrice?.includes('L =')) return 'l';
  if (unitPrice?.includes('kg =')) return 'kg';
  
  return 'buc'; // Default to pieces
}

/**
 * Determine if Lidl product is in stock
 */
function isLidlProductInStock(lidlProduct: LidlRawProduct): boolean {
  const badge = lidlProduct.ods_badge__label?.toLowerCase();
  if (!badge) return true;
  
  // Check for availability indicators
  if (badge.includes('în magazin') || badge.includes('disponibil')) return true;
  if (badge.includes('epuizat') || badge.includes('indisponibil')) return false;
  
  return true; // Default to in stock
}

/**
 * Placeholder for category extraction - will be set by dataLoader based on filename
 */
function extractCategoryFromFilename(): string {
  return 'Other'; // Will be overridden by dataLoader
}
