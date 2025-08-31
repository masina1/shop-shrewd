import { UnmappedProduct } from '@/types/admin';

export interface PreprocessorDataLoader {
  /**
   * Load unmapped products from preprocessing output files
   */
  loadUnmappedProducts(): Promise<UnmappedProduct[]>;
  
  /**
   * Get available categories from canonical categories.yaml
   */
  getAvailableCategories(): Promise<string[]>;
  
  /**
   * Get processing statistics from preprocessing reports
   */
  getProcessingStats(): Promise<any[]>;
}

/**
 * File-based data loader for development/testing
 * In production, this would be replaced with API calls
 */
export class FileBasedDataLoader implements PreprocessorDataLoader {
  private basePath: string;

  constructor() {
    // Path to preprocessing output directory
    this.basePath = process.env.NODE_ENV === 'production' 
      ? '/api/preprocessor' 
      : '/out';
  }

  async loadUnmappedProducts(): Promise<UnmappedProduct[]> {
    try {
      // In a real implementation, this would:
      // 1. Read from /out/{shop}/reports/unmapped.jsonl files
      // 2. Parse each line as JSON
      // 3. Transform to UnmappedProduct format
      // 4. Aggregate from all shops
      
      // For now, return mock data that simulates real structure
      return this.getMockUnmappedData();
    } catch (error) {
      console.error('Failed to load unmapped products:', error);
      throw new Error('Failed to load unmapped products from preprocessing system');
    }
  }

  async getAvailableCategories(): Promise<string[]> {
    try {
      // In a real implementation, this would read from:
      // /preprocessor/config/categories.yaml
      
      return [
        'Fructe & Legume',
        'Lactate & Ouă',
        'Carne & Mezeluri',
        'Pâine & Patiserie',
        'Băcănie',
        'Băuturi',
        'Dulciuri & Snacks',
        'Produse Congelate',
        'Brutărie & Cereale',
        'Ingrediente Culinare',
        'Curățenie & Igienizare',
        'Îngrijire Personală',
        'Copii & Bebeluși',
        'Casa & Grădină',
        'Electronice & IT',
        'Sport & Timp Liber',
        'Auto & Bricolaj'
      ];
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw new Error('Failed to load available categories');
    }
  }

  async getProcessingStats(): Promise<any[]> {
    try {
      // In a real implementation, this would read from:
      // /out/{shop}/reports/processing-summary.json files
      
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
    } catch (error) {
      console.error('Failed to load processing stats:', error);
      throw new Error('Failed to load processing statistics');
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
}

export const preprocessorDataLoader = new FileBasedDataLoader();
