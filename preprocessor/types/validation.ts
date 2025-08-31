/**
 * Zod validation schemas for canonical product format
 * 
 * These schemas provide runtime validation and type safety for the
 * preprocessing pipeline, with detailed error reporting.
 */

import { z } from 'zod';

// Basic enums and primitives
export const StoreIdSchema = z.enum(["auchan", "carrefour", "kaufland", "mega", "freshful"]);

export const MappingStatusSchema = z.enum([
  "ok", 
  "fallback-parent", 
  "fuzzy-match", 
  "manual-override", 
  "unmapped"
]);

export const DiscountTypeSchema = z.enum([
  "percent", 
  "second_item_percent", 
  "bundle", 
  "card", 
  "price_drop"
]);

export const UnitTypeSchema = z.enum(["kg", "l", "pcs", "g", "ml"]);

export const StockStatusSchema = z.enum([
  "in_stock", 
  "out_of_stock", 
  "limited_stock", 
  "pre_order"
]);

export const ImageRoleSchema = z.enum(["thumb", "main", "gallery"]);

// Component schemas
export const SourceSchema = z.object({
  shop: StoreIdSchema,
  shop_product_id: z.string().min(1, "Product ID cannot be empty"),
  source_file: z.string().min(1, "Source file path required"),
  fetched_at: z.string().datetime("Invalid ISO datetime format")
});

export const PricingSchema = z.object({
  price: z.number().positive("Price must be positive"),
  currency: z.literal("RON"),
  unit_price: z.object({
    value: z.number().positive("Unit price must be positive"),
    unit: z.string().min(1, "Unit specification required")
  }).optional(),
  original_price: z.number().positive().optional(),
  discount: z.object({
    type: DiscountTypeSchema.nullable(),
    value: z.number().min(0, "Discount value cannot be negative"),
    meta: z.string().nullable()
  }).optional()
});

export const PackSchema = z.object({
  size: z.number().positive("Pack size must be positive"),
  unit: UnitTypeSchema
});

export const StockSchema = z.object({
  in_stock: z.boolean(),
  status: StockStatusSchema
});

export const ImageInfoSchema = z.object({
  url: z.string().url("Invalid image URL"),
  role: ImageRoleSchema
});

export const AttributesSchema = z.object({
  country: z.string().optional(),
  dietary: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  promo_flags: z.array(z.string()).default([])
});

export const UrlsSchema = z.object({
  product: z.string().url().optional(),
  shop_category: z.string().url().optional()
});

export const AuditSchema = z.object({
  normalizer_version: z.string().min(1, "Normalizer version required"),
  category_rule_id: z.string().optional(),
  notes: z.array(z.string()).default([])
});

// Main canonical product schema
export const CanonicalProductSchema = z.object({
  canonical_id: z.string().min(1, "Canonical ID required"),
  source: SourceSchema,
  
  // Product information
  title: z.string().min(1, "Product title required"),
  brand: z.string().optional(),
  description: z.string().optional(),
  
  // Category hierarchy
  category_path: z.array(z.string().min(1, "Category level cannot be empty"))
    .min(1, "At least one category level required"),
  category_slug: z.string().min(1, "Category slug required")
    .regex(/^[a-z0-9\-\/]+$/, "Category slug must be lowercase, alphanumeric with hyphens and slashes"),
  mapping_status: MappingStatusSchema,
  
  // Media
  images: z.array(ImageInfoSchema).default([]),
  
  // Pricing and availability
  pricing: PricingSchema,
  pack: PackSchema,
  stock: StockSchema,
  
  // Identifiers
  gtin: z.string().optional(),
  
  // Attributes and metadata
  attributes: AttributesSchema,
  urls: UrlsSchema,
  
  // Audit trail
  audit: AuditSchema
});

// Product index schema (minimal)
export const ProductIndexSchema = z.object({
  canonical_id: z.string().min(1),
  title: z.string().min(1),
  brand: z.string().optional(),
  category_path: z.array(z.string().min(1)).min(1),
  category_slug: z.string().min(1),
  price: z.number().positive(),
  images: z.array(z.string().url()).default([]),
  in_stock: z.boolean()
});

