import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, Plus, ShoppingCart, Calendar, Trash2 } from "lucide-react";
import { mockWishlists } from "@/lib/mockData";

export default function WishlistsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      // Here you would create a new wishlist
      console.log("Creating new list:", newListName);
      setNewListName("");
      setShowCreateModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlists</h1>
          <p className="text-muted-foreground">
            Organize your shopping with custom lists
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Create List</span>
        </button>
      </div>

      {/* Wishlists Grid */}
      {mockWishlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockWishlists.map((list) => (
            <div key={list.id} className="bg-card rounded-2xl shadow-medium border border-border overflow-hidden hover:shadow-large transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-card-foreground mb-1">
                        {list.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Items Preview */}
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    {list.items.length} item{list.items.length !== 1 ? 's' : ''}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {list.items.slice(0, 3).map((item, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                    {list.items.length > 3 && (
                      <span className="inline-block px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                        +{list.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6 p-4 rounded-xl bg-success-light border border-success/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-success font-medium">
                      Estimated total
                    </span>
                    <span className="text-xl font-bold text-success">
                      {list.subtotal.toFixed(2)} RON
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/lists/${list.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <Heart className="w-4 h-4" />
                    <span>View List</span>
                  </Link>
                  
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-success text-success rounded-lg hover:bg-success/5 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Shop</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No wishlists yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first wishlist to start organizing your shopping
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Create Your First List
          </button>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-background w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Wishlist</h3>
            
            <form onSubmit={handleCreateList}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Weekly Shopping"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
        <h2 className="text-lg font-semibold mb-4">Wishlist Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="font-medium">Organize by occasion</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">
              Create separate lists for weekly shopping, parties, or special meals
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="font-medium">Track price changes</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">
              Get notified when items in your lists go on sale
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="font-medium">Share with family</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">
              Collaborate on shopping lists with household members
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="font-medium">Budget tracking</span>
            </div>
            <p className="text-sm text-muted-foreground ml-4">
              Set budget limits and get alerts when you're close to spending limits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}