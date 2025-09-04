/**
 * ================================
 * CENTRALIZED MOCK DATA
 * ================================
 * 
 * This file contains ALL mock data for the application.
 * When implementing real API integration, replace these exports with API calls.
 * 
 * Key integration points:
 * - searchService.ts: Replace mockProducts with API endpoint
 * - Home.tsx: Replace mockProducts with API endpoint  
 * - All other pages: Replace respective mock data with API calls
 * 
 * TODO: Replace with real API calls when backend is ready
 */

// Search-compatible product structure (main product interface)
export interface SearchProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  categoryPath: string[]; // ['Băcănie', 'Alimente de bază', 'Lapte']
  badges?: string[]; // ['eco', 'made_in_ro', 'fara_gluten']
  offers: ProductOffer[];
}

export interface ProductOffer {
  store: string;
  price: number;
  unitPrice?: string;
  promoPct?: number;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
}

// Legacy Product interface (for backward compatibility)
export interface Product {
  id: string;
  name: string;
  image: string;
  lowestPrice: number;
  store: string;
  category?: string;
}

export interface Offer {
  productId: string;
  store: string;
  price: number;
  image: string;
  wasPrice?: number;
  outOfStock?: boolean;
  promo?: boolean;
}

export interface Combo {
  id: string;
  title: string;
  description: string;
  items: string[];
  total: number;
  savings: number;
  image?: string;
}

export interface Wishlist {
  id: string;
  name: string;
  items: string[];
  subtotal: number;
  createdAt: string;
}

// ===== MAIN PRODUCT DATA (Used by Search & Home pages) =====
// TODO: Replace with API call to /api/products
export const mockSearchProducts: SearchProduct[] = [
  {
    id: 'p1',
    name: 'Lapte integral 3.5% 1L Zuzu',
    brand: 'Zuzu',
    image: '/placeholder.svg',
    categoryPath: ['Băcănie', 'Alimente de bază', 'Lapte'],
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
    categoryPath: ['Băcănie', 'Panificație', 'Pâine'],
    badges: ['eco', 'made_in_ro'],
    offers: [
      { store: 'kaufland', price: 4.99, availability: 'in_stock' },
      { store: 'mega', price: 5.19, promoPct: 10, availability: 'in_stock' },
      { store: 'freshful', price: 4.79, availability: 'limited' }
    ]
  },
  {
    id: 'p3',
    name: 'Mozzarella 350g Hochland',
    brand: 'Hochland',
    image: '/placeholder.svg',
    categoryPath: ['Băcănie', 'Lactate', 'Brânză'],
    badges: ['imported'],
    offers: [
      { store: 'carrefour', price: 16.49, availability: 'in_stock' },
      { store: 'kaufland', price: 17.99, availability: 'in_stock' },
      { store: 'freshful', price: 18.49, promoPct: 8, availability: 'in_stock' }
    ]
  },
  {
    id: 'p4',
    name: 'Mușchi file 100g Scandia',
    brand: 'Scandia',
    image: '/placeholder.svg',
    categoryPath: ['Băcănie', 'Carne', 'Șuncă'],
    badges: ['made_in_ro'],
    offers: [
      { store: 'freshful', price: 7.09, availability: 'in_stock' },
      { store: 'kaufland', price: 7.49, promoPct: 5, availability: 'in_stock' },
      { store: 'carrefour', price: 7.99, availability: 'limited' }
    ]
  },
  {
    id: 'p5',
    name: 'Ouă L 10 bucăți Fermierul',
    brand: 'Fermierul',
    image: '/placeholder.svg',
    categoryPath: ['Băcănie', 'Lactate', 'Ouă'],
    badges: ['eco', 'made_in_ro'],
    offers: [
      { store: 'mega', price: 13.99, availability: 'in_stock' },
      { store: 'kaufland', price: 14.49, availability: 'in_stock' },
      { store: 'carrefour', price: 15.99, promoPct: 12, availability: 'in_stock' }
    ]
  },
  {
    id: 'p6',
    name: 'Paste 500g Barilla',
    brand: 'Barilla',
    image: '/placeholder.svg',
    categoryPath: ['Băcănie', 'Alimente de bază', 'Paste'],
    badges: ['imported'],
    offers: [
      { store: 'carrefour', price: 5.99, availability: 'in_stock' },
      { store: 'kaufland', price: 6.49, promoPct: 10, availability: 'in_stock' },
      { store: 'mega', price: 6.99, availability: 'out_of_stock' }
    ]
  }
];

// Legacy Product interface for backward compatibility
// TODO: Remove when all components migrate to SearchProduct
export const mockProducts: Product[] = mockSearchProducts.map(product => {
  const cheapestOffer = product.offers.reduce((min, offer) => 
    offer.price < min.price ? offer : min
  );
  
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    lowestPrice: cheapestOffer.price,
    store: cheapestOffer.store,
    category: product.categoryPath[product.categoryPath.length - 1]
  };
});

export const mockOffers: Offer[] = [
  { productId: "p2", store: "Freshful", price: 7.09, image: "/thumb-fresh.png" },
  { productId: "p2", store: "Store A", price: 7.49, image: "/thumb-a.png", wasPrice: 8.99, promo: true },
  { productId: "p2", store: "Store B", price: 7.99, image: "/thumb-b.png" },
  { productId: "p2", store: "Store C", price: 8.49, image: "/thumb-c.png", outOfStock: true },
  
  { productId: "p1", store: "Freshful", price: 12.49, image: "/thumb-fresh.png" },
  { productId: "p1", store: "Store A", price: 13.99, image: "/thumb-a.png" },
  { productId: "p1", store: "Store B", price: 12.99, image: "/thumb-b.png" },
  
  { productId: "p3", store: "Freshful", price: 16.49, image: "/thumb-fresh.png" },
  { productId: "p3", store: "Store A", price: 17.99, image: "/thumb-a.png" },
  { productId: "p3", store: "Store B", price: 18.49, image: "/thumb-b.png", wasPrice: 21.99, promo: true },
];

