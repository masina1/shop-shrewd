import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Database, Zap, BarChart3 } from 'lucide-react';
import { searchIndexGenerator } from '@/lib/search/searchIndexGenerator';
import { loadAllProducts } from '@/lib/dataLoader';

interface SearchIndexStats {
  totalIndices: number;
  totalDocuments: number;
  averageIndexSize: number;
  categories: string[];
}

export default function SearchIndices() {
  const [stats, setStats] = useState<SearchIndexStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [resultLimit, setResultLimit] = useState<number>(20);

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    const currentStats = searchIndexGenerator.getStats();
    setStats(currentStats);
  };

  const handleGenerateIndices = async () => {
    setIsGenerating(true);
    try {
      console.log('🚀 Starting search index generation...');
      
      // Load all products first
      const allProducts = await loadAllProducts();
      
      if (allProducts.length === 0) {
        alert('No products found. Please ensure the preprocessor has generated output files.');
        return;
      }

      // Group products by category for index generation
      const categoryShards = new Map<string, any[]>();
      
      for (const product of allProducts) {
        const category = product.category_path?.[0] || 'Other';
        if (!categoryShards.has(category)) {
          categoryShards.set(category, []);
        }
        categoryShards.get(category)!.push(product);
      }

      // Generate indices
      const result = await searchIndexGenerator.generateAllIndices(categoryShards);
      
      console.log('✅ Search indices generated successfully:', result);
      updateStats();
      
      alert(`Search indices generated successfully!\n${result.totalIndices} categories indexed\n${result.totalDocuments} products indexed`);
      
    } catch (error) {
      console.error('❌ Failed to generate search indices:', error);
      alert(`Failed to generate search indices: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      console.log(`🔍 Starting search for: "${searchQuery}"`);
             const results = await searchIndexGenerator.searchAll(searchQuery, resultLimit);
      const endTime = performance.now();
      const searchDuration = endTime - startTime;
      
      console.log(`🔍 Search completed in ${searchDuration.toFixed(2)}ms:`, results);
      console.log(`📊 Raw results structure:`, JSON.stringify(results, null, 2));
      
      setSearchResults(results);
      setSearchTime(searchDuration);
      
      if (results.length === 0) {
        console.log(`⚠️ No search results returned for query: "${searchQuery}"`);
      } else {
        console.log(`✅ Found ${results.length} search results`);
        // Log first few results for debugging
        results.slice(0, 3).forEach((result, index) => {
          console.log(`   Result ${index + 1}:`, result);
        });
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearIndices = () => {
    searchIndexGenerator.clearIndices();
    updateStats();
    setSearchResults([]);
    alert('All search indices cleared');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
                 <div>
           <h1 className="text-3xl font-bold">Search Indices Management</h1>
           <p className="text-muted-foreground">
             Create, manage, and test search indices for lightning-fast product search across all stores
           </p>
           <div className="mt-2 text-sm text-muted-foreground max-w-2xl">
             This page allows you to generate search indices from your preprocessed product data. 
             Once generated, these indices enable instant search across product titles, brands, and categories 
             from all Romanian supermarkets (Auchan, Carrefour, Mega, Freshful, Lidl).
           </div>
         </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateIndices}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Generate Indices
              </>
            )}
          </Button>
          
          <Button
            onClick={clearIndices}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
          
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Indices</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIndices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Category indices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Indexed products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Index Size</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageIndexSize || 0}</div>
            <p className="text-xs text-muted-foreground">
              Products per category
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Regeneration Notice */}
      {stats && stats.totalIndices > 0 && stats.totalDocuments === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <Zap className="h-5 w-5" />
              <div>
                <p className="font-medium">Indices Need Regeneration</p>
                <p className="text-sm text-orange-700">
                  Found {stats.totalIndices} saved index categories, but the actual search indices need to be rebuilt. 
                  Click "Generate Indices" to restore full search functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Search Indices</CardTitle>
          <CardDescription>
            Test the search functionality with your generated indices
          </CardDescription>
        </CardHeader>
                 <CardContent className="space-y-4">
           {/* Search Status Warning */}
           {stats?.totalDocuments === 0 && (
             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
               <div className="flex items-center gap-2 text-red-800">
                 <span className="text-lg">⚠️</span>
                 <div>
                   <p className="font-medium">Search is Currently Disabled</p>
                   <p className="text-sm text-red-700">
                     No search indices are active. Click "Generate Indices" above to enable search functionality.
                   </p>
                 </div>
               </div>
             </div>
           )}

           {/* Search Legend */}
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
             <h4 className="font-medium text-blue-900 mb-2">🔍 What You Can Search By:</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-blue-800">
               <div>
                 <strong>Product Titles:</strong> "lapte", "paine", "salam", "mere"
               </div>
               <div>
                 <strong>Brand Names:</strong> "Nestle", "Milupa", "Aptamil"
               </div>
               <div>
                 <strong>Categories:</strong> "mama & copilul", "lactate & ouă"
               </div>
             </div>
             <div className="mt-2 text-xs text-blue-700">
               💡 Search is case-insensitive and supports partial matches
             </div>
           </div>

           <div className="flex gap-2 items-center">
             <input
               type="text"
               placeholder={stats?.totalDocuments === 0 ? "Generate indices first to enable search" : "Enter search query (e.g., 'lapte', 'paine')"}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               disabled={stats?.totalDocuments === 0}
               className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
             />
             <select
               value={resultLimit}
               onChange={(e) => setResultLimit(Number(e.target.value))}
               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
             >
               <option value={10}>10 results</option>
               <option value={20}>20 results</option>
               <option value={50}>50 results</option>
               <option value={100}>100 results</option>
             </select>
             <Button
               onClick={handleSearch}
               disabled={isLoading || !searchQuery.trim() || (stats?.totalDocuments === 0)}
               className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
               title={stats?.totalDocuments === 0 ? "Generate indices first to enable search" : ""}
             >
               {isLoading ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               ) : (
                 <Search className="mr-2 h-4 w-4" />
               )}
               Search
             </Button>
           </div>

                     {searchTime > 0 && (
             <div className="text-sm text-muted-foreground">
               Search completed in <Badge variant="secondary">{searchTime.toFixed(2)}ms</Badge>
               <span className="ml-2 text-xs">
                 Showing up to {resultLimit} results
               </span>
             </div>
           )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
                             <h4 className="font-medium">Search Results ({searchResults.length})</h4>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{result.title || 'Unknown Product'}</div>
                      {result.store && (
                        <Badge variant="outline" className="text-xs">
                          {result.store.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Category: {result.category} | Score: {result.score || 'N/A'}
                    </div>
                    {result.brand && (
                      <div className="text-xs text-gray-500">Brand: {result.brand}</div>
                    )}
                    {result.id && (
                      <div className="text-xs text-gray-400">ID: {result.id}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              No search results found for "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category List */}
      {stats?.categories && stats.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Indexed Categories</CardTitle>
            <CardDescription>
              Categories that have been indexed for search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.categories.map((category, index) => (
                <Badge key={index} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
