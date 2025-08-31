import { Index } from 'flexsearch';

export interface SearchIndexConfig {
  // Search fields to index
  fields: {
    title: boolean;
    brand?: boolean;
    category: boolean;
    attributes?: boolean;
  };
  
  // Search options
  options: {
    tokenize: 'forward' | 'reverse' | 'full';
    resolution: number;
    threshold: number;
    depth: number;
  };
}

export interface SearchIndex {
  id: string;
  category: string;
  documentCount: number;
  index: Index;
  documents: Map<string, any>; // Store actual documents separately
  lastUpdated: Date;
}

export interface SearchIndexStats {
  totalIndices: number;
  totalDocuments: number;
  averageIndexSize: number;
  categories: string[];
}

/**
 * Search Index Generator for Category Shards
 * Creates optimized FlexSearch indices for fast client-side search
 */
export class SearchIndexGenerator {
  private config: SearchIndexConfig;
  private indices: Map<string, SearchIndex> = new Map();

  constructor(config?: Partial<SearchIndexConfig>) {
    this.config = {
      fields: {
        title: true,
        brand: true,
        category: true,
        attributes: false
      },
      options: {
        tokenize: 'forward',
        resolution: 9,
        threshold: 1,
        depth: 3
      },
      ...config
    };

    // Load existing indices from localStorage on initialization
    this.loadIndicesFromStorage();
  }

  /**
   * Generate search index for a category shard
   */
  async generateIndex(categorySlug: string, products: any[]): Promise<SearchIndex> {
    console.log(`🔍 Generating search index for category: ${categorySlug} (${products.length} products)`);

    // Create a simple FlexSearch Index (not Document)
    const index = new Index({
      tokenize: 'forward',
      resolution: 9
    });

    // Store documents separately for retrieval
    const documents = new Map<string, any>();

    // Add products to the index
    let indexedCount = 0;
    for (const product of products) {
      try {
        // Create searchable text from product
        const searchableText = this.extractSearchableText(product);
        const documentId = product.canonical_id || product.id;
        
                 // Store the document data
         documents.set(documentId, {
           id: documentId,
           title: product.title || '',
           brand: product.brand || '',
           category_path: product.category_path?.join(' ') || '',
           canonical_id: documentId,
           price: product.pricing?.unit_price || '',
           images: product.images || [],
           store: documentId.split(':')[0] || 'unknown' // Extract store name from ID
         });
        
        // Add to FlexSearch index
        index.add(documentId, searchableText);
        indexedCount++;
        
        // Debug: Log first few products being indexed
        if (indexedCount <= 3) {
          console.log(`📝 Indexing product ${indexedCount}:`, {
            id: documentId,
            title: product.title,
            brand: product.brand,
            category_path: product.category_path?.join(' '),
            searchableText: searchableText.substring(0, 100) + '...'
          });
        }
      } catch (error) {
        console.warn(`Failed to index product ${product.canonical_id}:`, error);
      }
    }

    // Test the index with a simple query
    try {
      const testResults = index.search('lapte', 5);
      console.log(`🧪 Test search for "lapte" in ${categorySlug}:`, testResults.length, 'results');
      if (testResults.length > 0) {
        console.log(`   First result ID:`, testResults[0]);
                 // Try to get the stored document
         const storedDoc = documents.get(String(testResults[0]));
        if (storedDoc) {
          console.log(`   Stored document:`, storedDoc);
        }
      }
    } catch (error) {
      console.warn(`Test search failed for ${categorySlug}:`, error);
    }

    // Create search index object
    const searchIndex: SearchIndex = {
      id: `${categorySlug}-search-index`,
      category: categorySlug,
      documentCount: indexedCount,
      index,
      documents,
      lastUpdated: new Date()
    };

    this.indices.set(categorySlug, searchIndex);
    console.log(`✅ Generated search index for ${categorySlug}: ${indexedCount} products indexed`);

    return searchIndex;
  }

