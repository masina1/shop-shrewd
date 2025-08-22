import { useState } from "react";
import { ChevronDown, ChevronRight, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface FilterState {
  categories: string[];
  stores: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

interface ShopSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categoryData: Array<{ name: string; count: number }>;
  storeData: Array<{ name: string; count: number }>;
  isMobile?: boolean;
}

function SidebarContent({ filters, onFiltersChange, categoryData, storeData }: Omit<ShopSidebarProps, 'isMobile'>) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    stores: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleStoreChange = (store: string, checked: boolean) => {
    const newStores = checked
      ? [...filters.stores, store]
      : filters.stores.filter(s => s !== store);
    
    onFiltersChange({
      ...filters,
      stores: newStores
    });
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [field]: numValue
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      stores: [],
      priceRange: { min: null, max: null }
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.stores.length > 0 || 
    filters.priceRange.min !== null || filters.priceRange.max !== null;

  return (
    <div className="w-full h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
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
              <div className="mt-3 space-y-3 pl-2">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                      <Checkbox
                        checked={filters.categories.includes(category.name)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.name, checked as boolean)
                        }
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
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
                {storeData.map((store) => (
                  <div key={store.name} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 flex-1 cursor-pointer">
                      <Checkbox
                        checked={filters.stores.includes(store.name)}
                        onCheckedChange={(checked) => 
                          handleStoreChange(store.name, checked as boolean)
                        }
                      />
                      <span className="text-sm">{store.name}</span>
                    </label>
                    <Badge variant="secondary" className="text-xs">
                      {store.count}
                    </Badge>
                  </div>
                ))}
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
              <div className="mt-3 space-y-3 pl-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Min RON</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.priceRange.min ?? ''}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full mt-1 px-2 py-1 text-sm border border-input rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Max RON</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={filters.priceRange.max ?? ''}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full mt-1 px-2 py-1 text-sm border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export function ShopSidebar(props: ShopSidebarProps) {
  if (props.isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden lg:flex w-80 bg-card border-r border-border">
      <SidebarContent {...props} />
    </div>
  );
}