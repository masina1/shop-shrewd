/**
 * Main processing pipeline
 * 
 * Orchestrates the complete data processing workflow from raw shop data
 * to normalized, sharded outputs with category mapping and validation.
 */

import fs from 'fs/promises';
import path from 'path';
import { JsonlShardWriter } from './output/jsonl-writer.js';
import { FreshfulNormalizer } from './normalizers/freshful.js';
import { BaseNormalizer } from './normalizers/base.js';
import { CategoryMappingEngine } from './category-mapper/engine.js';
import { CanonicalProduct, StoreId, ProcessingJob, UnmappedCategory } from '@/types/canonical.js';
import { config, getDataPath, getOutputPath, getReportPath } from '@/config/environment.js';

export interface ProcessingOptions {
  inputPath?: string;
  outputPath?: string;
  limit?: number;
  dryRun?: boolean;
  strict?: boolean;
  enableReports?: boolean;
  enableVerbose?: boolean;
  batchSize?: number;
}

export interface ProcessingResult {
  success: boolean;
  shop: StoreId;
  stats: {
    totalInput: number;
    totalProcessed: number;
    totalMapped: number;
    totalUnmapped: number;
    totalErrors: number;
    processingTime: number;
    memoryPeak: number;
  };
  outputs: {
    indexFile: string;
    categoryShards: string[];
    searchIndices: string[];
    reports: string[];
  };
  unmappedCategories: UnmappedCategory[];
  errors: (string | object)[];
}

/**
 * Main processing pipeline orchestrator
 */
export class ProcessingPipeline {
  private normalizers: Map<StoreId, BaseNormalizer> = new Map();
  private categoryMapper: CategoryMappingEngine;
  
  constructor() {
    this.categoryMapper = new CategoryMappingEngine();
    // Initialize normalizers lazily
  }

  private async ensureInitialized(): Promise<void> {
    if (this.normalizers.size === 0) {
      await this.initializeNormalizers();
    }
  }
  
  /**
   * Process a single shop's data
   */
  async processShop(shop: StoreId, options: ProcessingOptions = {}): Promise<ProcessingResult> {
    await this.ensureInitialized();
    const startTime = performance.now();
    
    const result: ProcessingResult = {
      success: false,
      shop,
      stats: {
        totalInput: 0,
        totalProcessed: 0,
        totalMapped: 0,
        totalUnmapped: 0,
        totalErrors: 0,
        processingTime: 0,
        memoryPeak: 0
      },
      outputs: {
        indexFile: '',
        categoryShards: [],
        searchIndices: [],
        reports: []
      },
      unmappedCategories: [],
      errors: []
    };
    
    try {
      // 1. Setup and validation
      const { inputFiles, outputBasePath } = await this.setupProcessing(shop, options);
      result.stats.totalInput = await this.countTotalProducts(inputFiles);
      
      if (options.dryRun) {
        console.log(`[DRY RUN] Would process ${result.stats.totalInput} products from ${inputFiles.length} files`);
        result.success = true;
        return result;
      }
      
      // 2. Initialize output writer
      const shardWriter = new JsonlShardWriter(shop, outputBasePath);
      await shardWriter.initialize();
      
      // 3. Get normalizer for this shop
      const normalizer = this.getNormalizer(shop);
      
      // 4. Process all input files
      await this.processInputFiles(
        inputFiles, 
        normalizer, 
        shardWriter, 
        options, 
        result
      );
      
      // 5. Finalize outputs
      const shardingStats = await shardWriter.finalize();
      result.stats.totalProcessed = shardingStats.totalProducts;
      result.stats.memoryPeak = shardingStats.memoryPeak;
      
      // 6. Collect unmapped categories before reporting
      result.unmappedCategories = this.categoryMapper.getUnmappedQueue()
        .filter(cat => cat.shop === shop);
      
      // 7. Generate reports
      if (options.enableReports) {
        await this.generateReports(shop, result, shardingStats, outputBasePath);
      }
      
      if (options.strict && result.unmappedCategories.length > 0) {
        throw new Error(`Strict mode: Found ${result.unmappedCategories.length} unmapped categories`);
      }
      
      result.stats.processingTime = performance.now() - startTime;
      result.success = true;
      
      console.log(`✅ Processed ${shop}: ${result.stats.totalProcessed} products in ${(result.stats.processingTime / 1000).toFixed(2)}s`);
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      result.stats.processingTime = performance.now() - startTime;
      
      console.error(`❌ Failed to process ${shop}:`, error);
    }
    
    return result;
  }
  
