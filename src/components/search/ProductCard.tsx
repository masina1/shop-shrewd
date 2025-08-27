import { useState } from 'react';
import { Heart, Package, Store, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchResultItem, WishlistOption, ComboOption } from '@/types/search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice, formatCategoryPath, getBadgeLabel, getStoreLabel } from '@/utils/searchUtils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: SearchResultItem;
}

// Mock data - replace with actual data from API
const mockWishlists: WishlistOption[] = [
  { id: 'w1', name: 'Weekly Shopping' },
  { id: 'w2', name: 'Monthly Essentials' },
  { id: 'w3', name: 'Quick Meals' },
];

const mockCombos: ComboOption[] = [
  { id: 'c1', name: 'Daily Basics' },
  { id: 'c2', name: 'Starter Basket' },
  { id: 'c3', name: 'Weekly Saver' },
];

export function ProductCard({ product }: ProductCardProps) {
  const [showWishlistSelect, setShowWishlistSelect] = useState(false);
  const [showComboSelect, setShowComboSelect] = useState(false);

  const handleAddToWishlist = (wishlistId: string) => {
    // TODO: Replace with API call
    const wishlist = mockWishlists.find(w => w.id === wishlistId);
    console.log('Adding product to wishlist:', { productId: product.id, wishlistId });
    toast.success(`Added to ${wishlist?.name}!`);
    setShowWishlistSelect(false);
  };

  const handleAddToCombo = (comboId: string) => {
    // TODO: Replace with API call
    const combo = mockCombos.find(c => c.id === comboId);
    console.log('Adding product to combo:', { productId: product.id, comboId });
    toast.success(`Added to ${combo?.name}!`);
    setShowComboSelect(false);
  };

  const isOutOfStock = product.availability === 'out_of_stock';
  const isLimitedStock = product.availability === 'limited';

  return (
    <Card className="group hover:shadow-medium transition-all duration-200 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md bg-muted"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Discount badge */}
          {product.cheapest.promoPct && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 px-2 py-1 text-xs font-bold"
            >
              -{product.cheapest.promoPct}%
            </Badge>
          )}
          
          {/* Stock status overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-muted/80 rounded-md flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
          
          {isLimitedStock && (
            <Badge 
              variant="outline"
              className="absolute top-2 right-2 bg-background/90"
            >
              Limited Stock
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {/* Category breadcrumb */}
          {product.categoryPath.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Tag className="w-3 h-3 mr-1" />
              {formatCategoryPath(product.categoryPath)}
            </div>
          )}

          {/* Product name and brand */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 text-card-foreground mb-1">
              <Link 
                to={`/product/${product.id}`}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {product.name}
              </Link>
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            )}
          </div>
          
          {/* Price and store */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-success">
                  {formatPrice(product.cheapest.price)}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Store className="w-3 h-3 mr-1" />
                  {getStoreLabel(product.cheapest.store)}
                </div>
              </div>
            </div>

            {/* Other stores info */}
            {product.otherStores.length > 0 && (
              <p className="text-xs text-muted-foreground">
                +{product.otherStores.length} other store{product.otherStores.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Product badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.badges.slice(0, 3).map((badge) => (
                <Badge 
                  key={badge}
                  variant="outline" 
                  className="text-xs px-2 py-0"
                >
                  {getBadgeLabel(badge)}
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {/* Add to Wishlist */}
            <div className="relative flex-1">
              {showWishlistSelect ? (
                <Select 
                  onValueChange={handleAddToWishlist} 
                  onOpenChange={(open) => !open && setShowWishlistSelect(false)}
                >
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder="Choose list" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWishlists.map((wishlist) => (
                      <SelectItem key={wishlist.id} value={wishlist.id}>
                        {wishlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={() => setShowWishlistSelect(true)}
                  disabled={isOutOfStock}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  + List
                </Button>
              )}
            </div>

            {/* Add to Combo */}
            <div className="relative flex-1">
              {showComboSelect ? (
                <Select 
                  onValueChange={handleAddToCombo} 
                  onOpenChange={(open) => !open && setShowComboSelect(false)}
                >
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder="Choose combo" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCombos.map((combo) => (
                      <SelectItem key={combo.id} value={combo.id}>
                        {combo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={() => setShowComboSelect(true)}
                  disabled={isOutOfStock}
                >
                  <Package className="w-3 h-3 mr-1" />
                  + Combo
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
