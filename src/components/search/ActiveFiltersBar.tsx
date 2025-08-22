import { X } from 'lucide-react';
import { SearchParams } from '@/types/search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStoreLabel, getBadgeLabel } from '@/utils/searchUtils';

interface ActiveFiltersBarProps {
  searchParams: SearchParams;
  onFiltersChange: (params: Partial<SearchParams>) => void;
}

export function ActiveFiltersBar({ searchParams, onFiltersChange }: ActiveFiltersBarProps) {
  const hasActiveFilters = Boolean(
    searchParams.stores?.length ||
    searchParams.cat ||
    searchParams.min ||
    searchParams.max ||
    searchParams.promo ||
    searchParams.inStock ||
    searchParams.tags?.length
  );

  if (!hasActiveFilters) return null;

  const clearAllFilters = () => {
    onFiltersChange({
      stores: undefined,
      cat: undefined,
      min: undefined,
      max: undefined,
      promo: undefined,
      inStock: undefined,
      tags: undefined
    });
  };

  const removeStoreFilter = (storeId: string) => {
    const newStores = (searchParams.stores || []).filter(id => id !== storeId);
    onFiltersChange({ stores: newStores.length > 0 ? newStores : undefined });
  };

  const removeCategoryFilter = () => {
    onFiltersChange({ cat: undefined });
  };

  const removePriceFilter = () => {
    onFiltersChange({ min: undefined, max: undefined });
  };

  const removePromoFilter = () => {
    onFiltersChange({ promo: undefined });
  };

  const removeInStockFilter = () => {
    onFiltersChange({ inStock: undefined });
  };

  const removeTagFilter = (tag: string) => {
    const newTags = (searchParams.tags || []).filter(t => t !== tag);
    onFiltersChange({ tags: newTags.length > 0 ? newTags : undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
      
      {/* Search query */}
      {searchParams.q && (
        <Badge variant="secondary" className="gap-1">
          Search: "{searchParams.q}"
        </Badge>
      )}

      {/* Stores */}
      {searchParams.stores?.map(storeId => (
        <Badge key={storeId} variant="secondary" className="gap-1">
          {getStoreLabel(storeId)}
          <button
            onClick={() => removeStoreFilter(storeId)}
            className="hover:bg-secondary-foreground/20 rounded-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Category */}
      {searchParams.cat && (
        <Badge variant="secondary" className="gap-1">
          Category: {searchParams.cat}
          <button
            onClick={removeCategoryFilter}
            className="hover:bg-secondary-foreground/20 rounded-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Price range */}
      {(searchParams.min || searchParams.max) && (
        <Badge variant="secondary" className="gap-1">
          Price: {searchParams.min || 0} - {searchParams.max || '∞'} RON
          <button
            onClick={removePriceFilter}
            className="hover:bg-secondary-foreground/20 rounded-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Promo */}
      {searchParams.promo && (
        <Badge variant="secondary" className="gap-1">
          Promo only
          <button
            onClick={removePromoFilter}
            className="hover:bg-secondary-foreground/20 rounded-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* In stock */}
      {searchParams.inStock && (
        <Badge variant="secondary" className="gap-1">
          In stock
          <button
            onClick={removeInStockFilter}
            className="hover:bg-secondary-foreground/20 rounded-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Tags */}
      {searchParams.tags?.map(tag => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {getBadgeLabel(tag)}
          <button
            onClick={() => removeTagFilter(tag)}
            className="hover:bg-secondary-foreground/20 rounded-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Clear all */}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearAllFilters}
        className="h-6 px-2 text-xs"
      >
        Clear all
      </Button>
    </div>
  );
}