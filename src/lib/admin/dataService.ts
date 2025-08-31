import { UnmappedProduct } from '@/types/admin';
import { preprocessorDataLoader } from './preprocessorDataLoader';

export interface ProcessingReport {
  shop: string;
  totalProducts: number;
  processedProducts: number;
  unmappedProducts: number;
  rejectedProducts: number;
  mappingSuccessRate: number;
  timestamp: string;
}

export interface ShopData {
  shop: string;
  unmappedProducts: UnmappedProduct[];
  processingStats: ProcessingReport;
}

export class AdminDataService {
  private baseUrl: string;

  constructor() {
    // In production, this would be an API endpoint
    // For now, we'll load from local files
    this.baseUrl = '/api/admin';
  }

  /**
   * Load unmapped products from all shops
   */
  async loadUnmappedProducts(): Promise<UnmappedProduct[]> {
    try {
      // Use the preprocessor data loader to get real data
      return await preprocessorDataLoader.loadUnmappedProducts();
    } catch (error) {
      console.error('Failed to load unmapped products:', error);
      throw new Error('Failed to load unmapped products');
    }
  }

  /**
   * Load processing statistics for all shops
   */
  async loadProcessingStats(): Promise<ProcessingReport[]> {
    try {
      console.log('📊 Loading real processing stats from preprocessing reports...');
      
      const shops = ['freshful', 'auchan', 'carrefour', 'mega', 'lidl'];
      const stats: ProcessingReport[] = [];
      
      for (const shop of shops) {
        try {
          const statsPath = `/out/${shop}-final/metadata.json`;
          const response = await fetch(statsPath);
          
          if (response.ok) {
            const metadata = await response.json();
            
            // Transform preprocessing metadata to admin format
            const report: ProcessingReport = {
              shop: shop.charAt(0).toUpperCase() + shop.slice(1),
              totalProducts: metadata.stats?.totalProducts || 0,
              processedProducts: metadata.stats?.totalProducts || 0, // All products are processed in current format
              unmappedProducts: 0, // No unmapped in current format
              rejectedProducts: 0, // No rejected in current format  
              mappingSuccessRate: 1.0, // 100% success rate in current format
              timestamp: metadata.processed_at || new Date().toISOString()
            };
            
            stats.push(report);
            console.log(`✅ Loaded stats for ${shop}: ${report.totalProducts} products`);
          } else {
            console.log(`⚠️ No metadata for ${shop}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load stats for ${shop}:`, error);
        }
      }
      
      // If no real stats found, return mock data
      if (stats.length === 0) {
        console.log('📦 No real stats found, returning mock data for testing');
        return this.getMockProcessingStats();
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to load processing stats:', error);
      throw new Error('Failed to load processing stats');
    }
  }

  /**
   * Approve a product mapping
   */
  async approveProduct(productId: string, category: string): Promise<void> {
    try {
      // In production, this would update your category mapping rules
      // and move the product from unmapped to processed
      console.log(`Approved product ${productId} with category ${category}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to approve product:', error);
      throw new Error('Failed to approve product');
    }
  }

  /**
   * Reject a product mapping
   */
  async rejectProduct(productId: string, reason: string): Promise<void> {
    try {
      // In production, this would log the rejection and reason
      console.log(`Rejected product ${productId} with reason: ${reason}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to reject product:', error);
      throw new Error('Failed to reject product');
    }
  }

  /**
   * Get available categories for manual assignment
   */
  async getAvailableCategories(): Promise<string[]> {
    try {
      // Use the preprocessor data loader to get real categories
      return await preprocessorDataLoader.getAvailableCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw new Error('Failed to load available categories');
    }
  }

  /**
   * Mock data that simulates real preprocessing output
   */
  private getMockUnmappedData(): UnmappedProduct[] {
    return [
      {
        id: '1',
        productName: 'Lapte integral 3.5% 1L',
        brand: 'Danone',
        shop: 'Auchan',
        rawCategory: 'lactate-si-oua',
        suggestedCategory: 'Lactate & Ouă',
        confidence: 0.85,
        status: 'pending',
        productData: {
          price: 8.99,
          image: 'https://via.placeholder.com/300x300?text=Lapte+Danone',
          url: 'https://auchan.ro/lapte-danone-1l'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        productName: 'Pâine integrală 500g',
        brand: 'Boromir',
        shop: 'Mega',
        rawCategory: 'paine--cafea--cereale',
        suggestedCategory: 'Pâine & Patiserie',
        confidence: 0.92,
        status: 'pending',
        productData: {
          price: 4.50,
          image: 'https://via.placeholder.com/300x300?text=Paine+Integrala',
          url: 'https://mega-image.ro/paine-integrala'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        productName: 'Suc de portocale 1L',
        brand: 'Dorna',
        shop: 'Carrefour',
        rawCategory: 'apa-si-sucuri',
        suggestedCategory: 'Băuturi',
        confidence: 0.78,
        status: 'pending',
        productData: {
          price: 6.99,
          image: 'https://via.placeholder.com/300x300?text=Suc+Portocale',
          url: 'https://carrefour.ro/suc-portocale'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        productName: 'Detergent pentru rufe 2.5L',
        brand: 'Ariel',
        shop: 'Lidl',
        rawCategory: 'curatenie-si-intretinerea',
        suggestedCategory: 'Curățenie & Igienizare',
        confidence: 0.65,
        status: 'pending',
        productData: {
          price: 12.99,
          image: 'https://via.placeholder.com/300x300?text=Detergent+Ariel',
          url: 'https://lidl.ro/detergent-ariel'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: '5',
        productName: 'Brânză cașcaval 200g',
        brand: 'La Dorna',
        shop: 'Freshful',
        rawCategory: 'lactate-si-oua',
        suggestedCategory: 'Lactate & Ouă',
        confidence: 0.88,
        status: 'pending',
        productData: {
          price: 15.50,
          image: 'https://via.placeholder.com/300x300?text=Branza+Cascaval',
          url: 'https://freshful.ro/branza-cascaval'
        },
        timestamp: new Date().toISOString()
      }
    ];
  }

  /**
   * Mock processing statistics
   */
  private getMockProcessingStats(): ProcessingReport[] {
    return [
      {
        shop: 'Freshful',
        totalProducts: 18061,
        processedProducts: 17234,
        unmappedProducts: 827,
        rejectedProducts: 0,
        mappingSuccessRate: 95.4,
        timestamp: new Date().toISOString()
      },
      {
        shop: 'Auchan',
        totalProducts: 15432,
        processedProducts: 13889,
        unmappedProducts: 1543,
        rejectedProducts: 0,
        mappingSuccessRate: 90.0,
        timestamp: new Date().toISOString()
      },
      {
        shop: 'Mega',
        totalProducts: 12345,
        processedProducts: 11111,
        unmappedProducts: 1234,
        rejectedProducts: 0,
        mappingSuccessRate: 90.0,
        timestamp: new Date().toISOString()
      },
      {
        shop: 'Carrefour',
        totalProducts: 9876,
        processedProducts: 8888,
        unmappedProducts: 988,
        rejectedProducts: 0,
        mappingSuccessRate: 90.0,
        timestamp: new Date().toISOString()
      },
      {
        shop: 'Lidl',
        totalProducts: 8765,
        processedProducts: 7889,
        unmappedProducts: 876,
        rejectedProducts: 0,
        mappingSuccessRate: 90.0,
        timestamp: new Date().toISOString()
      }
    ];
  }
}

export const adminDataService = new AdminDataService();
