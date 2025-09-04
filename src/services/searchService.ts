import { SearchParams, SearchResult, SearchResultItem, FacetOption, PriceBucket, StoreId } from '@/types/search';
import { mockSearchProducts, SearchProduct } from '@/lib/mockData';

/**
 * ================================
 * SEARCH SERVICE
 * ================================
 * 
 * This service handles product search functionality.
 * Currently uses centralized mock data from @/lib/mockData.ts
 * 
 * TODO: Replace mockSearchProducts with real API calls when backend is ready
 * Example: const response = await fetch('/api/search', { method: 'POST', body: JSON.stringify(params) });
 */

export interface ISearchService {
  search(params: SearchParams): Promise<SearchResult>;
}

function filterProducts(products: SearchProduct[], params: SearchParams) {
  let filtered = [...products];

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    );
  }

  if (params.cat) {
    const categoryPath = params.cat.split('/').map(c => c.toLowerCase());
    filtered = filtered.filter(product =>
      categoryPath.every((cat, index) =>
        product.categoryPath[index]?.toLowerCase() === cat
      )
    );
  }

  if (params.stores && params.stores.length > 0) {
    filtered = filtered.filter(product =>
      product.offers.some(offer => params.stores!.includes(offer.store))
    );
  }

  if (params.price_min !== undefined || params.price_max !== undefined) {
    filtered = filtered.filter(product => {
      const minPrice = Math.min(...product.offers.map(o => o.price));
      if (params.price_min !== undefined && minPrice < params.price_min) return false;
      if (params.price_max !== undefined && minPrice > params.price_max) return false;
      return true;
    });
  }

  if (params.promo) {
    filtered = filtered.filter(product =>
      product.offers.some(offer => offer.promoPct && offer.promoPct > 0)
    );
  }

  if (params.availability === 'in_stock') {
    filtered = filtered.filter(product =>
      product.offers.some(offer => offer.availability === 'in_stock')
    );
  }

  if (params.props && params.props.length > 0) {
    filtered = filtered.filter(product =>
      product.badges?.some(badge => params.props!.includes(badge))
    );
  }

  return filtered;
}

function normalizeProducts(products: SearchProduct[], params: SearchParams): SearchResultItem[] {
  return products.map(product => {
    const availableOffers = product.offers.filter(offer => 
      params.availability !== 'in_stock' || offer.availability === 'in_stock'
    );
    
    const sortedOffers = [...availableOffers].sort((a, b) => a.price - b.price);
    const cheapest = sortedOffers[0];
    const otherStores = sortedOffers.slice(1);

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      categoryPath: product.categoryPath,
      cheapest: cheapest ? {
        store: cheapest.store,
        price: cheapest.price,
        promoPct: cheapest.promoPct
      } : { store: 'unknown' as StoreId, price: 0 },
      otherStores: otherStores.map(offer => ({
        store: offer.store,
        price: offer.price,
        promoPct: offer.promoPct
      })),
      badges: product.badges,
      availability: cheapest?.availability as 'in_stock' | 'limited' | 'out_of_stock' | undefined
    };
  });
}

function computeFacets(filteredProducts: SearchProduct[]) {
  const categoryCounts: Record<string, number> = {};
  filteredProducts.forEach(product => {
    product.categoryPath.forEach((cat, index) => {
      const path = product.categoryPath.slice(0, index + 1).map(c => c.toLowerCase()).join('/');
      if (!categoryCounts[path]) categoryCounts[path] = 0;
      categoryCounts[path]++;
    });
  });

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

  const stores: Record<string, number> = {};
  filteredProducts.forEach(product => {
    product.offers.forEach(offer => {
      if (!stores[offer.store]) stores[offer.store] = 0;
      stores[offer.store]++;
    });
  });

  const prices = filteredProducts.flatMap(p => p.offers.map(o => o.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;

  return {
    categories,
    stores,
    properties: [],
    types: [],
    brands: [],
    price: { min: minPrice, max: maxPrice, buckets: [] },
    activeCounts: {}
  };
}

export const searchService: ISearchService = {
  async search(params: SearchParams): Promise<SearchResult> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const pageSize = params.pageSize || 24;
    const page = params.page || 1;

    const filteredProducts = filterProducts(mockSearchProducts, params);
    let items = normalizeProducts(filteredProducts, params);
    const facets = computeFacets(filteredProducts);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      pageSize,
      hasMore: endIndex < items.length,
      facets
    };
  }
};