  /**
   * Process multiple shops
   */
  async processMultiple(shops: StoreId[], options: ProcessingOptions = {}): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (const shop of shops) {
      console.log(`\n🔄 Processing ${shop}...`);
      const result = await this.processShop(shop, options);
      results.push(result);
      
      // Stop on first failure if strict mode
      if (options.strict && !result.success) {
        console.error(`❌ Stopping batch processing due to failure in ${shop}`);
        break;
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const totalProcessed = results.reduce((sum, r) => sum + r.stats.totalProcessed, 0);
    const totalTime = results.reduce((sum, r) => sum + r.stats.processingTime, 0);
    
    console.log(`\n📊 Batch Processing Summary:`);
    console.log(`   Shops: ${successful}/${shops.length} successful`);
    console.log(`   Products: ${totalProcessed.toLocaleString()}`);
    console.log(`   Time: ${(totalTime / 1000).toFixed(2)}s`);
    
    return results;
  }
  
  /**
   * Setup processing environment
   */
  private async setupProcessing(shop: StoreId, options: ProcessingOptions): Promise<{
    inputFiles: string[];
    outputBasePath: string;
  }> {
    // Determine paths
    const inputPath = options.inputPath || getDataPath(shop);
    const outputBasePath = options.outputPath || getOutputPath(shop);
    
    // Validate input directory
    try {
      await fs.access(inputPath);
    } catch {
      throw new Error(`Input directory not found: ${inputPath}`);
    }
    
    // Create output directory
    await fs.mkdir(outputBasePath, { recursive: true });
    
    // Find input files
    const files = await fs.readdir(inputPath);
    const jsonFiles = files
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(inputPath, f));
    
    if (jsonFiles.length === 0) {
      throw new Error(`No JSON files found in ${inputPath}`);
    }
    
    return { inputFiles: jsonFiles, outputBasePath };
  }
  
  /**
   * Count total products across all input files
   */
  private async countTotalProducts(inputFiles: string[]): Promise<number> {
    let total = 0;
    
    for (const file of inputFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const data = JSON.parse(content);
        total += Array.isArray(data) ? data.length : 0;
      } catch {
        // Skip invalid files in counting
      }
    }
    
