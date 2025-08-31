import React, { useState } from 'react';
import { FolderTree, MapPin, Search, Filter, Download, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  children?: CategoryNode[];
  mappingStatus: 'mapped' | 'unmapped' | 'partial';
  shopCount: number;
  lastUpdated: string;
}

interface ShopMapping {
  shopId: string;
  shopName: string;
  rawCategory: string;
  mappedCategory: string;
  confidence: number;
  productCount: number;
}

export default function CategoryManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data representing our preprocessing system's category structure
  const categoryTree: CategoryNode[] = [
    {
      id: '1',
      name: 'Lactate & Brânzeturi',
      slug: 'lactate-si-branzeturi',
      productCount: 2847,
      mappingStatus: 'mapped',
      shopCount: 5,
      lastUpdated: '2025-01-29',
      children: [
        {
          id: '1.1',
          name: 'Lapte',
          slug: 'lapte',
          productCount: 1247,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        },
        {
          id: '1.2',
          name: 'Iaurt & Sana',
          slug: 'iaurt-si-sana',
          productCount: 892,
          mappingStatus: 'mapped',
          shopCount: 4,
          lastUpdated: '2025-01-29',
        },
        {
          id: '1.3',
          name: 'Brânzeturi',
          slug: 'branzeturi',
          productCount: 708,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        }
      ]
    },
    {
      id: '2',
      name: 'Carne & Mezeluri',
      slug: 'carne-si-mezeluri',
      productCount: 3156,
      mappingStatus: 'mapped',
      shopCount: 5,
      lastUpdated: '2025-01-29',
      children: [
        {
          id: '2.1',
          name: 'Carne proaspătă',
          slug: 'carne-proaspata',
          productCount: 1456,
          mappingStatus: 'mapped',
          shopCount: 4,
          lastUpdated: '2025-01-29',
        },
        {
          id: '2.2',
          name: 'Mezeluri',
          slug: 'mezeluri',
          productCount: 1700,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        }
      ]
    },
    {
      id: '3',
      name: 'Fructe & Legume',
      slug: 'fructe-si-legume',
      productCount: 1892,
      mappingStatus: 'mapped',
      shopCount: 5,
      lastUpdated: '2025-01-29',
      children: [
        {
          id: '3.1',
          name: 'Fructe proaspete',
          slug: 'fructe-proaspete',
          productCount: 892,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        },
        {
          id: '3.2',
          name: 'Legume proaspete',
          slug: 'legume-proaspete',
          productCount: 1000,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        }
      ]
    },
    {
      id: '4',
      name: 'Băcănie',
      slug: 'bacanie',
      productCount: 4567,
      mappingStatus: 'mapped',
      shopCount: 5,
      lastUpdated: '2025-01-29',
      children: [
        {
          id: '4.1',
          name: 'Conserve',
          slug: 'conserve',
          productCount: 1234,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        },
        {
          id: '4.2',
          name: 'Paste & Orez',
          slug: 'paste-si-orez',
          productCount: 892,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        },
        {
          id: '4.3',
          name: 'Condimente & Sosuri',
          slug: 'condimente-si-sosuri',
          productCount: 678,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        }
      ]
    },
    {
      id: '5',
      name: 'Băuturi',
      slug: 'bauturi',
      productCount: 2341,
      mappingStatus: 'mapped',
      shopCount: 5,
      lastUpdated: '2025-01-29',
      children: [
        {
          id: '5.1',
          name: 'Apă & Sucuri',
          slug: 'apa-si-sucuri',
          productCount: 1234,
          mappingStatus: 'mapped',
          shopCount: 5,
          lastUpdated: '2025-01-29',
        },
        {
          id: '5.2',
          name: 'Vinuri & Bere',
          slug: 'vinuri-si-bere',
          productCount: 1107,
          mappingStatus: 'mapped',
          shopCount: 4,
          lastUpdated: '2025-01-29',
        }
      ]
    },
    {
      id: '6',
      name: 'Other',
      slug: 'other',
      productCount: 15603,
      mappingStatus: 'partial',
      shopCount: 5,
      lastUpdated: '2025-01-29',
    }
  ];

  // Mock shop mapping data
  const shopMappings: ShopMapping[] = [
    {
      shopId: 'mega',
      shopName: 'MEGA',
      rawCategory: 'apa-si-sucuri',
      mappedCategory: 'Băuturi > Apă & Sucuri',
      confidence: 0.95,
      productCount: 234
    },
    {
      shopId: 'auchan',
      shopName: 'AUCHAN',
      rawCategory: 'bauturi-si-tutun',
      mappedCategory: 'Băuturi > Vinuri & Bere',
      confidence: 0.87,
      productCount: 156
    },
    {
      shopId: 'carrefour',
      shopName: 'CARREFOUR',
      rawCategory: 'super-market',
      mappedCategory: 'Băcănie',
      confidence: 0.92,
      productCount: 892
    },
    {
      shopId: 'lidl',
      shopName: 'LIDL',
      rawCategory: 'alimente-si-bauturi',
      mappedCategory: 'Lactate & Brânzeturi',
      confidence: 0.78,
      productCount: 445
    }
  ];

  const getStatusBadge = (status: CategoryNode['mappingStatus']) => {
    const variants = {
      mapped: 'default',
      unmapped: 'destructive',
      partial: 'secondary',
    } as const;

    const labels = {
      mapped: 'Mapped',
      unmapped: 'Unmapped',
      partial: 'Partial',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const renderCategoryNode = (node: CategoryNode, level: number = 0) => (
    <div key={node.id} className="space-y-2">
      <div 
        className={`flex items-center justify-between p-3 rounded-lg border ${
          level === 0 ? 'bg-muted/50' : 'bg-background'
        }`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-3">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{node.name}</p>
            <p className="text-sm text-muted-foreground">
              {node.slug} • {node.productCount.toLocaleString()} products
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(node.mappingStatus)}
          <Badge variant="outline">{node.shopCount} shops</Badge>
          <span className="text-sm text-muted-foreground">
            {node.lastUpdated}
          </span>
        </div>
      </div>
      {node.children && (
        <div className="space-y-2">
          {node.children.map(child => renderCategoryNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  const filteredCategories = categoryTree.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || category.mappingStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredMappings = shopMappings.filter(mapping => {
    const matchesShop = selectedShop === 'all' || mapping.shopId === selectedShop;
    const matchesSearch = mapping.rawCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mapping.mappedCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShop && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
        <p className="text-muted-foreground">
          Manage category mappings and structure for the preprocessing system
        </p>
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
                placeholder="Search categories..."
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
                <SelectItem value="mapped">Mapped</SelectItem>
                <SelectItem value="unmapped">Unmapped</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree">Category Tree</TabsTrigger>
          <TabsTrigger value="mappings">Shop Mappings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Category Structure
              </CardTitle>
              <CardDescription>
                Hierarchical view of all categories with mapping status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredCategories.map(category => renderCategoryNode(category))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shop Category Mappings
              </CardTitle>
              <CardDescription>
                How raw shop categories map to our canonical structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{mapping.shopName}</Badge>
                      <div>
                        <p className="font-medium">{mapping.rawCategory}</p>
                        <p className="text-sm text-muted-foreground">
                          → {mapping.mappedCategory}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={mapping.confidence > 0.9 ? 'default' : 'secondary'}>
                        {Math.round(mapping.confidence * 100)}% confidence
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {mapping.productCount} products
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  Canonical categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Mapping Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">
                  Products properly categorized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Unmapped Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  Products needing review
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution by Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { shop: 'MEGA', mapped: 13232, unmapped: 0, total: 13232 },
                  { shop: 'AUCHAN', mapped: 8462, unmapped: 1234, total: 9696 },
                  { shop: 'CARREFOUR', mapped: 30210, unmapped: 0, total: 30210 },
                  { shop: 'LIDL', mapped: 441, unmapped: 13, total: 454 },
                  { shop: 'FRESHFUL', mapped: 18461, unmapped: 0, total: 18461 }
                ].map((stats, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{stats.shop}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {stats.mapped.toLocaleString()} mapped
                      </span>
                      {stats.unmapped > 0 && (
                        <Badge variant="destructive">
                          {stats.unmapped.toLocaleString()} unmapped
                        </Badge>
                      )}
                      <span className="text-sm font-medium">
                        {stats.total.toLocaleString()} total
                      </span>
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
              <Upload className="h-4 w-4 mr-2" />
              Import Category Mappings
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Category Structure
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Category Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
