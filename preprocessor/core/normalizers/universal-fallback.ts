/**
 * Universal Fallback Normalizer
 * 
 * Handles multiple shop formats when shop-specific normalizers aren't available.
 * Uses Freshful's category structure as the canonical reference.
 */

import { BaseNormalizer, NormalizationResult, NormalizationOptions } from './base.js';
import { CanonicalProduct, StoreId } from '@/types/canonical.js';
import { CategoryMappingEngine } from '../category-mapper/engine.js';

export class UniversalFallbackNormalizer extends BaseNormalizer {
  readonly storeId: StoreId = 'auchan'; // Fallback store ID
  readonly version = '1.0.0';

  constructor(private categoryMapper: CategoryMappingEngine) {
    super();
  }

  getSchema() {
    return {
      requiredFields: [], // No required fields for fallback
      optionalFields: ['description', 'description_1', 'description_2', 'a', 'span', 'price', 'price_1'],
      description: 'Universal fallback normalizer that accepts any product format'
    };
  }

  /**
   * Check if this normalizer can handle the product
   * This is a fallback, so it accepts anything other normalizers reject
   */
  canHandle(product: any): boolean {
    // Accept any product that has at least one field that looks like a name or description
    return this.extractProductName(product) !== null;
  }

  /**
   * Extract shop from filename
   */
  private extractShopFromFilename(filename: string): StoreId {
    const name = filename.toLowerCase();
    if (name.includes('auchan')) return 'auchan';
    if (name.includes('mega')) return 'mega';
    if (name.includes('carrefour')) return 'carrefour';
    if (name.includes('kaufland')) return 'kaufland';
    if (name.includes('freshful')) return 'freshful';
    if (name.includes('lidl')) return 'lidl';
    return 'auchan'; // default fallback
  }

  /**
   * Extract category from MEGA product URL if available
   */
  private extractCategoryFromMegaUrl(product: any): string | null {
    const url = product.sc_y4jrw3_8_url;
    if (!url || typeof url !== 'string') return null;
    
    // Extract category from MEGA URL structure
    // Example: /Apa-si-sucuri/Apa/Apa-carbogazoasa/... → "apa si sucuri"
    // Example: /Produse-congelate/Carne-peste-si-fructe-de-mare-congelate/... → "produse congelate"
    const match = url.match(/mega-image\.ro\/([^\/]+)/);
    if (match && match[1]) {
      return match[1]
        .replace(/-/g, ' ')
        .toLowerCase()
        .trim();
    }
    return null;
  }

  /**
   * Extract additional MEGA-specific data
   */
  private extractMegaSpecificData(product: any): {
    productId?: string;
    unitPrice?: string;
    maxQuantity?: number;
    depositInfo?: string;
  } {
    return {
      productId: product.sc_wxp2va_0, // Product numeric ID
      unitPrice: product.sc_dqia0p_3, // Unit price (e.g., "1.12 Lei/L")
      maxQuantity: product.sc_y4jrw3_30 ? parseInt(product.sc_y4jrw3_30) : undefined,
      depositInfo: product.sc_y4jrw3_21 // Deposit/guarantee info
    };
  }

  /**
   * Extract category from filename (similar to Freshful approach)
   */
  private extractCategoryFromFilename(filename: string): string {
    let baseName = filename
      .replace(/\.json$/, '') // Remove .json extension
      .toLowerCase();

    // Remove timestamp patterns first (they can be anywhere)
    baseName = baseName
      .replace(/\d{4}-\d{2}-\d{2}t\d{2}-\d{2}-\d{2}-\d{3}z/g, '') // Remove full timestamp
      .replace(/---[^-]*---[^-]*---.*$/, '') // Remove shop and domain suffixes
      .replace(/---.*$/, '') // Remove any remaining suffix
      .replace(/-+/g, ' ') // Convert dashes to spaces
      .trim();

    // Clean up common filename patterns
    baseName = baseName
      .replace(/\bgama variata\b/gi, '')
      .replace(/\btoate produsele\b/gi, '')
      .replace(/\bmega image\b/gi, '')
      .replace(/\bauchan ro\b/gi, '')
      .replace(/\bcarrefour romania\b/gi, '')
      .replace(/\bprospetime si calitate pentru familia ta\b/gi, '')
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();

    return baseName;
  }

