import { SearchParams, SearchResult, SearchResultItem, FacetOption, PriceBucket, StoreId } from '@/types/search';
import { loadAllProducts } from '@/lib/dataLoader';
import { stripDiacritics } from '@/lib/normalization/textUtils';


export interface ISearchService {
  search(params: SearchParams): Promise<SearchResult>;
  searchWithFilter(params: SearchParams, filterQuery: string): Promise<SearchResult>;
}

// Cache for global search results to enable efficient filtering
let globalSearchCache: {
  params: string;
  allResults: SearchResultItem[];
} | null = null;

/**
 * Enhanced search service using master product index files
 * This loads from products.index.jsonl files for optimal performance
 */
export const searchService: ISearchService = {
  async search(params: SearchParams): Promise<SearchResult> {
    // Add small delay to simulate network call
    await new Promise(resolve => setTimeout(resolve, 200));

    const pageSize = params.pageSize || 24;
    const page = params.page || 1;

    try {
      // Load all products from master index files
      const allProducts = await loadAllProducts();
      
      console.log(`🔍 Search service loaded ${allProducts.length} products from master index files`);
      
      // Convert to SearchResultItems format
      let searchItems = allProducts.map(product => convertToSearchResultItem(product));
      
      // Apply filters
      searchItems = await applyFilters(searchItems, params);
      
      // Apply sorting
      searchItems = applySorting(searchItems, params);
      
      // Cache the complete global results for filtering
      const cacheKey = JSON.stringify({ q: params.q, cat: params.cat, stores: params.stores, brand: params.brand, props: params.props, promo: params.promo, availability: params.availability, price_min: params.price_min, price_max: params.price_max });
      globalSearchCache = {
        params: cacheKey,
        allResults: searchItems.map(item => ({
          ...item,
          _filterText: precomputeFilterText(item) // Precompute for fast filtering
        }))
      };
      
      // Generate facets
      const facets = await generateFacets(searchItems, params);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = searchItems.slice(startIndex, endIndex);

      return {
        items: paginatedItems,
        total: searchItems.length,
        page,
        pageSize,
        hasMore: endIndex < searchItems.length,
        facets
      };
    } catch (error) {
      console.error('Search service error:', error);
      
      // Return empty result on error
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        facets: {
          categories: [],
          stores: {},
          properties: [],
          types: [],
          brands: [],
          price: { min: 0, max: 100, buckets: [] },
          activeCounts: {}
        }
      };
    }
  },

  async searchWithFilter(params: SearchParams, filterQuery: string): Promise<SearchResult> {
    const pageSize = params.pageSize || 24;
    const page = 1; // Always reset to page 1 when filtering

    try {
      // Use cached global results if available and params match
      const cacheKey = JSON.stringify({ q: params.q, cat: params.cat, stores: params.stores, brand: params.brand, props: params.props, promo: params.promo, availability: params.availability, price_min: params.price_min, price_max: params.price_max });
      
      let allResults: SearchResultItem[];
      
      if (globalSearchCache && globalSearchCache.params === cacheKey) {
        // Use cached results
        allResults = globalSearchCache.allResults;
        console.log(`🔍 Using cached global results: ${allResults.length} products`);
      } else {
        // Fallback: run full search if cache miss
        console.log(`🔄 Cache miss, running full search for filter...`);
        const fullResult = await this.search(params);
        allResults = globalSearchCache?.allResults || [];
      }

      // Apply results filter - case-insensitive, no diacritics, AND logic
      const filteredResults = applyResultsFilter(allResults, filterQuery);
      
      console.log(`🔍 Results filter "${filterQuery}": ${filteredResults.length} matches from ${allResults.length} total`);
      
      // Apply pagination to filtered results
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = filteredResults.slice(startIndex, endIndex);

      // Generate facets from filtered results
      const facets = await generateFacets(filteredResults, params);

      return {
        items: paginatedItems,
        total: filteredResults.length,
        page,
        pageSize,
        hasMore: endIndex < filteredResults.length,
        facets
      };
    } catch (error) {
      console.error('Filter search error:', error);
      
      // Return empty result on error
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize,
        hasMore: false,
        facets: {
          categories: [],
          stores: {},
          properties: [],
          types: [],
          brands: [],
          price: { min: 0, max: 100, buckets: [] },
          activeCounts: {}
        }
      };
    }
  }
};

