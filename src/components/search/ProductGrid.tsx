import { SearchResult, SearchParams } from '@/types/search';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizeForFilter, stripDiacritics } from '@/lib/normalization/textUtils';
import { useMemo } from 'react';

interface ProductGridProps {
  result: SearchResult;
  searchParams: SearchParams;
  onPageChange: (page: number) => void;
  searchWithinResults?: string; // For filtering within current results
}

/**
 * Get category relevance boost for search query (same logic as header search)
 */
function getCategoryRelevanceBoost(query: string, categoryPath: string[]): number {
  const normalizedQuery = stripDiacritics(query.toLowerCase());
  
  // Define category mappings for common search terms
  const categoryMappings: Record<string, string[]> = {
    // Milk & Dairy queries should prioritize dairy categories
    'lapte': ['lactate & oua', 'lactate & branzeturi', 'lactate & lapte'],
    'milk': ['lactate & oua', 'lactate & branzeturi', 'lactate & lapte'],
    'iaurt': ['lactate & oua', 'lactate & branzeturi', 'lactate & iaurt'],
    'yogurt': ['lactate & oua', 'lactate & branzeturi', 'lactate & iaurt'],
    'branza': ['lactate & oua', 'lactate & branzeturi'],
    'cheese': ['lactate & oua', 'lactate & branzeturi'],
    'smantana': ['lactate & oua', 'lactate & branzeturi'],
    'unt': ['lactate & oua', 'lactate & unt'],
    'butter': ['lactate & oua', 'lactate & unt'],
    
    // Meat queries should prioritize meat categories
    'carne': ['carne & peste', 'carne & mezeluri', 'carne & pasari'],
    'meat': ['carne & peste', 'carne & mezeluri'],
    'porc': ['carne & peste', 'carne & porc'],
    'vita': ['carne & peste', 'carne & vita'],
    'pasare': ['carne & peste', 'carne & pasari'],
    
    // Beverages
    'apa': ['bauturi'],
    'water': ['bauturi'],
    'suc': ['bauturi'],
    'juice': ['bauturi'],
    'bere': ['bauturi', 'bauturi alcoolice'],
    'beer': ['bauturi', 'bauturi alcoolice'],
    
    // Fruits & Vegetables
    'fructe': ['fructe & legume'],
    'fruits': ['fructe & legume'],
    'legume': ['fructe & legume'],
    'vegetables': ['fructe & legume'],
    'mere': ['fructe & legume'],
    'apples': ['fructe & legume'],
    'banane': ['fructe & legume'],
    'bananas': ['fructe & legume'],
    
    // Bakery
    'paine': ['brutarie & patiserie'],
    'bread': ['brutarie & patiserie'],
    
    // Sweets
    'ciocolata': ['dulciuri & mic dejun'],
    'chocolate': ['dulciuri & mic dejun'],
    'bomboane': ['dulciuri & mic dejun'],
    'candy': ['dulciuri & mic dejun']
  };
  
  // Check if query matches any category mapping
  const relevantCategories = categoryMappings[normalizedQuery] || [];
  
  for (const category of relevantCategories) {
    // Check if product is in a relevant category
    for (const productCategory of categoryPath) {
      const normalizedProductCategory = stripDiacritics(productCategory.toLowerCase());
      
      if (normalizedProductCategory.includes(category)) {
        return 200; // High boost for category-relevant products
      }
    }
  }
  
  return 0; // No category boost
}

export function ProductGrid({ result, searchParams, onPageChange, searchWithinResults }: ProductGridProps) {
  // Filter the FULL result set with SMART RELEVANCE SCORING (same as header search)
  const filteredProducts = useMemo(() => {
    if (!searchWithinResults?.trim()) {
      return result.items;
    }
    
    // STEP 1: Filter products (keep original broad matching)
    const normalizedQuery = normalizeForFilter(searchWithinResults);
    const queryTokens = normalizedQuery.split(/\s+/);
    
    const matchingProducts = result.items.filter(product => {
      // Create comprehensive searchable text for each product
      const searchableFields = [
        product.name,
        product.brand || '',
        product.categoryPath.join(' '),
        product.badges.join(' ')
      ];
      
      const productSearchText = normalizeForFilter(searchableFields.join(' '));
      
      // All query tokens must match somewhere in the product text
      return queryTokens.every(token => 
        token.length > 0 && productSearchText.includes(token)
      );
    });
    
    // STEP 2: Apply SMART SCORING to sort results (same as header search)
    const query = stripDiacritics(searchWithinResults.toLowerCase());
    const scoredItems = matchingProducts.map(item => {
      let score = 0;
      
      const itemName = stripDiacritics(item.name.toLowerCase());
      const itemBrand = item.brand ? stripDiacritics(item.brand.toLowerCase()) : '';
      
      // **PRIORITY 1: CATEGORY RELEVANCE** (highest boost)
      const categoryBoost = getCategoryRelevanceBoost(query, item.categoryPath);
      if (categoryBoost > 0) {
        score += categoryBoost;
      }
      
      // **PRIORITY 2: EXACT MATCHES**
      if (itemName === query) {
        score += 100;
      } else if (itemName.startsWith(query)) {
        score += 80;
      } else if (itemName.includes(` ${query} `) || itemName.includes(` ${query}`)) {
        score += 60;
      }
      
      // Brand exact matches
      if (itemBrand === query) {
        score += 70;
      } else if (itemBrand.startsWith(query)) {
        score += 50;
      }
      
      // **PRIORITY 3: PARTIAL MATCHES**
      if (itemName.includes(query)) {
        score += 40;
      }
      
      if (itemBrand.includes(query)) {
        score += 30;
      }
      
      // Category text matches
      if (item.categoryPath.some(cat => {
        const catNormalized = stripDiacritics(cat.toLowerCase());
        return catNormalized.includes(query);
      })) {
        score += 20;
      }

      // Badge matches
      if (item.badges.some(badge => {
        const badgeNormalized = stripDiacritics(badge.toLowerCase());
        return badgeNormalized.includes(query);
      })) {
        score += 10;
      }
      
      return { item, score };
    });
    
    // Sort by relevance score (same as header search) 
    return scoredItems
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .map(({ item }) => item);
  }, [result.items, searchWithinResults]);
  
  // Apply pagination to filtered results
  const currentPage = searchParams.page || 1;
  const pageSize = searchParams.pageSize || 24;
  
  const totalFilteredItems = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredItems / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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

  if (paginatedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nu s-au găsit produse</h3>
        <p className="text-muted-foreground mb-4">
          {searchWithinResults 
            ? `Nu s-au găsit produse care să conțină "${searchWithinResults}" în rezultatele curente`
            : 'Încearcă să ajustezi termenii de căutare sau filtrele'
          }
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
              ? `${totalFilteredItems} din ${result.total} produse pentru "${searchWithinResults}" (pagina ${currentPage} din ${totalPages})`
              : `${result.total} produse găsite (pagina ${currentPage} din ${totalPages})`
            }
          </span>
        </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
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