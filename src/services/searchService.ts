
import { SearchParams, SearchResult, Product, SearchResultItem, FacetCounts, StoreId } from '@/types/search';

// Mock data - replace with API calls later
const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Lapte integral 3.5% 1L Zuzu',
    brand: 'Zuzu',
    image: '/placeholder.svg',
    categoryPath: ['Dairy', 'Milk'],
    badges: ['made_in_ro'],
    offers: [
      { store: 'kaufland', price: 6.99, unitPrice: '6.99 Lei/L', availability: 'in_stock' },
      { store: 'carrefour', price: 7.29, unitPrice: '7.29 Lei/L', promoPct: 15, availability: 'in_stock' },
      { store: 'freshful', price: 6.89, unitPrice: '6.89 Lei/L', availability: 'in_stock' }
    ]
  },
  {
    id: 'p2',
    name: 'Pâine integrală 500g Vel Pitar',
    brand: 'Vel Pitar',
    image: '/placeholder.svg',
    categoryPath: ['Bakery', 'Bread'],
    badges: ['eco', 'made_in_ro'],
    offers: [
      { store: 'kaufland', price: 4.99, availability: 'in_stock' },
      { store: 'mega', price: 5.19, promoPct: 10, availability: 'in_stock' },
      { store: 'freshful', price: 4.79, availability: 'limited' }
    ]
  },
  {
    id: 'p3',
    name: 'Brânză telemea 300g Delaco',
    brand: 'Delaco',
    image: '/placeholder.svg',
    categoryPath: ['Dairy', 'Cheese'],
    badges: ['made_in_ro'],
    offers: [
      { store: 'carrefour', price: 12.99, promoPct: 20, availability: 'in_stock' },
      { store: 'kaufland', price: 14.49, availability: 'in_stock' },
      { store: 'auchan', price: 13.79, availability: 'out_of_stock' }
    ]
  },
  {
    id: 'p4',
    name: 'Iaurt grecesc 2% 150g Danone',
    brand: 'Danone',
    image: '/placeholder.svg',
    categoryPath: ['Dairy', 'Yogurt'],
    badges: ['eco'],
    offers: [
      { store: 'kaufland', price: 3.49, availability: 'in_stock' },
      { store: 'carrefour', price: 3.69, availability: 'in_stock' },
      { store: 'mega', price: 3.29, promoPct: 25, availability: 'in_stock' }
    ]
  },
  {
    id: 'p5',
    name: 'Ouă M 10 bucăți Fermierul',
    brand: 'Fermierul',
    image: '/placeholder.svg',
    categoryPath: ['Dairy', 'Eggs'],
    badges: ['eco', 'made_in_ro'],
    offers: [
      { store: 'freshful', price: 8.99, availability: 'in_stock' },
      { store: 'kaufland', price: 9.49, availability: 'in_stock' },
      { store: 'carrefour', price: 8.79, promoPct: 15, availability: 'limited' }
    ]
  },
  {
    id: 'p6',
    name: 'Paste integrale 500g Barilla',
    brand: 'Barilla',
    image: '/placeholder.svg',
    categoryPath: ['Pantry', 'Pasta'],
    badges: ['gluten_free'],
    offers: [
      { store: 'carrefour', price: 7.99, availability: 'in_stock' },
      { store: 'kaufland', price: 8.29, availability: 'in_stock' },
      { store: 'mega', price: 7.49, promoPct: 30, availability: 'in_stock' }
    ]
  }
];

export interface ISearchService {
  search(params: SearchParams): Promise<SearchResult>;
}

function normalizeProducts(products: Product[], params: SearchParams): SearchResultItem[] {
  return products.map(product => {
    // Find cheapest offer
    const availableOffers = product.offers.filter(offer => 
      !params.inStock || offer.availability === 'in_stock'
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
      availability: cheapest?.availability
    };
  });
}

