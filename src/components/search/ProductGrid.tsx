import { SearchResult, SearchParams } from '@/types/search';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ProductGridProps {
  result: SearchResult;
  searchParams: SearchParams;
  onPageChange: (page: number) => void;
}

export function ProductGrid({ result, searchParams, onPageChange }: ProductGridProps) {
  const [searchWithin, setSearchWithin] = useState('');

  // Filter products based on search within results
  const filteredProducts = result.items.filter(product =>
    !searchWithin || 
    product.name.toLowerCase().includes(searchWithin.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchWithin.toLowerCase())) ||
    product.categoryPath.some(cat => cat.toLowerCase().includes(searchWithin.toLowerCase()))
  );

  const currentPage = searchParams.page || 1;
  const totalPages = Math.ceil(result.total / result.pageSize);

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
      {/* Search within results */}
      {result.items.length > 10 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Caută în rezultate..."
            value={searchWithin}
            onChange={(e) => setSearchWithin(e.target.value)}
            className="pl-9"
          />
          {searchWithin && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchWithin('')}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                ×
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {searchWithin 
            ? `${filteredProducts.length} din ${result.total} produse pentru "${searchWithin}"`
            : `${result.total} produse găsite`
          }
        </span>
        {searchWithin && (
          <Button variant="outline" size="sm" onClick={() => setSearchWithin('')}>
            Șterge filtrarea
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* No results within search */}
      {filteredProducts.length === 0 && searchWithin && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nu s-au găsit produse care să corespundă "{searchWithin}" în rezultatele curente
          </p>
          <Button variant="outline" onClick={() => setSearchWithin('')} className="mt-2">
            Șterge căutarea
          </Button>
        </div>
      )}

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