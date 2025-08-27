/**
 * Category mapping utilities
 */
import { StoreId } from '@/types/product';
import taxonomyData from '@/data/taxonomy.json';

export interface CategoryInfo {
  l1: string;
  l2?: string;
}

/**
 * Map vendor category to unified taxonomy
 */
export function mapCategory(vendorCategory: string, storeId: StoreId): CategoryInfo {
  if (!vendorCategory) {
    return { l1: 'Other' };
  }
  
  const normalized = vendorCategory.toLowerCase().trim();
  const mappingKey = `${storeId}:${vendorCategory}`;
  
  // Try exact mapping first
  const exactMapping = taxonomyData.storeMapping[mappingKey];
  if (exactMapping) {
    return parseCanonicalCategory(exactMapping);
  }
  
  // Try partial matching
  const partialMatch = findPartialCategoryMatch(normalized, storeId);
  if (partialMatch) {
    return parseCanonicalCategory(partialMatch);
  }
  
  // Fallback to keyword-based mapping
  return mapByKeywords(normalized);
}

/**
 * Map category based on product content (name + brand)
 * Used when filename-based categorization fails
 */
export function mapCategoryByContent(content: string, storeId: StoreId): CategoryInfo {
  const normalized = content.toLowerCase().trim();
  return mapByKeywords(normalized);
}

/**
 * Parse canonical category path (e.g., "Lactate & Brânzeturi > Lapte")
 */
function parseCanonicalCategory(canonicalPath: string): CategoryInfo {
  const parts = canonicalPath.split(' > ').map(p => p.trim());
  return {
    l1: parts[0],
    l2: parts[1]
  };
}

/**
 * Find partial matches in store mapping
 */
function findPartialCategoryMatch(normalized: string, storeId: StoreId): string | undefined {
  const storePrefix = `${storeId}:`;
  
  // Look for mappings that contain the normalized category
  for (const [key, value] of Object.entries(taxonomyData.storeMapping)) {
    if (key.startsWith(storePrefix)) {
      const categoryPart = key.substring(storePrefix.length).toLowerCase();
      if (categoryPart.includes(normalized) || normalized.includes(categoryPart)) {
        return value;
      }
    }
  }
  
  return undefined;
}

/**
 * Map by keywords when no direct mapping exists
 */
