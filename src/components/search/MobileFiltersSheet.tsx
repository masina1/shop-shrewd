import { Filter } from 'lucide-react';
import { SearchParams, FacetCounts } from '@/types/search';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FilterSidebar } from './FilterSidebar';
import { Badge } from '@/components/ui/badge';

interface MobileFiltersSheetProps {
  searchParams: SearchParams;
  onFiltersChange: (params: Partial<SearchParams>) => void;
  facets?: FacetCounts;
  isLoading: boolean;
}

export function MobileFiltersSheet({ searchParams, onFiltersChange, facets, isLoading }: MobileFiltersSheetProps) {
  // Count active filters
  const activeFiltersCount = [
    searchParams.stores?.length || 0,
    searchParams.cat ? 1 : 0,
    searchParams.min || searchParams.max ? 1 : 0,
    searchParams.promo ? 1 : 0,
    searchParams.inStock ? 1 : 0,
    searchParams.tags?.length || 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-hidden">
          <FilterSidebar
            searchParams={searchParams}
            onFiltersChange={onFiltersChange}
            facets={facets}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}