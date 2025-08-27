/**
 * Text normalization utilities for diacritics and string processing
 */

// Romanian diacritics mapping
const DIACRITIC_MAP: Record<string, string> = {
  'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ţ': 't', 'ț': 't',
  'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ţ': 'T', 'Ț': 'T',
  // Extended for other common diacritics
  'á': 'a', 'à': 'a', 'ä': 'a', 'ã': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ç': 'c', 'ñ': 'n'
};

/**
 * Remove diacritics from text
 */
export function stripDiacritics(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[^\u0000-\u007E]/g, char => DIACRITIC_MAP[char] || char);
}

/**
 * Normalize text for canonical ID generation and search
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return stripDiacritics(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')      // Collapse multiple spaces
    .trim();
}

/**
 * Normalize text for search queries (preserves original case for display)
 */
export function normalizeForSearch(text: string): string {
  return stripDiacritics(text)
    .toLowerCase()
    .trim();
}

/**
 * Clean and normalize brand names
 */
export function normalizeBrand(brand: string): string {
  return brand
    .trim()
    .replace(/\b(S\.A\.|SRL|SA|SRL\.)\b/gi, '') // Remove company suffixes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract and normalize size tokens from product names
 */
export function extractSizeTokens(text: string): string[] {
  const sizePatterns = [
    /\d+[.,]?\d*\s*[gl]/gi,           // 1L, 500g, 1.5l
    /\d+[.,]?\d*\s*ml/gi,             // 250ml, 1000ml  
    /\d+[.,]?\d*\s*kg/gi,             // 1kg, 0.5kg
    /\d+\s*x\s*\d+[.,]?\d*\s*[glm]/gi, // 2x500ml, 3x1L
    /\d+\s*buc/gi,                    // 10 buc, 6buc
    /\d+\s*bucăți/gi                  // 12 bucăți
  ];
  
  const tokens: string[] = [];
  sizePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      tokens.push(...matches.map(m => m.toLowerCase().trim()));
    }
  });
  
  return tokens;
}

/**
 * Check if two normalized strings are similar (for duplicate detection)
 */
export function areSimilar(str1: string, str2: string, threshold = 0.8): boolean {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);
  
  if (norm1 === norm2) return true;
  
  // Simple similarity check based on common words
  const words1 = new Set(norm1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(norm2.split(' ').filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size >= threshold;
}