  /**
   * Generate indices for all category shards
   */
  async generateAllIndices(categoryShards: Map<string, any[]>): Promise<SearchIndexStats> {
    console.log(`🚀 Starting bulk search index generation for ${categoryShards.size} categories`);
    
    const startTime = performance.now();
    
    for (const [category, products] of categoryShards) {
      await this.generateIndex(category, products);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Save all indices to localStorage after bulk generation
    this.saveIndicesToStorage();
    
    console.log(`🎉 Bulk index generation completed in ${Math.round(duration)}ms`);
    
    const stats = this.getStats();
    console.log(`📊 Total: ${stats.totalIndices} indices, ${stats.totalDocuments} documents`);
    
    return stats;
  }

  /**
   * Search across all indices
   */
  async searchAll(query: string, limit: number = 50): Promise<any[]> {
    const results: any[] = [];
    
    console.log(`🔍 Searching for "${query}" across ${this.indices.size} indices...`);
    
    for (const [category, searchIndex] of this.indices) {
      try {
        console.log(`🔍 Searching category: ${category} (${searchIndex.documentCount} products)`);
        
        // Search the FlexSearch index
        const searchResults = searchIndex.index.search(query, limit);
        
        console.log(`🔍 Raw search results for ${category}:`, searchResults);
        
        if (searchResults && searchResults.length > 0) {
          console.log(`📊 ${category} search results:`, searchResults.length);
          
                     // Get the actual documents for each result
           const categoryResults = searchResults.map(resultId => {
             const document = searchIndex.documents.get(String(resultId));
            
            if (document) {
              console.log(`📄 Retrieved document for ${resultId}:`, document);
              return {
                ...document,
                category: category,
                score: 0 // FlexSearch doesn't provide scores with regular Index
              };
            } else {
              console.warn(`⚠️ Document not found for ID: ${resultId}`);
              return {
                id: resultId,
                title: 'Unknown Product',
                brand: '',
                category_path: '',
                category: category,
                score: 0
              };
            }
          });
          
          results.push(...categoryResults);
        } else {
          console.log(`⚠️ No results in ${category} for query: "${query}"`);
        }
      } catch (error) {
        console.warn(`Failed to search ${category} index:`, error);
      }
    }

    console.log(`📊 Total results found: ${results.length}`);
    
    // Sort by relevance score (if available) and limit results
    const sortedResults = results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return sortedResults;
  }

  /**
   * Search within a specific category
   */
  async searchCategory(categorySlug: string, query: string, limit: number = 50): Promise<any[]> {
    const searchIndex = this.indices.get(categorySlug);
    if (!searchIndex) {
      console.warn(`Search index not found for category: ${categorySlug}`);
      return [];
    }

    try {
      const searchResults = searchIndex.index.search(query, limit);
             return searchResults.map(resultId => {
         const document = searchIndex.documents.get(String(resultId));
        return {
          ...document,
          category: categorySlug,
          searchIndex: searchIndex.id
        };
      });
    } catch (error) {
      console.error(`Search failed for ${categorySlug}:`, error);
      return [];
    }
  }

  /**
   * Get search index statistics
   */
  getStats(): SearchIndexStats {
    const totalDocuments = Array.from(this.indices.values())
      .reduce((sum, index) => sum + index.documentCount, 0);
    
    const averageIndexSize = this.indices.size > 0 ? totalDocuments / this.indices.size : 0;

    return {
      totalIndices: this.indices.size,
      totalDocuments,
      averageIndexSize: Math.round(averageIndexSize),
      categories: Array.from(this.indices.keys())
    };
  }

  /**
   * Clear all indices
   */
  clearIndices(): void {
    this.indices.clear();
    console.log('🧹 All search indices cleared');
  }

  /**
   * Save all current indices to localStorage
   */
  private saveIndicesToStorage(): void {
    const indicesToSave = Array.from(this.indices.values()).map(index => ({
      id: index.id,
      category: index.category,
      documentCount: index.documentCount,
      lastUpdated: index.lastUpdated.toISOString()
    }));
    localStorage.setItem('searchIndices', JSON.stringify(indicesToSave));
    console.log('💾 Search indices saved to localStorage');
  }

  /**
   * Load indices from localStorage
   */
  private loadIndicesFromStorage(): void {
    const savedIndices = localStorage.getItem('searchIndices');
    if (savedIndices) {
      try {
        const parsedIndices = JSON.parse(savedIndices);
        parsedIndices.forEach(index => {
          const lastUpdatedDate = new Date(index.lastUpdated);
          this.indices.set(index.category, {
            id: index.id,
            category: index.category,
            documentCount: index.documentCount,
                         index: new Index({
               tokenize: this.config.options.tokenize,
               resolution: this.config.options.resolution
             }),
            documents: new Map(), // Empty documents map for loaded indices
            lastUpdated: lastUpdatedDate
          });
        });
        console.log(`💾 Loaded ${this.indices.size} search indices from localStorage`);
      } catch (error) {
        console.error('Failed to load search indices from localStorage:', error);
      }
    }
  }

  /**
   * Extract searchable text from product
   */
  private extractSearchableText(product: any): string {
    const textParts: string[] = [];
    
    if (this.config.fields.title && product.title) {
      textParts.push(product.title);
    }
    
    if (this.config.fields.brand && product.brand) {
      textParts.push(product.brand);
    }
    
    if (this.config.fields.category && product.category_path) {
      textParts.push(product.category_path.join(' '));
    }
    
    if (this.config.fields.attributes && product.attributes) {
      if (product.attributes.dietary) textParts.push(product.attributes.dietary.join(' '));
      if (product.attributes.allergens) textParts.push(product.attributes.allergens.join(' '));
    }
    
    return textParts.join(' ').toLowerCase();
  }
}

// Export singleton instance
export const searchIndexGenerator = new SearchIndexGenerator();
