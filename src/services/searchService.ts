import { SearchParams, SearchResult, SearchResultItem, FacetOption, PriceBucket, StoreId } from '@/types/search';
import { loadAllProducts } from '@/lib/dataLoader';
import { stripDiacritics } from '@/lib/normalization/textUtils';


export interface ISearchService {
  search(params: SearchParams): Promise<SearchResult>;
}

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
  const productImage = product.images?.[0]?.url || '/placeholder.svg';
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

  // Text search
  if (params.q) {
    const query = stripDiacritics(params.q.toLowerCase());
    filtered = filtered.filter(item => {
      // Search in name
      if (stripDiacritics(item.name.toLowerCase()).includes(query)) {
        return true;
      }
      
      // Search in brand
      if (item.brand && stripDiacritics(item.brand.toLowerCase()).includes(query)) {
        return true;
      }
      
      // Search in category path
      if (item.categoryPath.some(cat => 
        stripDiacritics(cat.toLowerCase()).includes(query)
      )) {
        return true;
      }

      // Search in badges
      if (item.badges.some(badge => 
        stripDiacritics(badge.toLowerCase()).includes(query)
      )) {
        return true;
      }
      
      return false;
    });
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
      // Sort by price for now (could enhance with relevance scoring)
      return items.sort((a, b) => a.cheapest.price - b.cheapest.price);
  }
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