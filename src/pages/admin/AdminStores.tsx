import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Settings,
  MapPin,
  Globe,
  Palette
} from "lucide-react";
import { mockStores, Store } from "@/lib/adminMockData";
import { useToast } from "@/hooks/use-toast";

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const filteredStores = stores.filter((store) => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleEnabled = (storeId: string) => {
    setStores(prev => prev.map(store => 
      store.id === storeId 
        ? { ...store, enabled: !store.enabled }
        : store
    ));
    
    const store = stores.find(s => s.id === storeId);
    toast({
      title: "Store Updated",
      description: `${store?.name} has been ${store?.enabled ? 'disabled' : 'enabled'}`,
    });
  };

  const handleStoreAction = (action: string, storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    toast({
      title: "Store Action",
      description: `${action} applied to ${store?.name}`,
    });
  };

  const getScrapingMethodBadge = (method: Store['scrapingMethod']) => {
    const variants = {
      API: 'default',
      crawler: 'secondary',
      manual: 'outline'
    } as const;
    
    return <Badge variant={variants[method]}>{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground">
            Manage connected stores and their configurations
          </p>
        </div>
        <Button onClick={() => handleStoreAction('Add new store', 'new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Store Network</CardTitle>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className={viewMode === 'grid' 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
          }>
            {filteredStores.map((store) => (
              <Card key={store.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: store.color }}
                      >
                        {store.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {store.slug}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${store.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStoreAction('Edit', store.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStoreAction('View details', store.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStoreAction('Configure', store.id)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={store.enabled}
                          onCheckedChange={() => handleToggleEnabled(store.id)}
                          aria-label={`Toggle ${store.name}`}
                        />
                        <span className="text-sm">
                          {store.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Method</span>
                      {getScrapingMethodBadge(store.scrapingMethod)}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{store.region}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {store.baseUrl}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {store.deliveryAreas.slice(0, 2).map(area => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {store.deliveryAreas.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{store.deliveryAreas.length - 2} more
                        </Badge>
                      )}
                    </div>

                    {store.testUrls.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          Test URLs: {store.testUrls.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full bg-success"
                            title="All test URLs passing"
                          />
                          <span className="text-xs text-success">Healthy</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto text-muted-foreground mb-4 flex items-center justify-center border-2 border-muted-foreground rounded">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first store'}
              </p>
              <Button onClick={() => handleStoreAction('Add new store', 'new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}