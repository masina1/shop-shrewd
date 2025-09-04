/**
 * ================================
 * ADMIN MOCK DATA
 * ================================
 * 
 * This file contains admin-specific mock data structures and metadata.
 * It LINKS to the main mock data (mockData.ts) for core entities but adds
 * admin-specific fields like status, metadata, configuration, etc.
 * 
 * DEVELOPER NOTE: When implementing real APIs:
 * 1. Replace admin-specific data with admin API endpoints
 * 2. Core product/offer data should come from the same API as user-facing data
 * 3. Admin APIs should extend core data with additional metadata
 */

import { mockSearchProducts, getCheapestPrice, type SearchProduct } from './mockData';

// Store configuration (admin-only)
export interface Store {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  logo?: string;
  region: string;
  deliveryAreas: string[];
  baseUrl: string;
  scrapingMethod: 'manual' | 'API' | 'crawler';
  currency: string;
  color: string;
  testUrls: string[];
}

// Admin product extends core product with metadata  
export interface AdminProduct {
  // Core product data (from mockData.ts)
  coreProduct: SearchProduct;
  
  // Admin-specific metadata
  gtin: string | null;
  normalizedName: string;
  status: 'active' | 'archived' | 'pending';
  description?: string;
  updatedAt: string;
  tags: string[];
  size: string; // More detailed than core product
}

// Admin offer extends core offer data with metadata
export interface AdminOffer {
  id: string;
  productId: string; // Links to core product
  storeId: string;   // Links to admin store config
  price: number;     // Same as core data
  unitPrice: number;
  promo: string | null;
  url: string;       // Admin-specific: direct store URL
  lastSeen: string;  // Admin-specific: scraping metadata  
  status: 'active' | 'out_of_stock' | 'expired'; // Admin-specific
}

export interface Combo {
  id: string;
  title: string;
  slug: string;
  description: string;
  items: { productId: string; qty: number; storeOverride?: string }[];
  total: number;
  savings: number;
  published: boolean;
  image?: string;
}

export interface ImportJob {
  id: string;
  file: string;
  rows: number;
  status: 'success' | 'failed' | 'processing';
  duration: string;
  errors: number;
  createdAt: string;
}

export interface ScraperStatus {
  storeId: string;
  lastRun: string;
  successRate: number;
  changed: number;
  errors: number;
  nextRun: string;
}

export interface Template {
  id: string;
  title: string;
  type: 'wishlist' | 'recipe';
  description: string;
  items: { productId: string; qty: number }[];
  tags: string[];
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
  avatar?: string;
  createdAt: string;
}

// Mock data
export const mockStores: Store[] = [
  {
    id: 's1',
    name: 'Freshful',
    slug: 'freshful',
    enabled: true,
    logo: '/placeholder-freshful.png',
    region: 'Bucharest',
    deliveryAreas: ['Sector 1', 'Sector 2', 'Sector 3'],
    baseUrl: 'https://freshful.ro',
    scrapingMethod: 'crawler',
    currency: 'RON',
    color: '#2563eb',
    testUrls: ['https://freshful.ro/lapte', 'https://freshful.ro/muschi']
  },
  {
    id: 's2',
    name: 'Carrefour',
    slug: 'carrefour',
    enabled: true,
    logo: '/placeholder-carrefour.png',
    region: 'Bucharest',
    deliveryAreas: ['Sector 1', 'Sector 4', 'Sector 5'],
    baseUrl: 'https://carrefour.ro',
    scrapingMethod: 'API',
    currency: 'RON',
    color: '#dc2626',
    testUrls: ['https://carrefour.ro/lapte']
  },
  {
    id: 's3',
    name: 'Mega Image',
    slug: 'mega-image',
    enabled: true,
    logo: '/placeholder-mega.png',
    region: 'Bucharest',
    deliveryAreas: ['Sector 2', 'Sector 3', 'Sector 6'],
    baseUrl: 'https://megaimage.ro',
    scrapingMethod: 'manual',
    currency: 'RON',
    color: '#059669',
    testUrls: []
  }
];

