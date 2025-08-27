/**
 * Product attribute extraction utilities
 */
import synonymsData from '@/data/synonyms.json';

export interface ProductAttributes {
  fat?: number;
  process?: string;
  sizeGrams?: number;
  sizeMl?: number;
}

/**
 * Extract product attributes from name and raw data
 */
export function extractAttributes(name: string, rawData?: any): ProductAttributes {
  const attrs: ProductAttributes = {};
  
  // Handle undefined/null names
  if (!name || typeof name !== 'string') {
    return attrs;
  }
  
  const normalized = name.toLowerCase();
  
  // Extract fat percentage for dairy products
  const fatContent = extractFatContent(normalized);
  if (fatContent !== undefined) {
    attrs.fat = fatContent;
  }
  
  // Extract processing method (UHT, pasteurizat, etc.)
  const process = extractProcessMethod(normalized);
  if (process) {
    attrs.process = process;
  }
  
  // Extract size information
  const sizeInfo = extractSizeAttributes(name, rawData);
  if (sizeInfo.sizeGrams) attrs.sizeGrams = sizeInfo.sizeGrams;
  if (sizeInfo.sizeMl) attrs.sizeMl = sizeInfo.sizeMl;
  
  return attrs;
}

/**
 * Extract fat percentage from product name
 */
function extractFatContent(text: string): number | undefined {
  // Look for explicit percentages
  const percentMatch = text.match(/(\d+[.,]?\d*)\s*%/);
  if (percentMatch) {
    return parseFloat(percentMatch[1].replace(',', '.'));
  }
  
  // Look for synonym mappings
  const { milk } = synonymsData;
  
  for (const [canonical, synonyms] of Object.entries(milk)) {
    if (synonyms.some(synonym => text.includes(synonym.toLowerCase()))) {
      switch (canonical) {
        case 'integral':
          return 3.5;
        case 'semi':
          return 1.5;
        case 'degresat':
          return 0.1;
      }
    }
  }
  
  // Direct keyword matching
  if (text.includes('integral') || text.includes('3.5') || text.includes('3,5')) {
    return 3.5;
  }
  
  if (text.includes('semi') || text.includes('1.5') || text.includes('1,5')) {
    return 1.5;
  }
  
  if (text.includes('degresat') || text.includes('0.1') || text.includes('0,1')) {
    return 0.1;
  }
  
  return undefined;
}

/**
 * Extract processing method from product name
 */
function extractProcessMethod(text: string): string | undefined {
  const { milk } = synonymsData;
  
  // Check UHT variants
  if (milk.uht.some(term => text.includes(term.toLowerCase()))) {
    return 'UHT';
  }
  
  // Check fresh/pasteurized variants
  if (milk.proaspat.some(term => text.includes(term.toLowerCase()))) {
    return 'Proaspăt';
  }
  
  // Direct keyword matching
  if (text.includes('uht') || text.includes('ultra')) {
    return 'UHT';
  }
  
  if (text.includes('pasteurizat') || text.includes('proaspat') || text.includes('fresh')) {
    return 'Proaspăt';
  }
  
  return undefined;
}

/**
 * Extract size attributes in grams/ml
 */
function extractSizeAttributes(name: string, rawData?: any): { sizeGrams?: number; sizeMl?: number } {
  const result: { sizeGrams?: number; sizeMl?: number } = {};
  
  // Try to extract from name first
  const sizeFromName = extractSizeFromText(name);
  Object.assign(result, sizeFromName);
  
  // Try to extract from raw data fields
  if (rawData) {
    const sizeFields = [rawData.size, rawData.weight, rawData.volume];
    
    for (const field of sizeFields) {
      if (field) {
        const sizeFromField = extractSizeFromText(field);
        if (!result.sizeGrams && sizeFromField.sizeGrams) {
          result.sizeGrams = sizeFromField.sizeGrams;
        }
        if (!result.sizeMl && sizeFromField.sizeMl) {
          result.sizeMl = sizeFromField.sizeMl;
        }
      }
    }
  }
  
  return result;
}

/**
 * Extract size from text using regex patterns
 */
function extractSizeFromText(text: string): { sizeGrams?: number; sizeMl?: number } {
  const result: { sizeGrams?: number; sizeMl?: number } = {};
  
  // Handle undefined/null text
  if (!text || typeof text !== 'string') {
    return result;
  }
  
  const normalized = text.toLowerCase();
  
  // Weight patterns
  const weightPatterns = [
    /(\d+(?:[.,]\d+)?)\s*kg/g,           // 1kg, 0.5kg
    /(\d+(?:[.,]\d+)?)\s*g(?:\s|$)/g,    // 500g, 100g  
    /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*g/g // 2x100g
  ];
  
  for (const pattern of weightPatterns) {
    const matches = [...normalized.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      
      if (match.length === 3 && pattern.toString().includes('x')) {
        // Format: 2x100g
        const multiplier = parseInt(match[1]);
        const weight = parseFloat(match[2].replace(',', '.'));
        result.sizeGrams = multiplier * weight;
        break;
      } else if (match.length === 2) {
        // Format: 500g, 1kg
        let weight = parseFloat(match[1].replace(',', '.'));
        if (pattern.toString().includes('kg')) {
          weight *= 1000; // Convert kg to g
        }
        result.sizeGrams = weight;
        break;
      }
    }
  }
  
  // Volume patterns
  const volumePatterns = [
    /(\d+(?:[.,]\d+)?)\s*l(?:\s|$)/g,     // 1l, 1.5l
    /(\d+(?:[.,]\d+)?)\s*ml/g,            // 500ml, 250ml
    /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*ml/g // 2x500ml
  ];
  
  for (const pattern of volumePatterns) {
    const matches = [...normalized.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      
      if (match.length === 3 && pattern.toString().includes('x')) {
        // Format: 2x500ml
        const multiplier = parseInt(match[1]);
        const volume = parseFloat(match[2].replace(',', '.'));
        result.sizeMl = multiplier * volume;
        break;
      } else if (match.length === 2) {
        // Format: 500ml, 1l
        let volume = parseFloat(match[1].replace(',', '.'));
        if (pattern.toString().includes('l(?:')) {
          volume *= 1000; // Convert l to ml
        }
        result.sizeMl = volume;
        break;
      }
    }
  }
  
  return result;
}