/**
 * Convert normalized preprocessor product to SearchResultItem
 */
function convertToSearchResultItem(product: any): SearchResultItem {
  // Handle normalized preprocessor output format
  const productName = product.title || 'Unknown Product';
  const productBrand = product.brand || '';
  const productPrice = product.pricing?.price || 0;
  
  // Fix image handling - check both images array format and fallback
  let productImage = '/placeholder.svg';
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Handle new preprocessor format: images: [{"url": "...", "role": "main"}]
    if (product.images[0]?.url) {
      productImage = product.images[0].url;
    }
    // Handle old format: images: ["url"]
    else if (typeof product.images[0] === 'string') {
      productImage = product.images[0];
    }
  }
  // Handle single image field
  else if (typeof product.image === 'string') {
    productImage = product.image;
  }
  
  const productCategory = product.category_path?.[0] || 'Other';
  const productCategory2 = product.category_path?.[1] || '';
  
  // Create a simple offer structure for compatibility
  const offer = {
    storeId: product.source?.shop || 'unknown',
    price: productPrice,
    promoLabel: product.attributes?.promo_flags?.[0] || '',
    inStock: product.stock?.in_stock !== false
  };
  
  // Extract badges from product attributes
  const badges: string[] = [];
  if (product.attributes) {
    if (product.attributes.dietary && product.attributes.dietary.length > 0) {
      badges.push(...product.attributes.dietary);
    }
    if (product.attributes.allergens && product.attributes.allergens.length > 0) {
      badges.push(...product.attributes.allergens);
    }
    if (product.attributes.promo_flags && product.attributes.promo_flags.length > 0) {
      badges.push(...product.attributes.promo_flags);
    }
  }
  
  // Add pack size information if available
  if (product.pack) {
    if (product.pack.size && product.pack.unit) {
      badges.push(`${product.pack.size} ${product.pack.unit}`);
    }
  }
  
  // Check availability
  let availability: 'in_stock' | 'limited' | 'out_of_stock' = 'in_stock';
  if (offer.inStock === false) {
    availability = 'out_of_stock';
  }

  return {
    id: product.canonical_id || `${product.source?.shop || 'unknown'}-${Math.random().toString(36).substr(2, 9)}`,
    name: productName,
    brand: productBrand,
    image: productImage,
    categoryPath: [productCategory, productCategory2].filter(Boolean),
    cheapest: { 
      store: offer.storeId, 
      price: offer.price,
      promoPct: offer.promoLabel ? extractPromoPercentage(offer.promoLabel) : undefined
    },
    otherStores: [], // No other stores for single-shop data
    badges,
    availability
  };
}

/**
 * Extract promo percentage from promo label
 */
function extractPromoPercentage(promoLabel: string): number | undefined {
  const match = promoLabel.match(/(\d+)%/);
  return match ? parseInt(match[1]) : undefined;
}

/**
 * Apply search filters to items
 */
