import { Smartphone, Zap, Bell, Heart, Download, QrCode, Star, Shield } from "lucide-react";

export default function AppPromoPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-large">
            <Smartphone className="w-16 h-16 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          Get the PriceCompare App
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Take smart shopping with you anywhere. Compare prices, get instant alerts, 
          and never miss a deal again.
        </p>

        {/* App Store Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="flex items-center space-x-3 px-6 py-4 bg-foreground text-background rounded-2xl hover:bg-foreground/90 transition-colors font-medium">
            <div className="w-8 h-8 bg-background/20 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs opacity-80">Download on the</div>
              <div className="text-lg font-semibold">App Store</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 px-6 py-4 bg-foreground text-background rounded-2xl hover:bg-foreground/90 transition-colors font-medium">
            <div className="w-8 h-8 bg-background/20 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs opacity-80">Get it on</div>
              <div className="text-lg font-semibold">Google Play</div>
            </div>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <QrCode className="w-5 h-5" />
          <span>Scan QR code to download</span>
        </div>
      </div>

      {/* App Screenshots Mockup */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-primary/10 to-success/10 rounded-3xl p-8 border border-primary/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">See It In Action</h2>
              <p className="text-muted-foreground mb-6">
                Experience the full power of price comparison right in your pocket. 
                Our mobile app gives you instant access to the best deals wherever you are.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Instant price comparison</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Barcode scanning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Location-based deals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Offline shopping lists</span>
                </div>
              </div>
            </div>
            
            {/* Mock Phone Screenshots */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-96 bg-foreground rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-2xl p-4 flex flex-col">
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="space-y-3 flex-1">
                      <div className="h-16 bg-success/20 rounded-xl" />
                      <div className="h-12 bg-muted rounded-lg" />
                      <div className="h-12 bg-muted rounded-lg" />
                      <div className="h-12 bg-muted rounded-lg" />
                    </div>
                    <div className="h-12 bg-primary/20 rounded-xl mt-4" />
                  </div>
                </div>
                
                {/* Floating notification */}
                <div className="absolute -right-4 top-16 bg-accent text-accent-foreground px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
                  New deal alert!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Download Our App?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-medium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                <Zap className="w-6 h-6 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast Search</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Find and compare prices instantly with our optimized mobile search. 
              Scan barcodes or search by name for immediate results.
            </p>
            <div className="flex items-center space-x-2 text-sm text-success">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>Search 50,000+ products in seconds</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-medium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Smart Price Alerts</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Never miss a deal again. Get push notifications when your favorite 
              products go on sale or drop to your target price.
            </p>
            <div className="flex items-center space-x-2 text-sm text-accent">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>Custom price thresholds & alerts</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-medium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Offline Wishlists</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Create and manage your shopping lists even without internet. 
              Sync automatically when you're back online.
            </p>
            <div className="flex items-center space-x-2 text-sm text-primary">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Works offline, syncs when online</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-medium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                <Shield className="w-6 h-6 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Privacy First</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Your shopping data stays private. We don't sell your information 
              or track your purchases across stores.
            </p>
            <div className="flex items-center space-x-2 text-sm text-success">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>End-to-end encrypted data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "This app has saved me over 200 RON per month on groceries. The price alerts are fantastic!"
            </p>
            <div className="font-medium">Maria T.</div>
            <div className="text-sm text-muted-foreground">Bucharest</div>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "Super easy to use and the barcode scanner works perfectly. Highly recommend!"
            </p>
            <div className="font-medium">Alexandru R.</div>
            <div className="text-sm text-muted-foreground">Cluj-Napoca</div>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "The offline shopping lists are a game-changer. No more forgotten items at the store!"
            </p>
            <div className="font-medium">Elena S.</div>
            <div className="text-sm text-muted-foreground">Timișoara</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-primary to-success rounded-3xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Saving?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of smart shoppers who are already saving money with our mobile app. 
            Download now and get your first price alert within minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center space-x-3 px-8 py-4 bg-white text-foreground rounded-2xl hover:bg-white/90 transition-colors font-semibold">
              <Download className="w-5 h-5" />
              <span>Download Free App</span>
            </button>
          </div>
          
          <div className="mt-6 text-white/80 text-sm">
            Free forever • No ads • No subscription
          </div>
        </div>
      </section>
    </div>
  );
}