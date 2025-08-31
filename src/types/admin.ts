export interface UnmappedProduct {
  id: string;
  productName: string;
  brand: string;
  shop: string;
  rawCategory: string;
  suggestedCategory: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  productData: {
    price?: number;
    image?: string;
    url?: string;
  };
  timestamp: string;
}

export interface ProcessingJob {
  id: string;
  shop: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentFile?: string;
  currentStep?: string;
  totalFiles: number;
  processedFiles: number;
  totalProducts: number;
  processedProducts: number;
  startTime: string;
  estimatedTime?: string;
  error?: string;
}

export interface CategoryMapping {
  shop: string;
  rawCategory: string;
  canonicalCategory: string;
  confidence: number;
  productCount: number;
  lastUpdated: string;
}

export interface CategoryTree {
  name: string;
  slug: string;
  productCount: number;
  mappingStatus: 'mapped' | 'partial' | 'unmapped';
  shopCount: number;
  children?: CategoryTree[];
}

export interface ShopStats {
  shop: string;
  totalProducts: number;
  mappedProducts: number;
  unmappedProducts: number;
  rejectedProducts: number;
  mappingSuccessRate: number;
  lastProcessed: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  uploadedAt: string;
  processedAt?: string;
  productCount?: number;
  error?: string;
}
