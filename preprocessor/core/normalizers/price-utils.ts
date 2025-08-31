/**
 * Price parsing and unit conversion utilities
 * 
 * Handles various price formats, currency symbols, and unit normalization
 * with support for Romanian formatting conventions.
 */

import { UnitType } from '@/types/canonical.js';
import { config } from '@/config/environment.js';

export interface ParsedPrice {
  value: number;
  currency: 'RON';
  originalText: string;
  confidence: number; // 0-1 how confident we are in the parsing
}

export interface ParsedUnit {
  type: UnitType;
  originalText: string;
  confidence: number;
}

export interface ParsedSize {
  size: number;
  unit: UnitType;
  totalGrams?: number;
  totalMl?: number;
  originalText: string;
  confidence: number;
}

export interface UnitPrice {
  value: number;
  unit: string; // "RON/kg", "RON/l", "RON/pcs"
  originalText: string;
}

/**
 * Parse price from various Romanian and international formats
 */
export function parsePrice(priceInput: string | number): ParsedPrice {
  if (typeof priceInput === 'number') {
    return {
      value: priceInput,
      currency: 'RON',
      originalText: priceInput.toString(),
      confidence: 1.0
    };
  }
  
  if (!priceInput || typeof priceInput !== 'string') {
    return {
      value: 0,
      currency: 'RON',
      originalText: String(priceInput || ''),
      confidence: 0
    };
  }
  
  const originalText = priceInput.trim();
  let confidence = 0.8; // Default confidence
  
  // Remove common currency symbols and text
  let cleaned = originalText
    .toLowerCase()
    .replace(/\s*lei\s*/gi, '') // Romanian currency
    .replace(/\s*ron\s*/gi, '') // Romanian currency code
    .replace(/\s*€\s*/gi, '') // Euro (sometimes used incorrectly)
    .replace(/\s*eur\s*/gi, '') // Euro code
    .replace(/[\s\u00A0]+/g, '') // Remove all whitespace including non-breaking
    .trim();
  
  // Handle Romanian decimal format (comma as decimal separator)
  // Convert patterns like "12,99" to "12.99"
  if (/^\d+,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
    confidence = 0.95; // High confidence for standard format
  }
  
  // Handle mixed formats like "12.999,99" (thousands separator + decimal)
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    confidence = 0.9;
  }
  
  // Handle US format like "12.99" or "1,234.99"
  if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, '');
    confidence = 0.85;
  }
  
  // Handle integer prices
  if (/^\d+$/.test(cleaned)) {
    confidence = 0.7; // Lower confidence for integer prices
  }
  
  // Parse the final number
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || parsed < 0) {
    return {
      value: 0,
      currency: 'RON',
      originalText,
      confidence: 0
    };
  }
  
  // Sanity checks
  if (parsed > 10000) {
    confidence *= 0.5; // Very high prices are suspicious
  }
  
  if (parsed < 0.01) {
    confidence *= 0.3; // Very low prices are suspicious
  }
  
  return {
    value: parsed,
    currency: 'RON',
    originalText,
    confidence
  };
}

/**
 * Parse and normalize units to standard types
 */
export function parseUnit(unitInput?: string): ParsedUnit {
  if (!unitInput || typeof unitInput !== 'string') {
    return {
      type: 'pcs',
      originalText: unitInput || '',
      confidence: 0.3 // Low confidence for missing unit
    };
  }
  
  const originalText = unitInput.trim();
  const normalized = originalText.toLowerCase();
  
  // Weight units
  if (/^(kg|kilogram|kilo)s?$/i.test(normalized)) {
    return { type: 'kg', originalText, confidence: 1.0 };
  }
  
  if (/^(g|gram|grame)s?$/i.test(normalized)) {
    return { type: 'g', originalText, confidence: 1.0 };
  }
  
  // Volume units
  if (/^(l|litru|liter|litre)s?$/i.test(normalized)) {
    return { type: 'l', originalText, confidence: 1.0 };
  }
  
  if (/^(ml|mililitru|milliliter)s?$/i.test(normalized)) {
    return { type: 'ml', originalText, confidence: 1.0 };
  }
  
  // Piece units
  if (/^(buc|bucata|bucati|bucăți|piece|pieces|pcs|pc)s?$/i.test(normalized)) {
    return { type: 'pcs', originalText, confidence: 1.0 };
  }
  
  // Special handling for compound units
  if (/lei\/(kg|l|buc)/i.test(normalized)) {
    const match = normalized.match(/lei\/([kgl]|buc)/i);
    if (match) {
      const unit = match[1] === 'buc' ? 'pcs' : match[1] as UnitType;
      return { type: unit, originalText, confidence: 0.9 };
    }
  }
  
  return {
    type: 'pcs',
    originalText,
    confidence: 0.2 // Low confidence for unknown unit
  };
}

/**
 * Extract size information from size/weight strings with pack support
 */
