import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchParams, SearchResult } from '@/types/search';
import { searchService } from '@/services/searchService';
import { urlToSearchParams, searchParamsToUrl } from '@/utils/searchUtils';
import { FilterSidebar } from './FilterSidebar';
import { MobileFiltersSheet } from './MobileFiltersSheet';
import { ActiveFiltersBar } from './ActiveFiltersBar';
import { SortControl } from './SortControl';
import { ResultSummary } from './ResultSummary';
import { ProductGrid } from './ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function SearchPage() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert URL params to search params
  const searchParams = useMemo(() => urlToSearchParams(urlSearchParams), [urlSearchParams]);

  // Update URL when search params change
  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    const mergedParams = { ...searchParams, ...newParams };
    // Reset page when filters change
    if ('page' in newParams && Object.keys(newParams).length > 1) {
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
        const result = await searchService.search(searchParams);
        setSearchResult(result);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {searchParams.q ? `Search Results` : 'All Products'}
              </h1>
              {searchResult && (
                <ResultSummary 
                  result={searchResult} 
                  searchParams={searchParams} 
                />
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

          {/* Active filters */}
          <ActiveFiltersBar 
            searchParams={searchParams}
            onFiltersChange={updateSearchParams}
          />
        </div>

        {/* Error state */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main content */}
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <FilterSidebar
            searchParams={searchParams}
            onFiltersChange={updateSearchParams}
            facets={searchResult?.facets}
            isLoading={isLoading}
          />
          
          {/* Results area */}
          <div className="flex-1 min-w-0">
            {/* Sort control */}
            <div className="mb-6">
            <SortControl
              sortBy={searchParams.sort || 'relevance'}
              onSortChange={(sort) => updateSearchParams({ sort: sort as SearchParams['sort'] })}
              resultsCount={searchResult?.total || 0}
            />
            </div>

            {/* Product grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResult ? (
              <ProductGrid
                result={searchResult}
                searchParams={searchParams}
                onPageChange={(page) => updateSearchParams({ page })}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}