export const mockCombos: Combo[] = [
  {
    id: "c1",
    title: "Daily Basics",
    description: "Essential daily items for your household",
    items: ["Lapte", "Ouă", "Pâine", "Mușchi file"],
    total: 39.99,
    savings: 6.50,
    image: "/combo-daily.png"
  },
  {
    id: "c2",
    title: "Starter Basket",
    description: "Perfect starter pack for new apartments",
    items: ["Lapte", "Paste", "Mozzarella", "Pâine"],
    total: 42.99,
    savings: 8.20,
    image: "/combo-starter.png"
  },
  {
    id: "c3",
    title: "Weekly Saver",
    description: "Best deals for your weekly shopping",
    items: ["Lapte", "Ouă", "Paste", "Mozzarella", "Pâine"],
    total: 58.99,
    savings: 12.75,
    image: "/combo-weekly.png"
  }
];

export const mockWishlists: Wishlist[] = [
  {
    id: "w1",
    name: "Beginner pantry",
    items: ["Lapte", "Paste", "Sos roșii"],
    subtotal: 28.97,
    createdAt: "2024-01-15"
  },
  {
    id: "w2",
    name: "Weekly Shopping",
    items: ["Lapte", "Ouă", "Pâine", "Mușchi file"],
    subtotal: 39.56,
    createdAt: "2024-01-18"
  }
];

// Dashboard-specific mock data
export interface DashboardUser {
  id: string;
  name: string;
  preferredStores: string[];
}

export interface PriceAlert {
  productId: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  store: string;
}

export interface PriceDrop {
  productId: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  store: string;
  image: string;
}

export interface Budget {
  cap: number;
  current: number;
}

export const mockDashboardUser: DashboardUser = {
  id: "u1",
  name: "Ana",
  preferredStores: ["Freshful", "Carrefour"]
};

export const mockPriceAlerts: PriceAlert[] = [
  {
    productId: "p2",
    name: "Mușchi file 100g",
    oldPrice: 7.99,
    newPrice: 7.09,
    store: "Freshful"
  }
];

export const mockPriceDrops: PriceDrop[] = [
  {
    productId: "pMilk",
    name: "Lapte 1.5% 1.5L",
    oldPrice: 14.39,
    newPrice: 12.49,
    store: "Freshful",
    image: "/placeholder-milk.png"
  },
  {
    productId: "pBread",
    name: "Pâine integrală 500g",
    oldPrice: 6.99,
    newPrice: 4.99,
    store: "Store A",
    image: "/placeholder-bread.png"
  }
];

export const mockBudget: Budget = { 
  cap: 150, 
  current: 92.3 
};

export const mockRecentProducts: string[] = ["p2", "p3", "pMilk"];

// ===== HELPER FUNCTIONS =====
// Get cheapest price for a product
export const getCheapestPrice = (product: SearchProduct): { price: number; store: string } => {
  const cheapest = product.offers.reduce((min, offer) => 
    offer.price < min.price ? offer : min
  );
  return { price: cheapest.price, store: cheapest.store };
};

// Usage references for all mock data
export const mockDataUsage = {
  searchProducts: {
    usage: ["Search page - main product data", "Home page - featured products", "Product pages", "API replacement point"],
    components: ["SearchPage", "Home", "ProductCard", "ProductGrid"],
    apiReplacement: "Replace with API call to /api/products"
  },
  products: {
    usage: ["Legacy support - will be removed", "Backward compatibility"],
    components: ["Legacy components - to be updated"]
  },
  offers: {
    usage: ["Product detail pages - price comparison", "Store price listings"],
    components: ["ProductPage", "OfferDetail"]
  },
  combos: {
    usage: ["Combos page", "Dashboard - suggested combos", "Home page - featured combos"],
    components: ["CombosPage", "ComboDetail", "Dashboard"]
  },
  wishlists: {
    usage: ["Wishlists page", "Dashboard - user wishlists", "Wishlist detail pages"],
    components: ["WishlistsPage", "WishlistDetail", "Dashboard"]
  },
  dashboardUser: {
    usage: ["Dashboard - user welcome, preferences"],
    components: ["Dashboard"]
  },
  priceAlerts: {
    usage: ["Dashboard - price drop notifications"],
    components: ["Dashboard"]
  },
  priceDrops: {
    usage: ["Dashboard - recent price drops site-wide"],
    components: ["Dashboard"]
  },
  budget: {
    usage: ["Dashboard - weekly spending tracker"],
    components: ["Dashboard"]
  },
  recentProducts: {
    usage: ["Dashboard - recently viewed products"],
    components: ["Dashboard"]
  }
};

// Search function
export const searchProducts = (query: string): Product[] => {
  if (!query.trim()) return [];
  
  return mockProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
};

// Get product by ID
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

// Get offers for product
export const getOffersForProduct = (productId: string): Offer[] => {
  return mockOffers.filter(offer => offer.productId === productId);
};

// Get combo by ID
export const getComboById = (id: string): Combo | undefined => {
  return mockCombos.find(combo => combo.id === id);
};

// Get wishlist by ID
export const getWishlistById = (id: string): Wishlist | undefined => {
  return mockWishlists.find(list => list.id === id);
};