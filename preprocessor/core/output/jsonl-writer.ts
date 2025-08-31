/**
 * Streaming JSONL writer with memory-efficient processing
 * 
 * Handles large datasets by streaming products to JSONL files
 * with automatic sharding by category and memory management.
 */

import fs from 'fs/promises';
import { createWriteStream, WriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { CanonicalProduct, ProductIndex, StoreId } from '@/types/canonical.js';
import { config, getCategoryShardPath, getProductIndexPath } from '@/config/environment.js';

export interface ShardWriter {
  categorySlug: string;
  filePath: string;
  stream: WriteStream;
  recordCount: number;
  sizeBytes: number;
}

export interface ShardingStats {
  totalProducts: number;
  totalShards: number;
  categoryCounts: Record<string, number>;
  processingTime: number;
  memoryPeak: number;
}

/**
 * Memory-efficient JSONL writer with category-based sharding
 */
export class JsonlShardWriter {
  private shop: StoreId;
  private outputBasePath: string;
  private shardWriters: Map<string, ShardWriter> = new Map();
  private indexWriter: WriteStream | null = null;
  private stats: ShardingStats;
  private startTime: number;
  
  constructor(shop: StoreId, outputBasePath: string) {
    this.shop = shop;
    this.outputBasePath = outputBasePath;
    this.stats = {
      totalProducts: 0,
      totalShards: 0,
      categoryCounts: {},
      processingTime: 0,
      memoryPeak: 0
    };
    this.startTime = performance.now();
  }
  
  /**
   * Initialize the writer system
   */
  async initialize(): Promise<void> {
    // Create necessary directories
    await this.createDirectories();
    
    // Initialize index writer
    const indexPath = path.join(this.outputBasePath, 'products.index.jsonl');
    this.indexWriter = createWriteStream(indexPath, { flags: 'w' });
  }
  
  /**
   * Write a canonical product to appropriate shards
   */
  async writeProduct(product: CanonicalProduct): Promise<void> {
    try {
      // Write to category shard
      await this.writeToShard(product);
      
      // Write to index
      await this.writeToIndex(product);
      
      // Update statistics
      this.updateStats(product);
      
      // Memory management
      await this.manageMemory();
      
    } catch (error) {
      throw new Error(`Failed to write product ${product.canonical_id}: ${error}`);
    }
  }
  
  /**
   * Write multiple products efficiently
   */
  async writeProducts(products: CanonicalProduct[]): Promise<void> {
    const batchSize = config.processing.batchSize;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      await Promise.all(batch.map(product => this.writeProduct(product)));
      
      // Progress reporting
      if (i % (batchSize * 10) === 0) {
        const progress = ((i + batch.length) / products.length * 100).toFixed(1);
        console.log(`Progress: ${progress}% (${i + batch.length}/${products.length})`);
      }
    }
  }
  
  /**
   * Process products from a stream
   */
  async processStream(
    productStream: NodeJS.ReadableStream,
    transform?: (data: any) => CanonicalProduct
  ): Promise<void> {
    const transformStream = new Transform({
      objectMode: true,
      transform: async (chunk, encoding, callback) => {
        try {
          const product = transform ? transform(chunk) : chunk as CanonicalProduct;
          await this.writeProduct(product);
          callback();
        } catch (error) {
          callback(error);
        }
      }
    });
    
    await pipeline(productStream, transformStream);
  }
  
  /**
   * Finalize all writers and generate summary
   */
  async finalize(): Promise<ShardingStats> {
    // Close all shard writers
    await Promise.all(
      Array.from(this.shardWriters.values()).map(writer => 
        this.closeShard(writer)
      )
    );
    
    // Close index writer
    if (this.indexWriter) {
      await this.closeStream(this.indexWriter);
    }
    
    // Update final statistics
    this.stats.processingTime = performance.now() - this.startTime;
    this.stats.totalShards = this.shardWriters.size;
    this.stats.memoryPeak = Math.max(this.stats.memoryPeak, process.memoryUsage().heapUsed);
    
    // Generate metadata file
    await this.generateMetadata();
    
    return this.stats;
  }
  
  /**
   * Write product to appropriate category shard
   */
  private async writeToShard(product: CanonicalProduct): Promise<void> {
    const categorySlug = product.category_slug;
    
    // Get or create shard writer
    let shardWriter = this.shardWriters.get(categorySlug);
    if (!shardWriter) {
      shardWriter = await this.createShardWriter(categorySlug);
      this.shardWriters.set(categorySlug, shardWriter);
    }
    
    // Write product as JSONL
    const jsonLine = JSON.stringify(product) + '\n';
    const written = shardWriter.stream.write(jsonLine);
    
    if (!written) {
      // Handle backpressure
      await new Promise((resolve) => shardWriter!.stream.once('drain', () => resolve(undefined)));
    }
    
    // Update shard statistics
    shardWriter.recordCount++;
    shardWriter.sizeBytes += Buffer.byteLength(jsonLine);
    
    // Check if shard needs to be rotated (size limit)
    const maxShardSize = config.output.shardSizeMB * 1024 * 1024;
    if (shardWriter.sizeBytes > maxShardSize) {
      await this.rotateShard(categorySlug, shardWriter);
    }
  }
  
  /**
   * Write product to index file
   */
  private async writeToIndex(product: CanonicalProduct): Promise<void> {
    if (!this.indexWriter) {
      throw new Error('Index writer not initialized');
    }
    
    const indexEntry: ProductIndex = {
      canonical_id: product.canonical_id,
      title: product.title,
      brand: product.brand,
      category_path: product.category_path,
      category_slug: product.category_slug,
      price: product.pricing.price,
      images: product.images.map(img => img.url),
      in_stock: product.stock.in_stock
    };
    
    const jsonLine = JSON.stringify(indexEntry) + '\n';
    const written = this.indexWriter.write(jsonLine);
    
    if (!written) {
      await new Promise((resolve) => this.indexWriter!.once('drain', () => resolve(undefined)));
    }
  }
  
  /**
   * Create a new shard writer
   */
  private async createShardWriter(categorySlug: string): Promise<ShardWriter> {
    const filePath = path.join(this.outputBasePath, 'by-category', `${categorySlug}.jsonl`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    const stream = createWriteStream(filePath, { flags: 'w' });
    
    return {
      categorySlug,
      filePath,
      stream,
      recordCount: 0,
      sizeBytes: 0
    };
  }
  
  /**
   * Rotate a shard when it gets too large
   */
  private async rotateShard(categorySlug: string, oldWriter: ShardWriter): Promise<void> {
    // Close the old writer
    await this.closeShard(oldWriter);
    
    // Create new writer with incremented filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedSlug = `${categorySlug}-${timestamp}`;
    const newWriter = await this.createShardWriter(rotatedSlug);
    
    // Update the map
    this.shardWriters.set(categorySlug, newWriter);
  }
  
  /**
   * Close a shard writer safely
   */
  private async closeShard(writer: ShardWriter): Promise<void> {
    await this.closeStream(writer.stream);
  }
  
  /**
   * Close a stream safely
   */
  private closeStream(stream: WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.end((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
  
  /**
   * Update processing statistics
   */
  private updateStats(product: CanonicalProduct): void {
    this.stats.totalProducts++;
    
    const categoryKey = product.category_path.join(' > ');
    this.stats.categoryCounts[categoryKey] = 
      (this.stats.categoryCounts[categoryKey] || 0) + 1;
  }
  
  /**
   * Manage memory usage during processing
   */
  private async manageMemory(): Promise<void> {
    const currentMemory = process.memoryUsage().heapUsed;
    this.stats.memoryPeak = Math.max(this.stats.memoryPeak, currentMemory);
    
    // Force garbage collection if available and memory is high
    const memoryLimitBytes = config.processing.memoryLimitMB * 1024 * 1024;
    if (currentMemory > memoryLimitBytes * 0.8 && global.gc) {
      global.gc();
    }
  }
  
  /**
   * Create necessary output directories
   */
  private async createDirectories(): Promise<void> {
    const directories = [
      path.join(this.outputBasePath, 'by-category'),
      path.join(this.outputBasePath, 'search'),
      path.join(this.outputBasePath, 'reports'),
      path.join(this.outputBasePath, 'full')
    ];
    
    await Promise.all(
      directories.map(dir => fs.mkdir(dir, { recursive: true }))
    );
  }
  
  /**
   * Generate metadata file with processing information
   */
  private async generateMetadata(): Promise<void> {
    const metadata = {
      shop: this.shop,
      processed_at: new Date().toISOString(),
      stats: this.stats,
      shards: Array.from(this.shardWriters.values()).map(writer => ({
        category_slug: writer.categorySlug,
        file_path: path.relative(this.outputBasePath, writer.filePath),
        record_count: writer.recordCount,
        size_bytes: writer.sizeBytes
      })),
      config: {
        batch_size: config.processing.batchSize,
        shard_size_mb: config.output.shardSizeMB,
        memory_limit_mb: config.processing.memoryLimitMB
      }
    };
    
    const metadataPath = path.join(this.outputBasePath, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }
}

/**
 * Utility class for reading JSONL shards
 */
export class JsonlShardReader {
  private shop: StoreId;
  private basePath: string;
  
  constructor(shop: StoreId, basePath: string) {
    this.shop = shop;
    this.basePath = basePath;
  }
  
  /**
   * Read all products from a category shard
   */
  async readCategoryShard(categorySlug: string): Promise<CanonicalProduct[]> {
    const filePath = path.join(this.basePath, 'by-category', `${categorySlug}.jsonl`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content
        .trim()
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line) as CanonicalProduct);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return []; // File doesn't exist - empty shard
      }
      throw error;
    }
  }
  
  /**
   * Read products from index
   */
  async readIndex(): Promise<ProductIndex[]> {
    const indexPath = getProductIndexPath(this.shop);
    
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      return content
        .trim()
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line) as ProductIndex);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
  
  /**
   * Get available category shards
   */
  async getAvailableShards(): Promise<string[]> {
    const shardDir = path.join(this.basePath, 'by-category');
    
    try {
      const files = await fs.readdir(shardDir);
      return files
        .filter(file => file.endsWith('.jsonl'))
        .map(file => file.replace('.jsonl', ''));
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Stream products from a shard
   */
  async* streamCategoryShard(categorySlug: string): AsyncGenerator<CanonicalProduct> {
    const filePath = path.join(this.basePath, 'by-category', `${categorySlug}.jsonl`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.trim().split('\n');
      
      for (const line of lines) {
        if (line.length > 0) {
          yield JSON.parse(line) as CanonicalProduct;
        }
      }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist - generator ends naturally
    }
  }
}
