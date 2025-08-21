import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Eye,
  EyeOff,
  RefreshCw,
  Clock
} from 'lucide-react';
import { AdConfig, AdSlot, AdStatus, AdProvider, LazyUntil, AdSize } from '@/types/ads';
import { adConfigClient } from '@/lib/adConfigClient';
import { cn } from '@/lib/utils';

const adSlotSchema = z.object({
  routePattern: z.string().min(1, 'Route pattern is required'),
  section: z.string().min(1, 'Section is required'),
  status: z.enum(['off', 'on', 'preview']),
  provider: z.enum(['gpt', 'affiliates', 'house']),
  countries: z.array(z.string()).min(1, 'At least one country is required'),
  unitPath: z.string().optional(),
  sizes: z.array(z.object({
    width: z.number().min(1),
    height: z.number().min(1)
  })).min(1, 'At least one size is required'),
  targeting: z.record(z.string()).optional(),
  lazyUntil: z.enum(['visible', 'idle', 'immediate'])
});

type AdSlotFormData = z.infer<typeof adSlotSchema>;

const statusColors = {
  on: 'bg-success text-success-foreground',
  preview: 'bg-amber-500 text-white',
  off: 'bg-muted text-muted-foreground'
};

const providerLabels = {
  gpt: 'Google Ad Manager',
  affiliates: 'Affiliate Network',
  house: 'House Ads'
};

