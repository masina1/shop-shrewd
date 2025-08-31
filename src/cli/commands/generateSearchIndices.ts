import { Command } from 'commander';
import { searchIndexGenerator } from '@/lib/search/searchIndexGenerator';
import { loadCategoryShards } from '@/lib/dataLoader';
import { CanonicalProduct } from '@/types/canonical';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export const generateSearchIndicesCommand = new Command('generate-search-indices')
  .description('Generate FlexSearch indices for all category shards')
  .option('-o, --output <path>', 'Output directory for search indices', './data/search-indices')
  .option('-c, --categories <categories>', 'Comma-separated list of categories to index (default: all)')
  .option('--stats', 'Show index statistics after generation')
  .option('--export-json', 'Export indices as JSON files (for debugging)')
  .option('--export-binary', 'Export indices as binary files (for production use)')
  .action(async (options) => {
    try {
      console.log('🔍 Generating search indices for category shards...\n');

      // Create output directory
      mkdirSync(options.output, { recursive: true });

      // Load all category shards
      console.log('📂 Loading category shards...');
      const categoryShards = await loadCategoryShards();
      
      if (categoryShards.size === 0) {
        console.log('❌ No category shards found. Run preprocessing first.');
        return;
      }

      console.log(`✅ Loaded ${categoryShards.size} category shards\n`);

      // Filter categories if specified
      let targetCategories = Array.from(categoryShards.keys());
      if (options.categories) {
        const requestedCategories = options.categories.split(',').map(c => c.trim());
        targetCategories = targetCategories.filter(cat => 
          requestedCategories.includes(cat)
        );
        console.log(`🎯 Targeting ${targetCategories.length} categories: ${targetCategories.join(', ')}\n`);
      }

      // Generate indices for target categories
      const categoryProducts = new Map<string, CanonicalProduct[]>();
      for (const category of targetCategories) {
        const products = categoryShards.get(category) || [];
        if (products.length > 0) {
          categoryProducts.set(category, products);
        }
      }

      console.log('🔨 Generating search indices...');
      const indices = await searchIndexGenerator.generateAllIndices(categoryProducts);
      
      if (indices.length === 0) {
        console.log('❌ No indices generated');
        return;
      }

      console.log(`✅ Generated ${indices.length} search indices\n`);

      // Show statistics
      if (options.stats) {
        const stats = searchIndexGenerator.getIndexStats();
        console.log('📊 Search Index Statistics:');
        console.log(`   Total Indices: ${stats.totalIndices}`);
        console.log(`   Total Documents: ${stats.totalDocuments.toLocaleString()}`);
        console.log(`   Average Index Size: ${Math.round(stats.averageIndexSize).toLocaleString()}`);
        console.log(`   Categories: ${stats.categories.join(', ')}\n`);
      }

      // Export indices if requested
      if (options.exportJson || options.exportBinary) {
        console.log('💾 Exporting search indices...');
        
        for (const index of indices) {
          const categorySlug = index.category.toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          if (options.exportJson) {
            // Export as JSON for debugging
            const jsonPath = join(options.output, `${categorySlug}_index.json`);
            const indexData = {
              id: index.id,
              category: index.category,
              documentCount: index.documentCount,
              lastUpdated: index.lastUpdated.toISOString(),
              sampleQueries: await generateSampleQueries(index),
            };
            
            writeFileSync(jsonPath, JSON.stringify(indexData, null, 2));
            console.log(`   📄 JSON: ${jsonPath}`);
          }
          
          if (options.exportBinary) {
            // Export as binary for production use
            const binaryPath = join(options.output, `${categorySlug}_index.bin`);
            const binaryData = await searchIndexGenerator.exportIndex(index.category);
            
            writeFileSync(binaryPath, Buffer.from(binaryData));
            console.log(`   💾 Binary: ${binaryPath}`);
          }
        }
        
        console.log(`✅ Exported ${indices.length} indices to ${options.output}\n`);
      }

      // Generate search index manifest
      const manifestPath = join(options.output, 'search-indices-manifest.json');
      const manifest = {
        generatedAt: new Date().toISOString(),
        totalIndices: indices.length,
        indices: indices.map(index => ({
          id: index.id,
          category: index.category,
          documentCount: index.documentCount,
          lastUpdated: index.lastUpdated.toISOString(),
        })),
        searchConfig: {
          fields: ['name', 'brand', 'categoryL1', 'categoryL2', 'attrs'],
          options: {
            tokenize: 'forward',
            resolution: 9,
            threshold: 1,
            depth: 3,
          },
        },
      };

      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`📋 Manifest: ${manifestPath}`);

      console.log('\n🎉 Search index generation completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Use searchIndexGenerator in your search service');
      console.log('   2. Load binary indices on app startup');
      console.log('   3. Test search functionality in admin panel');

    } catch (error) {
      console.error('❌ Failed to generate search indices:', error);
      process.exit(1);
    }
  });

/**
 * Generate sample search queries for testing
 */
async function generateSampleQueries(index: any): Promise<string[]> {
  const sampleQueries = [
    'lapte',
    'paine',
    'carne',
    'fructe',
    'legume',
    'dulciuri',
    'bauturi',
    'curatenie',
  ];

  // Test each query and return successful ones
  const workingQueries: string[] = [];
  for (const query of sampleQueries) {
    try {
      const results = await searchIndexGenerator.searchInCategory(index.category, query, { limit: 1 });
      if (results.length > 0) {
        workingQueries.push(query);
      }
    } catch (error) {
      // Query failed, skip it
    }
  }

  return workingQueries.slice(0, 5); // Return max 5 working queries
}