// LINKED ADMIN PRODUCTS - References core products with admin metadata
// TODO: Replace with admin API that extends core product API data
export const mockAdminProducts: AdminProduct[] = [
  {
    coreProduct: mockSearchProducts[0], // Links to "Lapte integral 3.5% 1L Zuzu"
    gtin: '5941234567890',
    normalizedName: 'lapte-integral-3-5-1l-zuzu',
    status: 'active',
    description: 'Fresh integral milk 3.5% fat content',
    updatedAt: '2025-08-20 14:30',
    tags: ['dairy', 'fresh', 'zuzu', 'integral'],
    size: '1L'
  },
  {
    coreProduct: mockSearchProducts[3], // Links to "Mușchi file 100g Scandia"
    gtin: null,
    normalizedName: 'muschi-file-100g-scandia',
    status: 'active',
    description: 'Sliced ham, premium quality',
    updatedAt: '2025-08-20 12:15',
    tags: ['deli', 'meat', 'sliced', 'scandia'],
    size: '100g'
  },
  {
    coreProduct: mockSearchProducts[1], // Links to "Pâine integrală 500g Vel Pitar"
    gtin: '5947123456789',
    normalizedName: 'paine-integrala-500g-vel-pitar',
    status: 'active',
    description: 'Integral bread, fresh daily',
    updatedAt: '2025-08-20 08:45',
    tags: ['bakery', 'bread', 'daily', 'integral', 'vel-pitar'],
    size: '500g'
  }
];

// LINKED ADMIN OFFERS - Extends core offer data with admin metadata  
// TODO: Replace with admin API that extends core offer API data
export const mockAdminOffers: AdminOffer[] = [
  {
    id: 'o1',
    productId: 'p1',
    storeId: 's1',
    price: 12.49,
    unitPrice: 8.33,
    promo: '-13%',
    url: 'https://freshful.ro/lapte-napolact',
    lastSeen: '2025-08-21 09:15',
    status: 'active'
  },
  {
    id: 'o2',
    productId: 'p2',
    storeId: 's1',
    price: 7.09,
    unitPrice: 70.9,
    promo: '-11%',
    url: 'https://freshful.ro/muschi-file',
    lastSeen: '2025-08-21 09:15',
    status: 'active'
  },
  {
    id: 'o3',
    productId: 'p1',
    storeId: 's2',
    price: 13.99,
    unitPrice: 9.33,
    promo: null,
    url: 'https://carrefour.ro/lapte',
    lastSeen: '2025-08-21 08:30',
    status: 'active'
  }
];

export const mockCombos: Combo[] = [
  {
    id: 'c1',
    title: 'Daily Basics',
    slug: 'daily-basics',
    description: 'Essential items for daily breakfast',
    items: [
      { productId: 'p1', qty: 1 },
      { productId: 'p2', qty: 2 },
      { productId: 'p3', qty: 1 }
    ],
    total: 39.99,
    savings: 6.5,
    published: true,
    image: '/placeholder-combo.png'
  },
  {
    id: 'c2',
    title: 'Weekend Brunch',
    slug: 'weekend-brunch',
    description: 'Perfect combo for weekend breakfast',
    items: [
      { productId: 'p1', qty: 2 },
      { productId: 'p3', qty: 2 }
    ],
    total: 28.90,
    savings: 3.2,
    published: false
  }
];

export const mockImports: ImportJob[] = [
  {
    id: 'imp1',
    file: 'freshful-2025-08-18.csv',
    rows: 1200,
    status: 'success',
    duration: '38s',
    errors: 0,
    createdAt: '2025-08-18 14:30'
  },
  {
    id: 'imp2',
    file: 'carrefour-2025-08-17.xlsx',
    rows: 850,
    status: 'failed',
    duration: '12s',
    errors: 45,
    createdAt: '2025-08-17 16:20'
  }
];

export const mockScrapers: ScraperStatus[] = [
  {
    storeId: 's1',
    lastRun: 'Today 09:10',
    successRate: 0.98,
    changed: 214,
    errors: 3,
    nextRun: 'Today 21:00'
  },
  {
    storeId: 's2',
    lastRun: 'Today 08:30',
    successRate: 0.95,
    changed: 89,
    errors: 7,
    nextRun: 'Today 20:30'
  }
];