export function parseSize(sizeInput?: string): ParsedSize {
  if (!sizeInput || typeof sizeInput !== 'string') {
    return {
      size: 0,
      unit: 'pcs',
      originalText: sizeInput || '',
      confidence: 0
    };
  }
  
  const originalText = sizeInput.trim();
  const str = originalText.toLowerCase().replace(/\s+/g, '');
  
  // Patterns for various size formats
  const patterns = [
    // Multi-pack formats: "2x500ml", "6x330ml", "4x1.5l"
    /(\d+)x(\d+(?:[.,]\d+)?)(g|ml|l|kg)/g,
    
    // Simple formats: "500g", "1l", "2.5kg", "250ml"
    /(\d+(?:[.,]\d+)?)(g|ml|l|kg)/g,
    
    // Piece formats: "12buc", "6bucăți"
    /(\d+)(buc|bucăți|bucata|pieces?|pcs?)/g
  ];
  
  for (const pattern of patterns) {
    const matches = [...str.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      
      if (match.length === 4) {
        // Multi-pack format: quantity x size unit
        const quantity = parseInt(match[1]);
        const size = parseFloat(match[2].replace(',', '.'));
        const unit = match[3];
        const totalSize = quantity * size;
        
        const result: ParsedSize = {
          size: totalSize,
          unit: normalizeUnitFromString(unit),
          originalText,
          confidence: 0.95
        };
        
        // Add base unit conversions
        Object.assign(result, convertToBaseUnits(totalSize, result.unit));
        return result;
        
      } else if (match.length === 3) {
        // Simple format: size unit
        const size = parseFloat(match[1].replace(',', '.'));
        const unit = match[2];
        
        const result: ParsedSize = {
          size,
          unit: normalizeUnitFromString(unit),
          originalText,
          confidence: 0.9
        };
        
        // Add base unit conversions
        Object.assign(result, convertToBaseUnits(size, result.unit));
        return result;
      }
    }
  }
  
  return {
    size: 0,
    unit: 'pcs',
    originalText,
    confidence: 0
  };
}

/**
 * Parse unit price strings like "2.36 Lei/l" or "12.5 RON/kg"
 */
export function parseUnitPrice(unitPriceInput?: string): UnitPrice | null {
  if (!unitPriceInput || typeof unitPriceInput !== 'string') {
    return null;
  }
  
  const originalText = unitPriceInput.trim();
  
  // Pattern for unit prices: "price currency/unit"
  const pattern = /(\d+(?:[.,]\d+)?)\s*(lei|ron)\s*\/\s*(kg|l|ml|g|buc|pcs)/i;
  const match = originalText.match(pattern);
  
  if (!match) {
    return null;
  }
  
  const price = parseFloat(match[1].replace(',', '.'));
  const unit = match[3].toLowerCase();
  
  // Normalize unit names
  const normalizedUnit = (() => {
    switch (unit) {
      case 'kg': return 'kg';
      case 'l': return 'l';
      case 'ml': return 'ml';
      case 'g': return 'g';
      case 'buc':
      case 'pcs': return 'pcs';
      default: return unit;
    }
  })();
  
  return {
    value: price,
    unit: `RON/${normalizedUnit}`,
    originalText
  };
}

/**
 * Calculate unit price per kg/l when possible
 */
export function calculateUnitPrice(price: number, size: ParsedSize): UnitPrice | null {
  if (size.totalGrams && size.totalGrams > 0) {
    const pricePerKg = (price / size.totalGrams) * 1000;
    return {
      value: Math.round(pricePerKg * 100) / 100, // Round to 2 decimal places
      unit: 'RON/kg',
      originalText: 'calculated'
    };
  }
  
  if (size.totalMl && size.totalMl > 0) {
    const pricePerL = (price / size.totalMl) * 1000;
    return {
      value: Math.round(pricePerL * 100) / 100,
      unit: 'RON/l',
      originalText: 'calculated'
    };
  }
  
  if (size.unit === 'pcs' && size.size > 0) {
    const pricePerPiece = price / size.size;
    return {
      value: Math.round(pricePerPiece * 100) / 100,
      unit: 'RON/pcs',
      originalText: 'calculated'
    };
  }
  
  return null;
}

/**
 * Convert sizes to base units (grams and ml) for comparison
 */
function convertToBaseUnits(value: number, unit: UnitType): { totalGrams?: number; totalMl?: number } {
  const result: { totalGrams?: number; totalMl?: number } = {};
  
  switch (unit) {
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
    // pcs don't convert to weight/volume
  }
  
  return result;
}

/**
 * Normalize unit string to UnitType
 */
function normalizeUnitFromString(unit: string): UnitType {
  const normalized = unit.toLowerCase();
  
  switch (normalized) {
    case 'kg': return 'kg';
    case 'g': return 'g';
    case 'l': return 'l';
    case 'ml': return 'ml';
    case 'buc':
    case 'bucăți':
    case 'bucata':
    case 'pieces':
    case 'pcs':
    default:
      return 'pcs';
  }
}

/**
 * Validate parsed price for reasonableness
 */
export function validatePrice(price: ParsedPrice): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  if (price.value <= 0) {
    return { isValid: false, warnings: ['Price must be positive'] };
  }
  
  if (price.value > 10000) {
    warnings.push('Unusually high price detected');
  }
  
  if (price.value < 0.01) {
    warnings.push('Unusually low price detected');
  }
  
  if (price.confidence < 0.5) {
    warnings.push('Low confidence in price parsing');
  }
  
  return { isValid: true, warnings };
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'RON'): string {
  return `${price.toFixed(2).replace('.', ',')} ${currency}`;
}

/**
 * Format unit price for display
 */
export function formatUnitPrice(unitPrice: UnitPrice): string {
  return `${unitPrice.value.toFixed(2).replace('.', ',')} ${unitPrice.unit}`;
}
