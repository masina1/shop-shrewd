/**
 * Freshful-specific data normalizer  
 * Maps Freshful's scraped field names to our unified RawVendorProduct format
 */
import { RawVendorProduct } from '@/types/product';

interface FreshfulRawProduct {
  image_image__nanvf_image?: string; // Image URL
  productdefaultcard_root__5axhf_url?: string; // Product URL
  image_image__nanvf_description?: string; // Product name
  productdefaultcard_brand__ix27n?: string; // Brand
  span?: string; // Price like "28,29"
  productprice_perunit__4wcmu?: string; // Unit price like "2,36 Lei/l"
  producttaxes_icon__cbmn9_description?: string; // Tax info like "+ 3 Lei"
}

/**
 * Normalize Freshful scraped data to unified format
 */
export function normalizeFreshfulProduct(freshfulProduct: FreshfulRawProduct): RawVendorProduct | null {
  const name = freshfulProduct.image_image__nanvf_description || '';
  const brand = freshfulProduct.productdefaultcard_brand__ix27n;
  const price = freshfulProduct.span;
  
  // Skip products without price
  if (!price) {
    return null;
  }
  
  const formattedPrice = formatFreshfulPrice(price);
  
  return {
    name: name,
    brand: brand,
    price: formattedPrice,
    size: extractSizeFromName(name),
    unit: extractUnitFromUnitPrice(freshfulProduct.productprice_perunit__4wcmu),
    url: freshfulProduct.productdefaultcard_root__5axhf_url,
    image: freshfulProduct.image_image__nanvf_image,
    category: 'Other', // Will be overridden by dataLoader
    inStock: true,
    promoLabel: undefined,
    // Additional fields
    unitPrice: freshfulProduct.productprice_perunit__4wcmu,
    taxInfo: freshfulProduct.producttaxes_icon__cbmn9_description
  };
}

/**
 * Format Freshful price (they use format like "28,29" for 28.29 Lei)
 */
function formatFreshfulPrice(price: string): string {
  if (!price) return '0,00 lei';
  
  const cleanPrice = price.trim();
  
  // If it already contains "lei", return as-is
  if (cleanPrice.toLowerCase().includes('lei')) {
    return cleanPrice;
  }
  
  // If it's just a number like "28,29", add "lei"
  return `${cleanPrice} lei`;
}

/**
 * Extract size from product name (look for patterns like "6x2l", "500ml", etc.)
 */
function extractSizeFromName(name: string): string | undefined {
  if (!name) return undefined;
  
  // Look for size patterns in the name  
  const sizePatterns = [
    /(\d+x\d+(?:[.,]\d+)?)\s*[lL](?:\s|$)/gi,  // 6x2l, 4x1.5L
    /(\d+(?:[.,]\d+)?)\s*[lL](?:\s|$)/gi,      // 2l, 1.5L  
    /(\d+(?:[.,]\d+)?)\s*ml(?:\s|$)/gi,        // 500ml, 250ml
    /(\d+(?:[.,]\d+)?)\s*kg(?:\s|$)/gi,        // 1kg, 0.5kg
    /(\d+(?:[.,]\d+)?)\s*g(?:\s|$)/gi,         // 500g, 100g
    /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*[gml]/gi  // 2x500ml, 6x250g
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
 * Extract unit from unit price string like "2,36 Lei/l"
 */
function extractUnitFromUnitPrice(unitPrice?: string): string | undefined {
  if (!unitPrice) return 'buc';
  
  const normalized = unitPrice.toLowerCase();
  
  if (normalized.includes('/l')) return 'l';
  if (normalized.includes('/kg')) return 'kg'; 
  if (normalized.includes('/ml')) return 'ml';
  if (normalized.includes('/g')) return 'g';
  if (normalized.includes('/buc')) return 'buc';
  
  return 'buc';
}
