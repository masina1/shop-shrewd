import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Search } from 'lucide-react';
import { SearchParams, SearchResult } from '@/types/search';
import { searchService } from '@/services/searchService';
import { urlToSearchParams, searchParamsToUrl } from '@/utils/searchUtils';
import { FilterSidebar } from './FilterSidebar';
import { MobileFiltersSheet } from './MobileFiltersSheet';
import { ProductGrid } from './ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SearchPage() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchWithinResults, setSearchWithinResults] = useState('');
  
  // Store the complete global results for in-memory filtering
  const globalResultsRef = useRef<SearchResult | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();


  // Convert URL params to search params
  const searchParams = useMemo(() => urlToSearchParams(urlSearchParams), [urlSearchParams]);

  // Update URL when search params change
  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    const mergedParams = { ...searchParams, ...newParams };
    // Reset page when filters change (except when only page is changing)
    if (!('page' in newParams) || Object.keys(newParams).length > 1) {
      mergedParams.page = 1;
    }
    const urlString = searchParamsToUrl(mergedParams);
    setUrlSearchParams(urlString);
  };

  // Fetch results when main search params change (not when filtering within results)
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      setSearchWithinResults(''); // Clear filter when new search
      
      try {
        const result = await searchService.search(searchParams);
        
        // Store complete results for in-memory filtering
        globalResultsRef.current = result;
        setSearchResult(result);
        
        console.log(`🔍 Global search completed: ${result.total} products loaded for in-memory filtering`);
      } catch (err) {
        setError('Failed to load results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);
  
  // Handle in-memory filtering with debounce (no network calls)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      applyInMemoryFilter();
    }, 250); // 250ms debounce to prevent re-render spam
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchWithinResults]);

  // Pure in-memory filter function (no network calls)
  const applyInMemoryFilter = () => {
    if (!globalResultsRef.current) {
      return; // No global results to filter
    }
    
    const globalResults = globalResultsRef.current;
    
    if (!searchWithinResults.trim()) {
      // No filter - show original global results
      setSearchResult(globalResults);
      console.log(`🔄 Filter cleared: showing all ${globalResults.total} global results`);
      return;
    }
    
    console.log(`🔍 Filtering ${globalResults.total} global results for: "${searchWithinResults}"`);
    
    // Convert filter query to lowercase tokens
    const filterTokens = searchWithinResults.toLowerCase().trim().split(/\s+/).filter(token => token.length > 0);
    
    if (filterTokens.length === 0) {
      setSearchResult(globalResults);
      return;
    }
    
    // Filter items in memory (preserve original ranking order)
    const filteredItems = globalResults.items.filter(item => {
      // Build searchable text: name + brand + size + category  
      const searchableText = [
        item.name,
        item.brand || '',
        ...item.badges.filter(badge => /\d+\s*(ml|l|g|kg|buc|bucati|bucăți)/.test(badge.toLowerCase())), // Size badges
        ...item.categoryPath
      ].join(' ').toLowerCase();
      
      // ALL tokens must appear in product text (AND logic)
      return filterTokens.every(token => searchableText.includes(token));
    });
    
    // Create filtered result maintaining pagination structure
    const pageSize = searchParams.pageSize || 24;
    const filteredResult: SearchResult = {
      items: filteredItems.slice(0, pageSize), // First page of filtered results
      total: filteredItems.length,
      page: 1, // Reset to page 1 when filtering
      pageSize,
      hasMore: filteredItems.length > pageSize,
      facets: globalResults.facets // Keep original facets
    };
    
    setSearchResult(filteredResult);
    console.log(`✅ In-memory filter: ${filteredItems.length} matches found (showing first ${Math.min(pageSize, filteredItems.length)})`);
    
    // Store all filtered items for pagination
    (filteredResult as any)._allFilteredItems = filteredItems;
  };

  const handleRetry = () => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await searchService.search(searchParams);
        setSearchResult(result);
      } catch (err) {
        setError('Failed to load results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  };



  // Handle pagination for filtered results (in-memory)
  const handleFilteredPageChange = (page: number) => {
    if (!searchWithinResults.trim()) {
      // No active filter - use normal pagination
      updateSearchParams({ page });
      return;
    }
    
    if (!globalResultsRef.current) return;
    
    // Apply filter and get specific page (in-memory)
    const filterTokens = searchWithinResults.toLowerCase().trim().split(/\s+/).filter(token => token.length > 0);
    const allGlobalItems = globalResultsRef.current.items;
    
    const filteredItems = allGlobalItems.filter(item => {
      const searchableText = [
        item.name,
        item.brand || '',
        ...item.badges.filter(badge => /\d+\s*(ml|l|g|kg|buc|bucati|bucăți)/.test(badge.toLowerCase())),
        ...item.categoryPath
      ].join(' ').toLowerCase();
      
      return filterTokens.every(token => searchableText.includes(token));
    });
    
    // Paginate filtered results
    const pageSize = searchParams.pageSize || 24;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    const filteredResult: SearchResult = {
      items: paginatedItems,
      total: filteredItems.length,
      page,
      pageSize,
      hasMore: endIndex < filteredItems.length,
      facets: globalResultsRef.current.facets
    };
    
    setSearchResult(filteredResult);
    console.log(`📄 In-memory pagination: Page ${page} of filtered results (${filteredItems.length} total)`);
  };

  const handleSortChange = (sort: string) => {
    updateSearchParams({ sort: sort as SearchParams['sort'] });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {searchParams.q ? `Rezultate pentru "${searchParams.q}"` : 'Toate produsele'}
              </h1>
              {searchResult && (
                <p className="text-muted-foreground">
                  {searchResult.total} produse găsite
                  {searchParams.cat && ` în ${searchParams.cat.split('/').pop()}`}
                </p>
              )}
            </div>
            
            {/* Mobile filter button */}
            <MobileFiltersSheet
              searchParams={searchParams}
              onFiltersChange={updateSearchParams}
              facets={searchResult?.facets}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Încearcă din nou
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main layout */}
        <div className="flex gap-8">
          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden lg:block">
            <FilterSidebar
              searchParams={searchParams}
              onFiltersChange={updateSearchParams}
              facets={searchResult?.facets}
              isLoading={isLoading}
            />
          </div>
          
          {/* Results area */}
          <div className="flex-1 min-w-0">
            {/* Top controls */}
            <div className="mb-6 space-y-4">
              {/* Search within results + Sort controls */}
              <div className="flex items-center justify-between gap-4">
                {/* Search within current results */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {searchResult && (
                      <>
                        Pagina {searchResult.page} din {Math.ceil(searchResult.total / searchResult.pageSize)} 
                        ({searchResult.total} produse)
                      </>
                    )}
                  </div>
                  
                  {/* Search within results - positioned next to pagination */}
                  {searchResult && searchResult.total > 10 && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Filtrează în rezultate..."
                          value={searchWithinResults}
                          onChange={(e) => setSearchWithinResults(e.target.value)}
                          className="pl-10 w-64"
                          size="sm"
                        />
                      </div>
                      {searchWithinResults && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchWithinResults('');
                            // Instantly restore full global results
                            if (globalResultsRef.current) {
                              setSearchResult(globalResultsRef.current);
                              console.log('🔄 Filter cleared: restored full global results');
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sort and page size controls */}
                <div className="flex items-center gap-6">
                  {/* Page size control */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Produse pe pagină:</span>
                    <Select 
                      value={String(searchParams.pageSize || 24)} 
                      onValueChange={(value) => updateSearchParams({ pageSize: Number(value) })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort control */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sortare:</span>
                    <Select value={searchParams.sort || 'relevance'} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevanță</SelectItem>
                        <SelectItem value="price_asc">Preț crescător</SelectItem>
                        <SelectItem value="price_desc">Preț descrescător</SelectItem>
                        <SelectItem value="promo_desc">Reducere %</SelectItem>
                        <SelectItem value="newest">Noutăți</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {searchResult ? (
              <ProductGrid
                result={searchResult}
                searchParams={searchParams}
                onPageChange={(page) => handleFilteredPageChange(page)}
                searchWithinResults={searchWithinResults}
              />
            ) : !isLoading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">
                  Începe să cauți produse
                </h3>
                <p className="text-muted-foreground">
                  Folosește bara de căutare sau filtrele pentru a găsi produsele dorite.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}