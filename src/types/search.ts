export type StoreId = 'kaufland' | 'carrefour' | 'mega' | 'auchan' | 'freshful' | string;

export type FacetKind = 'category' | 'multi' | 'boolean' | 'brand' | 'price' | 'range';

export type FacetOption = {
  id: string;
  label: string;
  count: number;
  parentId?: string;
};

export type PriceBucket = {
  from: number;
  to: number;
  count: number;
  label: string;
};

export type SearchParams = {
  q?: string;
  cat?: string;               // "bacanie/alimente-de-baza/lapte"
  stores?: string[];          // ["freshful","carrefour"]
  storeExclusive?: boolean;   // "Doar din acest magazin"
  promo?: boolean;
  availability?: 'in_stock' | 'all';
  props?: string[];           // ["eco","fara_gluten","made_in_ro","congelat"]
  types?: string[];           // domain-specific filters like "ulei:extravirgin"
  brand?: string[];
  price_min?: number;
  price_max?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'promo_desc' | 'newest';
  page?: number;
  pageSize?: number;
};

export type SearchResultItem = {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  categoryPath: string[];
  cheapest: { store: StoreId; price: number; promoPct?: number };
  otherStores: Array<{ store: StoreId; price: number; promoPct?: number }>;
  badges?: string[];  // ['eco','made_in_ro','fara_gluten','congelat']
  availability?: 'in_stock' | 'limited' | 'out_of_stock';
};

export type SearchResult = {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets: {
    categories: FacetOption[];   // hierarchical (include parentId)
    stores: Record<string, number>;
    properties: FacetOption[];   // eco, fara_gluten, etc.
    types: FacetOption[];        // domain-specific (Tip produs, Tip ulei…)
    brands: FacetOption[];
    price: { 
      min: number; 
      max: number; 
      buckets: PriceBucket[];
    };
    activeCounts: Record<string, number>; // for group badges
  };
};

export type WishlistOption = {
  id: string;
  name: string;
};

export type ComboOption = {
  id: string;
  name: string;
};