async function applyFilters(items: SearchResultItem[], params: SearchParams): Promise<SearchResultItem[]> {
  let filtered = [...items];

  // Text search with category-first relevance scoring
  if (params.q) {
    const query = stripDiacritics(params.q.toLowerCase());
    
    // First pass: collect all matches with relevance scores
    const scoredItems = filtered.map(item => {
      let score = 0;
      let hasMatch = false;
      
      const itemName = stripDiacritics(item.name.toLowerCase());
      const itemBrand = item.brand ? stripDiacritics(item.brand.toLowerCase()) : '';
      
      // **PRIORITY 1: CATEGORY RELEVANCE** (highest boost)
      const categoryBoost = getCategoryRelevanceBoost(query, item.categoryPath);
      if (categoryBoost > 0) {
        score += categoryBoost;
        hasMatch = true;
      }
      
      // **PRIORITY 2: EXACT MATCHES**
      // Exact name match
      if (itemName === query) {
        score += 100;
        hasMatch = true;
      }
      // Name starts with query  
      else if (itemName.startsWith(query)) {
        score += 80;
        hasMatch = true;
      }
      // Name contains query as whole word
      else if (itemName.includes(` ${query} `) || itemName.includes(` ${query}`)) {
        score += 60;
        hasMatch = true;
      }
      
      // Brand exact matches
      if (itemBrand === query) {
        score += 70;
        hasMatch = true;
      } else if (itemBrand.startsWith(query)) {
        score += 50;
        hasMatch = true;
      }
      
      // **PRIORITY 3: PARTIAL MATCHES** (lower scores)
      // Name contains query anywhere
      if (itemName.includes(query)) {
        score += 40;
        hasMatch = true;
      }
      
      // Brand partial matches
      if (itemBrand.includes(query)) {
        score += 30;
        hasMatch = true;
      }
      
      // Category text matches (when not boosted above)
      if (categoryBoost === 0 && item.categoryPath.some(cat => {
        const catNormalized = stripDiacritics(cat.toLowerCase());
        return catNormalized.includes(query);
      })) {
        score += 20;
        hasMatch = true;
      }

      // Badge matches (lowest priority)
      if (item.badges.some(badge => {
        const badgeNormalized = stripDiacritics(badge.toLowerCase());
        return badgeNormalized.includes(query);
      })) {
        score += 10;
        hasMatch = true;
      }
      
      return { item, score, hasMatch };
    });
    
    // Filter out non-matches and sort by relevance score
    filtered = scoredItems
      .filter(({ hasMatch }) => hasMatch)
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .map(({ item }) => item);
  }

  // Category filter
  if (params.cat) {
    const categoryParts = params.cat.split('/').map(c => c.toLowerCase());
    filtered = filtered.filter(item => {
      if (categoryParts.length === 1) {
        return item.categoryPath[0]?.toLowerCase() === categoryParts[0];
      } else if (categoryParts.length === 2) {
        return item.categoryPath[0]?.toLowerCase() === categoryParts[0] && 
               item.categoryPath[1]?.toLowerCase() === categoryParts[1];
      }
      return false;
    });
  }

  // Store filter
  if (params.stores && params.stores.length > 0) {
    filtered = filtered.filter(item => {
      const allStores = [item.cheapest.store, ...item.otherStores.map(o => o.store)];
      return allStores.some(store => params.stores!.includes(store));
    });
  }

  // Price range filter
  if (params.price_min !== undefined || params.price_max !== undefined) {
    filtered = filtered.filter(item => {
      const price = item.cheapest.price;
      if (params.price_min !== undefined && price < params.price_min) return false;
      if (params.price_max !== undefined && price > params.price_max) return false;
      return true;
    });
  }

  // Promo filter
  if (params.promo) {
    filtered = filtered.filter(item =>
      item.cheapest.promoPct !== undefined || 
      item.otherStores.some(offer => offer.promoPct !== undefined)
    );
  }

  // Availability filter
  if (params.availability === 'in_stock') {
    filtered = filtered.filter(item => item.availability === 'in_stock');
  }

  // Brand filter
  if (params.brand && params.brand.length > 0) {
    filtered = filtered.filter(item =>
      item.brand && params.brand!.includes(item.brand)
    );
  }

  // Properties filter (badges)
  if (params.props && params.props.length > 0) {
    filtered = filtered.filter(item =>
      params.props!.some(prop => 
        item.badges.some(badge => 
          stripDiacritics(badge.toLowerCase()).includes(stripDiacritics(prop.toLowerCase()))
        )
      )
    );
  }

  return filtered;
}

