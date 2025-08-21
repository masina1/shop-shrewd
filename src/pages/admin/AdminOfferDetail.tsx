import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Copy, AlertTriangle, User, MapPin, Package, Camera, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { submittedOffers } from '@/lib/rewardsMockData';
import { toast } from '@/hooks/use-toast';

export default function AdminOfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adminNotes, setAdminNotes] = useState('');
  
  const offer = submittedOffers.find(o => o.id === id);
  
  if (!offer) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Oferta nu a fost găsită</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
        </div>
      </div>
    );
  }

  const handleAction = (action: 'verify' | 'reject' | 'duplicate') => {
    const actionText = action === 'verify' ? 'verificată' : 
                      action === 'reject' ? 'respinsă' : 'marcată ca duplicat';
    toast({
      title: 'Oferta actualizată',
      description: `Oferta a fost ${actionText}.`
    });
    
    // In a real app, this would update the offer status
    navigate('/admin/review');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'duplicate': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verificată';
      case 'rejected': return 'Respinsă';
      case 'duplicate': return 'Duplicat';
      default: return 'În așteptare';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const savingsPercent = ((offer.currentPrice - offer.submittedPrice) / offer.currentPrice) * 100;
  const isPriceReasonable = savingsPercent <= 50; // Flag suspicious discounts

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Review Ofertă</h1>
            <p className="text-muted-foreground">#{offer.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(offer.status)}
          <Badge 
            variant={offer.status === 'verified' ? 'default' : 
                   offer.status === 'pending' ? 'secondary' : 'destructive'}
          >
            {getStatusText(offer.status)}
          </Badge>
        </div>
      </div>

      {/* Alert for suspicious offers */}
      {!isPriceReasonable && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenție:</strong> Această ofertă raportează o reducere de {savingsPercent.toFixed(1)}%, 
            care pare neobișnuit de mare. Verifică cu atenție dovada foto.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product & Price Comparison */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Comparație Prețuri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">{offer.productName}</h2>
                <Badge variant="outline">{offer.category}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Preț curent în app</div>
                  <div className="text-2xl font-bold">{offer.currentPrice.toFixed(2)} RON</div>
                  <div className="text-xs text-muted-foreground mt-1">Referință</div>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Preț raportat</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {offer.submittedPrice.toFixed(2)} RON
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {offer.storeName}
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isPriceReasonable 
                    ? 'bg-green-50 dark:bg-green-950/20' 
                    : 'bg-amber-50 dark:bg-amber-950/20'
                }`}>
                  <div className={`text-sm mb-1 ${
                    isPriceReasonable 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    Economie
                  </div>
                  <div className={`text-2xl font-bold ${
                    isPriceReasonable 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {offer.savings.toFixed(2)} RON
                  </div>
                  <div className={`text-xs mt-1 ${
                    isPriceReasonable 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {savingsPercent.toFixed(1)}% reducere
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof Images */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Dovadă Foto ({offer.proofImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offer.proofImages.map((image, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border hover:border-primary transition-colors">
                      <img
                        src={image}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => {
                          // In a real app, this would open a fullscreen image viewer
                          window.open(image, '_blank');
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Foto {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Instrucțiuni de verificare:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Verifică dacă prețul din imagine corespunde cu cel raportat</li>
                  <li>• Asigură-te că produsul din imagine este același cu cel din app</li>
                  <li>• Verifică dacă imaginea arată clar eticheta de preț din magazin</li>
                  <li>• Atenție la promoții temporare sau prețuri vechi</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Note Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offer.adminNotes && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Note existente:</Label>
                  <p className="text-sm mt-1">{offer.adminNotes}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="adminNotes">Adaugă note pentru această ofertă:</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Scrie observațiile tale despre această ofertă..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {offer.status === 'pending' && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Acțiuni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleAction('verify')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verifică Oferta
                </Button>
                
                <Button 
                  onClick={() => handleAction('reject')}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Respinge Oferta
                </Button>
                
                <Button 
                  onClick={() => handleAction('duplicate')}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Marchează ca Duplicat
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submitter Info */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informații Contributor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {offer.userName.split(' ').map(name => name[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{offer.userName}</h3>
                  <p className="text-sm text-muted-foreground">Contributor</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oferte totale:</span>
                  <span className="font-medium">
                    {submittedOffers.filter(o => o.userId === offer.userId).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rata de aprobare:</span>
                  <span className="font-medium text-green-600">85%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Info */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Informații Magazin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{offer.storeName}</h3>
                  <p className="text-sm text-muted-foreground">Lanț de magazine</p>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oferte din acest magazin:</span>
                    <span className="font-medium">
                      {submittedOffers.filter(o => o.storeName === offer.storeName).length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Cronologie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="font-medium text-sm">Oferta trimisă</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(offer.submittedAt)}
                  </p>
                </div>
              </div>
              
              {offer.verifiedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="font-medium text-sm">Oferta verificată</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(offer.verifiedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {offer.status === 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 animate-pulse" />
                  <div>
                    <p className="font-medium text-sm">În proces de verificare</p>
                    <p className="text-xs text-muted-foreground">
                      Se așteaptă acțiunea admin
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}