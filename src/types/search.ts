export type StoreId = 'kaufland' | 'carrefour' | 'mega' | 'auchan' | 'freshful' | string;

export type Offer = {
  store: StoreId;
  price: number;           // RON
  unitPrice?: string;      // "72,45 Lei/kg"
  promoPct?: number;       // e.g. 38 for -38%
  tags?: string[];         // ['eco','gluten_free','made_in_ro','congelat']
  availability?: 'in_stock' | 'limited' | 'out_of_stock';
  url?: string;
};

export type Product = {
  id: string;              // normalized cross-store id
  name: string;
  brand?: string;
  image?: string;
  categoryPath: string[];  // ['Dairy','Milk']
  badges?: string[];       // same as tags, for UI
  offers: Offer[];         // 1..n
};

export type SearchParams = {
  q?: string;
  stores?: StoreId[];
  cat?: string;     // "dairy/milk"
  min?: number;
  max?: number;
  promo?: boolean;
  inStock?: boolean;
  tags?: string[];  // ['eco', 'gluten_free', 'made_in_ro']
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'promo_desc' | 'newest';
  page?: number;
  pageSize?: number;
};

export type FacetCounts = {
  stores: Record<StoreId, number>;
  categories: Array<{ id: string; name: string; count: number; parentId?: string }>;
  priceBounds: { min: number; max: number };
  tags: Record<string, number>;
  categoryLabels: Record<string, string>;
};

export type SearchResultItem = {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  categoryPath: string[];
  cheapest: { store: StoreId; price: number; promoPct?: number };
  otherStores: Array<{ store: StoreId; price: number; promoPct?: number }>;
  badges?: string[];
  availability?: 'in_stock' | 'limited' | 'out_of_stock';
};

export type SearchResult = {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets: FacetCounts;
};

export type WishlistOption = {
  id: string;
  name: string;
};

export type ComboOption = {
  id: string;
  name: string;
};