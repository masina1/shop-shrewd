import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Upload, MapPin, Package, DollarSign, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCommonTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';

interface OfferFormData {
  productName: string;
  category: string;
  currentPrice: number;
  submittedPrice: number;
  storeName: string;
  storeLocation: string;
  proofImages: File[];
  notes: string;
}

const categories = [
  'Lactate', 'Panificație', 'Carne', 'Curățenie', 'Băuturi', 'Fructe și Legume', 
  'Congelate', 'Conserve', 'Dulciuri', 'Igienă personală'
];

const stores = [
  'Kaufland', 'Carrefour', 'Auchan', 'Mega Image', 'Lidl', 'Penny', 
  'Profi', 'Cora', 'Selgros', 'Metro', 'Altul'
];

export default function SubmitOffer() {
  const navigate = useNavigate();
  const { t } = useCommonTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>({
    productName: '',
    category: '',
    currentPrice: 0,
    submittedPrice: 0,
    storeName: '',
    storeLocation: '',
    proofImages: [],
    notes: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Mock submission
    toast({
      title: t('messages.success'),
      description: 'Oferta ta a fost trimisă și va fi verificată în curând!'
    });
    navigate('/rewards');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      proofImages: [...prev.proofImages, ...files].slice(0, 3) // Max 3 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proofImages: prev.proofImages.filter((_, i) => i !== index)
    }));
  };

  const savings = formData.currentPrice - formData.submittedPrice;
  const savingsPercent = formData.currentPrice > 0 ? (savings / formData.currentPrice) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container max-w-2xl px-4">
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
            <h1 className="text-2xl font-bold">Trimite o Ofertă</h1>
            <p className="text-muted-foreground">Ajută comunitatea să economisească bani</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Pasul {currentStep} din {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              {currentStep === 1 && <Package className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <DollarSign className="h-5 w-5 text-primary" />}
              {currentStep === 3 && <Store className="h-5 w-5 text-primary" />}
              {currentStep === 4 && <Camera className="h-5 w-5 text-primary" />}
              
              <CardTitle>
                {currentStep === 1 && 'Informații Produs'}
                {currentStep === 2 && 'Prețuri'}
                {currentStep === 3 && 'Magazin'}
                {currentStep === 4 && 'Dovadă Foto'}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Product Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">{t('form.name')} *</Label>
                  <Input
                    id="productName"
                    placeholder="ex: Laptele Zuzu 1.5% 1L"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">{t('form.category')} *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selectează categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Prices */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPrice">Preț actual în app (RON) *</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.currentPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="submittedPrice">Preț găsit de tine (RON) *</Label>
                  <Input
                    id="submittedPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.submittedPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, submittedPrice: parseFloat(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>

                {savings > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Economie potențială:
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                          {savings.toFixed(2)} RON
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          ({savingsPercent.toFixed(1)}% reducere)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Store */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Magazin *</Label>
                  <Select 
                    value={formData.storeName} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, storeName: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selectează magazinul" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="storeLocation">Locația magazinului *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeLocation"
                      placeholder="ex: Kaufland Baneasa, Șos. București-Ploiești"
                      value={formData.storeLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, storeLocation: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photo Proof */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Fotografii cu prețul (max 3) *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Încarcă fotografii clare cu prețul produsului și eticheta de pe raft
                  </p>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Apasă pentru a încărca fotografii
                      </p>
                    </label>
                  </div>
                  
                  {formData.proofImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {formData.proofImages.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes">Note adiționale</Label>
                  <Textarea
                    id="notes"
                    placeholder="Orice informații suplimentare despre ofertă..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  className="rounded-xl"
                  disabled={
                    (currentStep === 1 && (!formData.productName || !formData.category)) ||
                    (currentStep === 2 && (!formData.currentPrice || !formData.submittedPrice)) ||
                    (currentStep === 3 && (!formData.storeName || !formData.storeLocation))
                  }
                >
                  Următorul
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="rounded-xl"
                  disabled={formData.proofImages.length === 0}
                >
                  Trimite Oferta
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}