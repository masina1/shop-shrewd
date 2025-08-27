/**
 * Product repository - central data store for normalized products
 */
import { Product, SearchItem, StoreId } from '@/types/product';
import { loadVendorData } from './dataLoader';
import { normalizeVendorProducts, groupProductsByCanonicalId } from './normalization';

export class ProductRepository {
  private products = new Map<string, Product>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize repository by loading and normalizing all vendor data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    console.log('🔄 Initializing product repository...');
    
    try {
      // Load raw vendor data
      const vendorData = await loadVendorData();
      
      // Normalize each vendor's products
      const allProducts: Product[] = [];
      
      for (const [storeId, rawProducts] of vendorData) {
        const normalized = normalizeVendorProducts(rawProducts, storeId);
        allProducts.push(...normalized);
        console.log(`✅ Normalized ${normalized.length} products from ${storeId}`);
      }
      
      // Group products by canonical ID
      const grouped = groupProductsByCanonicalId(allProducts);
      this.products = grouped;
      
      this.initialized = true;
      console.log(`✅ Repository initialized with ${this.products.size} unique products`);
    } catch (error) {
      console.error('❌ Failed to initialize product repository:', error);
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Get all products as SearchItems (with cheapest/alternatives structure)
   */
  async getAllSearchItems(): Promise<SearchItem[]> {
    await this.initialize();
    
    return Array.from(this.products.values()).map(product => {
      const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
      const cheapest = sortedOffers[0];
      const alternatives = sortedOffers.slice(1);
      
      return {
        product,
        cheapest,
        alternatives
      };
    });
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | undefined> {
    await this.initialize();
    return this.products.get(id);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryL1: string, categoryL2?: string): Promise<SearchItem[]> {
    const allItems = await this.getAllSearchItems();
    
    return allItems.filter(item => {
      const product = item.product;
      if (product.categoryL1 !== categoryL1) return false;
      if (categoryL2 && product.categoryL2 !== categoryL2) return false;
      return true;
    });
  }

  /**
   * Get products by store
   */
  async getProductsByStore(storeId: StoreId): Promise<SearchItem[]> {
    const allItems = await this.getAllSearchItems();
    
    return allItems.filter(item => 
      item.product.offers.some(offer => offer.storeId === storeId)
    );
  }

  /**
   * Search products by text query
   */
  async searchProducts(query: string): Promise<SearchItem[]> {
    if (!query.trim()) {
      return this.getAllSearchItems();
    }
    
    const allItems = await this.getAllSearchItems();
    const normalizedQuery = query.toLowerCase().trim();
    
    return allItems.filter(item => {
      const product = item.product;
      
      // Search in name
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in brand
      if (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in category
      if (product.categoryL1.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      if (product.categoryL2 && product.categoryL2.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Get all available brands
   */
  async getAllBrands(): Promise<{ brand: string; count: number }[]> {
    await this.initialize();
    
    const brandCounts = new Map<string, number>();
    
    for (const product of this.products.values()) {
      if (product.brand) {
        const current = brandCounts.get(product.brand) || 0;
        brandCounts.set(product.brand, current + 1);
      }
    }
    
    return Array.from(brandCounts.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get all available categories
   */
  async getAllCategories(): Promise<{ categoryL1: string; categoryL2?: string; count: number }[]> {
    await this.initialize();
    
    const categoryCounts = new Map<string, number>();
    
    for (const product of this.products.values()) {
      // Count L1 categories
      const l1Key = product.categoryL1;
      categoryCounts.set(l1Key, (categoryCounts.get(l1Key) || 0) + 1);
      
      // Count L2 categories
      if (product.categoryL2) {
        const l2Key = `${product.categoryL1} > ${product.categoryL2}`;
        categoryCounts.set(l2Key, (categoryCounts.get(l2Key) || 0) + 1);
      }
    }
    
    return Array.from(categoryCounts.entries())
      .map(([key, count]) => {
        const parts = key.split(' > ');
        return {
          categoryL1: parts[0],
          categoryL2: parts[1],
          count
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get repository statistics
   */
  async getStats(): Promise<{
    totalProducts: number;
    totalOffers: number;
    storeStats: { store: StoreId; products: number; offers: number }[];
  }> {
    await this.initialize();
    
    const storeStats = new Map<StoreId, { products: number; offers: number }>();
    let totalOffers = 0;
    
    for (const product of this.products.values()) {
      totalOffers += product.offers.length;
      
      for (const offer of product.offers) {
        const current = storeStats.get(offer.storeId) || { products: 0, offers: 0 };
        current.offers += 1;
        
        // Count unique products per store
        if (!storeStats.has(offer.storeId)) {
          current.products = 1;
        }
        
        storeStats.set(offer.storeId, current);
      }
    }
    
    return {
      totalProducts: this.products.size,
      totalOffers,
      storeStats: Array.from(storeStats.entries()).map(([store, stats]) => ({
        store,
        ...stats
      }))
    };
  }
}

// Singleton instance
export const productRepository = new ProductRepository();
