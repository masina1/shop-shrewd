import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockProducts, mockOffers, mockCombos, mockWishlists } from "@/lib/mockData";
import { currentUser, badges, submittedOffers, leaderboardUsers, userActivity } from "@/lib/rewardsMockData";
import { mockStores, mockProducts as adminProducts, mockOffers as adminOffers, mockCombos as adminCombos } from "@/lib/adminMockData";

export default function MockDataPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Mock Data Reference</h1>
        <p className="text-muted-foreground">Complete overview of all mock data structures and examples</p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products & Offers</TabsTrigger>
          <TabsTrigger value="rewards">Rewards System</TabsTrigger>
          <TabsTrigger value="admin">Admin Data</TabsTrigger>
          <TabsTrigger value="search">Search Data</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Products ({mockProducts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockProducts.map((product) => (
                  <div key={product.id} className="border rounded-p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.id}</Badge>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Price: {product.lowestPrice} Lei</p>
                      <p>Store: {product.store}</p>
                      <p>Category: {product.category}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offers ({mockOffers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockOffers.map((offer, idx) => (
                  <div key={idx} className="border rounded p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{offer.productId}</Badge>
                      <span className="font-medium">{offer.store}</span>
                      {offer.promo && <Badge className="bg-red-500">PROMO</Badge>}
                      {offer.outOfStock && <Badge variant="destructive">Out of Stock</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Price: {offer.price} Lei {offer.wasPrice && `(was ${offer.wasPrice})`}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Combos ({mockCombos.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCombos.map((combo) => (
                  <div key={combo.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{combo.id}</Badge>
                      <span className="font-medium">{combo.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{combo.description}</p>
                    <div className="text-sm">
                      <p>Items: {combo.items.join(", ")}</p>
                      <p>Total: {combo.total} Lei (Save {combo.savings} Lei)</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wishlists ({mockWishlists.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockWishlists.map((wishlist) => (
                  <div key={wishlist.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{wishlist.id}</Badge>
                      <span className="font-medium">{wishlist.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Items: {wishlist.items.join(", ")}</p>
                      <p>Subtotal: {wishlist.subtotal} Lei</p>
                      <p>Created: {wishlist.createdAt}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {currentUser.name}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Points:</strong> {currentUser.points}</p>
                  <p><strong>Badge:</strong> {currentUser.badge}</p>
                  <p><strong>Submissions:</strong> {currentUser.submissionsCount}</p>
                  <p><strong>Monthly Submissions:</strong> {currentUser.monthlySubmissions}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges ({badges.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="border rounded p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <p className="text-xs">Required: {badge.pointsRequired} points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submitted Offers ({submittedOffers.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submittedOffers.slice(0, 5).map((offer) => (
                <div key={offer.id} className="border rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{offer.id}</Badge>
                    <span className="font-medium">{offer.productName}</span>
                    <Badge className={
                      offer.status === 'verified' ? 'bg-green-500' :
                      offer.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }>
                      {offer.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Store: {offer.storeName} | Price: {offer.submittedPrice} Lei</p>
                    <p>Submitted: {offer.submittedAt}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stores ({mockStores.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockStores.map((store) => (
                  <div key={store.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{store.id}</Badge>
                      <span className="font-medium">{store.name}</span>
                      <Badge className={store.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                        {store.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Region: {store.region}</p>
                      <p>Method: {store.scrapingMethod}</p>
                      <p>Currency: {store.currency}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Products ({adminProducts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {adminProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.id}</Badge>
                      <span className="font-medium">{product.name}</span>
                      <Badge className={product.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                        {product.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Brand: {product.brand}</p>
                      <p>Category: {product.category}</p>
                      <p>Size: {product.size}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Service Mock Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-3">
                  <h4 className="font-medium mb-2">Sample Products for Search</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Lapte integral 3.5% 1L Zuzu</p>
                    <p>• Pâine integrală 500g Vel Pitar</p>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium mb-2">Available Stores</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">Kaufland</Badge>
                    <Badge variant="outline">Carrefour</Badge>
                    <Badge variant="outline">Freshful</Badge>
                    <Badge variant="outline">Mega</Badge>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <h4 className="font-medium mb-2">Product Badges</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">made_in_ro</Badge>
                    <Badge variant="outline">eco</Badge>
                    <Badge variant="outline">fara_gluten</Badge>
                    <Badge variant="outline">fara_lactoza</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}