import { Link } from "react-router-dom";
import { Badge, ShoppingCart, TrendingDown, Zap } from "lucide-react";
import { mockProducts, mockCombos } from "@/lib/mockData";
import { AdSlot } from "@/components/ads/AdSlot";

export default function Home() {
  const featuredProduct = mockProducts[0]; // Lapte 1.5%
  const otherOffers = mockProducts.slice(1, 4);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section - Cheapest Option */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Today's Best Deal
        </h1>
        
        {/* Hero Ad */}
        <div className="flex justify-center mb-6">
          <AdSlot 
            slot={{
              id: 'hero-banner',
              routePattern: '/',
              section: 'Hero Banner',
              status: 'off',
              provider: 'gpt',
              countries: ['RO'],
              sizes: [{ width: 728, height: 90 }],
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              unitPath: '/ads/hero-banner',
              targeting: { page: 'home', section: 'hero' },
              lazyUntil: 'visible'
            }}
          />
        </div>
        
        <div className="relative overflow-hidden rounded-2xl shadow-large">
          <div className="absolute inset-0 gradient-success opacity-90" />
          <div className="relative p-6 text-white">
            <div className="flex items-start space-x-4">
              <img
                src={featuredProduct.image}
                alt={featuredProduct.name}
                className="w-20 h-20 rounded-xl object-cover shadow-medium"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  {featuredProduct.name}
                </h2>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {featuredProduct.store}
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    Best Price
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {featuredProduct.lowestPrice.toFixed(2)} RON
                </div>
              </div>
            </div>
            <Link
              to={`/product/${featuredProduct.id}`}
              className="inline-flex items-center mt-4 px-6 py-2 bg-white text-success font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </div>
        </div>
      </section>

      {/* Sidebar Ad */}
      <div className="flex justify-center mb-6">
        <AdSlot 
          slot={{
            id: 'home-content',
            routePattern: '/',
            section: 'Content',
            status: 'off',
            provider: 'house',
            countries: ['RO'],
            sizes: [{ width: 300, height: 250 }],
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            targeting: { page: 'home', position: 'content' },
            lazyUntil: 'visible'
          }}
        />
      </div>

      {/* Other Offers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">More Great Deals</h2>
          <Link
            to="/search"
            className="text-primary hover:text-primary-light font-medium text-sm"
          >
            View All
          </Link>
        </div>
        
        <div className="space-y-3">
          {otherOffers.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="block"
            >
              <div className="flex items-center space-x-4 p-4 rounded-xl border border-border hover:shadow-medium transition-all hover:border-primary/20 bg-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-card-foreground mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {product.store}
                    </span>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                    <span className="text-success font-semibold">
                      {product.lowestPrice.toFixed(2)} RON
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">from</div>
                  <div className="font-bold text-success">
                    {product.lowestPrice.toFixed(2)} RON
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access to Combos */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cheapest Combos</h2>
          <Link
            to="/combos"
            className="text-primary hover:text-primary-light font-medium text-sm"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockCombos.slice(0, 2).map((combo) => (
            <Link
              key={combo.id}
              to={`/combos/${combo.id}`}
              className="block"
            >
              <div className="p-4 rounded-xl border border-border hover:shadow-medium transition-all hover:border-accent/20 bg-card">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-card-foreground">
                    {combo.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {combo.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {combo.items.length} items
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-success font-medium">
                      Save {combo.savings.toFixed(2)} RON
                    </div>
                    <div className="font-bold text-card-foreground">
                      {combo.total.toFixed(2)} RON
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section>
        <div className="relative overflow-hidden rounded-2xl shadow-medium">
          <div className="absolute inset-0 gradient-accent opacity-90" />
          <div className="relative p-6 text-center text-white">
            <h2 className="text-xl font-bold mb-2">
              Save More with Our Mobile App!
            </h2>
            <p className="text-white/90 mb-4">
              Get exclusive deals and instant price alerts
            </p>
            <Link
              to="/app"
              className="inline-flex items-center px-6 py-2 bg-white text-accent font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
