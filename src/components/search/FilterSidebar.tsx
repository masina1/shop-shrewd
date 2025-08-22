import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, X, Filter } from 'lucide-react';
import { SearchParams, FacetOption } from '@/types/search';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice, getStoreLabel, getBadgeLabel } from '@/utils/searchUtils';

interface FilterSidebarProps {
  searchParams: SearchParams;
  onFiltersChange: (params: Partial<SearchParams>) => void;
  facets?: {
    categories: FacetOption[];
    stores: Record<string, number>;
    properties: FacetOption[];
    brands: FacetOption[];
    price: { min: number; max: number; buckets: Array<{from: number; to: number; count: number; label: string}> };
    activeCounts: Record<string, number>;
  };
  isLoading?: boolean;
}

export function FilterSidebar({ searchParams, onFiltersChange, facets, isLoading }: FilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedBrands, setExpandedBrands] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    searchParams.price_min || facets?.price.min || 0,
    searchParams.price_max || facets?.price.max || 100
  ]);

  // Calculate active filters for display
  const activeFilters = [
    ...(searchParams.stores?.map(store => ({ type: 'store', value: store, label: getStoreLabel(store) })) || []),
    ...(searchParams.cat ? [{ type: 'category', value: searchParams.cat, label: searchParams.cat.split('/').pop() || '' }] : []),
    ...(searchParams.props?.map(prop => ({ type: 'property', value: prop, label: getBadgeLabel(prop) })) || []),
    ...(searchParams.brand?.map(brand => ({ type: 'brand', value: brand, label: brand })) || []),
    ...(searchParams.promo ? [{ type: 'promo', value: 'promo', label: 'La ofertă' }] : []),
    ...(searchParams.availability === 'in_stock' ? [{ type: 'availability', value: 'in_stock', label: 'În stoc' }] : []),
    ...((searchParams.price_min || searchParams.price_max) ? [{ type: 'price', value: 'price', label: `${searchParams.price_min || 0}-${searchParams.price_max || '∞'} RON` }] : [])
  ];

  const removeFilter = (filter: { type: string; value: string }) => {
    switch (filter.type) {
      case 'store':
        onFiltersChange({ 
          stores: searchParams.stores?.filter(s => s !== filter.value) 
        });
        break;
      case 'category':
        onFiltersChange({ cat: undefined });
        break;
      case 'property':
        onFiltersChange({ 
          props: searchParams.props?.filter(p => p !== filter.value) 
        });
        break;
      case 'brand':
        onFiltersChange({ 
          brand: searchParams.brand?.filter(b => b !== filter.value) 
        });
        break;
      case 'promo':
        onFiltersChange({ promo: undefined });
        break;
      case 'availability':
        onFiltersChange({ availability: 'all' });
        break;
      case 'price':
        onFiltersChange({ price_min: undefined, price_max: undefined });
        setPriceRange([facets?.price.min || 0, facets?.price.max || 100]);
        break;
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      stores: undefined,
      cat: undefined,
      props: undefined,
      brand: undefined,
      promo: undefined,
      availability: 'all',
      price_min: undefined,
      price_max: undefined,
      storeExclusive: undefined
    });
    setPriceRange([facets?.price.min || 0, facets?.price.max || 100]);
  };

  // Render hierarchical categories
  const renderCategories = (categories: FacetOption[], parentId?: string) => {
    const filtered = categories.filter(cat => cat.parentId === parentId);
    
    return filtered.map(category => {
      const hasChildren = categories.some(cat => cat.parentId === category.id);
      const isSelected = searchParams.cat === category.id;
      
      return (
        <div key={category.id} className="space-y-1">
          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onFiltersChange({ 
                  cat: checked ? category.id : undefined 
                });
              }}
              className="transition-colors duration-200"
            />
            <label className="text-sm flex-1 cursor-pointer hover:text-primary transition-colors duration-200">
              {category.label}
            </label>
            <span className="text-xs text-muted-foreground">
              {category.count}
            </span>
          </div>
          
          {hasChildren && (
            <div className="ml-6 space-y-1">
              {renderCategories(categories, category.id)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredBrands = facets?.brands.filter(brand => 
    brand.label.toLowerCase().includes(brandSearch.toLowerCase())
  ) || [];

  const visibleBrands = expandedBrands ? filteredBrands : filteredBrands.slice(0, 10);

  return (
    <div className="w-80 bg-card border-r border-border sticky top-0 h-screen">
      <ScrollArea className="h-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Filtre</h2>
            </div>
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Șterge tot
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Filtre active ({activeFilters.length})
              </h3>
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {activeFilters.map((filter, index) => (
                    <div
                      key={`${filter.type}-${filter.value}-${index}`}
                      className="flex items-center justify-between bg-primary/10 rounded-md px-3 py-2"
                    >
                      <span className="text-sm font-medium text-primary">
                        {filter.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(filter)}
                        className="h-auto p-1 text-primary hover:text-primary-foreground hover:bg-primary"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Filter Groups */}
          <Accordion type="multiple" defaultValue={["categories", "stores", "price"]} className="space-y-2">
            {/* Categories */}
            <AccordionItem value="categories" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Categorii</span>
                  {facets?.activeCounts.categories > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {facets.activeCounts.categories}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {facets?.categories && renderCategories(facets.categories)}
                  {!facets?.categories && (
                    <div className="text-sm text-muted-foreground">
                      Nu sunt categorii disponibile
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stores */}
            <AccordionItem value="stores" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Magazine</span>
                  {facets?.activeCounts.stores > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {facets.activeCounts.stores}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* Store Exclusive Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="store-exclusive" className="text-sm">
                      Doar din aceste magazine
                    </Label>
                    <Switch
                      id="store-exclusive"
                      checked={searchParams.storeExclusive || false}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ storeExclusive: checked || undefined })
                      }
                    />
                  </div>
                  
                  {/* Store List */}
                  <div className="space-y-3">
                    {Object.entries(facets?.stores || {}).map(([storeId, count]) => (
                      <div key={storeId} className="flex items-center space-x-2">
                        <Checkbox
                          checked={searchParams.stores?.includes(storeId) || false}
                          onCheckedChange={(checked) => {
                            const currentStores = searchParams.stores || [];
                            const newStores = checked
                              ? [...currentStores, storeId]
                              : currentStores.filter(s => s !== storeId);
                            onFiltersChange({ 
                              stores: newStores.length > 0 ? newStores : undefined 
                            });
                          }}
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          {getStoreLabel(storeId)}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Price */}
            <AccordionItem value="price" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Preț</span>
                  {facets?.activeCounts.price > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {facets.activeCounts.price}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* Price Range Slider */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Interval preț</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      onValueCommit={(value) => {
                        const [min, max] = value;
                        onFiltersChange({
                          price_min: min > (facets?.price.min || 0) ? min : undefined,
                          price_max: max < (facets?.price.max || 100) ? max : undefined
                        });
                      }}
                      max={facets?.price.max || 100}
                      min={facets?.price.min || 0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex items-center space-x-2 text-sm">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setPriceRange([value, priceRange[1]]);
                        }}
                        onBlur={() => {
                          onFiltersChange({
                            price_min: priceRange[0] > (facets?.price.min || 0) ? priceRange[0] : undefined
                          });
                        }}
                        className="flex-1"
                        placeholder="Min"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 100;
                          setPriceRange([priceRange[0], value]);
                        }}
                        onBlur={() => {
                          onFiltersChange({
                            price_max: priceRange[1] < (facets?.price.max || 100) ? priceRange[1] : undefined
                          });
                        }}
                        className="flex-1"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Properties */}
            {facets?.properties && facets.properties.length > 0 && (
              <AccordionItem value="properties" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Proprietăți</span>
                    {facets?.activeCounts.properties > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {facets.activeCounts.properties}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {facets.properties.map(property => (
                      <div key={property.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={searchParams.props?.includes(property.id) || false}
                          onCheckedChange={(checked) => {
                            const currentProps = searchParams.props || [];
                            const newProps = checked
                              ? [...currentProps, property.id]
                              : currentProps.filter(p => p !== property.id);
                            onFiltersChange({ 
                              props: newProps.length > 0 ? newProps : undefined 
                            });
                          }}
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          {property.label}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {property.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Availability & Promo */}
            <AccordionItem value="availability" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Disponibilitate</span>
                  {(facets?.activeCounts.availability > 0 || facets?.activeCounts.promo > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {(facets?.activeCounts.availability || 0) + (facets?.activeCounts.promo || 0)}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={searchParams.availability === 'in_stock'}
                      onCheckedChange={(checked) => {
                        onFiltersChange({ 
                          availability: checked ? 'in_stock' : 'all' 
                        });
                      }}
                    />
                    <label className="text-sm cursor-pointer">
                      În stoc
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={!!searchParams.promo}
                      onCheckedChange={(checked) => {
                        onFiltersChange({ promo: (checked === true) || undefined });
                      }}
                    />
                    <label className="text-sm cursor-pointer">
                      La ofertă
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}