import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Bell, 
  TrendingDown, 
  Package, 
  Target, 
  MapPin, 
  Eye, 
  Settings,
  Plus,
  ArrowRight,
  Store,
  Award,
  Trophy,
  Upload
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { mockWishlists, mockCombos } from "@/lib/mockData";

// Mock data for dashboard
const mockUser = {
  id: "u1",
  name: "Ana",
  preferredStores: ["Freshful", "Carrefour"]
};

const mockAlerts = [
  {
    productId: "p2",
    name: "Mușchi file 100g",
    oldPrice: 7.99,
    newPrice: 7.09,
    store: "Freshful"
  }
];

const mockDrops = [
  {
    productId: "pMilk",
    name: "Lapte 1.5% 1.5L",
    oldPrice: 14.39,
    newPrice: 12.49,
    store: "Freshful",
    image: "/placeholder-milk.png"
  },
  {
    productId: "pBread",
    name: "Pâine integrală 500g",
    oldPrice: 6.99,
    newPrice: 4.99,
    store: "Store A",
    image: "/placeholder-bread.png"
  }
];

const mockBudget = { cap: 150, current: 92.3 };
const mockRecentProducts = ["p2", "p3", "pMilk"];

export default function Dashboard() {
  const [preferredStores, setPreferredStores] = useState(mockUser.preferredStores);
  const navigate = useNavigate();

  const hasWishlists = mockWishlists.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {mockUser.name}
            </h1>
            <p className="text-muted-foreground">Here's your shopping overview</p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Empty State */}
        {!hasWishlists && (
          <Card className="shadow-medium">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Start Your Smart Shopping</h3>
                  <p className="text-muted-foreground">
                    Create wishlists, track prices, and discover the best deals
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="gradient-primary" asChild>
                    <Link to="/lists">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first wishlist
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/combos">Browse combos</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Grid */}
        {hasWishlists && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Your Wishlists */}
            <Card className="shadow-medium md:col-span-2 lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Wishlists
                  </CardTitle>
                  <CardDescription>Manage your shopping lists</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/lists">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {mockWishlists.map((list) => (
                    <Card key={list.id} className="border-border">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{list.name}</h4>
                          <Badge variant="secondary">{list.items.length} items</Badge>
                        </div>
                        <p className="text-2xl font-bold text-success">
                          {list.subtotal.toFixed(2)} RON
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge className="store-badge-a text-xs">Best at Freshful</Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/lists/${list.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Alerts */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Price Alerts
                </CardTitle>
                <CardDescription>Products from your lists that dropped in price</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{alert.name}</p>
                        <p className="text-xs text-muted-foreground">{alert.store}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm line-through text-muted-foreground">
                          {alert.oldPrice.toFixed(2)} RON
                        </p>
                        <p className="font-bold text-success">
                          {alert.newPrice.toFixed(2)} RON
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Price Drops */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Recent Drops
                </CardTitle>
                <CardDescription>Site-wide price reductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDrops.slice(0, 3).map((drop, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={drop.image}
                        alt={drop.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{drop.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs line-through text-muted-foreground">
                            {drop.oldPrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-success">
                            {drop.newPrice.toFixed(2)} RON
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Combos */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Suggested Combos
                </CardTitle>
                <CardDescription>Based on your wishlists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCombos.slice(0, 2).map((combo) => (
                    <Card key={combo.id} className="border-border">
                      <CardContent className="pt-3">
                        <h4 className="font-medium text-sm mb-1">{combo.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{combo.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-success">
                            {combo.total.toFixed(2)} RON
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Save {combo.savings.toFixed(2)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Budget */}
            <Card className="shadow-medium md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Budget
                </CardTitle>
                <CardDescription>Track your spending progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {mockBudget.current.toFixed(2)} RON
                    </span>
                    <span className="text-muted-foreground">
                      of {mockBudget.cap} RON
                    </span>
                  </div>
                  <Progress 
                    value={(mockBudget.current / mockBudget.cap) * 100} 
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    {(mockBudget.cap - mockBudget.current).toFixed(2)} RON remaining this week
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shopping Plan */}
            <Card className="shadow-medium md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shopping Plan
                </CardTitle>
                <CardDescription>Optimized store routing for "{mockWishlists[0]?.name}"</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Freshful</p>
                        <p className="text-sm text-muted-foreground">3 items</p>
                      </div>
                    </div>
                    <p className="font-bold text-success">27.90 RON</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Store B</p>
                        <p className="text-sm text-muted-foreground">2 items</p>
                      </div>
                    </div>
                    <p className="font-bold text-success">11.67 RON</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recently Viewed */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recently Viewed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {mockRecentProducts.map((productId, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card className="shadow-medium md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Settings
                </CardTitle>
                <CardDescription>Adjust your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Preferred Stores</Label>
                    <div className="space-y-2">
                      {["Freshful", "Carrefour", "Store A", "Store B"].map((store) => (
                        <div key={store} className="flex items-center space-x-2">
                          <Switch 
                            id={store}
                            checked={preferredStores.includes(store)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPreferredStores([...preferredStores, store]);
                              } else {
                                setPreferredStores(preferredStores.filter(s => s !== store));
                              }
                            }}
                          />
                          <Label htmlFor={store} className="text-sm">{store}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Distance Filter</Label>
                    <p className="text-sm text-muted-foreground">Within 5 km</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Currency</Label>
                    <p className="text-sm text-muted-foreground">RON (Romanian Leu)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards & Offers Section */}
            <Card className="shadow-medium md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Rewards & Community
                </CardTitle>
                <CardDescription>Contribute to the community and earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Button asChild className="gradient-primary h-auto p-4 flex-col gap-2">
                    <Link to="/submit-offer">
                      <Upload className="h-6 w-6" />
                      <span className="font-medium">Submit Offer</span>
                      <span className="text-xs opacity-90">Share better prices you found</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Link to="/rewards">
                      <Award className="h-6 w-6" />
                      <span className="font-medium">My Rewards</span>
                      <span className="text-xs text-muted-foreground">View points & badges</span>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Link to="/leaderboard">
                      <Trophy className="h-6 w-6" />
                      <span className="font-medium">Leaderboard</span>
                      <span className="text-xs text-muted-foreground">Top contributors</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}