/**
 * Apply sorting to search results
 */
function applySorting(items: SearchResultItem[], params: SearchParams): SearchResultItem[] {
  const sortBy = params.sort || 'relevance';
  
  switch (sortBy) {
    case 'price_asc':
      return items.sort((a, b) => a.cheapest.price - b.cheapest.price);
      
    case 'price_desc':
      return items.sort((a, b) => b.cheapest.price - a.cheapest.price);
      
    case 'promo_desc':
      return items.sort((a, b) => {
        const aPromo = a.cheapest.promoPct || 0;
        const bPromo = b.cheapest.promoPct || 0;
        return bPromo - aPromo;
      });
      
    case 'newest':
      // For now, just return as-is (would need timestamp data for true newest)
      return items;
      
    case 'relevance':
    default:
      // If there's a search query, relevance is already applied in filtering
      // If no query, sort by price ascending as default
      if (!params.q) {
        return items.sort((a, b) => a.cheapest.price - b.cheapest.price);
      }
      // With query, items are already sorted by relevance score
      return items;
  }
}

/**
 * Get category relevance boost for search query
 * Implements Priority 1: Products from relevant category get highest scores
 */
function getCategoryRelevanceBoost(query: string, categoryPath: string[]): number {
  const normalizedQuery = stripDiacritics(query.toLowerCase());
  
  // Define category mappings for common search terms
  const categoryMappings: Record<string, string[]> = {
    // Milk & Dairy queries should prioritize dairy categories
    'lapte': ['lactate & oua', 'lactate & branzeturi', 'lactate & lapte'],
    'milk': ['lactate & oua', 'lactate & branzeturi', 'lactate & lapte'],
    'iaurt': ['lactate & oua', 'lactate & branzeturi', 'lactate & iaurt'],
    'yogurt': ['lactate & oua', 'lactate & branzeturi', 'lactate & iaurt'],
    'branza': ['lactate & oua', 'lactate & branzeturi'],
    'cheese': ['lactate & oua', 'lactate & branzeturi'],
    'smantana': ['lactate & oua', 'lactate & branzeturi'],
    'unt': ['lactate & oua', 'lactate & unt'],
    'butter': ['lactate & oua', 'lactate & unt'],
    
    // Meat queries should prioritize meat categories
    'carne': ['carne & peste', 'carne & mezeluri', 'carne & pasari'],
    'meat': ['carne & peste', 'carne & mezeluri'],
    'porc': ['carne & peste', 'carne & porc'],
    'vita': ['carne & peste', 'carne & vita'],
    'pasare': ['carne & peste', 'carne & pasari'],
    
    // Beverages
    'apa': ['bauturi'],
    'water': ['bauturi'],
    'suc': ['bauturi'],
    'juice': ['bauturi'],
    'bere': ['bauturi', 'bauturi alcoolice'],
    'beer': ['bauturi', 'bauturi alcoolice'],
    
    // Fruits & Vegetables
    'fructe': ['fructe & legume'],
    'fruits': ['fructe & legume'],
    'legume': ['fructe & legume'],
    'vegetables': ['fructe & legume'],
    'mere': ['fructe & legume'],
    'apples': ['fructe & legume'],
    'banane': ['fructe & legume'],
    'bananas': ['fructe & legume'],
    
    // Bakery
    'paine': ['brutarie & patiserie'],
    'bread': ['brutarie & patiserie'],
    
    // Sweets
    'ciocolata': ['dulciuri & mic dejun'],
    'chocolate': ['dulciuri & mic dejun'],
    'bomboane': ['dulciuri & mic dejun'],
    'candy': ['dulciuri & mic dejun']
  };
  
  // Check if query matches any category mapping
  const relevantCategories = categoryMappings[normalizedQuery] || [];
  
  for (const category of relevantCategories) {
    // Check if product is in a relevant category
    for (const productCategory of categoryPath) {
      const normalizedProductCategory = stripDiacritics(productCategory.toLowerCase());
      
      if (normalizedProductCategory.includes(category)) {
        return 200; // High boost for category-relevant products
      }
    }
  }
  
  return 0; // No category boost
}