export const mockTemplates: Template[] = [
  {
    id: 't1',
    title: 'Beginner Pantry',
    type: 'wishlist',
    description: 'Essential items for a basic pantry',
    items: [
      { productId: 'p1', qty: 2 },
      { productId: 'p3', qty: 3 }
    ],
    tags: ['beginner', 'essentials'],
    category: 'Pantry'
  },
  {
    id: 't2',
    title: 'Breakfast Basics',
    type: 'recipe',
    description: 'Everything needed for a healthy breakfast',
    items: [
      { productId: 'p1', qty: 1 },
      { productId: 'p2', qty: 1 },
      { productId: 'p3', qty: 1 }
    ],
    tags: ['breakfast', 'healthy'],
    category: 'Meals'
  }
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Ana Popescu',
    email: 'ana@example.com',
    role: 'admin',
    status: 'active',
    avatar: '/placeholder-avatar.png',
    createdAt: '2025-01-15 10:30'
  },
  {
    id: 'u2',
    name: 'Mihai Ionescu',
    email: 'mihai@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2025-02-20 14:45'
  },
  {
    id: 'u3',
    name: 'Elena Stefan',
    email: 'elena@example.com',
    role: 'viewer',
    status: 'disabled',
    createdAt: '2025-03-10 09:15'
  }
];

export const mockDataQuality = {
  duplicates: 3,
  missingImages: 11,
  unitConflicts: 4,
  nameMismatches: 7
};

export const mockKPIs = {
  totalProducts: mockAdminProducts.length,
  totalOffers: mockAdminOffers.length,
  activeStores: mockStores.filter(s => s.enabled).length,
  priceUpdatesToday: 247,
  alertsQueued: 12
};

// ADMIN UTILITY FUNCTIONS - Work with linked data
// TODO: Replace with admin API utility functions
export const getStoreById = (id: string) => mockStores.find(s => s.id === id);
export const getAdminProductById = (id: string) => mockAdminProducts.find(p => p.coreProduct.id === id);
export const getAdminOfferById = (id: string) => mockAdminOffers.find(o => o.id === id);
export const getComboById = (id: string) => mockCombos.find(c => c.id === id);
export const getTemplateById = (id: string) => mockTemplates.find(t => t.id === id);
export const getUserById = (id: string) => mockUsers.find(u => u.id === id);

export const getAdminOffersForProduct = (productId: string) => 
  mockAdminOffers.filter(o => o.productId === productId);

export const getScraperForStore = (storeId: string) => 
  mockScrapers.find(s => s.storeId === storeId);

// LEGACY COMPATIBILITY - For components that haven't been updated yet
// TODO: Remove these when all admin components use the new linked structure

// Legacy type aliases
export type Product = {
  id: string;
  name: string;
  brand: string;
  size: string;
  category: string;
  gtin: string | null;
  image: string;
  normalizedName: string;
  status: 'active' | 'archived' | 'pending';
  description?: string;
  updatedAt: string;
  tags: string[];
};

export type Offer = AdminOffer; // Direct alias for admin offer

export const mockProducts = mockAdminProducts.map(ap => ({
  id: ap.coreProduct.id,
  name: ap.coreProduct.name,
  brand: ap.coreProduct.brand,
  size: ap.size,
  category: ap.coreProduct.categoryPath[ap.coreProduct.categoryPath.length - 1],
  gtin: ap.gtin,
  image: ap.coreProduct.image,
  normalizedName: ap.normalizedName,
  status: ap.status,
  description: ap.description,
  updatedAt: ap.updatedAt,
  tags: ap.tags
}));

export const mockOffers = mockAdminOffers;

// Legacy utility functions
export const getProductById = (id: string) => mockProducts.find(p => p.id === id);
export const getOfferById = (id: string) => mockOffers.find(o => o.id === id);
export const getOffersForProduct = (productId: string) => mockOffers.filter(o => o.productId === productId);