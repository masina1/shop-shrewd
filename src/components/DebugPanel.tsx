import { useState } from 'react';
import { Settings, RotateCcw, User, Shield, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { resetDemoData, currentUser } from '@/lib/rewardsMockData';
import { toast } from '@/hooks/use-toast';
import { useAds } from '@/contexts/AdsContext';

type UserMode = 'user' | 'admin';

export function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>('user');
  const { previewMode, setPreviewMode } = useAds();

  const handleResetData = () => {
    resetDemoData();
    toast({
      title: 'Demo Data Reset',
      description: 'All demo data has been reset to initial state.'
    });
  };

  const handleModeSwitch = () => {
    const newMode = userMode === 'user' ? 'admin' : 'user';
    setUserMode(newMode);
    
    // In a real app, this would update authentication state
    toast({
      title: 'Mode Switched',
      description: `Switched to ${newMode} mode. Navigate to appropriate pages.`
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2 bg-background/80 backdrop-blur-sm hover:bg-background/95 transition-all duration-300">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Debug Panel</span>
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
          </div>

          {/* Collapsed view */}
          {!isExpanded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {userMode === 'admin' ? (
                  <Shield className="h-4 w-4 text-red-500" />
                ) : (
                  <User className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm capitalize">{userMode} Mode</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleModeSwitch}>
                Switch
              </Button>
            </div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Current User Info */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Current User</div>
                <div className="font-medium text-sm">{currentUser.name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentUser.points} points • {currentUser.badge} badge
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Mode</div>
                <div className="flex gap-2">
                  <Button
                    variant={userMode === 'user' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserMode('user')}
                    className="flex-1"
                  >
                    <User className="h-3 w-3 mr-1" />
                    User
                  </Button>
                  <Button
                    variant={userMode === 'admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserMode('admin')}
                    className="flex-1"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {userMode === 'admin' 
                    ? 'Access admin routes (/admin/*)' 
                    : 'Access user routes (rewards, leaderboard, etc.)'}
                </div>
              </div>

              {/* Ads Preview */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Ads Preview</div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ads-preview" 
                    checked={previewMode}
                    onCheckedChange={(checked) => {
                      setPreviewMode(checked === true);
                      toast({
                        title: 'Ads Preview',
                        description: `Ads preview ${checked ? 'enabled' : 'disabled'}. Navigate pages to see placeholders.`
                      });
                    }}
                  />
                  <label 
                    htmlFor="ads-preview" 
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    {previewMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Show Ad Placeholders
                  </label>
                </div>
                <div className="text-xs text-muted-foreground">
                  {previewMode 
                    ? 'Ad placeholders visible site-wide' 
                    : 'Ad placeholders hidden'}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Actions</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetData}
                  className="w-full"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Demo Data
                </Button>
              </div>

              {/* Quick Navigation */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Navigation</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button variant="ghost" size="sm" asChild className="h-8 justify-start p-2">
                    <a href="/submit-offer">Submit Offer</a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-8 justify-start p-2">
                    <a href="/rewards">Rewards</a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-8 justify-start p-2">
                    <a href="/leaderboard">Leaderboard</a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-8 justify-start p-2">
                    <a href="/ori-core/review">ORI Core Review</a>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                <div>🎯 Demo System Active</div>
                <div>📊 Mock Data Loaded</div>
                <div>🔄 Real-time UI Updates</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}