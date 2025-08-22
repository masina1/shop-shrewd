import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { searchProducts, mockProducts, mockOffers, getOffersForProduct } from "@/lib/mockData";
import { ShopSidebar } from "@/components/ShopSidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { toast } from "sonner";

interface FilterState {
  categories: string[];
  stores: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    stores: [],
    priceRange: { min: null, max: null }
  });

  // Get initial results based on search query
  const baseResults = useMemo(() => {
    if (query) {
      const searchResults = searchProducts(query);
      return searchResults.length > 0 ? searchResults : [];
    } else {
      return mockProducts;
    }
  }, [query]);

  // Apply filters to the results
  const filteredResults = useMemo(() => {
    let results = [...baseResults];

    // Apply category filter
    if (filters.categories.length > 0) {
      results = results.filter(product => 
        product.category && filters.categories.includes(product.category)
      );
    }

    // Apply store filter
    if (filters.stores.length > 0) {
      results = results.filter(product => 
        filters.stores.includes(product.store)
      );
    }

    // Apply price range filter
    if (filters.priceRange.min !== null) {
      results = results.filter(product => product.lowestPrice >= filters.priceRange.min!);
    }
    if (filters.priceRange.max !== null) {
      results = results.filter(product => product.lowestPrice <= filters.priceRange.max!);
    }

    return results;
  }, [baseResults, filters]);

  // Prepare data for sidebar
  const categoryData = useMemo(() => {
    const categoryCounts = baseResults.reduce((acc, product) => {
      if (product.category) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  }, [baseResults]);

  const storeData = useMemo(() => {
    const storeCounts = baseResults.reduce((acc, product) => {
      acc[product.store] = (acc[product.store] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(storeCounts).map(([name, count]) => ({ name, count }));
  }, [baseResults]);

  // Action handlers - prepared for API integration
  const handleAddToWishlist = (productId: string, wishlistId: string) => {
    // TODO: Replace with API call
    console.log('Adding product to wishlist:', { productId, wishlistId });
    toast.success('Product added to wishlist!');
  };

  const handleAddToCombo = (productId: string, comboId: string) => {
    // TODO: Replace with API call
    console.log('Adding product to combo:', { productId, comboId });
    toast.success('Product added to combo!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {query ? `Search Results for "${query}"` : "All Products"}
              </h1>
              <p className="text-muted-foreground mt-2">
                Showing {filteredResults.length} of {baseResults.length} products
              </p>
            </div>
            
            {/* Mobile filter button */}
            <ShopSidebar
              filters={filters}
              onFiltersChange={setFilters}
              categoryData={categoryData}
              storeData={storeData}
              isMobile
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <ShopSidebar
            filters={filters}
            onFiltersChange={setFilters}
            categoryData={categoryData}
            storeData={storeData}
          />
          
          {/* Product grid */}
          <ProductGrid
            products={filteredResults}
            offers={mockOffers}
            onAddToWishlist={handleAddToWishlist}
            onAddToCombo={handleAddToCombo}
          />
        </div>
      </div>
    </div>
  );
}