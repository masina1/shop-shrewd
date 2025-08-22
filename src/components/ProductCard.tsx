import { useState } from "react";
import { Heart, Plus, ShoppingCart, Tag, Package } from "lucide-react";
import { Product, Offer } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductCardProps {
  product: Product;
  offers?: Offer[];
  onAddToWishlist: (productId: string, wishlistId: string) => void;
  onAddToCombo: (productId: string, comboId: string) => void;
}

export function ProductCard({ product, offers = [], onAddToWishlist, onAddToCombo }: ProductCardProps) {
  const [showWishlistSelect, setShowWishlistSelect] = useState(false);
  const [showComboSelect, setShowComboSelect] = useState(false);

  // Mock data for wishlists and combos - replace with actual data later
  const mockWishlists = [
    { id: "w1", name: "Weekly Shopping" },
    { id: "w2", name: "Monthly Essentials" },
    { id: "w3", name: "Quick Meals" },
  ];

  const mockCombos = [
    { id: "c1", name: "Daily Basics" },
    { id: "c2", name: "Starter Basket" },
    { id: "c3", name: "Weekly Saver" },
  ];

  // Find best offer and calculate discount
  const bestOffer = offers.find(offer => offer.price === product.lowestPrice);
  const hasDiscount = bestOffer?.wasPrice && bestOffer.wasPrice > bestOffer.price;
  const discountPercent = hasDiscount 
    ? Math.round(((bestOffer.wasPrice! - bestOffer.price) / bestOffer.wasPrice!) * 100)
    : 0;

  const handleWishlistSelect = (wishlistId: string) => {
    onAddToWishlist(product.id, wishlistId);
    setShowWishlistSelect(false);
  };

  const handleComboSelect = (comboId: string) => {
    onAddToCombo(product.id, comboId);
    setShowComboSelect(false);
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-200 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md bg-muted"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 px-2 py-1 text-xs font-bold"
            >
              -{discountPercent}%
            </Badge>
          )}
          
          {/* Out of stock overlay */}
          {bestOffer?.outOfStock && (
            <div className="absolute inset-0 bg-muted/80 rounded-md flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
          
          {/* Promo badge */}
          {bestOffer?.promo && !hasDiscount && (
            <Badge 
              className="absolute top-2 left-2 bg-accent text-accent-foreground"
            >
              PROMO
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-card-foreground">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {bestOffer?.wasPrice?.toFixed(2)} RON
                </span>
              )}
              <span className="font-bold text-lg text-success">
                {product.lowestPrice.toFixed(2)} RON
              </span>
            </div>
            
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-1"
            >
              {product.store}
            </Badge>
          </div>

          {product.category && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Tag className="w-3 h-3 mr-1" />
              {product.category}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {/* Add to Wishlist */}
            <div className="relative flex-1">
              {showWishlistSelect ? (
                <Select onValueChange={handleWishlistSelect} onOpenChange={(open) => !open && setShowWishlistSelect(false)}>
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
                >
                  <Heart className="w-3 h-3 mr-1" />
                  List
                </Button>
              )}
            </div>

            {/* Add to Combo */}
            <div className="relative flex-1">
              {showComboSelect ? (
                <Select onValueChange={handleComboSelect} onOpenChange={(open) => !open && setShowComboSelect(false)}>
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
                >
                  <Package className="w-3 h-3 mr-1" />
                  Combo
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}