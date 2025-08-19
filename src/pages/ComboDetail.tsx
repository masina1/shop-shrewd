import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Plus, Store, TrendingDown } from "lucide-react";
import { getComboById, mockProducts, getOffersForProduct, mockWishlists } from "@/lib/mockData";

interface ComboItem {
  product: any;
  bestOffer: any;
  allOffers: any[];
}

export default function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddToList, setShowAddToList] = useState(false);

  const combo = id ? getComboById(id) : null;

  if (!combo) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Combo Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Mock detailed combo data with actual products
  const comboItems: ComboItem[] = combo.items.map((itemName, index) => {
    const product = mockProducts[index] || mockProducts[0]; // Fallback to first product
    const offers = getOffersForProduct(product.id);
    const bestOffer = offers.length > 0 ? offers.reduce((best, current) => 
      current.price < best.price ? current : best
    ) : null;
    
    return {
      product: { ...product, name: itemName },
      bestOffer,
      allOffers: offers
    };
  });

  const totalItems = comboItems.length;
  const suggestedStore = "Freshful"; // Most common store
  const storeBreakdown = [
    { store: "Freshful", items: 3, total: 28.99 },
    { store: "Store A", items: 1, total: 12.00 },
  ];

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
        <div>
          <h1 className="text-2xl font-bold">{combo.title}</h1>
          <p className="text-muted-foreground">{combo.description}</p>
        </div>
      </div>

      {/* Combo Summary */}
      <div className="mb-8 p-6 rounded-2xl shadow-large bg-gradient-to-r from-success-light to-primary/5 border border-success/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-success mb-1">
              Complete Combo
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{totalItems} items</span>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>Best prices selected</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-success font-medium mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>Save {combo.savings.toFixed(2)} RON</span>
            </div>
            <div className="text-3xl font-bold text-success">
              {combo.total.toFixed(2)} RON
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddToList(true)}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add All to Wishlist</span>
        </button>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Combo Items</h3>
        <div className="space-y-4">
          {comboItems.map((item, index) => (
            <div key={index} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center space-x-4 mb-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground mb-1">
                    {item.product.name}
                  </h4>
                  {item.bestOffer && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Best at</span>
                      <span className="font-medium">{item.bestOffer.store}</span>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <span className="text-success font-semibold">
                        {item.bestOffer.price.toFixed(2)} RON
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-card-foreground">
                    {item.bestOffer?.price.toFixed(2) || "N/A"} RON
                  </div>
                  <div className="text-sm text-muted-foreground">per unit</div>
                </div>
              </div>
              
              {/* Alternative offers */}
              {item.allOffers.length > 1 && (
                <div className="pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-2">
                    Also available at:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.allOffers
                      .filter(offer => offer.store !== item.bestOffer?.store)
                      .slice(0, 2)
                      .map((offer, offerIndex) => (
                      <span
                        key={offerIndex}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                      >
                        {offer.store}: {offer.price.toFixed(2)} RON
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Store Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Recommended Shopping Plan</h3>
        <div className="bg-muted/50 rounded-xl p-6 border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Most Efficient: {suggestedStore}</h4>
          </div>
          
          <div className="space-y-3">
            {storeBreakdown.map((store, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div>
                  <div className="font-medium">{store.store}</div>
                  <div className="text-sm text-muted-foreground">
                    {store.items} item{store.items !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{store.total.toFixed(2)} RON</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total for combo:</span>
              <span className="text-xl font-bold text-success">
                {combo.total.toFixed(2)} RON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add to List Modal */}
      {showAddToList && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-background w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Combo to Wishlist</h3>
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
                    setShowAddToList(false);
                    // Here you would add all combo items to the selected list
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