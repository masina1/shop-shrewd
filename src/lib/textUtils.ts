/**
 * Text formatting utilities for product names and brands
 */

// Common Romanian brand names that should be capitalized
const KNOWN_BRANDS = [
  'doncafe', 'jacobs', 'nescafe', 'lavazza', 'starbucks',
  'coca-cola', 'pepsi', 'fanta', 'sprite', 'aqua carpatica',
  'borsec', 'bucegi', 'dorna', 'cotnari', 'murfatlar',
  'napolact', 'zuzu', 'albalact', 'delaco', 'olympus',
  'danone', 'activia', 'fruttis', 'milka', 'oreo',
  'nutella', 'ferrero', 'kinder', 'haribo', 'orbit',
  'dove', 'nivea', 'garnier', 'loreal', 'palmolive',
  'ariel', 'persil', 'vanish', 'fairy', 'domestos',
  'cosmin', 'verdino', 'carrefour', 'auchan', 'mega',
  'lidl', 'freshful', 'kaufland', 'cora', 'penny',
  'knorr', 'maggi', 'hellmann', 'ketchup', 'heinz',
  'barilla', 'baneasa', 'boromir', 'vel pitar', 'franzeluta'
];

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Capitalize known brand names in text
 */
function capitalizeBrands(text: string): string {
  if (!text) return text;
  
  let result = text;
  
  // Check each known brand and capitalize it
  KNOWN_BRANDS.forEach(brand => {
    const regex = new RegExp(`\\b${brand}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve the original case if it's already properly capitalized
      if (match === brand.charAt(0).toUpperCase() + brand.slice(1)) {
        return match;
      }
      // Otherwise capitalize properly
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    });
  });
  
  return result;
}

/**
 * Format product name with proper capitalization
 * - Capitalizes first letter of the entire name
 * - Capitalizes known brand names
 * - Preserves other formatting
 */
export function formatProductName(name: string): string {
  if (!name) return name;
  
  // First, capitalize the very first letter
  let formatted = capitalizeFirst(name.trim());
  
  // Then capitalize known brands
  formatted = capitalizeBrands(formatted);
  
  return formatted;
}

/**
 * Format brand name with proper capitalization
 */
export function formatBrandName(brand: string): string {
  if (!brand) return brand;
  
  // Check if it's a known brand first
  const formatted = capitalizeBrands(brand.trim());
  
  // If no known brand was found, just capitalize first letter
  if (formatted.toLowerCase() === brand.toLowerCase()) {
    return capitalizeFirst(brand.trim());
  }
  
  return formatted;
}
