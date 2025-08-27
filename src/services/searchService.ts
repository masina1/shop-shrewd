import { SearchParams, SearchResult, SearchResultItem, FacetOption, PriceBucket, StoreId } from '@/types/search';
import { productRepository } from '@/lib/productRepository';
import { SearchItem } from '@/types/product';
import { stripDiacritics } from '@/lib/normalization/textUtils';

export interface ISearchService {
  search(params: SearchParams): Promise<SearchResult>;
}

/**
 * Enhanced search service using normalized vendor data
 */
export const searchService: ISearchService = {
  async search(params: SearchParams): Promise<SearchResult> {
    // Add small delay to simulate network call
    await new Promise(resolve => setTimeout(resolve, 200));

    const pageSize = params.pageSize || 24;
    const page = params.page || 1;

    try {
      // Get all search items from repository
      let searchItems = await productRepository.getAllSearchItems();
      
      // Apply filters
      searchItems = await applyFilters(searchItems, params);
      
      // Apply sorting
      searchItems = applySorting(searchItems, params);
      
      // Convert to SearchResultItems format
      const resultItems = searchItems.map(item => convertToSearchResultItem(item));
      
      // Generate facets
      const facets = await generateFacets(searchItems, params);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = resultItems.slice(startIndex, endIndex);

      return {
        items: paginatedItems,
        total: resultItems.length,
        page,
        pageSize,
        hasMore: endIndex < resultItems.length,
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
 * Apply search filters to items
 */
async function applyFilters(items: SearchItem[], params: SearchParams): Promise<SearchItem[]> {
  let filtered = [...items];

  // Text search
  if (params.q) {
    const query = stripDiacritics(params.q.toLowerCase());
    filtered = filtered.filter(item => {
      const product = item.product;
      
      // Search in name
      if (stripDiacritics(product.name.toLowerCase()).includes(query)) {
        return true;
      }
      
      // Search in brand
      if (product.brand && stripDiacritics(product.brand.toLowerCase()).includes(query)) {
        return true;
      }
      
      // Search in category
      if (stripDiacritics(product.categoryL1.toLowerCase()).includes(query)) {
        return true;
      }
      
      if (product.categoryL2 && stripDiacritics(product.categoryL2.toLowerCase()).includes(query)) {
        return true;
      }
      
      return false;
    });
  }

  // Category filter
  if (params.cat) {
    const categoryParts = params.cat.split('/').map(c => c.toLowerCase());
    filtered = filtered.filter(item => {
      const product = item.product;
      
      if (categoryParts.length === 1) {
        return product.categoryL1.toLowerCase() === categoryParts[0];
      } else if (categoryParts.length === 2) {
        return product.categoryL1.toLowerCase() === categoryParts[0] && 
               product.categoryL2?.toLowerCase() === categoryParts[1];
      }
      
      return false;
    });
  }

  // Store filter
  if (params.stores && params.stores.length > 0) {
    filtered = filtered.filter(item =>
      item.product.offers.some(offer => params.stores!.includes(offer.storeId))
    );
  }

  // Price range filter
  if (params.price_min !== undefined || params.price_max !== undefined) {
    filtered = filtered.filter(item => {
      const minPrice = item.cheapest.price;
      if (params.price_min !== undefined && minPrice < params.price_min) return false;
      if (params.price_max !== undefined && minPrice > params.price_max) return false;
      return true;
    });
  }

  // Promo filter
  if (params.promo) {
    filtered = filtered.filter(item =>
      item.product.offers.some(offer => offer.promoLabel)
    );
  }

  // Availability filter
  if (params.availability === 'in_stock') {
    filtered = filtered.filter(item =>
      item.product.offers.some(offer => offer.inStock !== false)
    );
  }

  // Brand filter
  if (params.brand && params.brand.length > 0) {
    filtered = filtered.filter(item =>
      item.product.brand && params.brand!.includes(item.product.brand)
    );
  }

  return filtered;
}

/**
 * Apply sorting to search results
 */
function applySorting(items: SearchItem[], params: SearchParams): SearchItem[] {
  const sortBy = params.sort || 'relevance';
  
  switch (sortBy) {
    case 'price_asc':
      return items.sort((a, b) => a.cheapest.price - b.cheapest.price);
      
    case 'price_desc':
      return items.sort((a, b) => b.cheapest.price - a.cheapest.price);
      
    case 'promo_desc':
      return items.sort((a, b) => {
        const aHasPromo = a.product.offers.some(offer => offer.promoLabel) ? 1 : 0;
        const bHasPromo = b.product.offers.some(offer => offer.promoLabel) ? 1 : 0;
        return bHasPromo - aHasPromo;
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
 * Convert SearchItem to SearchResultItem format
 */
function convertToSearchResultItem(item: SearchItem): SearchResultItem {
  const product = item.product;
  
  // Debug logging for price issues
  if (product.name.toLowerCase().includes('cappy')) {
    console.log('🔍 Cappy Product Debug:', {
      name: product.name,
      cheapestPrice: item.cheapest.price,
      promoLabel: item.cheapest.promoLabel,
      offers: product.offers.map(o => ({ store: o.storeId, price: o.price, promo: o.promoLabel }))
    });
  }
  
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    image: product.image || '/placeholder.svg',
    categoryPath: [product.categoryL1, product.categoryL2].filter(Boolean) as string[],
    cheapest: {
      store: item.cheapest.storeId,
      price: item.cheapest.price,
      promoPct: item.cheapest.promoLabel ? extractPromoPercentage(item.cheapest.promoLabel) : undefined
    },
    otherStores: item.alternatives.map(offer => ({
      store: offer.storeId,
      price: offer.price,
      promoPct: offer.promoLabel ? extractPromoPercentage(offer.promoLabel) : undefined
    })),
    badges: product.adminFlags || [],
    availability: item.cheapest.inStock !== false ? 'in_stock' : 'out_of_stock'
  };
}

/**
 * Extract percentage from promo label
 */
function extractPromoPercentage(promoLabel: string): number | undefined {
  const match = promoLabel.match(/-?(\d+)%/);
  return match ? parseInt(match[1]) : undefined;
}

/**
 * Generate facets for filtering
 */
async function generateFacets(items: SearchItem[], params: SearchParams) {
  // Categories
  const categoryCounts: Record<string, number> = {};
  const storeCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  
  items.forEach(item => {
    const product = item.product;
    
    // Count categories
    const l1Key = product.categoryL1.toLowerCase();
    categoryCounts[l1Key] = (categoryCounts[l1Key] || 0) + 1;
    
    if (product.categoryL2) {
      const l2Key = `${product.categoryL1}/${product.categoryL2}`.toLowerCase();
      categoryCounts[l2Key] = (categoryCounts[l2Key] || 0) + 1;
    }
    
    // Count stores
    product.offers.forEach(offer => {
      storeCounts[offer.storeId] = (storeCounts[offer.storeId] || 0) + 1;
    });
    
    // Count brands
    if (product.brand) {
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
    }
  });
  
  // Convert to facet format
  const categories: FacetOption[] = Object.entries(categoryCounts).map(([path, count]) => {
    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const parentId = parts.length > 1 ? parts.slice(0, -1).join('/') : undefined;
    
    return {
      id: path,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      parentId
    };
  });
  
  const brands: FacetOption[] = Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a) // Sort by count desc
    .slice(0, 15) // Top 15 brands
    .map(([brand, count]) => ({
      id: brand,
      label: brand,
      count
    }));
  
  // Price range
  const prices = items.map(item => item.cheapest.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;
  
  return {
    categories,
    stores: storeCounts,
    properties: [],
    types: [],
    brands,
    price: { min: minPrice, max: maxPrice, buckets: [] },
    activeCounts: {}
  };
}