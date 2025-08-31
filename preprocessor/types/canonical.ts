/**
 * Canonical Product Schema
 * 
 * This defines the unified product format that all shop-specific normalizers
 * must produce. Based on the specifications with flexible category hierarchy,
 * comprehensive audit trail, and support for sharded JSONL outputs.
 */

export type StoreId = "auchan" | "carrefour" | "kaufland" | "mega" | "freshful" | "lidl";

export type MappingStatus = "ok" | "fallback-parent" | "fuzzy-match" | "manual-override" | "unmapped";

export type DiscountType = "percent" | "second_item_percent" | "bundle" | "card" | "price_drop";

export type UnitType = "kg" | "l" | "pcs" | "g" | "ml";

export interface Source {
  shop: StoreId;
  shop_product_id: string;
  source_file: string;
  fetched_at: string; // ISO datetime
}

export interface Pricing {
  price: number;
  currency: "RON";
  unit_price?: {
    value: number;
    unit: string; // "RON/kg", "RON/l", "RON/pcs"
  };
  original_price?: number;
  discount?: {
    type: DiscountType | null;
    value: number;
    meta: string | null; // Original promo text
  };
}

export interface Pack {
  size: number;
  unit: UnitType;
}

export interface Stock {
  in_stock: boolean;
  status: "in_stock" | "out_of_stock" | "limited_stock" | "pre_order";
}

export interface ImageInfo {
  url: string;
  role: "thumb" | "main" | "gallery";
}

export interface Attributes {
  country?: string;
  dietary: string[]; // ["bio", "vegan", "gluten-free", "lactose-free"]
  allergens: string[];
  promo_flags: string[]; // ["discount", "new", "limited", "member-only"]
}

export interface Urls {
  product?: string;
  shop_category?: string;
}

export interface Audit {
  normalizer_version: string;
  category_rule_id?: string;
  notes: string[];
}

/**
 * Main Canonical Product interface
 * 
 * This is the unified format that all products are normalized to,
 * with flexible category hierarchy and comprehensive metadata.
 */
export interface CanonicalProduct {
  canonical_id: string;
  source: Source;
  
  // Product information
  title: string;
  brand?: string;
  description?: string;
  
  // Flexible category hierarchy
  category_path: string[]; // ["Meat", "Pork", "Cutlets"]
  category_slug: string;   // "meat/pork/cutlets"
  mapping_status: MappingStatus;
  
  // Media
  images: ImageInfo[];
  
  // Pricing and availability
  pricing: Pricing;
  pack: Pack;
  stock: Stock;
  
  // Identifiers
  gtin?: string; // EAN/GTIN when available
  
  // Attributes and metadata
  attributes: Attributes;
  urls?: Urls;
  
  // Audit trail
  audit: Audit;
}

/**
 * Minimal product info for index files
 */
export interface ProductIndex {
  canonical_id: string;
  title: string;
  brand?: string;
  category_path: string[];
  category_slug: string;
  price: number;
  images: string[]; // Just URLs
  in_stock: boolean;
}

/**
 * Raw vendor product interface for normalization input
 */
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
  originalPrice?: string | number;
  discount?: string;
  [key: string]: any; // Allow additional vendor-specific fields
}

/**
 * Category mapping result with confidence
 */
export interface CategoryMappingResult {
  category_path: string[];
  category_slug: string;
  mapping_status: MappingStatus;
  confidence?: number;
  rule_id?: string;
  notes?: string[];
}

/**
 * Unmapped category for review queue
 */
export interface UnmappedCategory {
  shop: StoreId;
  original_category: string;
  sample_products: Array<{
    name: string;
    brand?: string;
    url?: string;
  }>;
  count: number;
  first_seen: string; // ISO datetime
  suggestions?: CategoryMappingResult[];
}

/**
 * Processing job status
 */
export interface ProcessingJob {
  id: string;
  shop: StoreId;
  status: "pending" | "running" | "completed" | "failed";
  started_at?: string;
  completed_at?: string;
  input_file: string;
  progress?: {
    total: number;
    processed: number;
    mapped: number;
    unmapped: number;
    errors: number;
  };
  outputs?: {
    index_file: string;
    category_shards: string[];
    search_indices: string[];
    reports: string[];
  };
  error_message?: string;
}

/**
 * Category rule for mapping engine
 */
export interface CategoryRule {
  id: string;
  shop: StoreId;
  pattern: string;
  pattern_type: "exact" | "regex" | "synonym" | "fuzzy";
  target_path: string[];
  confidence: number;
  created_by: "system" | "admin" | "learning";
  created_at: string;
  usage_count: number;
  enabled: boolean;
}
