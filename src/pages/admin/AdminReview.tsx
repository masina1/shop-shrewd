import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Check, X, Copy, Filter, Search, Calendar, User, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { submittedOffers, getOffersByStatus } from '@/lib/rewardsMockData';
import { toast } from '@/hooks/use-toast';

export default function AdminReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const pendingOffers = getOffersByStatus('pending');
  const allOffers = submittedOffers;

  const categories = [...new Set(submittedOffers.map(offer => offer.category))];

  const filteredOffers = allOffers.filter(offer => {
    const matchesSearch = offer.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSelectOffer = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === filteredOffers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(filteredOffers.map(offer => offer.id));
    }
  };

  const handleBulkAction = (action: 'verify' | 'reject') => {
    const actionText = action === 'verify' ? 'verificate' : 'respinse';
    toast({
      title: 'Acțiune executată',
      description: `${selectedOffers.length} oferte au fost ${actionText}.`
    });
    setSelectedOffers([]);
  };

  const handleQuickAction = (offerId: string, action: 'verify' | 'reject' | 'duplicate') => {
    const actionText = action === 'verify' ? 'verificată' : 
                      action === 'reject' ? 'respinsă' : 'marcată ca duplicat';
    toast({
      title: 'Oferta actualizată',
      description: `Oferta a fost ${actionText}.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">În așteptare</Badge>;
      case 'verified':
        return <Badge variant="default">Verificată</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Respinsă</Badge>;
      case 'duplicate':
        return <Badge variant="outline">Duplicat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OfferCard = ({ offer }: { offer: typeof submittedOffers[0] }) => (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={selectedOffers.includes(offer.id)}
            onChange={() => handleSelectOffer(offer.id)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">{offer.productName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{offer.userName}</span>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(offer.submittedAt)}</span>
                </div>
              </div>
              {getStatusBadge(offer.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Magazin</div>
                <div className="font-medium">{offer.storeName}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Preț curent</div>
                <div className="font-medium">{offer.currentPrice.toFixed(2)} RON</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">Preț propus</div>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {offer.submittedPrice.toFixed(2)} RON
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary/80">Economie:</span>
                <span className="font-semibold text-primary">
                  {offer.savings.toFixed(2)} RON ({((offer.savings / offer.currentPrice) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{offer.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {offer.proofImages.length} foto{offer.proofImages.length !== 1 ? 'grafii' : 'grafie'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/offers/${offer.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Detalii
                  </Link>
                </Button>
                
                {offer.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickAction(offer.id, 'verify')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Verifică
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleQuickAction(offer.id, 'reject')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Respinge
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickAction(offer.id, 'duplicate')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicat
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Oferte</h1>
          <p className="text-muted-foreground">
            Verifică și aprobă ofertele trimise de utilizatori
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-amber-500 mb-1">
              {pendingOffers.length}
            </div>
            <div className="text-sm text-muted-foreground">În așteptare</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {getOffersByStatus('verified').length}
            </div>
            <div className="text-sm text-muted-foreground">Verificate</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {getOffersByStatus('rejected').length}
            </div>
            <div className="text-sm text-muted-foreground">Respinse</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {allOffers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după produs, utilizator sau magazin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toate statusurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="pending">În așteptare</SelectItem>
                <SelectItem value="verified">Verificate</SelectItem>
                <SelectItem value="rejected">Respinse</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toate categoriile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate categoriile</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOffers.length > 0 && (
        <Card className="rounded-2xl border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedOffers.length} oferte selectate
                </span>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedOffers.length === filteredOffers.length ? 'Deselectează toate' : 'Selectează toate'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleBulkAction('verify')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Verifică Toate
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('reject')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Respinge Toate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Toate ({filteredOffers.length})</TabsTrigger>
          <TabsTrigger value="pending">În așteptare ({pendingOffers.length})</TabsTrigger>
          <TabsTrigger value="verified">Verificate ({getOffersByStatus('verified').length})</TabsTrigger>
          <TabsTrigger value="rejected">Respinse ({getOffersByStatus('rejected').length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredOffers.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nu s-au găsit oferte cu criteriile selectate.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingOffers.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </TabsContent>
        
        <TabsContent value="verified" className="space-y-4 mt-6">
          {getOffersByStatus('verified').map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4 mt-6">
          {getOffersByStatus('rejected').map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}