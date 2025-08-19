import { Link } from "react-router-dom";
import { Package, TrendingDown, ShoppingCart } from "lucide-react";
import { mockCombos } from "@/lib/mockData";

export default function CombosPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Cheapest Combos</h1>
        <p className="text-muted-foreground">
          Save money with our pre-selected product combinations
        </p>
      </div>

      {/* Combos Grid */}
      <div className="space-y-6">
        {mockCombos.map((combo) => (
          <div
            key={combo.id}
            className="bg-card rounded-2xl shadow-large border border-border overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground mb-1">
                      {combo.title}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {combo.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-success text-sm font-medium mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>Save {combo.savings.toFixed(2)} RON</span>
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">
                    {combo.total.toFixed(2)} RON
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-card-foreground mb-2">
                  Includes {combo.items.length} items:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {combo.items.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="mb-6 p-4 rounded-xl bg-success-light border border-success/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-success font-medium mb-1">
                      Total if bought separately
                    </div>
                    <div className="text-lg line-through text-muted-foreground">
                      {(combo.total + combo.savings).toFixed(2)} RON
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-success font-medium mb-1">
                      Combo price
                    </div>
                    <div className="text-xl font-bold text-success">
                      {combo.total.toFixed(2)} RON
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/combos/${combo.id}`}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Package className="w-4 h-4" />
                  <span>View Combo Details</span>
                </Link>
                
                <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-success text-success rounded-lg hover:bg-success/5 transition-colors font-medium">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add All to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Why Choose Our Combos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-success flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-success-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Best Prices</h3>
            <p className="text-sm text-muted-foreground">
              We find the lowest prices across all stores for each combo
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Curated Selection</h3>
            <p className="text-sm text-muted-foreground">
              Hand-picked combinations based on popular shopping patterns
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-accent flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Easy Shopping</h3>
            <p className="text-sm text-muted-foreground">
              Add entire combos to your wishlist with a single click
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}