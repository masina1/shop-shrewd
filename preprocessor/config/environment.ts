/**
 * Environment configuration for the preprocessing system
 * 
 * Centralizes all configuration values and provides type-safe access
 * to environment variables with sensible defaults.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PreprocessorConfig {
  // Paths
  paths: {
    root: string;
    data: string;
    output: string;
    config: string;
    canonical: string;
    shops: string;
  };
  
  // Processing settings
  processing: {
    batchSize: number;
    maxConcurrency: number;
    memoryLimitMB: number;
    timeoutMs: number;
  };
  
  // Category mapping settings
  mapping: {
    fuzzyThreshold: number;
    minimumConfidence: number;
    maxSuggestions: number;
    enableLearning: boolean;
  };
  
  // Output settings
  output: {
    shardSizeMB: number;
    compressionLevel: number;
    indexFields: string[];
    enableSearchIndices: boolean;
  };
  
  // Admin panel settings
  admin: {
    routePath: string;
    uploadMaxSizeMB: number;
    sessionTimeoutMs: number;
    enableAuth: boolean;
  };
  
  // Logging and debugging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enablePerformanceMetrics: boolean;
    enableDetailedErrors: boolean;
  };
}

// Default configuration
const defaultConfig: PreprocessorConfig = {
  paths: {
    root: path.resolve(__dirname, '../../..'),
    data: path.resolve(__dirname, '../../../data'),
    output: path.resolve(__dirname, '../../../out'),
    config: path.resolve(__dirname, '../config'),
    canonical: path.resolve(__dirname, '../config/canonical'),
    shops: path.resolve(__dirname, '../config/shops')
  },
  
  processing: {
    batchSize: parseInt(process.env.PREPROCESS_BATCH_SIZE || '1000'),
    maxConcurrency: parseInt(process.env.PREPROCESS_MAX_CONCURRENCY || '4'),
    memoryLimitMB: parseInt(process.env.PREPROCESS_MEMORY_LIMIT_MB || '2048'),
    timeoutMs: parseInt(process.env.PREPROCESS_TIMEOUT_MS || '300000') // 5 minutes
  },
  
  mapping: {
    fuzzyThreshold: parseFloat(process.env.MAPPING_FUZZY_THRESHOLD || '0.82'),
    minimumConfidence: parseFloat(process.env.MAPPING_MIN_CONFIDENCE || '0.7'),
    maxSuggestions: parseInt(process.env.MAPPING_MAX_SUGGESTIONS || '5'),
    enableLearning: process.env.MAPPING_ENABLE_LEARNING !== 'false'
  },
  
  output: {
    shardSizeMB: parseInt(process.env.OUTPUT_SHARD_SIZE_MB || '50'),
    compressionLevel: parseInt(process.env.OUTPUT_COMPRESSION_LEVEL || '6'),
    indexFields: ['canonical_id', 'title', 'brand', 'category_path', 'category_slug', 'price'],
    enableSearchIndices: process.env.OUTPUT_ENABLE_SEARCH_INDICES !== 'false'
  },
  
  admin: {
    routePath: process.env.ORI_CORE_PATH || '/ori-core',
    uploadMaxSizeMB: parseInt(process.env.ADMIN_UPLOAD_MAX_SIZE_MB || '500'),
    sessionTimeoutMs: parseInt(process.env.ADMIN_SESSION_TIMEOUT_MS || '3600000'), // 1 hour
    enableAuth: process.env.ADMIN_ENABLE_AUTH !== 'false'
  },
  
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    enablePerformanceMetrics: process.env.LOG_ENABLE_PERF_METRICS === 'true',
    enableDetailedErrors: process.env.LOG_ENABLE_DETAILED_ERRORS === 'true'
  }
};

// Environment-specific overrides
function getEnvironmentConfig(): PreprocessorConfig {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...defaultConfig,
        processing: {
          ...defaultConfig.processing,
          maxConcurrency: 8,
          memoryLimitMB: 4096
        },
        logging: {
          ...defaultConfig.logging,
          level: 'warn',
          enablePerformanceMetrics: true
        }
      };
      
    case 'staging':
      return {
        ...defaultConfig,
        processing: {
          ...defaultConfig.processing,
          maxConcurrency: 6
        },
        logging: {
          ...defaultConfig.logging,
          level: 'info',
          enablePerformanceMetrics: true
        }
      };
      
    case 'development':
    default:
      return {
        ...defaultConfig,
        logging: {
          ...defaultConfig.logging,
          level: 'debug',
          enableDetailedErrors: true
        }
      };
  }
}

// Export the configuration
export const config = getEnvironmentConfig();

// Utility functions
export function getDataPath(shop: string, filename?: string): string {
  const shopPath = path.join(config.paths.data, shop);
  return filename ? path.join(shopPath, filename) : shopPath;
}

export function getOutputPath(shop: string, filename?: string): string {
  const shopPath = path.join(config.paths.output, shop);
  return filename ? path.join(shopPath, filename) : shopPath;
}

export function getCategoryShardPath(shop: string, categorySlug: string): string {
  return path.join(config.paths.output, shop, 'by-category', `${categorySlug}.jsonl`);
}

export function getSearchIndexPath(shop: string, categorySlug: string): string {
  return path.join(config.paths.output, shop, 'search', `${categorySlug}.idx.json`);
}

export function getReportPath(shop: string, reportType: string): string {
  return path.join(config.paths.output, shop, 'reports', `${reportType}.jsonl`);
}

export function getProductIndexPath(shop: string): string {
  return path.join(config.paths.output, shop, 'products.index.jsonl');
}

// Validation
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (config.processing.batchSize <= 0) {
    errors.push('Processing batch size must be positive');
  }
  
  if (config.mapping.fuzzyThreshold < 0 || config.mapping.fuzzyThreshold > 1) {
    errors.push('Fuzzy threshold must be between 0 and 1');
  }
  
  if (config.output.shardSizeMB <= 0) {
    errors.push('Shard size must be positive');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Initialize configuration validation
validateConfig();