  /**
   * Smart product name extraction
   */
  private extractProductName(product: any): string | null {
    // Try common field names for product titles
    const nameFields = [
      'image_image__nanvf_description', // Freshful
      'description_2', // Auchan
      'a', // Carrefour  
      'odsc_tile__link', // Lidl
      'column_12', // MEGA product name (variant 1)
      'column_6', // MEGA product name (variant 2)
      'name',
      'title',
      'productName',
      'description'
    ];

    for (const field of nameFields) {
      if (product[field] && typeof product[field] === 'string' && product[field].trim()) {
        return product[field].trim();
      }
    }

    // Look for any string field that could be a name (not URL)
    for (const [key, value] of Object.entries(product)) {
      if (typeof value === 'string' && 
          value.length > 3 && 
          value.length < 200 &&
          !value.startsWith('http') &&
          !value.includes('cdn.') &&
          !key.toLowerCase().includes('url') &&
          !key.toLowerCase().includes('image')) {
        return value.trim();
      }
    }

    return null;
  }

  /**
   * Smart brand extraction
   */
  private extractBrand(product: any): string | null {
    const brandFields = [
      'productdefaultcard_brand__ix27n', // Freshful
      'product_grid_box__brand', // Lidl
      'span', // MEGA brand field
      'brand',
      'manufacturer'
    ];

    for (const field of brandFields) {
      if (product[field] && typeof product[field] === 'string' && product[field].trim()) {
        const value = product[field].trim();
        // Only accept if it looks like a brand (not a price or number)
        if (!/^\d+[.,]?\d*\s*(lei|ron|€|\$)?$/i.test(value)) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Smart price extraction
   */
  private extractPrice(product: any): { price: number; unit_price?: string; confidence: number } {
    // Method 1: Look for combined price fields
    const basicPriceFields = ['span', 'price', 'cost', 'value'];
    
    for (const field of basicPriceFields) {
      if (product[field]) {
        const priceStr = String(product[field]);
        const parsed = this.parsePrice(priceStr);
        if (parsed.price > 0) {
          return { ...parsed, confidence: 0.8 };
        }
      }
    }

    // Method 2: Look for split prices (like Auchan/Carrefour)
    if (product.price !== null && product.price_1 !== null) {
      const combined = `${product.price}.${product.price_1}`;
      const parsed = this.parsePrice(combined);
      if (parsed.price > 0) {
        return { ...parsed, confidence: 0.7 };
      }
    }

    if (product.span && product.span_1) {
      const combined = `${product.span}.${product.span_1}`;
      const parsed = this.parsePrice(combined);
      if (parsed.price > 0) {
        return { ...parsed, confidence: 0.7 };
      }
    }

    // Method 2.1: MEGA-specific split price pattern  
    if (product.sc_dqia0p_9 && product.sc_dqia0p_10) {
      const combined = `${product.sc_dqia0p_9}.${product.sc_dqia0p_10}`;
      const parsed = this.parsePrice(combined);
      if (parsed.price > 0) {
        return { ...parsed, confidence: 0.8 };
      }
    }

    // Method 2.5: Look for any numeric fields that might be prices
    const numericFields = Object.keys(product).filter(key => 
      !key.includes('description') && 
      !key.includes('url') && 
      !key.includes('image') &&
      typeof product[key] === 'string' &&
      /^\d+[.,]?\d*$/.test(product[key])
    );

    for (const field of numericFields) {
      const parsed = this.parsePrice(product[field]);
      if (parsed.price > 0 && parsed.price < 10000) { // Reasonable price range
        return { ...parsed, confidence: 0.5 };
      }
    }

    // Method 3: Look for unit price fields
    const unitPriceFields = [
      'productprice_perunit__4wcmu', // Freshful
      'undefined', // Auchan
      'sc_dqia0p_3' // MEGA
    ];

    for (const field of unitPriceFields) {
      if (product[field]) {
        const priceStr = String(product[field]);
        const parsed = this.parsePrice(priceStr);
        if (parsed.price > 0) {
          return { 
            price: parsed.price, 
            unit_price: priceStr,
            confidence: 0.6 
          };
        }
      }
    }

    return { price: 0, confidence: 0 };
  }

  /**
   * Parse price string with Romanian format support
   */
  private parsePrice(priceStr: string): { price: number } {
    if (!priceStr) return { price: 0 };

    // Clean the price string - handle Romanian "Lei" suffix
    const cleaned = priceStr
      .replace(/\s*lei\s*$/gi, '') // Remove "Lei" suffix (common in Lidl)
      .replace(/ron|€|\$/gi, '') // Remove other currencies
      .replace(/[^\d.,]/g, '') // Keep only digits, commas, dots
      .trim();

    if (!cleaned) return { price: 0 };

    // Handle Romanian comma as decimal separator
    let normalized = cleaned;
    if (normalized.includes(',') && !normalized.includes('.')) {
      // Replace comma with dot for decimal
      normalized = normalized.replace(',', '.');
    } else if (normalized.includes(',') && normalized.includes('.')) {
      // If both, assume comma is thousands separator
      normalized = normalized.replace(',', '');
    }

    const price = parseFloat(normalized);
    return { price: isNaN(price) ? 0 : price };
  }

  /**
   * Extract image URL
   */
  private extractImage(product: any): string | null {
    const imageFields = [
      'image_image__nanvf_image', // Freshful
      'description', // Auchan (sometimes image URL)
      'sc_y4jrw3_2_image', // MEGA product thumbnail
      'carrefour_lazy_image', // Carrefour
      'odsc_image_gallery__image_image', // Lidl
      'image',
      'imageUrl',
      'photo'
    ];

    for (const field of imageFields) {
      if (product[field] && typeof product[field] === 'string' && product[field].startsWith('http')) {
        return product[field];
      }
    }

    return null;
  }

  /**
   * Extract product URL
   */
  private extractUrl(product: any): string | null {
    const urlFields = [
      'productdefaultcard_root__5axhf_url', // Freshful
      'description_1', // Auchan
      'sc_y4jrw3_8_url', // MEGA product page URL
      'productitem_image_url', // Carrefour
      'odsc_tile__link_url', // Lidl
      'url',
      'link',
      'productUrl'
    ];

    for (const field of urlFields) {
      if (product[field] && typeof product[field] === 'string' && product[field].startsWith('http')) {
        return product[field];
      }
    }

    return null;
  }

  /**
   * Map filename category to Freshful canonical categories
   * Enhanced with mappings from MEGA, Auchan, Carrefour, and Lidl canonical trees
   */
  private getCategoryMapping(): Record<string, string> {
    return {
      // === DIRECT MAPPINGS (filename -> Freshful canonical) ===
      
      // Baby & Children (multiple shop variations)
      'articole si produse pentru bebelusi': 'Mama & copilul',
      'bebelusi si nou nascuti': 'Mama & copilul',
      'articole si produse pentru bebelusi si nou nascuti': 'Mama & copilul',
      'mama si ingrijire copil': 'Mama & copilul',
      'bebe': 'Mama & copilul',
      'copii': 'Mama & copilul',
      
      // Pet Shop
      'animale de companie': 'Pet Shop',
      'pet shop': 'Pet Shop',
      'petshop': 'Pet Shop',
      
      // Groceries & Pantry
      'bacanie': 'Băcănie',
      'pate conserve mezeluri': 'Băcănie',
      'conserve': 'Băcănie',
      'ingrediente culinare': 'Băcănie',
      
      // Beverages
      'bauturi apa sucuri bere whisky si tutun': 'Băuturi',
      'bauturi': 'Băuturi',
      'apa si sucuri': 'Băuturi',
      'vinuri': 'Băuturi',
      'bere': 'Băuturi',
      
      // Bakery & Pastry
      'brutarie cofetarie gastro': 'Brutărie & patiserie',
      'brutarie': 'Brutărie & patiserie',
      'paine cafea cereale si mic dejun': 'Brutărie & patiserie',
      'patiserie': 'Brutărie & patiserie',
      
      // Cleaning & Household
      'casa si curatenie': 'Detergenți & igienizare',
      'curatenie': 'Detergenți & igienizare',
      'detergenti': 'Detergenți & igienizare',
      'igienizare': 'Detergenți & igienizare',
      
      // Frozen Foods
      'congelate': 'Înghețată & congelate',
      'produse congelate': 'Înghețată & congelate',
      'inghetata': 'Înghețată & congelate',
      
      // Fruits & Vegetables
      'fructe si legume proaspete': 'Fructe & legume',
      'fructe si legume': 'Fructe & legume',
      'legume': 'Fructe & legume',
      'fructe': 'Fructe & legume',
      
      // Personal Care & Cosmetics
      'ingrijire personala si cosmetice': 'Cosmetice',
      'cosmetice si ingrijire personala': 'Cosmetice',
      'cosmetice': 'Cosmetice',
      'ingrijire': 'Cosmetice',
      'frumusete': 'Cosmetice',
      
      // Dairy & Eggs
      'lactate si oua': 'Lactate & ouă',
      'lactate': 'Lactate & ouă',
      'lapte': 'Lactate & ouă',
      'branzeturi': 'Lactate & ouă',
      'oua': 'Lactate & ouă',
      
      // Meat & Fish
      'carne': 'Carne & pește',
      'peste': 'Carne & pește',
      'pescarei': 'Carne & pește',
      'carne proaspata': 'Carne & pește',
      
      // Deli & Ready Meals
      'mezeluri': 'Mezeluri & ready meals',
      'mezeluri carne si ready meal': 'Mezeluri & ready meals',
      'ready meal': 'Mezeluri & ready meals',
      'semipreparate': 'Mezeluri & ready meals',
      
      // Sweets & Snacks
      'dulciuri si snacks': 'Dulciuri & mic dejun',
      'dulciuri': 'Dulciuri & mic dejun',
      'snacks': 'Dulciuri & mic dejun',
      'biscuiti': 'Dulciuri & mic dejun',
      'ciocolata': 'Dulciuri & mic dejun',
      
      // Dietary & International
      'equilibrium': 'Dietetic, ECO & internațional',
      'bio': 'Dietetic, ECO & internațional',
      'eco': 'Dietetic, ECO & internațional',
      'vegane': 'Dietetic, ECO & internațional',
      'dietetice': 'Dietetic, ECO & internațional',
      'produse vegane': 'Dietetic, ECO & internațional',
      
      // Plant-based products
      'produse vegetale': 'Produse vegetale',
      'vegetale': 'Produse vegetale',
      'soia': 'Produse vegetale',
      
      // === MULTI-CATEGORY FILES (need product-level categorization) ===
      // Auchan mixed files  
      'lactate carne mezeluri peste': '', // Mixed: needs product-level categorization
      'bacanie lichide': 'Băcănie',  // Mainly groceries
      'casa gradina petshop': '', // Mixed: house/garden/pets
      'cosmetice ingrijire personala': 'Cosmetice',
      
      // MEGA mixed files (need product-level categorization)
      'mega image gama variata': '', // Will use fuzzy matching
      'toate produsele': '', // Will use fuzzy matching
      'oferte': '', // Will use fuzzy matching
      'promotii': '', // Will use fuzzy matching
      'gama variata': '', // Will use fuzzy matching
      'bun la pret': '', // Will use fuzzy matching
      'mega gustul bun de luat acasa': '', // Will use fuzzy matching
      
      // Lidl categories (from Lidl canonical tree)
      'alimente si bauturi': 'Băcănie',
      'bucatarie si gospodarie': 'Casa & Menaj', 
      'bricolaj si gradina': 'Casa & Agrement',
      'locuinta si amenajare': 'Casa & Agrement',
      'moda si accesorii': 'Casa & Agrement',
      'bebelusi copii si jucarii': 'Mama & copilul',
      
      // MEGA URL-based categories (from product URLs)
      'carne peste si fructe de mare congelate': 'Înghețată & congelate',
      'fructe de mare congelate': 'Înghețată & congelate',
      'curatenie si nealimentare': 'Detergenți & igienizare'
    };
  }

  /**
   * Perform the actual normalization
   */
  async performNormalization(
    rawProduct: any, 
    options: NormalizationOptions
  ): Promise<CanonicalProduct> {
    const filename = options.sourceFile || 'unknown';
    const shop = this.extractShopFromFilename(filename);
    
    // Extract basic product information
    const name = this.extractProductName(rawProduct);
    if (!name) {
      throw new Error('Could not extract product name');
    }

    const brand = this.extractBrand(rawProduct);
    const priceInfo = this.extractPrice(rawProduct);
    const image = this.extractImage(rawProduct);
    const url = this.extractUrl(rawProduct);
    
    // Extract MEGA-specific data
    const megaData = shop === 'mega' ? this.extractMegaSpecificData(rawProduct) : {};

    // Extract and map category - try URL first for MEGA, then filename
    let extractedCategory = '';
    let categoryConfidence = 0.7;
    
    if (shop === 'mega') {
      const urlCategory = this.extractCategoryFromMegaUrl(rawProduct);
      if (urlCategory) {
        extractedCategory = urlCategory;
        categoryConfidence = 0.95; // Higher confidence from URL
      }
    }
    
    if (!extractedCategory) {
      extractedCategory = this.extractCategoryFromFilename(filename);
    }
    
    const categoryMapping = this.getCategoryMapping();
    let canonicalCategory = categoryMapping[extractedCategory];
    
    let categoryResult;
    if (canonicalCategory) {
      // Direct mapping found
      categoryResult = {
        category_path: [canonicalCategory],
        category_slug: this.slugifyCategory(canonicalCategory),
        mapping_status: 'ok' as const,
        confidence: categoryConfidence
      };
    } else {
      // Fallback to category mapper
      categoryResult = await this.categoryMapper.mapCategory({
        shop,
        originalCategory: extractedCategory,
        productName: name,
        brandName: brand
      });
    }

    // Build canonical product
    const canonicalProduct: CanonicalProduct = {
      canonical_id: `${shop}:${this.generateHash(name + brand + priceInfo.price)}`,
      
      source: {
        shop,
        shop_product_id: megaData.productId || rawProduct.id || rawProduct.sc_wxp2va_0 || 'generated',
        source_file: filename,
        fetched_at: new Date().toISOString()
      },
      
      title: name,
      brand: brand || undefined,
      
      category_path: categoryResult.category_path,
      category_slug: categoryResult.category_slug,
      mapping_status: categoryResult.mapping_status,
      
      images: image ? [{ url: image, role: 'main' as const }] : [],
      
      pricing: {
        price: priceInfo.price,
        currency: 'RON',
        unit_price: megaData.unitPrice ? {
          value: this.parseUnitPrice(megaData.unitPrice).value,
          unit: this.parseUnitPrice(megaData.unitPrice).unit
        } : priceInfo.unit_price ? {
          value: priceInfo.price,
          unit: this.extractUnit(priceInfo.unit_price) || 'RON/unit'
        } : undefined
      },
      
      pack: {
        size: 1,
        unit: 'pcs' as const
      },
      
      stock: {
        in_stock: true,
        status: 'in_stock' as const
      },
      
      attributes: {
        dietary: [],
        allergens: [],
        promo_flags: []
      },
      
      urls: url ? {
        product: url
      } : undefined,
      
      audit: this.generateAudit([
        `Normalized by universal fallback normalizer`,
        `Shop: ${shop}`,
        `Category: ${categoryResult.category_path.join(' > ')}`,
        `Price confidence: ${priceInfo.confidence}`,
        `Source: ${filename}`
      ])
    };

    return canonicalProduct;
  }

  private extractUnit(unitPriceStr: string): string | null {
    const unitMatch = unitPriceStr.match(/(kg|l|ml|g|buc|pcs)/i);
    return unitMatch ? `RON/${unitMatch[1].toLowerCase()}` : null;
  }

  /**
   * Parse MEGA unit price format: "1.12 Lei/L"
   */
  private parseUnitPrice(unitPriceStr: string): { value: number; unit: string } {
    if (!unitPriceStr) return { value: 0, unit: 'RON/unit' };
    
    // Parse "1.12 Lei/L" format
    const match = unitPriceStr.match(/(\d+[.,]?\d*)\s*Lei\/(.+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      const unit = `RON/${match[2].toLowerCase()}`;
      return { value: isNaN(value) ? 0 : value, unit };
    }
    
    return { value: 0, unit: 'RON/unit' };
  }

  private generateHash(input: string): string {
    // Simple hash for generating IDs
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Convert category name to URL-safe slug with proper Romanian diacritic handling
   */
  private slugifyCategory(category: string): string {
    return category
      .toLowerCase()
      // Replace Romanian diacritics with their ASCII equivalents
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a') 
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      // Replace spaces and special characters with hyphens
      .replace(/[\s&+%20,]/g, '-')
      // Keep only lowercase letters, numbers, and hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Collapse multiple hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '');
  }
}