    return total;
  }
  
  /**
   * Process all input files
   */
  private async processInputFiles(
    inputFiles: string[],
    normalizer: BaseNormalizer,
    shardWriter: JsonlShardWriter,
    options: ProcessingOptions,
    result: ProcessingResult
  ): Promise<void> {
    let processedCount = 0;
    const limit = options.limit || Infinity;
    
    for (const file of inputFiles) {
      if (processedCount >= limit) {
        console.log(`Reached limit of ${limit} products`);
        break;
      }
      
      try {
        const fileName = path.basename(file);
        console.log(`📁 Processing ${fileName}...`);
        
        // Load file
        const content = await fs.readFile(file, 'utf-8');
        const rawProducts = JSON.parse(content);
        
        if (!Array.isArray(rawProducts)) {
          throw new Error(`Expected array of products in ${fileName}`);
        }
        
        // Process products in batches
        const batchSize = options.batchSize || config.processing.batchSize;
        let fileProcessed = 0;
        
        for (let i = 0; i < rawProducts.length && processedCount < limit; i += batchSize) {
          const batch = rawProducts.slice(i, Math.min(i + batchSize, rawProducts.length, limit - processedCount));
          
          // Process batch
          const batchResults = normalizer.normalizeBatch(batch, {
            enableValidation: true,
            strictMapping: options.strict,
            verbose: options.enableVerbose,
            sourceFile: fileName
          });
          
          // Write products to shards
          for await (const normResult of batchResults) {
            if (normResult.success && normResult.product) {
              await shardWriter.writeProduct(normResult.product);
              
              // Update statistics
              if (normResult.product.mapping_status === 'ok') {
                result.stats.totalMapped++;
              } else {
                result.stats.totalUnmapped++;
              }
            } else {
              result.stats.totalErrors++;
              // Enhanced error tracking with product context
              const enhancedError = {
                message: normResult.errors.join(', '),
                source_file: fileName,
                line_number: normResult.lineNumber || 0,
                raw_product: normResult.rawProduct || null,
                product_name: normResult.rawProduct?.image_image__nanvf_description || normResult.rawProduct?.name || 'Unknown',
                timestamp: new Date().toISOString()
              };
              result.errors.push(enhancedError);
            }
            
            fileProcessed++;
            processedCount++;
          }
          
          // Progress reporting
          if (options.enableVerbose && processedCount % 1000 === 0) {
            console.log(`   Progress: ${processedCount.toLocaleString()} products processed`);
          }
        }
        
        console.log(`   ✅ ${fileName}: ${fileProcessed} products`);
        
      } catch (error) {
        const fileName = path.basename(file);
        const errorMsg = `Failed to process ${fileName}: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
  }
  
  /**
   * Generate processing reports
   */
  private async generateReports(
    shop: StoreId,
    result: ProcessingResult,
    shardingStats: any,
    outputBasePath?: string
  ): Promise<void> {
    const reportsDir = outputBasePath ? path.join(outputBasePath, 'reports') : path.dirname(getReportPath(shop, 'mapping-report'));
    await fs.mkdir(reportsDir, { recursive: true });
    
    // 1. Mapping report (CSV)
    const mappingReportPath = outputBasePath ? path.join(reportsDir, 'mapping-report.csv') : getReportPath(shop, 'mapping-report.csv');
    const categoryCoverage = shardingStats?.categoryCounts || {};
    const mappingCsv = this.generateMappingReportCsv({
      totalProducts: shardingStats?.totalProducts || 0,
      categoryCoverage
    });
    await fs.writeFile(mappingReportPath, mappingCsv);
    result.outputs.reports.push(mappingReportPath);
    
    // 2. Unmapped categories (JSONL)
    const unmappedPath = outputBasePath ? path.join(reportsDir, 'unmapped.jsonl') : getReportPath(shop, 'unmapped.jsonl');
    const unmappedJsonl = result.unmappedCategories
      .map(cat => JSON.stringify(cat))
      .join('\n');
    await fs.writeFile(unmappedPath, unmappedJsonl);
    result.outputs.reports.push(unmappedPath);
    
    // 2a. Unmapped categories summary (CSV for easier viewing)  
    const unmappedCsvPath = outputBasePath ? path.join(reportsDir, 'unmapped-summary.csv') : getReportPath(shop, 'unmapped-summary.csv');
    const unmappedCsv = this.generateUnmappedCsv(result.unmappedCategories);
    await fs.writeFile(unmappedCsvPath, unmappedCsv);
    result.outputs.reports.push(unmappedCsvPath);

    // 2b. Rejects/errors (JSONL)
    const rejectsPath = outputBasePath ? path.join(reportsDir, 'rejects.jsonl') : getReportPath(shop, 'rejects.jsonl');
    const rejectsJsonl = result.errors.map(err => {
      // Handle both old string format and new enhanced object format
      if (typeof err === 'string') {
        return JSON.stringify({ message: err, timestamp: new Date().toISOString() });
      } else {
        return JSON.stringify(err);
      }
    }).join('\n');
    await fs.writeFile(rejectsPath, rejectsJsonl);
    result.outputs.reports.push(rejectsPath);
    
    // 2c. Rejects summary (CSV for easier viewing)
    const rejectsCsvPath = outputBasePath ? path.join(reportsDir, 'rejects-summary.csv') : getReportPath(shop, 'rejects-summary.csv');
    const rejectsCsv = this.generateRejectsCsv(result.errors);
    await fs.writeFile(rejectsCsvPath, rejectsCsv);
    result.outputs.reports.push(rejectsCsvPath);
    
    // 3. Processing summary (JSON)
    const summaryPath = outputBasePath ? path.join(reportsDir, 'processing-summary.json') : getReportPath(shop, 'processing-summary.json');
    const summary = {
      shop,
      timestamp: new Date().toISOString(),
      stats: result.stats,
      category_coverage: categoryCoverage,
      unmapped_count: result.unmappedCategories.length,
      error_count: result.errors.length,
      config: {
        batch_size: config.processing.batchSize,
        memory_limit_mb: config.processing.memoryLimitMB,
        fuzzy_threshold: config.mapping.fuzzyThreshold
      }
    };
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    result.outputs.reports.push(summaryPath);
    
    console.log(`📊 Generated ${result.outputs.reports.length} reports`);
  }
  
  /**
   * Generate CSV unmapped categories report
   */
  private generateUnmappedCsv(unmappedCategories: any[]): string {
    const headers = ['Original Category', 'Product Count', 'First Seen', 'Sample Product Names'];
    const rows = unmappedCategories.map(cat => [
      cat.original_category || 'Unknown',
      cat.count || 0,
      cat.first_seen || new Date().toISOString(),
      cat.sample_products?.map((p: any) => p.name).join('; ') || 'No samples'
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  }

  /**
   * Generate CSV rejects report
   */
  private generateRejectsCsv(errors: any[]): string {
    const headers = ['Source File', 'Line Number', 'Product Name', 'Error Message', 'Timestamp'];
    const rows = errors.map(err => {
      if (typeof err === 'string') {
        return ['Unknown', 'Unknown', 'Unknown', err, new Date().toISOString()];
      } else {
        return [
          err.source_file || 'Unknown',
          err.line_number || 'Unknown', 
          err.product_name || 'Unknown',
          err.message || 'Unknown error',
          err.timestamp || new Date().toISOString()
        ];
      }
    });
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  }

  /**
   * Generate CSV mapping report
   */
  private generateMappingReportCsv(shardingStats: any): string {
    const headers = ['Category', 'Product Count', 'Percentage'];
    const rows = Object.entries(shardingStats.categoryCoverage)
      .map(([category, count]) => [
        category,
        count,
        ((count as number / shardingStats.totalProducts) * 100).toFixed(2) + '%'
      ]);
    
    // Sort by count descending
    rows.sort((a, b) => (b[1] as number) - (a[1] as number));
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }
  
  /**
   * Initialize normalizers for all shops
   */
  private async initializeNormalizers(): Promise<void> {
    const { UniversalFallbackNormalizer } = await import('./normalizers/universal-fallback.js');
    
    // Shop-specific normalizers
    const freshfulNormalizer = new FreshfulNormalizer();
    const fallbackNormalizer = new UniversalFallbackNormalizer(this.categoryMapper);
    
    // Use Freshful for Freshful, fallback for others
    this.normalizers.set('freshful', freshfulNormalizer);
    this.normalizers.set('auchan', fallbackNormalizer);
    this.normalizers.set('carrefour', fallbackNormalizer);
    this.normalizers.set('kaufland', fallbackNormalizer);
    this.normalizers.set('mega', fallbackNormalizer);
    this.normalizers.set('lidl', fallbackNormalizer);
  }
  
  /**
   * Get normalizer for shop
   */
  private getNormalizer(shop: StoreId): BaseNormalizer {
    const normalizer = this.normalizers.get(shop);
    if (!normalizer) {
      throw new Error(`No normalizer available for shop: ${shop}`);
    }
    return normalizer;
  }
  
  /**
   * Create a processing job for async tracking
   */
  createJob(shop: StoreId, inputFile: string): ProcessingJob {
    return {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shop,
      status: 'pending',
      input_file: inputFile,
      progress: {
        total: 0,
        processed: 0,
        mapped: 0,
        unmapped: 0,
        errors: 0
      }
    };
  }
  
  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    shops: Array<{
      shop: StoreId;
      lastProcessed?: string;
      productCount: number;
      categoryCount: number;
      unmappedCount: number;
    }>;
    totalProducts: number;
    totalCategories: number;
  }> {
    const shops: StoreId[] = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful'];
    const shopStats = [];
    let totalProducts = 0;
    const allCategories = new Set<string>();
    
    for (const shop of shops) {
      try {
        const metadataPath = path.join(getOutputPath(shop), 'metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
        
        const productCount = metadata.stats?.totalProducts || 0;
        const categories = Object.keys(metadata.stats?.categoryCoverage || {});
        
        shopStats.push({
          shop,
          lastProcessed: metadata.processed_at,
          productCount,
          categoryCount: categories.length,
          unmappedCount: 0 // TODO: Calculate from unmapped queue
        });
        
        totalProducts += productCount;
        categories.forEach(cat => allCategories.add(cat));
        
      } catch {
        shopStats.push({
          shop,
          productCount: 0,
          categoryCount: 0,
          unmappedCount: 0
        });
      }
    }
    
    return {
      shops: shopStats,
      totalProducts,
      totalCategories: allCategories.size
    };
  }
}
