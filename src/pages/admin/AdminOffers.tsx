import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  ExternalLink,
  Calculator,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { mockOffers, mockProducts, mockStores, type Offer, getProductById, getStoreById } from "@/lib/adminMockData";
import { useToast } from "@/hooks/use-toast";

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const filteredOffers = offers.filter((offer) => {
    const product = getProductById(offer.productId);
    const store = getStoreById(offer.storeId);
    
    const matchesSearch = product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = storeFilter === "all" || offer.storeId === storeFilter;
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    const matchesPrice = (!priceRange.min || offer.price >= parseFloat(priceRange.min)) &&
                        (!priceRange.max || offer.price <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesStore && matchesStatus && matchesPrice;
  });

  const handleSelectAll = () => {
    if (selectedOffers.length === filteredOffers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(filteredOffers.map(o => o.id));
    }
  };

  const handleSelectOffer = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: "Bulk Action",
      description: `${action} applied to ${selectedOffers.length} offers`,
    });
    setSelectedOffers([]);
  };

  const handleOfferAction = (action: string, offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    const product = getProductById(offer?.productId || '');
    toast({
      title: "Offer Action",
      description: `${action} applied to offer for ${product?.name}`,
    });
  };

  const getStatusBadge = (status: Offer['status']) => {
    const variants = {
      active: 'default',
      out_of_stock: 'destructive',
      expired: 'secondary'
    } as const;
    
    const labels = {
      active: 'Active',
      out_of_stock: 'OOS',
      expired: 'Expired'
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const AddOfferModal = () => {
    const [newOffer, setNewOffer] = useState({
      productId: "",
      storeId: "",
      price: "",
      url: ""
    });

    const handleAddOffer = () => {
      if (!newOffer.productId || !newOffer.storeId || !newOffer.price) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Offer Added",
        description: "New offer has been linked successfully",
      });
      setShowAddModal(false);
      setNewOffer({ productId: "", storeId: "", price: "", url: "" });
    };

    return (
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link New Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select value={newOffer.productId} onValueChange={(value) => 
                setNewOffer(prev => ({ ...prev, productId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Store *</Label>
              <Select value={newOffer.storeId} onValueChange={(value) => 
                setNewOffer(prev => ({ ...prev, storeId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {mockStores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price (RON) *</Label>
              <Input
                type="number"
                step="0.01"
                value={newOffer.price}
                onChange={(e) => setNewOffer(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Source URL</Label>
              <Input
                value={newOffer.url}
                onChange={(e) => setNewOffer(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://store.com/product"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddOffer} className="flex-1">
                Add Offer
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offers</h1>
          <p className="text-muted-foreground">
            Manage product offers and pricing data
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Link Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Price Offers</CardTitle>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search offers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {mockStores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>
            
            {selectedOffers.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedOffers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('Recalculate unit price')}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Recalc Unit Price
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('Mark OOS')}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Mark OOS
                </Button>
                <Button
                  variant="outline"
                  size="sm"  
                  onClick={() => handleBulkAction('Delete')}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOffers.length === filteredOffers.length && filteredOffers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Promo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const product = getProductById(offer.productId);
                  const store = getStoreById(offer.storeId);
                  
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOffers.includes(offer.id)}
                          onCheckedChange={() => handleSelectOffer(offer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product?.image}
                            alt={product?.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product?.brand}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: store?.color }}
                          />
                          {store?.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {offer.price.toFixed(2)} RON
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {offer.unitPrice.toFixed(2)} RON/{product?.size}
                      </TableCell>
                      <TableCell>
                        {offer.promo ? (
                          <Badge variant="destructive">{offer.promo}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {offer.lastSeen}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOfferAction('Edit', offer.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {offer.url && (
                              <DropdownMenuItem asChild>
                                <a href={offer.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Visit Source
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleOfferAction('Delete', offer.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddOfferModal />
    </div>
  );
}