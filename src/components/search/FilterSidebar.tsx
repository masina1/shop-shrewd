import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SearchParams, FacetCounts } from '@/types/search';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { PriceRange } from './PriceRange';
import { getStoreLabel, getBadgeLabel } from '@/utils/searchUtils';

interface FilterSidebarProps {
  searchParams: SearchParams;
  onFiltersChange: (params: Partial<SearchParams>) => void;
  facets?: FacetCounts;
  isLoading: boolean;
}

export function FilterSidebar({ searchParams, onFiltersChange, facets, isLoading }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    stores: true,
    price: true,
    filters: true,
    tags: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStoreChange = (storeId: string, checked: boolean) => {
    const currentStores = searchParams.stores || [];
    const newStores = checked
      ? [...currentStores, storeId]
      : currentStores.filter(id => id !== storeId);
    
    onFiltersChange({ stores: newStores });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ cat: categoryId });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = searchParams.tags || [];
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag);
    
    onFiltersChange({ tags: newTags });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    onFiltersChange({ min, max });
  };

  // Get top-level categories
  const topLevelCategories = facets?.categories.filter(cat => !cat.parentId) || [];
  
  return (
    <div className="hidden lg:flex w-80 bg-card border-r border-border">
      <div className="w-full h-full">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
          <div className="p-4 space-y-6">
            
            {/* Categories */}
            <div>
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors"
              >
                <span className="font-medium">Categories</span>
                {expandedSections.categories ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.categories && (
                <div className="mt-3 space-y-2 pl-2">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    ))
                  ) : (
                    topLevelCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id.toLowerCase())}
                        className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors text-left"
                      >
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Stores */}
            <div>
              <button
                onClick={() => toggleSection('stores')}
                className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors"
              >
                <span className="font-medium">Stores</span>
                {expandedSections.stores ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.stores && (
                <div className="mt-3 space-y-3 pl-2">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-6" />
                      </div>
                    ))
                  ) : (
                    Object.entries(facets?.stores || {}).map(([storeId, count]) => (
                      <div key={storeId} className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                          <Checkbox
                            checked={searchParams.stores?.includes(storeId) || false}
                            onCheckedChange={(checked) => 
                              handleStoreChange(storeId, checked as boolean)
                            }
                          />
                          <span className="text-sm">{getStoreLabel(storeId)}</span>
                        </label>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div>
              <button
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors"
              >
                <span className="font-medium">Price Range</span>
                {expandedSections.price ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.price && (
                <div className="mt-3 pl-2">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ) : (
                    <PriceRange
                      min={searchParams.min}
                      max={searchParams.max}
                      bounds={facets?.priceBounds}
                      onChange={handlePriceChange}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Quick Filters */}
            <div>
              <button
                onClick={() => toggleSection('filters')}
                className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors"
              >
                <span className="font-medium">Quick Filters</span>
                {expandedSections.filters ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.filters && (
                <div className="mt-3 space-y-3 pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Promo only</span>
                    <Switch
                      checked={searchParams.promo || false}
                      onCheckedChange={(checked) => onFiltersChange({ promo: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In stock</span>
                    <Switch
                      checked={searchParams.inStock || false}
                      onCheckedChange={(checked) => onFiltersChange({ inStock: checked })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <button
                onClick={() => toggleSection('tags')}
                className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors"
              >
                <span className="font-medium">Product Tags</span>
                {expandedSections.tags ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.tags && (
                <div className="mt-3 space-y-3 pl-2">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-6" />
                      </div>
                    ))
                  ) : (
                    Object.entries(facets?.tags || {}).map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                          <Checkbox
                            checked={searchParams.tags?.includes(tag) || false}
                            onCheckedChange={(checked) => 
                              handleTagChange(tag, checked as boolean)
                            }
                          />
                          <span className="text-sm">{getBadgeLabel(tag)}</span>
                        </label>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}