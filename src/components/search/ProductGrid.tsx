import { SearchResult, SearchParams } from '@/types/search';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizeForFilter } from '@/lib/normalization/textUtils';
import { useMemo } from 'react';

interface ProductGridProps {
  result: SearchResult;
  searchParams: SearchParams;
  onPageChange: (page: number) => void;
  searchWithinResults?: string; // For filtering within current results
}

export function ProductGrid({ result, searchParams, onPageChange, searchWithinResults }: ProductGridProps) {
  // Filter the FULL result set (not just current page)
  const filteredProducts = useMemo(() => {
    if (!searchWithinResults?.trim()) {
      return result.items;
    }
    
    // Normalize filter query for diacritics-insensitive search
    const normalizedQuery = normalizeForFilter(searchWithinResults);
    const queryTokens = normalizedQuery.split(/\s+/);
    
    return result.items.filter(product => {
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