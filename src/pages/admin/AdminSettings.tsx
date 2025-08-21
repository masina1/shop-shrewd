import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Search,
  DollarSign,
  ToggleLeft,
  MapPin,
  Upload,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Price Comparison Romania",
    logo: "/logo.png",
    currency: "RON",
    units: "metric",
    locale: "ro-RO",
    timezone: "Europe/Bucharest"
  });

  const [searchSettings, setSearchSettings] = useState({
    debounceMs: 300,
    maxSuggestions: 8,
    nameWeight: 0.6,
    brandWeight: 0.3,
    popularityWeight: 0.1
  });

  const [priceRules, setPriceRules] = useState({
    unitConversions: "1 kg = 1000 g\n1 L = 1000 ml\n1 dozen = 12 pieces",
    minPrice: 0.01,
    maxPrice: 1000.00,
    sanityCheck: true
  });

  const [featureFlags, setFeatureFlags] = useState({
    priceAlerts: true,
    guestMode: true,
    comboSuggestions: true,
    darkMode: false,
    advancedFilters: false
  });

  const [regions, setRegions] = useState([
    "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"
  ]);

  const [newRegion, setNewRegion] = useState("");

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully`,
    });
  };

  const handleAddRegion = () => {
    if (newRegion && !regions.includes(newRegion)) {
      setRegions([...regions, newRegion]);
      setNewRegion("");
      toast({
        title: "Region Added",
        description: `${newRegion} has been added to delivery regions`,
      });
    }
  };

  const handleRemoveRegion = (region: string) => {
    setRegions(regions.filter(r => r !== region));
    toast({
      title: "Region Removed",
      description: `${region} has been removed from delivery regions`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings(prev => ({ 
                      ...prev, siteName: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings(prev => ({ 
                      ...prev, currency: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RON">Romanian Leu (RON)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Unit System</Label>
                  <Select 
                    value={generalSettings.units}
                    onValueChange={(value) => setGeneralSettings(prev => ({ 
                      ...prev, units: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, L)</SelectItem>
                      <SelectItem value="imperial">Imperial (lb, fl oz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locale">Locale</Label>
                  <Select 
                    value={generalSettings.locale}
                    onValueChange={(value) => setGeneralSettings(prev => ({ 
                      ...prev, locale: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro-RO">Romanian</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo Upload</Label>
                <div className="flex items-center gap-4">
                  <img 
                    src={generalSettings.logo} 
                    alt="Logo" 
                    className="h-12 w-12 object-contain rounded border"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Logo
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('General')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="debounceMs">Debounce Delay (ms)</Label>
                  <Input
                    id="debounceMs"
                    type="number"
                    value={searchSettings.debounceMs}
                    onChange={(e) => setSearchSettings(prev => ({ 
                      ...prev, debounceMs: parseInt(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Delay before triggering search suggestions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSuggestions">Max Suggestions</Label>
                  <Input
                    id="maxSuggestions"
                    type="number"
                    value={searchSettings.maxSuggestions}
                    onChange={(e) => setSearchSettings(prev => ({ 
                      ...prev, maxSuggestions: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Ranking Weights</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="nameWeight">Name Weight</Label>
                    <Input
                      id="nameWeight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={searchSettings.nameWeight}
                      onChange={(e) => setSearchSettings(prev => ({ 
                        ...prev, nameWeight: parseFloat(e.target.value) 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandWeight">Brand Weight</Label>
                    <Input
                      id="brandWeight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={searchSettings.brandWeight}
                      onChange={(e) => setSearchSettings(prev => ({ 
                        ...prev, brandWeight: parseFloat(e.target.value) 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popularityWeight">Popularity Weight</Label>
                    <Input
                      id="popularityWeight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={searchSettings.popularityWeight}
                      onChange={(e) => setSearchSettings(prev => ({ 
                        ...prev, popularityWeight: parseFloat(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Weights should sum to 1.0 for optimal results
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Search')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Search Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="unitConversions">Unit Conversions</Label>
                <Textarea
                  id="unitConversions"
                  value={priceRules.unitConversions}
                  onChange={(e) => setPriceRules(prev => ({ 
                    ...prev, unitConversions: e.target.value 
                  }))}
                  rows={5}
                  placeholder="1 kg = 1000 g&#10;1 L = 1000 ml"
                />
                <p className="text-xs text-muted-foreground">
                  Define unit conversion rules, one per line
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minPrice">Minimum Price (RON)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    step="0.01"
                    value={priceRules.minPrice}
                    onChange={(e) => setPriceRules(prev => ({ 
                      ...prev, minPrice: parseFloat(e.target.value) 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Maximum Price (RON)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    step="0.01"
                    value={priceRules.maxPrice}
                    onChange={(e) => setPriceRules(prev => ({ 
                      ...prev, maxPrice: parseFloat(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sanityCheck">Enable Sanity Checks</Label>
                  <p className="text-sm text-muted-foreground">
                    Reject prices outside the defined ranges
                  </p>
                </div>
                <Switch
                  id="sanityCheck"
                  checked={priceRules.sanityCheck}
                  onCheckedChange={(checked) => setPriceRules(prev => ({ 
                    ...prev, sanityCheck: checked 
                  }))}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Price Rules')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Price Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(featureFlags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'priceAlerts' && 'Allow users to set price alerts for products'}
                      {key === 'guestMode' && 'Enable guest browsing without registration'}
                      {key === 'comboSuggestions' && 'Show smart combo suggestions to users'}
                      {key === 'darkMode' && 'Enable dark mode theme toggle'}
                      {key === 'advancedFilters' && 'Show advanced filtering options'}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setFeatureFlags(prev => ({ 
                      ...prev, [key]: checked 
                    }))}
                  />
                </div>
              ))}

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Feature Flags')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Feature Flags
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Regions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Add new region..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRegion()}
                />
                <Button onClick={handleAddRegion}>
                  Add Region
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <Badge key={region} variant="secondary" className="flex items-center gap-2">
                    {region}
                    <button
                      onClick={() => handleRemoveRegion(region)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Regions define where your platform operates and stores can deliver.
              </p>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Regions')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Regions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}