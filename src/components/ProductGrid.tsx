import { useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Product, Offer } from "@/lib/mockData";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductGridProps {
  products: Product[];
  offers: Offer[];
  onAddToWishlist: (productId: string, wishlistId: string) => void;
  onAddToCombo: (productId: string, comboId: string) => void;
}

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'discount-desc' | 'relevance';

export function ProductGrid({ products, offers, onAddToWishlist, onAddToCombo }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchWithin, setSearchWithin] = useState('');

  // Filter products based on search within results
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchWithin.toLowerCase())
  );

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.lowestPrice - b.lowestPrice;
      case 'price-desc':
        return b.lowestPrice - a.lowestPrice;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'discount-desc': {
        // Calculate discount percentage for each product
        const getMaxDiscount = (productId: string) => {
          const productOffers = offers.filter(offer => offer.productId === productId);
          let maxDiscount = 0;
          productOffers.forEach(offer => {
            if (offer.wasPrice && offer.wasPrice > offer.price) {
              const discount = ((offer.wasPrice - offer.price) / offer.wasPrice) * 100;
              maxDiscount = Math.max(maxDiscount, discount);
            }
          });
          return maxDiscount;
        };
        return getMaxDiscount(b.id) - getMaxDiscount(a.id);
      }
      case 'relevance':
      default:
        return 0;
    }
  });

  return (
    <div className="flex-1 min-h-0">
      {/* Header with search and sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card border-b border-border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search within results..."
              value={searchWithin}
              onChange={(e) => setSearchWithin(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {sortedProducts.length} products
          </span>
          
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Best Match</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="discount-desc">Highest Discount</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product grid */}
      <div className="p-4">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedProducts.map((product) => {
              const productOffers = offers.filter(offer => offer.productId === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  offers={productOffers}
                  onAddToWishlist={onAddToWishlist}
                  onAddToCombo={onAddToCombo}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchWithin 
                ? `No products match "${searchWithin}" in the current results`
                : "Try adjusting your filters to see more products"
              }
            </p>
            {searchWithin && (
              <Button variant="outline" onClick={() => setSearchWithin('')}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}