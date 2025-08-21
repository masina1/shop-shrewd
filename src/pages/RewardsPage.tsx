import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, TrendingUp, Calendar, Gift, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { currentUser, badges, userActivity, getUserBadge, getNextBadge, submittedOffers, leaderboardUsers } from '@/lib/rewardsMockData';
import { AdSlot } from '@/components/ads/AdSlot';

export default function RewardsPage() {
  const currentBadge = getUserBadge(currentUser.id);
  const nextBadge = getNextBadge(currentUser.badge);
  const progressToNext = nextBadge ? (currentUser.points / nextBadge.pointsRequired) * 100 : 100;
  
  const userOffers = submittedOffers.filter(offer => offer.userId === currentUser.id);
  const verifiedOffers = userOffers.filter(offer => offer.status === 'verified');
  const pendingOffers = userOffers.filter(offer => offer.status === 'pending');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'verification': return <Trophy className="h-4 w-4 text-green-500" />;
      case 'submission': return <Plus className="h-4 w-4 text-blue-500" />;
      case 'badge_earned': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'points_earned': return <Gift className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Recompensele Tale</h1>
          <p className="text-muted-foreground">
            Urmărește-ți progresul și câștigă premii pentru contribuții
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {currentUser.points.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Puncte Totale</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {verifiedOffers.length}
              </div>
              <div className="text-sm text-muted-foreground">Oferte Verificate</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-500 mb-1">
                {pendingOffers.length}
              </div>
              <div className="text-sm text-muted-foreground">În Așteptare</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                #{leaderboardUsers.findIndex(u => u.id === currentUser.id) + 1}
              </div>
              <div className="text-sm text-muted-foreground">Poziția</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Ad */}
        <div className="flex justify-center mb-6">
          <AdSlot 
            slot={{
              id: 'rewards-top',
              routePattern: '/rewards',
              section: 'Rewards Top',
              status: 'off',
              provider: 'affiliates',
              countries: ['RO'],
              sizes: [{ width: 728, height: 90 }],
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              targeting: { page: 'rewards', position: 'top' },
              lazyUntil: 'visible'
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Badge & Progress */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Badge-ul Tău
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentBadge && (
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{currentBadge.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{currentBadge.name}</h3>
                      <p className="text-sm text-muted-foreground">{currentBadge.description}</p>
                    </div>
                  </div>
                )}
                
                {nextBadge && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progres către {nextBadge.name}</span>
                      <span>{currentUser.points} / {nextBadge.pointsRequired}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Încă {nextBadge.pointsRequired - currentUser.points} puncte pentru următorul badge
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Activitate Recentă
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                      {activity.points && (
                        <Badge variant="secondary" className="text-xs">
                          +{activity.points}p
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Sidebar Ad */}
            <div className="flex justify-center">
              <AdSlot 
                slot={{
                  id: 'rewards-sidebar',
                  routePattern: '/rewards',
                  section: 'Rewards Sidebar',
                  status: 'off',
                  provider: 'gpt',
                  countries: ['RO'],
                  sizes: [{ width: 300, height: 250 }],
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  targeting: { page: 'rewards', position: 'sidebar' },
                  lazyUntil: 'idle'
                }}
              />
            </div>

            {/* All Badges */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Badge-uri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => {
                    const isEarned = currentUser.points >= badge.pointsRequired;
                    return (
                      <div
                        key={badge.id}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          isEarned 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted bg-muted/20 opacity-60'
                        }`}
                      >
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <div className="text-xs font-medium">{badge.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {badge.pointsRequired}p
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Acțiuni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full rounded-xl">
                  <Link to="/submit-offer">
                    <Plus className="h-4 w-4 mr-2" />
                    Trimite Ofertă Nouă
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full rounded-xl">
                  <Link to="/leaderboard">
                    <Trophy className="h-4 w-4 mr-2" />
                    Vezi Clasamentul
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Submissions */}
        <Card className="rounded-2xl mt-8">
          <CardHeader>
            <CardTitle>Ofertele Mele</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Toate ({userOffers.length})</TabsTrigger>
                <TabsTrigger value="verified">Verificate ({verifiedOffers.length})</TabsTrigger>
                <TabsTrigger value="pending">În așteptare ({pendingOffers.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {userOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{offer.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {offer.storeName} • {formatDate(offer.submittedAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          offer.status === 'verified' ? 'default' :
                          offer.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {offer.status === 'verified' ? 'Verificată' :
                           offer.status === 'pending' ? 'În așteptare' :
                           offer.status === 'rejected' ? 'Respinsă' : 'Duplicat'}
                        </Badge>
                        {offer.points && (
                          <Badge variant="outline">+{offer.points}p</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {offer.submittedPrice.toFixed(2)} RON
                      </div>
                      <div className="text-sm text-green-600">
                        -{offer.savings.toFixed(2)} RON
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="ml-4">
                      <Link to={`/offer/${offer.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="verified" className="space-y-4">
                {verifiedOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                    <div className="flex-1">
                      <h4 className="font-medium">{offer.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {offer.storeName} • {formatDate(offer.submittedAt)}
                      </p>
                      <Badge variant="default" className="mt-1">
                        +{offer.points}p câștigate
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {offer.submittedPrice.toFixed(2)} RON
                      </div>
                      <div className="text-sm text-green-600">
                        -{offer.savings.toFixed(2)} RON economie
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-4">
                {pendingOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                    <div className="flex-1">
                      <h4 className="font-medium">{offer.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {offer.storeName} • {formatDate(offer.submittedAt)}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        Se verifică...
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {offer.submittedPrice.toFixed(2)} RON
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Potențial: -{offer.savings.toFixed(2)} RON
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}