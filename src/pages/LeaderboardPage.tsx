import { useState } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { leaderboardUsers, currentUser, getUserBadge } from '@/lib/rewardsMockData';

export default function LeaderboardPage() {
  // Sort users by points for all-time and by monthly submissions for monthly
  const allTimeLeaders = [...leaderboardUsers].sort((a, b) => b.points - a.points);
  const monthlyLeaders = [...leaderboardUsers].sort((a, b) => b.monthlySubmissions - a.monthlySubmissions);
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-slate-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'from-slate-400/20 to-slate-500/20 border-slate-400/30';
      case 3: return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default: return 'from-muted/50 to-muted/30 border-border';
    }
  };

  const getBadgeColor = (badgeId: string) => {
    switch (badgeId) {
      case 'diamond': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'gold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
      case 'silver': return 'bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300';
      case 'bronze': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderLeaderboard = (users: typeof leaderboardUsers, isMonthly = false) => (
    <div className="space-y-4">
      {users.map((user, index) => {
        const position = index + 1;
        const isCurrentUser = user.id === currentUser.id;
        const badge = getUserBadge(user.id);
        
        return (
          <Card 
            key={user.id} 
            className={`rounded-2xl transition-all ${
              isCurrentUser 
                ? 'ring-2 ring-primary bg-primary/5' 
                : ''
            } ${
              position <= 3 
                ? `bg-gradient-to-r ${getRankColor(position)}` 
                : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex flex-col items-center">
                  {getRankIcon(position)}
                  <span className="text-sm font-bold mt-1">#{position}</span>
                </div>
                
                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg font-semibold">
                    {user.name.split(' ').map(name => name[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {user.name}
                      {isCurrentUser && (
                        <span className="text-primary text-sm ml-2">(Tu)</span>
                      )}
                    </h3>
                    {badge && (
                      <Badge className={`text-xs ${getBadgeColor(user.badge)}`}>
                        {badge.icon} {badge.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{user.submissionsCount} oferte</span>
                    <span>Membru din {new Date(user.joinDate).toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {isMonthly ? user.monthlySubmissions : user.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isMonthly ? 'această lună' : 'puncte'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Clasament</h1>
          <p className="text-muted-foreground">
            Cei mai activi contributori ai comunității
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {allTimeLeaders.slice(0, 3).map((user, index) => {
            const position = index + 1;
            const isCurrentUser = user.id === currentUser.id;
            const badge = getUserBadge(user.id);
            
            return (
              <Card 
                key={user.id}
                className={`rounded-2xl ${
                  position === 1 ? 'md:order-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' :
                  position === 2 ? 'md:order-1 bg-gradient-to-br from-slate-400/20 to-slate-500/20 border-slate-400/30' :
                  'md:order-3 bg-gradient-to-br from-amber-600/20 to-amber-700/20 border-amber-600/30'
                } ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {getRankIcon(position)}
                  </div>
                  
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="text-xl font-bold">
                      {user.name.split(' ').map(name => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold mb-1">
                    {user.name}
                    {isCurrentUser && <span className="text-primary text-sm block">(Tu)</span>}
                  </h3>
                  
                  {badge && (
                    <Badge className={`text-xs mb-2 ${getBadgeColor(user.badge)}`}>
                      {badge.icon} {badge.name}
                    </Badge>
                  )}
                  
                  <div className="text-2xl font-bold text-primary mb-1">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    puncte • {user.submissionsCount} oferte
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Leaderboard Tables */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Clasament Detaliat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="alltime" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="alltime" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Toate timpurile
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Luna aceasta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="alltime" className="mt-6">
                {renderLeaderboard(allTimeLeaders)}
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-6">
                {renderLeaderboard(monthlyLeaders, true)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {leaderboardUsers.reduce((sum, user) => sum + user.points, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Puncte totale comunitate</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {leaderboardUsers.reduce((sum, user) => sum + user.submissionsCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Oferte trimise total</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {leaderboardUsers.length}
              </div>
              <div className="text-sm text-muted-foreground">Contributori activi</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}