const countries = [
  { code: 'RO', name: 'Romania' },
  { code: 'MD', name: 'Moldova' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HU', name: 'Hungary' }
];

export default function MonetizationPage() {
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<AdSlot | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdStatus | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState<AdProvider | 'all'>('all');
  const [targetingKeys, setTargetingKeys] = useState<Array<{key: string, value: string}>>([]);
  const [newSizeWidth, setNewSizeWidth] = useState('');
  const [newSizeHeight, setNewSizeHeight] = useState('');

  const form = useForm<AdSlotFormData>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: {
      status: 'off',
      provider: 'house',
      countries: ['RO'],
      sizes: [{ width: 300, height: 250 }],
      targeting: {},
      lazyUntil: 'visible'
    }
  });

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await adConfigClient.getConfig();
      setConfig(data);
    } catch (error) {
      toast.error('Failed to load ad configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const filteredSlots = config?.slots.filter(slot => {
    const matchesSearch = searchQuery === '' || 
      slot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.routePattern.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || slot.provider === providerFilter;
    
    return matchesSearch && matchesStatus && matchesProvider;
  }) || [];

  const openEditDrawer = (slot?: AdSlot) => {
    if (slot) {
      setEditingSlot(slot);
      form.reset({
        routePattern: slot.routePattern,
        section: slot.section,
        status: slot.status,
        provider: slot.provider,
        countries: slot.countries,
        unitPath: slot.unitPath || '',
        sizes: slot.sizes,
        targeting: slot.targeting,
        lazyUntil: slot.lazyUntil
      });
      setTargetingKeys(Object.entries(slot.targeting).map(([key, value]) => ({ key, value })));
    } else {
      setEditingSlot(null);
      form.reset();
      setTargetingKeys([]);
    }
    setIsDrawerOpen(true);
  };

  const onSubmit = async (data: AdSlotFormData) => {
    try {
      // Convert targeting array back to object
      const targeting = targetingKeys.reduce((acc, { key, value }) => {
        if (key.trim() && value.trim()) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      // Ensure all required fields are present and properly typed
      const slotData: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'> = {
        routePattern: data.routePattern,
        section: data.section,
        status: data.status,
        provider: data.provider,
        countries: data.countries,
        sizes: data.sizes.filter((s): s is AdSize => s.width > 0 && s.height > 0),
        unitPath: data.unitPath,
        targeting,
        lazyUntil: data.lazyUntil
      };

      if (editingSlot) {
        await adConfigClient.updateSlot(editingSlot.id, slotData);
        toast.success('Ad slot updated successfully');
      } else {
        await adConfigClient.createSlot(slotData);
        toast.success('Ad slot created successfully');
      }

      await loadConfig();
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error('Failed to save ad slot');
      console.error(error);
    }
  };

  const handleDuplicate = async (slot: AdSlot) => {
    try {
      await adConfigClient.duplicateSlot(slot.id);
      toast.success('Ad slot duplicated successfully');
      await loadConfig();
    } catch (error) {
      toast.error('Failed to duplicate ad slot');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deletingSlot) return;

    try {
      await adConfigClient.deleteSlot(deletingSlot.id);
      toast.success('Ad slot deleted successfully');
      await loadConfig();
      setDeletingSlot(null);
    } catch (error) {
      toast.error('Failed to delete ad slot');
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      const configJson = await adConfigClient.exportConfig();
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ad-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Configuration exported successfully');
    } catch (error) {
      toast.error('Failed to export configuration');
      console.error(error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const configJson = e.target?.result as string;
        await adConfigClient.importConfig(configJson);
        toast.success('Configuration imported successfully');
        await loadConfig();
      } catch (error) {
        toast.error('Failed to import configuration');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    try {
      await adConfigClient.resetToDefault();
      toast.success('Configuration reset to default');
      await loadConfig();
    } catch (error) {
      toast.error('Failed to reset configuration');
      console.error(error);
    }
  };

  const addTargetingPair = () => {
    setTargetingKeys([...targetingKeys, { key: '', value: '' }]);
  };

  const updateTargetingPair = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...targetingKeys];
    updated[index][field] = value;
    setTargetingKeys(updated);
  };

  const removeTargetingPair = (index: number) => {
    setTargetingKeys(targetingKeys.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const width = parseInt(newSizeWidth);
    const height = parseInt(newSizeHeight);
    
    if (width > 0 && height > 0) {
      const currentSizes = form.getValues('sizes');
      form.setValue('sizes', [...currentSizes, { width, height }]);
      setNewSizeWidth('');
      setNewSizeHeight('');
    }
  };

  const removeSize = (index: number) => {
    const currentSizes = form.getValues('sizes');
    if (currentSizes.length > 1) {
      form.setValue('sizes', currentSizes.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monetization & Ad Placements</h1>
          <p className="text-muted-foreground">
            Manage ad slots and revenue optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-config"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-config')?.click()}
            className="text-xs"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config?.slots.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {config?.slots.filter(s => s.status === 'on').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {config?.slots.filter(s => s.status === 'preview').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {config?.version ? new Date(config.version).toLocaleDateString() : 'Unknown'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search slots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: AdStatus | 'all') => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on">Active</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
          <Select value={providerFilter} onValueChange={(value: AdProvider | 'all') => setProviderFilter(value)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="gpt">Google Ad Manager</SelectItem>
              <SelectItem value="affiliates">Affiliate Network</SelectItem>
              <SelectItem value="house">House Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
            <Label htmlFor="preview-mode" className="text-sm">
              Preview Mode
            </Label>
            {previewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </div>
          <Button onClick={() => openEditDrawer()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot ID</TableHead>
                <TableHead>Route Pattern</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-mono text-xs">{slot.id}</TableCell>
                  <TableCell className="font-mono text-sm">{slot.routePattern}</TableCell>
                  <TableCell>{slot.section}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[slot.status]}>
                      {slot.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{providerLabels[slot.provider]}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {slot.countries.map(country => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {slot.sizes.map((size, i) => (
                        <div key={i}>{size.width}×{size.height}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(slot.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDrawer(slot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(slot)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingSlot(slot)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSlots.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No ad slots found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>
              {editingSlot ? 'Edit Ad Slot' : 'Create Ad Slot'}
            </DrawerTitle>
            <DrawerDescription>
              Configure ad slot settings and targeting parameters
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="routePattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route Pattern</FormLabel>
                        <FormControl>
                          <Input placeholder="/product/*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input placeholder="Hero Banner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="off" id="off" />
                              <Label htmlFor="off">Off</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="on" id="on" />
                              <Label htmlFor="on">On</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="preview" id="preview" />
                              <Label htmlFor="preview">Preview</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">House Ads</SelectItem>
                            <SelectItem value="affiliates">Affiliate Network</SelectItem>
                            <SelectItem value="gpt">Google Ad Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lazyUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Load Timing</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="visible">When Visible</SelectItem>
                            <SelectItem value="idle">When Idle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('provider') === 'gpt' && (
                  <FormField
                    control={form.control}
                    name="unitPath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Unit Path</FormLabel>
                        <FormControl>
                          <Input placeholder="/network-code/ad-unit-path" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div>
                  <Label>Countries</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {countries.map(country => (
                      <div key={country.code} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={country.code}
                          checked={form.watch('countries').includes(country.code)}
                          onChange={(e) => {
                            const current = form.getValues('countries');
                            if (e.target.checked) {
                              form.setValue('countries', [...current, country.code]);
                            } else {
                              form.setValue('countries', current.filter(c => c !== country.code));
                            }
                          }}
                        />
                        <Label htmlFor={country.code} className="text-sm">
                          {country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Ad Sizes</Label>
                  <div className="space-y-2 mt-2">
                    {form.watch('sizes').map((size, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={size.width}
                          onChange={(e) => {
                            const sizes = form.getValues('sizes');
                            sizes[index].width = parseInt(e.target.value) || 0;
                            form.setValue('sizes', sizes);
                          }}
                          placeholder="Width"
                          type="number"
                          className="w-24"
                        />
                        <span>×</span>
                        <Input
                          value={size.height}
                          onChange={(e) => {
                            const sizes = form.getValues('sizes');
                            sizes[index].height = parseInt(e.target.value) || 0;
                            form.setValue('sizes', sizes);
                          }}
                          placeholder="Height"
                          type="number"
                          className="w-24"
                        />
                        {form.watch('sizes').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSize(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSizeWidth}
                        onChange={(e) => setNewSizeWidth(e.target.value)}
                        placeholder="Width"
                        type="number"
                        className="w-24"
                      />
                      <span>×</span>
                      <Input
                        value={newSizeHeight}
                        onChange={(e) => setNewSizeHeight(e.target.value)}
                        placeholder="Height"
                        type="number"
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSize}
                        disabled={!newSizeWidth || !newSizeHeight}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Targeting Parameters</Label>
                  <div className="space-y-2 mt-2">
                    {targetingKeys.map((pair, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={pair.key}
                          onChange={(e) => updateTargetingPair(index, 'key', e.target.value)}
                          placeholder="Key"
                          className="flex-1"
                        />
                        <Input
                          value={pair.value}
                          onChange={(e) => updateTargetingPair(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTargetingPair(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTargetingPair}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Parameter
                    </Button>
                  </div>
                </div>

                <DrawerFooter>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingSlot ? 'Update Slot' : 'Create Slot'}
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSlot} onOpenChange={() => setDeletingSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the ad slot "{deletingSlot?.section}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}