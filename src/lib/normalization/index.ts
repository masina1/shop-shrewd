// Data normalization pipeline for vendor feeds
import { RawVendorProduct, Product, Offer, StoreId } from '@/types/product';
import { stripDiacritics, normalizeText } from './textUtils';
import { parsePrice, parseUnit, extractSize } from './parseUtils';
import { buildCanonicalId } from './idUtils';
import { mapCategory, mapCategoryByContent } from './categoryMapper';
import { extractAttributes } from './attributeExtractor';
import { formatProductName, formatBrandName } from '../textUtils';

/**
 * Normalize vendor-specific product data to unified Product schema
 */
export function normalizeVendorProducts(
  rawProducts: RawVendorProduct[],
  storeId: StoreId
): Product[] {
  return rawProducts.map(raw => normalizeProduct(raw, storeId));
}

/**
 * Normalize a single product from vendor data
 */
export function normalizeProduct(raw: RawVendorProduct, storeId: StoreId): Product {
  // Parse price and unit
  const price = parsePrice(raw.price);
  const unit = parseUnit(raw.unit);
  
  // Extract size information
  const sizeInfo = extractSize(raw.size || raw.weight || '');
  
  // Build canonical ID
  const canonicalId = buildCanonicalId({
    brand: raw.brand,
    name: raw.name,
    size: sizeInfo.normalized
  });
  
  // Map category to unified taxonomy
  let categoryInfo = mapCategory(raw.category || '', storeId);
  
  // If category is "Other", try content-based categorization using product name and brand
  if (categoryInfo.l1 === 'Other') {
    const contentForCategorization = [raw.name, raw.brand].filter(Boolean).join(' ').toLowerCase();
    categoryInfo = mapCategoryByContent(contentForCategorization, storeId);
  }
  
  // Debug logging for specific product
  if (raw.name.toLowerCase().includes('zahăr vanilinat')) {
    console.log(`🐛 Zahăr Debug: "${raw.name}" → raw.category: "${raw.category}" → storeId: "${storeId}" → mapped: "${categoryInfo.l1}"`);
  }
  
  // Extract product attributes (fat%, process, etc.)
  const attrs = extractAttributes(raw.name, raw);
  
  // Determine stock status
  const inStock = getStockStatus(raw);
  
  // Build offer
  const offer: Offer = {
    storeId,
    price,
    unit,
    url: raw.url,
    image: raw.image,
    inStock,
    promoLabel: getPromoLabel(raw)
  };
  
  // Build product
  const product: Product = {
    id: canonicalId,
    name: formatProductName(raw.name),
    brand: raw.brand ? formatBrandName(raw.brand) : undefined,
    image: raw.image,
    categoryL1: categoryInfo.l1,
    categoryL2: categoryInfo.l2,
    attrs: Object.keys(attrs).length > 0 ? attrs : undefined,
    offers: [offer]
  };
  
  // Add admin flags for data quality issues
  const adminFlags = detectDataIssues(raw, product);
  if (adminFlags.length > 0) {
    product.adminFlags = adminFlags;
  }
  
  return product;
}

/**
 * Determine stock status from various vendor formats
 */
function getStockStatus(raw: RawVendorProduct): boolean {
  if (typeof raw.inStock === 'boolean') return raw.inStock;
  if (typeof raw.stock === 'boolean') return raw.stock;
  if (raw.availability === 'in_stock') return true;
  if (raw.availability === 'out_of_stock') return false;
  if (raw.availability === 'limited_stock') return true;
  return true; // Default to in stock
}

/**
 * Extract promo label from various vendor formats
 */
function getPromoLabel(raw: RawVendorProduct): string | undefined {
  if (raw.promoLabel) return raw.promoLabel;
  if (raw.promotionText) return raw.promotionText;
  if (raw.promotional && raw.discount) return `-${raw.discount}`;
  return undefined;
}

/**
 * Detect data quality issues
 */
function detectDataIssues(raw: RawVendorProduct, product: Product): Array<"MISSING_PRICE" | "UNIT_MISMATCH" | "IMAGE_MISSING"> {
  const flags: Array<"MISSING_PRICE" | "UNIT_MISMATCH" | "IMAGE_MISSING"> = [];
  
  if (!raw.price || parsePrice(raw.price) === 0) {
    flags.push("MISSING_PRICE");
  }
  
  if (!raw.image) {
    flags.push("IMAGE_MISSING");
  }
  
  // Check for unit mismatches (e.g., price per kg but size in pieces)
  const unit = parseUnit(raw.unit);
  const sizeInfo = raw.size || raw.weight || '';
  const hasWeightSize = /\d+\s*[kgKG]|[gG](?:\s|$)/i.test(sizeInfo);
  const hasVolumeSize = /\d+\s*[lL]|[mM][lL](?:\s|$)/i.test(sizeInfo);
  const hasPieceSize = /\d+\s*buc|bucati|bucată|pieces?|pcs?/i.test(sizeInfo);
  
  // Only flag as mismatch if units are truly incompatible
  if ((unit === 'kg' && !hasWeightSize && !hasPieceSize) || 
      (unit === 'l' && !hasVolumeSize && !hasPieceSize)) {
    flags.push("UNIT_MISMATCH");
  }
  
  return flags;
}

/**
 * Group products by canonical ID and compute cheapest/alternatives
 */
export function groupProductsByCanonicalId(products: Product[]): Map<string, Product> {
  const grouped = new Map<string, Product>();
  
  products.forEach(product => {
    const existing = grouped.get(product.id);
    
    if (!existing) {
      grouped.set(product.id, { ...product });
    } else {
      // Merge offers
      existing.offers = [...existing.offers, ...product.offers];
      
      // Sort offers by price (cheapest first)
      existing.offers.sort((a, b) => a.price - b.price);
      
      // Update image if missing
      if (!existing.image && product.image) {
        existing.image = product.image;
      }
      
      // Prioritize non-"Other" categories during merge
      if (existing.categoryL1 === 'Other' && product.categoryL1 !== 'Other') {
        existing.categoryL1 = product.categoryL1;
        existing.categoryL2 = product.categoryL2;
      }
      
      // Merge admin flags
      if (product.adminFlags) {
        existing.adminFlags = Array.from(new Set([
          ...(existing.adminFlags || []),
          ...product.adminFlags
        ]));
      }
    }
  });
  
  return grouped;
}
