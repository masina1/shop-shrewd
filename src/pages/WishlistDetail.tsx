import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, Edit3, Copy, Share, Target, Bell } from "lucide-react";
import { getWishlistById, mockProducts } from "@/lib/mockData";

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  lowestPrice: number;
  store: string;
  quantity: number;
}

export default function WishlistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState("");

  const wishlist = id ? getWishlistById(id) : null;

  if (!wishlist) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Wishlist Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Mock detailed wishlist items with quantities
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(
    wishlist.items.map((itemName, index) => {
      const product = mockProducts[index] || mockProducts[0];
      return {
        id: product.id,
        name: itemName,
        image: product.image,
        lowestPrice: product.lowestPrice,
        store: product.store,
        quantity: 1
      };
    })
  );

  const updateQuantity = (itemId: string, change: number) => {
    setWishlistItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
  };

  const totalCost = wishlistItems.reduce((sum, item) => sum + (item.lowestPrice * item.quantity), 0);
  const totalItems = wishlistItems.reduce((sum, item) => sum + item.quantity, 0);

  // Mock store breakdown
  const storeBreakdown = [
    { store: "Freshful", items: 3, total: 32.47 },
    { store: "Store A", items: 1, total: 7.99 },
    { store: "Store B", items: 1, total: 13.99 },
  ];

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      // Here you would rename the wishlist
      console.log("Renaming wishlist to:", newName);
      setNewName("");
      setShowRenameModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{wishlist.name}</h1>
            <p className="text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? 's' : ''} · {totalCost.toFixed(2)} RON
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRenameModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Rename list"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Duplicate list"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Share list"
          >
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List Summary */}
      <div className="mb-8 p-6 rounded-2xl shadow-large bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {totalItems}
            </div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {totalCost.toFixed(2)} RON
            </div>
            <div className="text-sm text-muted-foreground">Estimated Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              3
            </div>
            <div className="text-sm text-muted-foreground">Stores Needed</div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Items in List</h3>
        {wishlistItems.length > 0 ? (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-card-foreground mb-1 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Best at {item.store}</span>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <span className="text-success font-medium">
                        {item.lowestPrice.toFixed(2)} RON each
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-full border border-border hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-full border border-border hover:bg-muted transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-card-foreground">
                      {(item.lowestPrice * item.quantity).toFixed(2)} RON
                    </div>
                    <div className="text-sm text-muted-foreground">
                      total
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Your wishlist is empty</p>
          </div>
        )}
      </div>

      {/* Store Breakdown */}
      {wishlistItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Shopping Plan by Store</h3>
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <div className="space-y-4">
              {storeBreakdown.map((store, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div>
                    <div className="font-semibold">{store.store}</div>
                    <div className="text-sm text-muted-foreground">
                      {store.items} item{store.items !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{store.total.toFixed(2)} RON</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">Total Cost:</span>
                <span className="text-2xl font-bold text-success">
                  {totalCost.toFixed(2)} RON
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Budget Cap */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-accent" />
            <h4 className="font-semibold">Budget Cap</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {totalCost.toFixed(2)} RON</span>
              <span>Budget: 100.00 RON</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totalCost / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Price Alerts */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Price Alerts</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Get notified when items go on sale
          </p>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-background w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Rename Wishlist</h3>
            
            <form onSubmit={handleRename}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  New Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={wishlist.name}
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}