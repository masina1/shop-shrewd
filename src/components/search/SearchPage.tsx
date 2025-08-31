import { useState, useEffect, useMemo } from 'react';
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
  const [allUnpaginatedResults, setAllUnpaginatedResults] = useState<SearchResultItem[]>([]);


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

  // Fetch results when params change
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [result, allItems] = await Promise.all([
          searchService.search(searchParams),
          searchService.searchAll(searchParams) // Get ALL unpaginated results for filtering
        ]);
        setSearchResult(result);
        setAllUnpaginatedResults(allItems); // Store complete unpaginated results
        setSearchWithinResults(''); // Clear filter when main search changes
      } catch (err) {
        setError('Failed to load results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleRetry = () => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [result, allItems] = await Promise.all([
          searchService.search(searchParams),
          searchService.searchAll(searchParams) // Get ALL unpaginated results for filtering
        ]);
        setSearchResult(result);
        setAllUnpaginatedResults(allItems); // Store complete unpaginated results
        setSearchWithinResults(''); // Clear filter on retry
      } catch (err) {
        setError('Failed to load results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
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
                          onClick={() => setSearchWithinResults('')}
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
                allResults={allUnpaginatedResults}
                searchParams={searchParams}
                onPageChange={(page) => updateSearchParams({ page })}
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