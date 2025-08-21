import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Camera, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { submittedOffers, getStatusColor } from '@/lib/rewardsMockData';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const offer = submittedOffers.find(o => o.id === id);
  
  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
        <div className="container max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Oferta nu a fost găsită</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'duplicate': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <AlertCircle className="h-5 w-5 text-amber-500" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Detalii Ofertă</h1>
            <p className="text-muted-foreground">#{offer.id}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Informații Produs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{offer.productName}</h2>
                  <Badge variant="outline">{offer.category}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Preț în app</div>
                    <div className="text-2xl font-bold">{offer.currentPrice.toFixed(2)} RON</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">Preț găsit</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {offer.submittedPrice.toFixed(2)} RON
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-primary/80 mb-1">Economie</div>
                      <div className="text-xl font-bold text-primary">
                        {offer.savings.toFixed(2)} RON
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-primary/80 mb-1">Reducere</div>
                      <div className="text-xl font-bold text-primary">
                        {savingsPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store Info */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Magazin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {offer.storeName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{offer.storeName}</h3>
                    <p className="text-sm text-muted-foreground">Locația: Vezi pe hartă</p>
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
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => {
                          // In a real app, this would open a fullscreen image viewer
                          window.open(image, '_blank');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            {offer.adminNotes && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Note Admin</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-muted/50 p-4 rounded-lg">
                    {offer.adminNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submitter Info */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contributor
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
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
                        Se așteaptă verificarea
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Points Earned */}
            {offer.points && (
              <Card className="rounded-2xl bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    +{offer.points}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Puncte câștigate
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}