function mapByKeywords(normalized: string): CategoryInfo {
  // Dairy products
  if (matchesKeywords(normalized, ['lapte', 'milk', 'iaurt', 'yogurt', 'branza', 'cheese', 'oua', 'eggs', 'unt', 'butter'])) {
    return { l1: 'Lactate & Brânzeturi' };
  }
  
  // Meat and deli
  if (matchesKeywords(normalized, ['carne', 'meat', 'mezeluri', 'deli', 'sunca', 'ham', 'salam', 'salami'])) {
    return { l1: 'Carne & Mezeluri' };
  }
  
  // Fish
  if (matchesKeywords(normalized, ['peste', 'fish', 'pescarie', 'seafood'])) {
    return { l1: 'Pește' };
  }
  
  // Fruits and vegetables
  if (matchesKeywords(normalized, ['fructe', 'fruits', 'legume', 'vegetables', 'vegetable', 'morcovi', 'carrots', 'cartofi', 'potatoes', 'ceapa', 'onion', 'rosii', 'tomatoes', 'castraveti', 'cucumber', 'ardei', 'pepper', 'salata', 'lettuce', 'varza', 'cabbage', 'mere', 'apples', 'pere', 'pears', 'banane', 'bananas', 'portocale', 'oranges', 'struguri', 'grapes'])) {
    return { l1: 'Fructe & Legume' };
  }
  
  // Coffee & Tea - prioritize before general categories
  if (matchesKeywords(normalized, ['cafea', 'coffee', 'doncafe', 'nescafe', 'jacobs', 'lavazza', 'illy', 'amigo', 'ceai', 'tea', 'nesquik', 'cappuccino', 'espresso'])) {
    return { l1: 'Cafea & Ceai' };
  }

  // Pantry/Grocery
  if (matchesKeywords(normalized, ['bacanie', 'băcănie', 'panificatie', 'bakery', 'paine', 'bread', 'paste', 'pasta', 'orez', 'rice', 'ulei', 'oil', 'zahar', 'sugar', 'faina', 'flour'])) {
    return { l1: 'Băcănie' };
  }
  
  // Beverages
  if (matchesKeywords(normalized, ['bauturi', 'băuturi', 'drinks', 'apa', 'water', 'suc', 'juice', 'cafea', 'coffee', 'ceai', 'tea'])) {
    return { l1: 'Băuturi' };
  }
  
  // House & Garden
  if (matchesKeywords(normalized, ['casa', 'grădină', 'gradina', 'house', 'garden', 'home', 'curatenie', 'curățenie', 'cleaning'])) {
    return { l1: 'Casa & Grădină' };
  }
  
  // Frozen Products
  if (matchesKeywords(normalized, ['produse congelate', 'congelate', 'frozen', 'inghetata', 'înghețată', 'ice cream'])) {
    return { l1: 'Produse Congelate' };
  }
  
  // Baby & Kids
  if (matchesKeywords(normalized, ['copii', 'bebeluși', 'bebelusi', 'kids', 'baby', 'children'])) {
    return { l1: 'Copii & Bebeluși' };
  }
  
  // Bakery & Pastry
  if (matchesKeywords(normalized, ['brutărie', 'brutarie', 'cofetărie', 'cofetarie', 'bakery', 'pastry'])) {
    return { l1: 'Brutărie & Patiserie' };
  }
  
  // Sweets & Snacks
  if (matchesKeywords(normalized, ['dulciuri', 'snacks', 'sweets', 'candy', 'bomboane', 'ciocolata', 'chocolate', 'biscuiti', 'cookies', 'la festa', 'oreo', 'milka', 'kinder', 'ferrero', 'nutella', 'ciocolata calda', 'hot chocolate', 'sticks cu sare', 'sticks', 'crackers', 'salatini', 'gustare', 'snack', 'chipsuri', 'chips'])) {
    return { l1: 'Dulciuri & Snacks' };
  }
  
  // Health & Wellness
  if (matchesKeywords(normalized, ['bio', 'sănătate', 'sanatate', 'health', 'wellness', 'organic'])) {
    return { l1: 'Bio & Sănătate' };
  }
  
  // Dairy products - specific brands and products
  if (matchesKeywords(normalized, ['lactate', 'dairy', 'lapte', 'milk', 'iaurt', 'yogurt', 'branza', 'brânzeturi', 'cheese', 'smantana', 'cream', 'sana', 'lapte batut', 'napolact', 'zuzu', 'albalact', 'delaco', 'danone', 'activia', 'gusturi romanesti'])) {
    return { l1: 'Lactate & Brânzeturi' };
  }

  // Cleaning - expanded with brands and products
  if (matchesKeywords(normalized, ['curățenie', 'curatenie', 'cleaning', 'detergent', 'ariel', 'persil', 'vanish', 'fairy', 'domestos', 'ajax', 'cif', 'bref', 'sano', 'spalare', 'intretinere'])) {
    return { l1: 'Curățenie' };
  }
  
  // Personal Care & Cosmetics
  if (matchesKeywords(normalized, ['cosmetice', 'cosmetics', 'parfumuri', 'perfume', 'ingrijire personala', 'personal care', 'gel de dus', 'shower gel', 'sampon', 'shampoo', 'pasta de dinti', 'toothpaste', 'deodorant', 'crema', 'lotion', 'sapun', 'soap', 'gel', 'balsam', 'scrub', 'masca', 'mask', 'harmony', 'sapun solid', 'solid soap'])) {
    return { l1: 'Cosmetice & Îngrijire' };
  }

  // Household & Cleaning  
  if (matchesKeywords(normalized, ['casa', 'home', 'menaj', 'household', 'hartie igienica', 'toilet paper', 'servetele', 'napkins', 'prosoape', 'towels', 'odorizant', 'air freshener'])) {
    return { l1: 'Casa & Menaj' };
  }

  // Meat & Delicatessen
  if (matchesKeywords(normalized, ['carne', 'meat', 'mezeluri', 'deli', 'salam', 'salami', 'sunca', 'ham', 'carnati', 'sausage', 'bacon', 'pastrama', 'vita', 'porc', 'pork', 'pasare', 'chicken', 'pui'])) {
    return { l1: 'Carne & Mezeluri' };
  }

  // Fish & Seafood
  if (matchesKeywords(normalized, ['peste', 'fish', 'seafood', 'fructe de mare', 'somon', 'salmon', 'ton', 'tuna', 'crap', 'macrou', 'sardine'])) {
    return { l1: 'Pește & Fructe de Mare' };
  }

  // Electronics & IT  
  if (matchesKeywords(normalized, ['electronice', 'electronics', 'itc', 'tech', 'technology', 'calculator', 'computer', 'telefon', 'phone'])) {
    return { l1: 'Electronice & IT' };
  }

  // Pet Shop
  if (matchesKeywords(normalized, ['animale', 'pets', 'pet shop', 'catei', 'dogs', 'pisici', 'cats', 'hrana pentru animale', 'pet food', 'caini', 'câini'])) {
    return { l1: 'Pet Shop' };
  }

  // Paper & Office
  if (matchesKeywords(normalized, ['papetarie', 'stationery', 'birou', 'office', 'creion', 'pencil', 'pix', 'pen', 'hartie', 'paper', 'caiet', 'notebook', 'birotica', 'rigla', 'ruler', 'plastic', 'rechizite', 'school supplies'])) {
    return { l1: 'Papetărie & Birou' };
  }

  // Garden & DIY
  if (matchesKeywords(normalized, ['gradina', 'garden', 'bricolaj', 'diy', 'unelte', 'tools', 'plante', 'plants', 'flori', 'flowers', 'seminte', 'seeds'])) {
    return { l1: 'Grădină & Bricolaj' };
  }

  // Automotive
  if (matchesKeywords(normalized, ['auto', 'automotive', 'masina', 'car', 'ulei motor', 'motor oil', 'anvelope', 'tires', 'acumulator', 'battery'])) {
    return { l1: 'Auto & Moto' };
  }
  
  // Default fallback
  return { l1: 'Other' };
}

/**
 * Check if text matches any of the keywords
 */
function matchesKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

/**
 * Get all available categories for facets
 */
export function getAllCategories(): { l1: string; l2?: string }[] {
  const categories: { l1: string; l2?: string }[] = [];
  
  Object.entries(taxonomyData.categories).forEach(([l1, data]) => {
    // Add L1 category
    categories.push({ l1 });
    
    // Add L2 subcategories
    if (data.subcategories) {
      data.subcategories.forEach(l2 => {
        categories.push({ l1, l2 });
      });
    }
  });
  
  return categories;
}
