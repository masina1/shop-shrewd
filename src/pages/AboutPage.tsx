import { Heart, Users, Shield, Zap, Target, Globe, Camera, Database } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
          <Heart className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4">About PriceCompare</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're on a mission to help families save money and time by comparing supermarket prices across Romania.
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-primary/5 to-success/5 rounded-2xl p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-center mb-6">Our Mission</h2>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6">
              Every Romanian family deserves access to affordable groceries. We believe that by making price comparison 
              easy and accessible, we can help people make informed decisions and save money on their everyday shopping.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-success flex items-center justify-center">
                  <Target className="w-6 h-6 text-success-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Save Money</h3>
                <p className="text-sm text-muted-foreground">
                  Find the best deals across all major supermarkets in Romania
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-accent flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Save Time</h3>
                <p className="text-sm text-muted-foreground">
                  Compare prices instantly without visiting multiple stores
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-primary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Stay Informed</h3>
                <p className="text-sm text-muted-foreground">
                  Get real-time price updates and deal notifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How We Get Our Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-medium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Official Store Feeds</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              We partner directly with major supermarket chains to access their official product catalogs and pricing data in real-time.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-store-a/10 text-store-a rounded-full text-sm">Kaufland</span>
              <span className="px-3 py-1 bg-store-b/10 text-store-b rounded-full text-sm">Carrefour</span>
              <span className="px-3 py-1 bg-store-c/10 text-store-c rounded-full text-sm">Auchan</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-medium">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Community Contributions</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Our community of users helps us by uploading photos of price tags and receipts, ensuring our data stays accurate and up-to-date.
            </p>
            <div className="text-sm text-muted-foreground">
              <span className="text-success font-medium">10,000+</span> verified price updates this month
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Transparency</h3>
            <p className="text-sm text-muted-foreground">
              All our pricing data is clearly sourced and regularly updated
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl gradient-success flex items-center justify-center">
              <Globe className="w-6 h-6 text-success-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              Everyone should have access to affordable groceries and price information
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl gradient-accent flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Community</h3>
            <p className="text-sm text-muted-foreground">
              We're powered by a community of savvy shoppers helping each other save
            </p>
          </div>

          <div className="text-center p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Reliability</h3>
            <p className="text-sm text-muted-foreground">
              You can count on us for accurate, timely price information
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <div className="bg-muted/50 rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Products Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">15+</div>
              <div className="text-muted-foreground">Partner Stores</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">2.3M RON</div>
              <div className="text-muted-foreground">Saved by Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">25,000+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
        <p className="text-muted-foreground mb-6">
          Have questions, feedback, or want to partner with us? We'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Contact Support
          </button>
          <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
            Partnership Inquiries
          </button>
        </div>
      </section>
    </div>
  );
}