// Raw vendor product schema (input validation)
export const RawVendorProductSchema = z.object({
  name: z.string().min(1, "Product name required"),
  brand: z.string().optional(),
  price: z.union([z.string(), z.number()], {
    errorMap: () => ({ message: "Price must be string or number" })
  }),
  unit: z.string().optional(),
  image: z.string().optional(),
  url: z.string().optional(),
  category: z.string().optional(),
  ean: z.string().optional(),
  gtin: z.string().optional(),
  inStock: z.boolean().optional(),
  stock: z.boolean().optional(),
  availability: z.string().optional(),
  promoLabel: z.string().optional(),
  promotionText: z.string().optional(),
  promotional: z.boolean().optional(),
  size: z.string().optional(),
  weight: z.string().optional(),
  originalPrice: z.union([z.string(), z.number()]).optional(),
  discount: z.string().optional()
}).passthrough(); // Allow additional vendor-specific fields

// Category mapping result schema
export const CategoryMappingResultSchema = z.object({
  category_path: z.array(z.string().min(1)).min(1),
  category_slug: z.string().min(1),
  mapping_status: MappingStatusSchema,
  confidence: z.number().min(0).max(1).optional(),
  rule_id: z.string().optional(),
  notes: z.array(z.string()).default([])
});

// Unmapped category schema
export const UnmappedCategorySchema = z.object({
  shop: StoreIdSchema,
  original_category: z.string().min(1),
  sample_products: z.array(z.object({
    name: z.string().min(1),
    brand: z.string().optional(),
    url: z.string().optional()
  })).max(5, "Maximum 5 sample products"),
  count: z.number().int().positive(),
  first_seen: z.string().datetime(),
  suggestions: z.array(CategoryMappingResultSchema).optional()
});

// Processing job schema
export const ProcessingJobSchema = z.object({
  id: z.string().min(1),
  shop: StoreIdSchema,
  status: z.enum(["pending", "running", "completed", "failed"]),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  input_file: z.string().min(1),
  progress: z.object({
    total: z.number().int().min(0),
    processed: z.number().int().min(0),
    mapped: z.number().int().min(0),
    unmapped: z.number().int().min(0),
    errors: z.number().int().min(0)
  }).optional(),
  outputs: z.object({
    index_file: z.string(),
    category_shards: z.array(z.string()),
    search_indices: z.array(z.string()),
    reports: z.array(z.string())
  }).optional(),
  error_message: z.string().optional()
});

// Category rule schema
export const CategoryRuleSchema = z.object({
  id: z.string().min(1),
  shop: StoreIdSchema,
  pattern: z.string().min(1),
  pattern_type: z.enum(["exact", "regex", "synonym", "fuzzy"]),
  target_path: z.array(z.string().min(1)).min(1),
  confidence: z.number().min(0).max(1),
  created_by: z.enum(["system", "admin", "learning"]),
  created_at: z.string().datetime(),
  usage_count: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true)
});

// Export type inference helpers
export type CanonicalProduct = z.infer<typeof CanonicalProductSchema>;
export type ProductIndex = z.infer<typeof ProductIndexSchema>;
export type RawVendorProduct = z.infer<typeof RawVendorProductSchema>;
export type CategoryMappingResult = z.infer<typeof CategoryMappingResultSchema>;
export type UnmappedCategory = z.infer<typeof UnmappedCategorySchema>;
export type ProcessingJob = z.infer<typeof ProcessingJobSchema>;
export type CategoryRule = z.infer<typeof CategoryRuleSchema>;

// Validation helper functions
export function validateCanonicalProduct(data: unknown): CanonicalProduct {
  return CanonicalProductSchema.parse(data);
}

export function validateRawVendorProduct(data: unknown): RawVendorProduct {
  return RawVendorProductSchema.parse(data);
}

export function validateProductIndex(data: unknown): ProductIndex {
  return ProductIndexSchema.parse(data);
}

export function safeValidateCanonicalProduct(data: unknown): {
  success: boolean;
  data?: CanonicalProduct;
  error?: z.ZodError;
} {
  const result = CanonicalProductSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}
