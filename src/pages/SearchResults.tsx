import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { searchProducts, mockProducts } from "@/lib/mockData";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState(mockProducts);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    store: "",
    minPrice: "",
    maxPrice: "",
    distance: ""
  });

  useEffect(() => {
    if (query) {
      const searchResults = searchProducts(query);
      setResults(searchResults.length > 0 ? searchResults : []);
    } else {
      setResults(mockProducts);
    }
  }, [query]);

  const clearFilters = () => {
    setFilters({
      store: "",
      minPrice: "",
      maxPrice: "",
      distance: ""
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {query ? `Search Results for "${query}"` : "All Products"}
          </h1>
          <p className="text-muted-foreground">
            {results.length} product{results.length !== 1 ? "s" : ""} found
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-background rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store</label>
              <select
                value={filters.store}
                onChange={(e) => setFilters({...filters, store: e.target.value})}
                className="w-full p-2 border border-input rounded-lg bg-background"
              >
                <option value="">All Stores</option>
                <option value="Freshful">Freshful</option>
                <option value="Store A">Store A</option>
                <option value="Store B">Store B</option>
                <option value="Store C">Store C</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="w-full p-2 border border-input rounded-lg bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <input
                type="number"
                placeholder="100.00"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full p-2 border border-input rounded-lg bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Distance</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                className="w-full p-2 border border-input rounded-lg bg-background"
              >
                <option value="">Any Distance</option>
                <option value="1km">Within 1km</option>
                <option value="5km">Within 5km</option>
                <option value="10km">Within 10km</option>
              </select>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex items-center space-x-4 p-4 rounded-xl border border-border hover:shadow-medium transition-all hover:border-primary/20 bg-card cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground mb-1 truncate">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{product.store}</span>
                  {product.category && (
                    <>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <span>{product.category}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">from</div>
                <div className="font-bold text-lg text-success">
                  {product.lowestPrice.toFixed(2)} RON
                </div>
                <div className="text-xs text-muted-foreground">
                  at {product.store}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {query
              ? `We couldn't find any products matching "${query}"`
              : "Try adjusting your search or filters"
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}