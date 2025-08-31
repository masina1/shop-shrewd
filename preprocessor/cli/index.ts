#!/usr/bin/env tsx

/**
 * CLI tool for the preprocessing system
 * 
 * Provides development commands for processing shop data with
 * comprehensive error handling and performance monitoring.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, getDataPath, getOutputPath } from '@/config/environment.js';
import { StoreId } from '@/types/canonical.js';

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagePath = path.join(__dirname, '../package.json');

let version = '1.0.0';
try {
  const packageContent = await fs.readFile(packagePath, 'utf-8');
  const packageJson = JSON.parse(packageContent);
  version = packageJson.version;
} catch {
  // Use default version if package.json not found
}

const program = new Command();

// Configure CLI
program
  .name('preprocess')
  .description('Data preprocessing system for web price comparator')
  .version(version);

// Global options
program
  .option('--verbose', 'enable verbose logging')
  .option('--perf', 'enable performance metrics')
  .option('--config <file>', 'custom configuration file')
  .hook('preAction', (thisCommand) => {
    if (thisCommand.opts().verbose) {
      process.env.LOG_LEVEL = 'debug';
    }
  });

/**
 * Main preprocess command
 */
program
  .command('preprocess')
  .alias('proc')
  .description('Preprocess shop data files')
  .argument('[shop]', 'shop to process (auchan, carrefour, kaufland, mega, freshful) or "all"')
  .option('--in <path>', 'input directory path', (value) => path.resolve(value))
  .option('--out <path>', 'output directory path', (value) => path.resolve(value))
  .option('--limit <number>', 'limit number of products to process', (value) => parseInt(value))
  .option('--dry-run', 'validate and analyze without generating output')
  .option('--strict', 'fail on any unmapped categories')
  .option('--rewrite', 'regenerate shards/indexes from existing canonical data')
  .option('--report', 'generate detailed processing reports')
  .action(async (shop, options) => {
    const startTime = performance.now();
    
    try {
      // Validate inputs
      if (!shop) {
        console.error(chalk.red('Error: Shop parameter is required'));
        console.log(chalk.yellow('Usage: preprocess <shop> [options]'));
        console.log(chalk.yellow('       preprocess --all [options]'));
        process.exit(1);
      }
      
      const shops = shop === 'all' ? 
        ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'] as StoreId[] :
        [shop as StoreId];
      
      // Validate shop names
      const validShops = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'];
      for (const s of shops) {
        if (!validShops.includes(s)) {
          console.error(chalk.red(`Error: Invalid shop "${s}"`));
          console.log(chalk.yellow(`Valid shops: ${validShops.join(', ')}`));
          process.exit(1);
        }
      }
      
      // Process each shop
      for (const shopId of shops) {
        await processShop(shopId, options);
      }
      
      // Summary
      const totalTime = performance.now() - startTime;
      console.log(chalk.green(`\n✅ Processing completed in ${(totalTime / 1000).toFixed(2)}s`));
      
      if (options.perf) {
        const memoryUsage = process.memoryUsage();
        console.log(chalk.cyan('\n📊 Performance Metrics:'));
        console.log(`   Memory: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Total time: ${(totalTime / 1000).toFixed(2)}s`);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Processing failed:'), error);
      
      if (options.verbose && error instanceof Error) {
        console.error(chalk.gray('\nStack trace:'));
        console.error(chalk.gray(error.stack));
      }
      
      // Generate repro command
      const reproArgs = process.argv.slice(2);
      console.log(chalk.yellow('\n🔄 To reproduce this error:'));
      console.log(chalk.yellow(`   ${reproArgs.join(' ')}`));
      
      process.exit(1);
    }
  });

/**
 * Validate command
 */
program
  .command('validate')
  .description('Validate input files without processing')
  .argument('<shop>', 'shop to validate')
  .option('--file <path>', 'specific file to validate')
  .option('--schema', 'validate against expected schema')
  .action(async (shop, options) => {
    const spinner = ora('Validating input files...').start();
    
    try {
      await validateShopData(shop as StoreId, options);
      spinner.succeed('Validation completed successfully');
    } catch (error) {
      spinner.fail('Validation failed');
      console.error(chalk.red(error));
      process.exit(1);
    }
  });

/**
 * Categories command
 */
program
  .command('categories')
  .alias('cat')
  .description('Manage category mappings')
  .option('--shop <shop>', 'filter by shop')
  .option('--unmapped', 'show only unmapped categories')
  .option('--stats', 'show mapping statistics')
  .action(async (options) => {
    try {
      await manageCategoryMappings(options);
    } catch (error) {
      console.error(chalk.red('Category management failed:'), error);
      process.exit(1);
    }
  });

/**
 * Clean command
 */
program
  .command('clean')
  .description('Clean output directories')
  .argument('[shop]', 'shop to clean or "all"')
  .option('--force', 'skip confirmation prompt')
  .action(async (shop, options) => {
    try {
      await cleanOutputs(shop, options);
    } catch (error) {
      console.error(chalk.red('Clean operation failed:'), error);
      process.exit(1);
    }
  });

/**
 * Status command
 */
program
  .command('status')
  .description('Show system status and recent processing results')
  .action(async () => {
    try {
      await showSystemStatus();
    } catch (error) {
      console.error(chalk.red('Status check failed:'), error);
      process.exit(1);
    }
  });

/**
 * Process a single shop
 */
async function processShop(shop: StoreId, options: any): Promise<void> {
  const spinner = ora(`Processing ${shop}...`).start();
  
  try {
    // Determine input and output paths
    const inputPath = options.in || getDataPath(shop);
    const outputPath = options.out || getOutputPath(shop);
    
    if (options.verbose) {
      spinner.info(`Input: ${inputPath}`);
      spinner.info(`Output: ${outputPath}`);
    }
    
    // Check if input directory exists
    try {
      await fs.access(inputPath);
    } catch {
      throw new Error(`Input directory not found: ${inputPath}`);
    }
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outputPath, { recursive: true });
    
    // Find input files
    const files = await fs.readdir(inputPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      throw new Error(`No JSON files found in ${inputPath}`);
    }
    
    spinner.text = `Found ${jsonFiles.length} files for ${shop}`;
    
    if (options.dryRun) {
      spinner.succeed(`Dry run completed for ${shop}: ${jsonFiles.length} files would be processed`);
      return;
    }
    
    // Import processing pipeline
    const { ProcessingPipeline } = await import('../core/pipeline.js');
    const pipeline = new ProcessingPipeline();
    
    // Process the shop
    const result = await pipeline.processShop(shop as StoreId, {
      inputPath,
      outputPath,
      limit: options.limit,
      dryRun: options.dryRun,
      strict: options.strict,
      enableReports: options.report,
      enableVerbose: options.verbose
    });
    
    if (result.success) {
      spinner.succeed(`Processed ${shop}: ${result.stats.totalProcessed.toLocaleString()} products from ${jsonFiles.length} files`);
      
      if (result.stats.totalUnmapped > 0) {
        console.log(chalk.yellow(`  ⚠️  ${result.stats.totalUnmapped} unmapped categories`));
      }
      
      if (result.stats.totalErrors > 0) {
        console.log(chalk.yellow(`  ⚠️  ${result.stats.totalErrors} processing errors`));
      }
    } else {
      throw new Error(result.errors.join('; '));
    }
    
    if (options.report) {
      const reportsDir = path.join(outputPath, 'reports');
      console.log(chalk.cyan(`  📊 Generated reports in ${reportsDir}`));
    }
    
  } catch (error) {
    spinner.fail(`Failed to process ${shop}`);
    throw error;
  }
}