/**
 * Precompute filter text for fast results filtering
 * Creates searchable text from: name + brand + size + categoryPath
 */
function precomputeFilterText(item: SearchResultItem): string {
  const parts = [
    item.name,
    item.brand || '',
    // Extract size from badges (like "1L", "500g", etc.)
    ...item.badges.filter(badge => /\d+\s*(ml|l|g|kg|buc|bucati|bucăți)/.test(badge.toLowerCase())),
    ...item.categoryPath
  ];
  
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Apply results filter to global result set
 * Preserves original ranking order, no re-sorting
 */
function applyResultsFilter(allResults: SearchResultItem[], filterQuery: string): SearchResultItem[] {
  if (!filterQuery.trim()) {
    return allResults;
  }

  const query = filterQuery.toLowerCase().trim();
  const queryTokens = query.split(/\s+/).filter(token => token.length > 0);
  
  if (queryTokens.length === 0) {
    return allResults;
  }

  // Filter: ALL tokens must appear in product (AND logic)
  // Preserve exact order from global search
  return allResults.filter(item => {
    const filterText = (item as any)._filterText || precomputeFilterText(item);
    
    // Check if ALL query tokens appear in the filter text
    return queryTokens.every(token => filterText.includes(token));
  });
}

/**
 * Generate search facets
 */
async function generateFacets(items: SearchResultItem[], params: SearchParams) {
  // Categories
  const categories = new Map<string, number>();
  items.forEach(item => {
    item.categoryPath.forEach(cat => {
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });
  });

  // Stores
  const stores: Record<string, number> = {};
  items.forEach(item => {
    const allStores = [item.cheapest.store, ...item.otherStores.map(o => o.store)];
    allStores.forEach(store => {
      stores[store] = (stores[store] || 0) + 1;
    });
  });

  // Brands
  const brands = new Map<string, number>();
  items.forEach(item => {
    if (item.brand) {
      brands.set(item.brand, (brands.get(item.brand) || 0) + 1);
    }
  });

  // Properties (badges)
  const properties = new Map<string, number>();
  items.forEach(item => {
    item.badges.forEach(badge => {
      properties.set(badge, (properties.get(badge) || 0) + 1);
    });
  });

  // Price range
  const prices = items.map(item => item.cheapest.price);
  const minPrice = Math.min(...prices, 0);
  const maxPrice = Math.max(...prices, 100);

  // Price buckets
  const buckets: PriceBucket[] = [];
  const bucketSize = Math.ceil((maxPrice - minPrice) / 10);
  for (let i = 0; i < 10; i++) {
    const from = minPrice + (i * bucketSize);
    const to = from + bucketSize;
    const count = items.filter(item => 
      item.cheapest.price >= from && item.cheapest.price < to
    ).length;
    
    if (count > 0) {
      buckets.push({
        from,
        to,
        count,
        label: `${from.toFixed(0)}-${to.toFixed(0)} RON`
      });
    }
  }

  return {
    categories: Array.from(categories.entries()).map(([name, count]) => ({ 
      id: name.toLowerCase().replace(/\s+/g, '-'), 
      label: name, 
      count 
    })),
    stores,
    properties: Array.from(properties.entries()).map(([name, count]) => ({ 
      id: name.toLowerCase().replace(/\s+/g, '-'), 
      label: name, 
      count 
    })),
    types: [], // Domain-specific types would be extracted from attributes
    brands: Array.from(brands.entries()).map(([name, count]) => ({ 
      id: name.toLowerCase().replace(/\s+/g, '-'), 
      label: name, 
      count 
    })),
    price: { min: minPrice, max: maxPrice, buckets },
    activeCounts: {}
  };
}