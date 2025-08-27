// Types aligned with workspace rules specification

export type StoreId = "auchan" | "carrefour" | "kaufland" | "mega" | "freshful" | "lidl";

export interface Offer {
  storeId: StoreId;
  price: number;
  unit: "kg" | "l" | "buc" | "g" | "ml";
  url?: string;
  image?: string;
  inStock?: boolean;
  promoLabel?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  categoryL1: string;
  categoryL2?: string;
  attrs?: {
    fat?: number;
    process?: string;
    sizeGrams?: number;
    sizeMl?: number;
  };
  adminFlags?: ("MISSING_PRICE" | "UNIT_MISMATCH" | "IMAGE_MISSING")[];
  offers: Offer[];
}

export interface SearchItem {
  product: Product;
  cheapest: Offer;
  alternatives: Offer[];
}

// Raw vendor data interfaces for normalization
export interface RawVendorProduct {
  name: string;
  brand?: string;
  price: string | number;
  unit?: string;
  image?: string;
  url?: string;
  category?: string;
  ean?: string;
  gtin?: string;
  inStock?: boolean;
  stock?: boolean;
  availability?: string;
  promoLabel?: string;
  promotionText?: string;
  promotional?: boolean;
  size?: string;
  weight?: string;
  [key: string]: any; // Allow additional vendor-specific fields
}

// Taxonomy types
export interface CategoryMapping {
  [vendorCategoryPath: string]: string; // vendor path -> canonical path
}

export interface SynonymDictionary {
  [canonicalTerm: string]: string[]; // canonical -> synonyms array
}