/**
 * Validate shop data
 */
async function validateShopData(shop: StoreId, options: any): Promise<void> {
  const inputPath = getDataPath(shop);
  
  if (options.file) {
    // Validate specific file
    const filePath = path.resolve(options.file);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(chalk.green(`✅ File is valid JSON: ${data.length} items`));
    
    if (options.schema) {
      // TODO: Implement schema validation
      console.log(chalk.yellow('Schema validation not yet implemented'));
    }
  } else {
    // Validate all files in shop directory
    const files = await fs.readdir(inputPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const filePath = path.join(inputPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        console.log(chalk.green(`✅ ${file}: ${data.length} items`));
      } catch (error) {
        console.log(chalk.red(`❌ ${file}: Invalid JSON`));
        throw error;
      }
    }
  }
}

/**
 * Manage category mappings
 */
async function manageCategoryMappings(options: any): Promise<void> {
  console.log(chalk.cyan('📂 Category Mapping Management'));
  
  const { CategoryMappingEngine } = await import('../core/category-mapper/engine.js');
  const categoryMapper = new CategoryMappingEngine();
  
  if (options.stats) {
    const { ProcessingPipeline } = await import('../core/pipeline.js');
    const pipeline = new ProcessingPipeline();
    const stats = await pipeline.getProcessingStats();
    
    console.log(chalk.white('\n📊 Category Mapping Statistics:'));
    console.log(`  Total products: ${stats.totalProducts.toLocaleString()}`);
    console.log(`  Total categories: ${stats.totalCategories}`);
    console.log('');
    
    console.log(chalk.white('By Shop:'));
    for (const shop of stats.shops) {
      console.log(`  ${shop.shop}: ${shop.productCount.toLocaleString()} products, ${shop.categoryCount} categories`);
      if (shop.unmappedCount > 0) {
        console.log(chalk.yellow(`    ⚠️  ${shop.unmappedCount} unmapped`));
      }
    }
  }
  
  if (options.unmapped) {
    const unmappedCategories = categoryMapper.getUnmappedQueue();
    
    if (unmappedCategories.length === 0) {
      console.log(chalk.green('\n✅ No unmapped categories found'));
      return;
    }
    
    console.log(chalk.white(`\n⚠️  Found ${unmappedCategories.length} unmapped categories:`));
    
    // Filter by shop if specified
    const filtered = options.shop ? 
      unmappedCategories.filter(cat => cat.shop === options.shop) : 
      unmappedCategories;
    
    // Sort by frequency
    filtered.sort((a, b) => b.count - a.count);
    
    for (const category of filtered.slice(0, 20)) { // Show top 20
      console.log(`\n${chalk.yellow(category.shop)}: "${category.original_category}"`);
      console.log(`  Count: ${category.count}`);
      console.log(`  First seen: ${new Date(category.first_seen).toLocaleDateString()}`);
      
      if (category.sample_products.length > 0) {
        console.log(`  Sample: ${category.sample_products[0].name}`);
      }
      
      if (category.suggestions && category.suggestions.length > 0) {
        console.log(`  Suggestion: ${category.suggestions[0].category_path.join(' > ')}`);
      }
    }
    
    if (filtered.length > 20) {
      console.log(chalk.gray(`\n... and ${filtered.length - 20} more`));
    }
  }
  
  if (!options.stats && !options.unmapped) {
    console.log(chalk.yellow('Use --stats or --unmapped to see category information'));
    console.log(chalk.gray('Examples:'));
    console.log(chalk.gray('  preprocess categories --stats'));
    console.log(chalk.gray('  preprocess categories --unmapped'));
    console.log(chalk.gray('  preprocess categories --unmapped --shop auchan'));
  }
}

