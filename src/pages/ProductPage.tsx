import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Heart, AlertCircle, Tag, Plus } from "lucide-react";
import { getProductById, getOffersForProduct, mockWishlists } from "@/lib/mockData";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);

  const product = id ? getProductById(id) : null;
  const offers = id ? getOffersForProduct(id) : [];

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
  const displayedOffers = showAllOffers ? sortedOffers : sortedOffers.slice(0, 3);
  const bestOffer = sortedOffers[0];

  const images = offers.map(offer => offer.image).filter((img, index, arr) => arr.indexOf(img) === index);
  if (images.length === 0) images.push(product.image);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-lg transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">{product.name}</h1>
      </div>

      {/* Product Image Gallery */}
      <div className="mb-6">
        <div className="aspect-square max-w-sm mx-auto mb-4 rounded-xl overflow-hidden shadow-medium">
          <img
            src={images[selectedImageIndex] || product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
        
        {images.length > 1 && (
          <div className="flex justify-center space-x-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Best Price Section */}
      {bestOffer && (
        <div className="mb-6 p-6 rounded-xl shadow-large border border-success/20 bg-success-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-success">Best Price</h2>
            {bestOffer.promo && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                <Tag className="w-3 h-3" />
                <span>PROMO</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-success mb-1">
                {bestOffer.price.toFixed(2)} RON
              </div>
              {bestOffer.wasPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  was {bestOffer.wasPrice.toFixed(2)} RON
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                at {bestOffer.store}
              </div>
            </div>
            
            <button className="px-6 py-3 bg-success text-success-foreground font-semibold rounded-lg hover:bg-success/90 transition-colors">
              <ShoppingCart className="w-4 h-4 mr-2 inline" />
              Go to Store
            </button>
          </div>
        </div>
      )}

      {/* Other Stores */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Offers</h3>
          {sortedOffers.length > 3 && !showAllOffers && (
            <button
              onClick={() => setShowAllOffers(true)}
              className="text-primary hover:text-primary-light font-medium text-sm"
            >
              Show all offers ({sortedOffers.length})
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {displayedOffers.map((offer, index) => (
            <div
              key={`${offer.store}-${index}`}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                offer.outOfStock
                  ? "border-destructive/20 bg-destructive/5"
                  : "border-border bg-card hover:shadow-soft"
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={offer.image}
                  alt={`${product.name} at ${offer.store}`}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div>
                  <div className="font-medium text-card-foreground">
                    {offer.store}
                  </div>
                  {offer.outOfStock && (
                    <div className="flex items-center space-x-1 text-destructive text-sm">
                      <AlertCircle className="w-3 h-3" />
                      <span>Out of Stock</span>
                    </div>
                  )}
                  {offer.promo && !offer.outOfStock && (
                    <div className="flex items-center space-x-1 text-accent text-sm">
                      <Tag className="w-3 h-3" />
                      <span>Special Offer</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-card-foreground">
                  {offer.price.toFixed(2)} RON
                </div>
                {offer.wasPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    was {offer.wasPrice.toFixed(2)} RON
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  per unit
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowAddToList(true)}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add to List</span>
        </button>
        
        <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Add to List Modal */}
      {showAddToList && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-background w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add to Wishlist</h3>
              <button
                onClick={() => setShowAddToList(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {mockWishlists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => {
                    // Here you would add the product to the selected list
                    setShowAddToList(false);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{list.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {list.items.length} items · {list.subtotal.toFixed(2)} RON
                  </div>
                </button>
              ))}
            </div>
            
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create New List</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
