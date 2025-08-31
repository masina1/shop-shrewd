/**
 * Base normalizer interface and common utilities
 * 
 * Provides the foundation for all shop-specific normalizers with
 * streaming processing capabilities and comprehensive error handling.
 */

import { CanonicalProduct, RawVendorProduct, StoreId } from '@/types/canonical.js';
import { validateCanonicalProduct, safeValidateCanonicalProduct } from '@/types/validation.js';
import { config } from '@/config/environment.js';

export interface NormalizationOptions {
  // Processing options
  batchSize?: number;
  enableValidation?: boolean;
  enableAuditTrail?: boolean;
  
  // Category mapping options
  strictMapping?: boolean;
  enableFuzzyMatching?: boolean;
  learningMode?: boolean;
  
  // Output options
  generateIndex?: boolean;
  enableSharding?: boolean;
  
  // Debug options
  verbose?: boolean;
  saveErrors?: boolean;
  sampleSize?: number;
  
  // Source information
  sourceFile?: string;
}

export interface NormalizationResult {
  success: boolean;
  product?: CanonicalProduct;
  errors: string[];
  warnings: string[];
  lineNumber?: number;
  processingTime?: number;
  rawProduct?: any; // Include raw product data for error reporting
}

export interface NormalizationStats {
  total: number;
  successful: number;
  failed: number;
  mapped: number;
  unmapped: number;
  processingTime: number;
  memoryUsage: number;
  categoryCoverage: Record<string, number>;
}

/**
 * Base normalizer interface that all shop-specific normalizers must implement
 */
export interface INormalizer {
  readonly storeId: StoreId;
  readonly version: string;
  
  /**
   * Normalize a single raw product to canonical format
   */
  normalize(
    rawProduct: RawVendorProduct, 
    options?: Partial<NormalizationOptions>
  ): Promise<NormalizationResult>;
  
  /**
   * Normalize a batch of products with streaming support
   */
  normalizeBatch(
    rawProducts: RawVendorProduct[], 
    options?: Partial<NormalizationOptions>
  ): AsyncGenerator<NormalizationResult, NormalizationStats>;
  
  /**
   * Validate that this normalizer can handle the given data format
   */
  canHandle(rawProduct: unknown): boolean;
  
  /**
   * Get schema information for this normalizer
   */
  getSchema(): {
    requiredFields: string[];
    optionalFields: string[];
    description: string;
  };
}

/**
 * Abstract base class providing common functionality for all normalizers
 */
export abstract class BaseNormalizer implements INormalizer {
  abstract readonly storeId: StoreId;
  abstract readonly version: string;
  
  protected defaultOptions: NormalizationOptions = {
    batchSize: config.processing.batchSize,
    enableValidation: true,
    enableAuditTrail: true,
    strictMapping: false,
    enableFuzzyMatching: true,
    learningMode: false,
    generateIndex: true,
    enableSharding: true,
    verbose: false,
    saveErrors: true,
    sampleSize: 0
  };
  
