/**
 * Canonical ID generation utilities
 */
import { normalizeText } from './textUtils';

export interface IdInput {
  brand?: string;
  name: string;
  size?: string;
  ean?: string;
  gtin?: string;
}

/**
 * Build canonical product ID
 * Prefers EAN/GTIN if available, otherwise builds from normalized brand+name+size
 */
export function buildCanonicalId(input: IdInput): string {
  // Prefer EAN/GTIN when available
  if (input.ean && input.ean.length >= 8) {
    return `ean-${input.ean}`;
  }
  
  if (input.gtin && input.gtin.length >= 8) {
    return `gtin-${input.gtin}`;
  }
  
  // Build from normalized components
  const components: string[] = [];
  
  if (input.brand) {
    components.push(normalizeText(input.brand));
  }
  
  components.push(normalizeText(input.name));
  
  if (input.size) {
    components.push(normalizeText(input.size));
  }
  
  const normalized = components
    .join('-')
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
  
  return `product-${normalized}`;
}

/**
 * Extract EAN/GTIN from various vendor data formats
 */
export function extractProductCode(raw: any): string | undefined {
  // Check common field names for product codes
  const fields = ['ean', 'gtin', 'barcode', 'productCode', 'code'];
  
  for (const field of fields) {
    if (raw[field] && typeof raw[field] === 'string' && raw[field].length >= 8) {
      return raw[field];
    }
  }
  
  return undefined;
}

/**
 * Validate EAN/GTIN format (basic validation)
 */
export function isValidProductCode(code: string): boolean {
  // Remove any non-digits
  const digits = code.replace(/\D/g, '');
  
  // Check length (EAN-8, EAN-13, GTIN-14)
  if (![8, 13, 14].includes(digits.length)) {
    return false;
  }
  
  // Basic checksum validation for EAN-13
  if (digits.length === 13) {
    return validateEAN13Checksum(digits);
  }
  
  return true; // Accept other formats without deep validation
}

/**
 * Validate EAN-13 checksum
 */
function validateEAN13Checksum(ean13: string): boolean {
  if (ean13.length !== 13) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(ean13[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(ean13[12]);
}
