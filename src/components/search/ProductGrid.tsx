import { SearchResult, SearchParams, SearchResultItem } from '@/types/search';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { stripDiacritics } from '@/lib/normalization/textUtils';

interface ProductGridProps {
  result: SearchResult;
  allResults?: SearchResult | null; // Complete search results for intelligent filtering
  searchParams: SearchParams;
  onPageChange: (page: number) => void;
  searchWithinResults?: string; // For filtering within current results
}

export function ProductGrid({ result, allResults, searchParams, onPageChange, searchWithinResults }: ProductGridProps) {
  // Apply intelligent filtering to ALL search results, then paginate
  const { filteredProducts, totalFiltered } = useMemo(() => {
    if (!searchWithinResults || !allResults) {
      return { filteredProducts: result.items, totalFiltered: result.total };
    }

    // Apply the same intelligent ranking to filter results
    const filtered = applyIntelligentFilter(allResults.items, searchWithinResults);
    
    // Apply pagination to filtered results
    const pageSize = searchParams.pageSize || 24;
    const currentPage = searchParams.page || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiltered = filtered.slice(startIndex, endIndex);
    
    return { 
      filteredProducts: paginatedFiltered, 
      totalFiltered: filtered.length 
    };
  }, [result.items, allResults, searchWithinResults, searchParams.page, searchParams.pageSize]);

  const currentPage = searchParams.page || 1;
  const actualTotal = searchWithinResults ? totalFiltered : result.total;
  const totalPages = Math.ceil(actualTotal / (searchParams.pageSize || 24));

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (result.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nu s-au găsit produse</h3>
        <p className="text-muted-foreground mb-4">
          Încearcă să ajustezi termenii de căutare sau filtrele
        </p>
      </div>
    );
  }

      return (
      <div className="space-y-6">
        {/* Results summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {searchWithinResults 
              ? `${totalFiltered} produse găsite pentru "${searchWithinResults}" (din ${result.total} total)`
              : `${result.total} produse găsite`
            }
          </span>
          {searchWithinResults && totalFiltered === 0 && (
            <span className="text-orange-600">
              Nu s-au găsit produse cu "{searchWithinResults}" în rezultatele curente
            </span>
          )}
        </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>



      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            Următor
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Apply intelligent filtering with same ranking logic as global search
 * No loading, no autocomplete - just instant smart ranking
 */
function applyIntelligentFilter(allItems: SearchResultItem[], filterQuery: string): SearchResultItem[] {
  if (!filterQuery.trim()) {
    return allItems;
  }

  const query = stripDiacritics(filterQuery.toLowerCase());
  
  // Apply same scoring logic as global search
  const scoredItems = allItems.map(item => {
    let score = 0;
    let hasMatch = false;
    
    const itemName = stripDiacritics(item.name.toLowerCase());
    const itemBrand = item.brand ? stripDiacritics(item.brand.toLowerCase()) : '';
    
    // Category relevance boost (same as global search)
    const categoryBoost = getCategoryRelevanceBoost(query, item.categoryPath);
    if (categoryBoost > 0) {
      score += categoryBoost;
      hasMatch = true;
    }
    
    // Exact matches
    if (itemName === query) {
      score += 100;
      hasMatch = true;
    } else if (itemName.startsWith(query)) {
      score += 80;
      hasMatch = true;
    } else if (itemName.includes(` ${query} `) || itemName.includes(` ${query}`)) {
      score += 60;
      hasMatch = true;
    }
    
    // Brand matches
    if (itemBrand === query) {
      score += 70;
      hasMatch = true;
    } else if (itemBrand.startsWith(query)) {
      score += 50;
      hasMatch = true;
    }
    
    // Partial matches
    if (itemName.includes(query)) {
      score += 40;
      hasMatch = true;
    }
    
    if (itemBrand.includes(query)) {
      score += 30;
      hasMatch = true;
    }
    
    // Category text matches
    if (categoryBoost === 0 && item.categoryPath.some(cat => {
      const catNormalized = stripDiacritics(cat.toLowerCase());
      return catNormalized.includes(query);
    })) {
      score += 20;
      hasMatch = true;
    }

    // Badge matches
    if (item.badges.some(badge => {
      const badgeNormalized = stripDiacritics(badge.toLowerCase());
      return badgeNormalized.includes(query);
    })) {
      score += 10;
      hasMatch = true;
    }
    
    return { item, score, hasMatch };
  });
  
  // Filter and sort by relevance score (same as global search)
  return scoredItems
    .filter(({ hasMatch }) => hasMatch)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Category relevance boost - same logic as global search  
 */
function getCategoryRelevanceBoost(query: string, categoryPath: string[]): number {
  const normalizedQuery = stripDiacritics(query.toLowerCase());
  
  const categoryMappings: Record<string, string[]> = {
    'lapte': ['lactate & oua', 'lactate & branzeturi', 'lactate & lapte'],
    'milk': ['lactate & oua', 'lactate & branzeturi', 'lactate & lapte'],
    'iaurt': ['lactate & oua', 'lactate & branzeturi', 'lactate & iaurt'],
    'branza': ['lactate & oua', 'lactate & branzeturi'],
    'carne': ['carne & peste', 'carne & mezeluri', 'carne & pasari'],
    'apa': ['bauturi'],
    'suc': ['bauturi'],
    'fructe': ['fructe & legume'],
    'legume': ['fructe & legume'],
    'paine': ['brutarie & patiserie'],
    'ciocolata': ['dulciuri & mic dejun']
  };
  
  const relevantCategories = categoryMappings[normalizedQuery] || [];
  
  for (const category of relevantCategories) {
    for (const productCategory of categoryPath) {
      const normalizedProductCategory = stripDiacritics(productCategory.toLowerCase());
      if (normalizedProductCategory.includes(category)) {
        return 200; // High boost for category-relevant products
      }
    }
  }
  
  return 0;
}