function filterProducts(products: Product[], params: SearchParams): Product[] {
  let filtered = [...products];

  // Text search
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    );
  }

  // Store filter
  if (params.stores && params.stores.length > 0) {
    filtered = filtered.filter(product =>
      product.offers.some(offer => params.stores!.includes(offer.store))
    );
  }

  // Category filter
  if (params.cat) {
    const categoryPath = params.cat.split('/');
    filtered = filtered.filter(product =>
      categoryPath.every((cat, index) =>
        product.categoryPath[index]?.toLowerCase() === cat.toLowerCase()
      )
    );
  }

  // Price range filter
  if (params.min !== undefined || params.max !== undefined) {
    filtered = filtered.filter(product => {
      const minPrice = Math.min(...product.offers.map(o => o.price));
      if (params.min !== undefined && minPrice < params.min) return false;
      if (params.max !== undefined && minPrice > params.max) return false;
      return true;
    });
  }

  // Promo filter
  if (params.promo) {
    filtered = filtered.filter(product =>
      product.offers.some(offer => offer.promoPct && offer.promoPct > 0)
    );
  }

  // In stock filter
  if (params.inStock) {
    filtered = filtered.filter(product =>
      product.offers.some(offer => offer.availability === 'in_stock')
    );
  }

  // Tags filter
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter(product =>
      product.badges?.some(badge => params.tags!.includes(badge))
    );
  }

  return filtered;
}

function computeFacets(filteredProducts: Product[], allProducts: Product[], params: SearchParams): FacetCounts {
  // Compute store counts
  const stores: Record<StoreId, number> = {};
  filteredProducts.forEach(product => {
    product.offers.forEach(offer => {
      if (!stores[offer.store]) stores[offer.store] = 0;
      stores[offer.store]++;
    });
  });

  // Compute category counts with proper hierarchy
  const categoryCounts: Record<string, number> = {};
  filteredProducts.forEach(product => {
    product.categoryPath.forEach((cat, index) => {
      const path = product.categoryPath.slice(0, index + 1).map(c => c.toLowerCase()).join('/');
      if (!categoryCounts[path]) categoryCounts[path] = 0;
      categoryCounts[path]++;
    });
  });

  // Build categories with parent relationships
  const categories = Object.entries(categoryCounts).map(([path, count]) => {
    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const parentId = parts.length > 1 ? parts.slice(0, -1).join('/') : undefined;
    
    // Capitalize the name for display
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    
    return { 
      id: path, 
      name: displayName, 
      count, 
      parentId 
    };
  });

  // Compute price bounds
  const prices = filteredProducts.flatMap(p => p.offers.map(o => o.price));
  const priceBounds = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 100
  };

  // Compute tag counts
  const tags: Record<string, number> = {};
  filteredProducts.forEach(product => {
    product.badges?.forEach(badge => {
      if (!tags[badge]) tags[badge] = 0;
      tags[badge]++;
    });
  });

  const categoryLabels: Record<string, string> = {
    'dairy': 'Lactate',
    'bakery': 'Panificație',
    'pantry': 'Cămară',
    'milk': 'Lapte',
    'cheese': 'Brânză',
    'yogurt': 'Iaurt',
    'eggs': 'Ouă',
    'bread': 'Pâine',
    'pasta': 'Paste'
  };

  return {
    stores,
    categories,
    priceBounds,
    tags,
    categoryLabels
  };
}

function sortProducts(items: SearchResultItem[], sortBy: string = 'relevance'): SearchResultItem[] {
  const sorted = [...items];
  
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.cheapest.price - b.cheapest.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.cheapest.price - a.cheapest.price);
    case 'promo_desc':
      return sorted.sort((a, b) => (b.cheapest.promoPct || 0) - (a.cheapest.promoPct || 0));
    case 'newest':
      return sorted; // Would sort by created date in real app
    case 'relevance':
    default:
      return sorted;
  }
}

export const searchService: ISearchService = {
  async search(params): Promise<SearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const pageSize = params.pageSize || 12;
    const page = params.page || 1;

    // Filter products based on search params
    const filteredProducts = filterProducts(mockProducts, params);
    
    // Convert to search result items
    let items = normalizeProducts(filteredProducts, params);
    
    // Sort items
    items = sortProducts(items, params.sort);

    // Compute facets from filtered results
    const facets = computeFacets(filteredProducts, mockProducts, params);

    // Paginate
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