/**
 * Clean output directories
 */
async function cleanOutputs(shop: string | undefined, options: any): Promise<void> {
  const shops = shop === 'all' || !shop ? 
    ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful'] :
    [shop];
  
  if (!options.force) {
    console.log(chalk.yellow('This will delete all generated output files.'));
    console.log(chalk.yellow('Use --force to skip this confirmation.'));
    return;
  }
  
  for (const shopId of shops) {
    const outputPath = getOutputPath(shopId as StoreId);
    
    try {
      await fs.rm(outputPath, { recursive: true, force: true });
      console.log(chalk.green(`✅ Cleaned ${shopId} outputs`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  No outputs to clean for ${shopId}`));
    }
  }
}

/**
 * Show system status
 */
async function showSystemStatus(): Promise<void> {
  console.log(chalk.cyan('🔍 System Status'));
  console.log('');
  
  // Configuration
  console.log(chalk.white('Configuration:'));
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Data path: ${config.paths.data}`);
  console.log(`  Output path: ${config.paths.output}`);
  console.log(`  Batch size: ${config.processing.batchSize}`);
  console.log(`  Memory limit: ${config.processing.memoryLimitMB}MB`);
  console.log('');
  
  // Check shop data availability
  console.log(chalk.white('Shop Data:'));
  const shops = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'] as StoreId[];
  
  for (const shop of shops) {
    try {
      const dataPath = getDataPath(shop);
      const files = await fs.readdir(dataPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length > 0) {
        console.log(chalk.green(`  ✅ ${shop}: ${jsonFiles.length} files`));
      } else {
        console.log(chalk.yellow(`  ⚠️  ${shop}: no data files`));
      }
    } catch {
      console.log(chalk.red(`  ❌ ${shop}: directory not found`));
    }
  }
  
  console.log('');
  
  // Memory usage
  const memoryUsage = process.memoryUsage();
  console.log(chalk.white('Memory Usage:'));
  console.log(`  Heap used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('💥 Unhandled Rejection:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse();

export default program;