  /**
   * Normalize a single product with comprehensive error handling
   */
  async normalize(
    rawProduct: RawVendorProduct, 
    options: Partial<NormalizationOptions> = {}
  ): Promise<NormalizationResult> {
    const startTime = performance.now();
    const opts = { ...this.defaultOptions, ...options };
    const result: NormalizationResult = {
      success: false,
      errors: [],
      warnings: [],
      processingTime: 0,
      rawProduct: rawProduct // Include raw product for error reporting
    };
    
    try {
      // Pre-validation
      if (!this.canHandle(rawProduct)) {
        result.errors.push('Raw product format not supported by this normalizer');
        return result;
      }
      
      // Perform normalization
      const canonicalProduct = await this.performNormalization(rawProduct, opts);
      
      // Post-validation
      if (opts.enableValidation) {
        const validation = safeValidateCanonicalProduct(canonicalProduct);
        if (!validation.success) {
          result.errors.push(`Validation failed: ${validation.error?.message}`);
          return result;
        }
        result.product = validation.data as CanonicalProduct;
      } else {
        result.product = canonicalProduct;
      }
      
      result.success = true;
      
    } catch (error) {
      result.errors.push(`Normalization error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      result.processingTime = performance.now() - startTime;
    }
    
    return result;
  }
  
  /**
   * Process products in batches with memory-efficient streaming
   */
  async* normalizeBatch(
    rawProducts: RawVendorProduct[], 
    options: Partial<NormalizationOptions> = {}
  ): AsyncGenerator<NormalizationResult, NormalizationStats> {
    const startTime = performance.now();
    const opts = { ...this.defaultOptions, ...options };
    const stats: NormalizationStats = {
      total: rawProducts.length,
      successful: 0,
      failed: 0,
      mapped: 0,
      unmapped: 0,
      processingTime: 0,
      memoryUsage: 0,
      categoryCoverage: {}
    };
    
    // Process in batches to manage memory
    const batchSize = opts.batchSize || 1000;
    let processed = 0;
    
    for (let i = 0; i < rawProducts.length; i += batchSize) {
      const batch = rawProducts.slice(i, i + batchSize);
      
      for (const [index, rawProduct] of batch.entries()) {
        const lineNumber = i + index + 1;
        
        try {
          const result = await this.normalize(rawProduct, opts);
          result.lineNumber = lineNumber;
          
          // Update statistics
          if (result.success) {
            stats.successful++;
            if (result.product) {
              // Track category mapping success
              if (result.product.mapping_status === 'ok') {
                stats.mapped++;
              } else {
                stats.unmapped++;
              }
              
              // Track category coverage
              const categoryKey = result.product.category_path.join(' > ');
              stats.categoryCoverage[categoryKey] = 
                (stats.categoryCoverage[categoryKey] || 0) + 1;
            }
          } else {
            stats.failed++;
          }
          
          yield result;
          processed++;
          
          // Memory management: collect garbage periodically
          if (processed % 1000 === 0) {
            if (global.gc) {
              global.gc();
            }
            stats.memoryUsage = process.memoryUsage().heapUsed;
          }
          
        } catch (error) {
          stats.failed++;
          yield {
            success: false,
            errors: [`Batch processing error: ${error instanceof Error ? error.message : String(error)}`],
            warnings: [],
            lineNumber
          };
        }
      }
    }
    
    stats.processingTime = performance.now() - startTime;
    return stats;
  }
  
  /**
   * Abstract method for shop-specific normalization logic
   */
  protected abstract performNormalization(
    rawProduct: RawVendorProduct, 
    options: NormalizationOptions
  ): Promise<CanonicalProduct>;
  
  /**
   * Default implementation checks for required fields
   */
  canHandle(rawProduct: unknown): boolean {
    if (!rawProduct || typeof rawProduct !== 'object') return false;
    
    const product = rawProduct as Record<string, unknown>;
    const schema = this.getSchema();
    
    // Check that all required fields are present
    return schema.requiredFields.every(field => 
      field in product && product[field] !== undefined && product[field] !== null
    );
  }
  
  /**
   * Abstract method for schema definition
   */
  abstract getSchema(): {
    requiredFields: string[];
    optionalFields: string[];
    description: string;
  };
  
  /**
   * Generate audit trail information
   */
  protected generateAudit(notes: string[] = []): {
    normalizer_version: string;
    notes: string[];
  } {
    return {
      normalizer_version: this.version,
      notes: [
        `Normalized by ${this.storeId} normalizer v${this.version}`,
        `Timestamp: ${new Date().toISOString()}`,
        ...notes
      ]
    };
  }
  
  /**
   * Generate canonical ID with fallback strategies
   */
  protected generateCanonicalId(
    rawProduct: RawVendorProduct,
    fallbackToHash: boolean = true
  ): string {
    // Try GTIN/EAN first
    if (rawProduct.gtin) {
      return `${this.storeId}:${rawProduct.gtin}`;
    }
    if (rawProduct.ean) {
      return `${this.storeId}:${rawProduct.ean}`;
    }
    
    // Try shop product ID
    if ('id' in rawProduct && rawProduct.id) {
      return `${this.storeId}:${rawProduct.id}`;
    }
    
    // Try URL-based ID
    if (rawProduct.url) {
      const urlMatch = rawProduct.url.match(/\/([^\/]+)(?:\?|$)/);
      if (urlMatch && urlMatch[1]) {
        return `${this.storeId}:${urlMatch[1]}`;
      }
    }
    
    // Fallback to content-based hash
    if (fallbackToHash) {
      const hashContent = [
        rawProduct.name,
        rawProduct.brand,
        rawProduct.size || rawProduct.weight
      ].filter(Boolean).join('|');
      
      // Simple hash function (for real implementation, use crypto.createHash)
      let hash = 0;
      for (let i = 0; i < hashContent.length; i++) {
        const char = hashContent.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return `${this.storeId}:hash_${Math.abs(hash).toString(36)}`;
    }
    
    throw new Error('Unable to generate canonical ID: no suitable identifier found');
  }
  
  /**
   * Normalize category slug for deterministic URLs
   */
  protected generateCategorySlug(categoryPath: string[]): string {
    return categoryPath
      .map(segment => segment
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      )
      .join('/');
  }
  
  /**
   * Extract source information from raw product
   */
  protected generateSource(
    rawProduct: RawVendorProduct,
    sourceFile: string
  ): {
    shop: StoreId;
    shop_product_id: string;
    source_file: string;
    fetched_at: string;
  } {
    return {
      shop: this.storeId,
      shop_product_id: this.extractShopProductId(rawProduct),
      source_file: sourceFile,
      fetched_at: new Date().toISOString()
    };
  }
  
  /**
   * Extract shop-specific product ID
   */
  protected extractShopProductId(rawProduct: RawVendorProduct): string {
    // Try various ID fields
    if ('id' in rawProduct && rawProduct.id) {
      return String(rawProduct.id);
    }
    
    if (rawProduct.url) {
      const urlMatch = rawProduct.url.match(/\/([^\/]+)(?:\?|$)/);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
    }
    
    // Fallback to hash of name + brand
    const content = [rawProduct.name, rawProduct.brand].filter(Boolean).join('|');
    return `generated_${content.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}
