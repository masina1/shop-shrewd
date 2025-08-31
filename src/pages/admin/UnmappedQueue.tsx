import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Search, Filter, Download, Eye, MapPin, Package, Edit, Loader2 } from 'lucide-react';
import { adminDataService } from '@/lib/admin/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { UnmappedProduct } from '@/types/admin';

export default function UnmappedQueue() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedProduct, setSelectedProduct] = useState<UnmappedProduct | null>(null);
  const [categoryOverrides, setCategoryOverrides] = useState<{[key: string]: string}>({});
  const [unmappedProducts, setUnmappedProducts] = useState<UnmappedProduct[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [products, categories] = await Promise.all([
          adminDataService.loadUnmappedProducts(),
          adminDataService.getAvailableCategories()
        ]);
        setUnmappedProducts(products);
        setAvailableCategories(categories);
        setError(null);
      } catch (err) {
        setError('Failed to load unmapped products');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handler functions for approve/reject actions
  const handleApprove = async (productId: string) => {
    try {
      // Get the manual category override if available
      const finalCategory = categoryOverrides[productId];
      
      // Call the data service to approve the product
      await adminDataService.approveProduct(productId, finalCategory || '');
      
      // Update the product status to approved with the final category
      setUnmappedProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? { 
            ...product, 
            status: 'approved' as const,
            suggestedCategory: finalCategory || product.suggestedCategory
          } : product
        )
      );
      
      // Clear the override for this product
      setCategoryOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[productId];
        return newOverrides;
      });
      
      console.log(`Product ${productId} approved with category: ${finalCategory || 'original suggestion'}`);
    } catch (error) {
      console.error('Failed to approve product:', error);
      // In a real app, you would show an error toast notification
    }
  };

  const handleReject = async (productId: string) => {
    try {
      // Call the data service to reject the product
      await adminDataService.rejectProduct(productId, 'Manual rejection');
      
      // Update the product status to rejected
      setUnmappedProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? { ...product, status: 'rejected' as const } : product
        )
      );
      
      console.log(`Product ${productId} rejected`);
    } catch (error) {
      console.error('Failed to reject product:', error);
      // In a real app, you would show an error toast notification
    }
  };

  const handleUndo = async (productId: string) => {
    try {
      // Update the product status back to pending
      setUnmappedProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? { ...product, status: 'pending' as const } : product
        )
      );
      
      console.log(`Product ${productId} moved back to queue`);
    } catch (error) {
      console.error('Failed to undo product status:', error);
    }
  };









  const getStatusBadge = (status: UnmappedProduct['status']) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    } as const;

    const labels = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getConfidenceBadge = (confidence: number) => {
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    if (confidence < 0.7) variant = 'destructive';
    else if (confidence < 0.85) variant = 'secondary';

    return (
      <Badge variant={variant}>
        {Math.round(confidence * 100)}% confidence
      </Badge>
    );
  };

  const getFilteredProducts = (status?: string) => {
    return unmappedProducts.filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.rawCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesShop = selectedShop === 'all' || product.shop.toLowerCase() === selectedShop;
      const matchesStatus = !status || product.status === status;
      return matchesSearch && matchesShop && matchesStatus;
    });
  };

  const stats = {
    total: unmappedProducts.length,
    pending: unmappedProducts.filter(p => p.status === 'pending').length,
    approved: unmappedProducts.filter(p => p.status === 'approved').length,
    rejected: unmappedProducts.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unmapped Queue</h1>
        <p className="text-muted-foreground">
          Review and approve category mappings for products that couldn't be automatically categorized
        </p>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading unmapped products...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Unmapped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Products needing review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully mapped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Needs manual review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select shop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shops</SelectItem>
                <SelectItem value="mega">MEGA</SelectItem>
                <SelectItem value="auchan">AUCHAN</SelectItem>
                <SelectItem value="carrefour">CARREFOUR</SelectItem>
                <SelectItem value="lidl">LIDL</SelectItem>
                <SelectItem value="freshful">FRESHFUL</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Products Pending Review
              </CardTitle>
              <CardDescription>
                Review suggested category mappings and approve or reject them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredProducts('pending').map((product) => (
                  <div key={product.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border">
                        {product.productData.image && 
                         product.productData.image !== 'https://via.placeholder.com/64x64?text=No+Image' && 
                         product.productData.image !== '' ? (
                          <img 
                            src={product.productData.image} 
                            alt={product.productName}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              const parent = e.currentTarget.parentElement;
                              e.currentTarget.style.display = 'none';
                              if (parent) {
                                parent.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                              }
                            }}
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} • {product.shop}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{product.rawCategory}</Badge>
                          <span className="text-xs font-medium text-green-600">
                            {product.productData.price ? `${product.productData.price}` : 'No price'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {categoryOverrides[product.id] || product.suggestedCategory}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Select 
                            value={categoryOverrides[product.id] || ''} 
                            onValueChange={(value) => {
                              setCategoryOverrides(prev => ({
                                ...prev,
                                [product.id]: value
                              }));
                            }}
                          >
                            <SelectTrigger className="w-64 h-8 text-xs">
                              <SelectValue placeholder="Override category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCategories.map((category) => (
                                <SelectItem key={category} value={category} className="text-xs">
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getConfidenceBadge(product.confidence)}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(product.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleReject(product.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Product Details</DialogTitle>
                            <DialogDescription>
                              Review product information and category mapping
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Product Name</p>
                                <p className="text-sm text-muted-foreground">{product.productName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Brand</p>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Shop</p>
                                <p className="text-sm text-muted-foreground">{product.shop}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Price</p>
                                <p className="text-sm text-muted-foreground">{product.productData.price} RON</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Raw Category</p>
                              <p className="text-sm text-muted-foreground">{product.rawCategory}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Suggested Category</p>
                              <p className="text-sm text-muted-foreground">{product.suggestedCategory}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Confidence</p>
                              <p className="text-sm text-muted-foreground">{Math.round(product.confidence * 100)}%</p>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button 
                                onClick={() => {
                                  handleApprove(product.id);
                                  setSelectedProduct(null);
                                }}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Mapping
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  handleReject(product.id);
                                  setSelectedProduct(null);
                                }}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approved Mappings
              </CardTitle>
              <CardDescription>
                Products that have been successfully mapped to categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {getFilteredProducts('approved').map((product) => (
                   <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border">
                         {product.productData.image && 
                          product.productData.image !== 'https://via.placeholder.com/64x64?text=No+Image' && 
                          product.productData.image !== '' ? (
                           <img 
                             src={product.productData.image} 
                             alt={product.productName}
                             className="w-full h-full object-cover rounded"
                             onError={(e) => {
                               const parent = e.currentTarget.parentElement;
                               e.currentTarget.style.display = 'none';
                               if (parent) {
                                 parent.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                               }
                             }}
                           />
                         ) : (
                           <Package className="h-6 w-6 text-gray-400" />
                         )}
                       </div>
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} • {product.shop}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{product.rawCategory}</Badge>
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{product.suggestedCategory}</span>
                        </div>
                      </div>
                    </div>
                                         <div className="flex items-center gap-3">
                       {getStatusBadge(product.status)}
                       {getConfidenceBadge(product.confidence)}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleUndo(product.id)}
                         className="text-blue-600 border-blue-600 hover:bg-blue-50"
                       >
                         <Edit className="h-4 w-4 mr-1" />
                         Undo
                       </Button>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Rejected Mappings
              </CardTitle>
              <CardDescription>
                Products that need manual category assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {getFilteredProducts('rejected').map((product) => (
                   <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border">
                         {product.productData.image && 
                          product.productData.image !== 'https://via.placeholder.com/64x64?text=No+Image' && 
                          product.productData.image !== '' ? (
                           <img 
                             src={product.productData.image} 
                             alt={product.productName}
                             className="w-full h-full object-cover rounded"
                             onError={(e) => {
                               const parent = e.currentTarget.parentElement;
                               e.currentTarget.style.display = 'none';
                               if (parent) {
                                 parent.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                               }
                             }}
                           />
                         ) : (
                           <Package className="h-6 w-6 text-gray-400" />
                         )}
                       </div>
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} • {product.shop}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{product.rawCategory}</Badge>
                          <span className="text-sm text-red-600">No category assigned</span>
                        </div>
                      </div>
                    </div>
                                         <div className="flex items-center gap-3">
                       {getStatusBadge(product.status)}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleUndo(product.id)}
                         className="text-blue-600 border-blue-600 hover:bg-blue-50"
                       >
                         <Edit className="h-4 w-4 mr-1" />
                         Undo
                       </Button>

                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Queue
            </Button>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Bulk Category Assignment
            </Button>
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Mapping Rules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
