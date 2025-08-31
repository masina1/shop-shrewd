/**
 * Freshful-specific normalizer
 * 
 * Normalizes Freshful product data to canonical format.
 * Freshful typically has the cleanest data structure.
 */

import { BaseNormalizer, NormalizationOptions } from './base.js';
import { parsePrice, parseSize, parseUnitPrice } from './price-utils.js';
import { CategoryMappingEngine } from '../category-mapper/engine.js';
import { CanonicalProduct, RawVendorProduct, StoreId } from '@/types/canonical.js';

export class FreshfulNormalizer extends BaseNormalizer {
  readonly storeId: StoreId = 'freshful';
  readonly version = '1.0.0';
  
  private categoryMapper: CategoryMappingEngine;
  
  constructor() {
    super();
    this.categoryMapper = new CategoryMappingEngine();
  }
  
  /**
   * Perform Freshful-specific normalization
   */
  protected async performNormalization(
    rawProduct: RawVendorProduct, 
    options: NormalizationOptions
  ): Promise<CanonicalProduct> {
    
    // Extract fields from your actual data structure
    const name = rawProduct.image_image__nanvf_description || rawProduct.name;
    const brand = rawProduct.productdefaultcard_brand__ix27n || rawProduct.brand;
    const price = rawProduct.span || rawProduct.price;
    const unitPrice = rawProduct.productprice_perunit__4wcmu || rawProduct.unitPrice;
    const url = rawProduct.productdefaultcard_root__5axhf_url || rawProduct.url;
    const image = rawProduct.image_image__nanvf_image || rawProduct.image;
    const promoText = rawProduct.button_content__uztcc || rawProduct.promoLabel;
    
    // Parse pricing information
    const parsedPrice = parsePrice(price);
    const parsedSize = parseSize(rawProduct.size || rawProduct.weight);
    const parsedUnitPrice = parseUnitPrice(unitPrice as string);
    
    // Map category - prioritize filename-based category
    const categoryFromFile = this.extractCategoryFromFilename(options.sourceFile || '');
    
    // If we have a mapped category from filename, use it directly
    const categoryMapping = this.getCategoryMapping();
    let categoryResult;
    
    if (categoryFromFile && categoryMapping[categoryFromFile]) {
      const mappedCategory = categoryMapping[categoryFromFile];
      categoryResult = {
        category_path: [mappedCategory],
        category_slug: this.slugifyCategory(mappedCategory),
        mapping_status: 'ok' as const,
        confidence: 0.95
      };
    } else {
      // Fallback to category engine for unmapped filename categories
      categoryResult = await this.categoryMapper.mapCategory({
        shop: this.storeId,
        originalCategory: rawProduct.category || categoryFromFile || 'unknown',
        productName: name,
        brandName: brand
      });
    }
    
    // Final fallback as requested: if still mapped to Other, force to Mama & copilul
    if (categoryResult?.category_slug === 'other') {
      categoryResult = {
        category_path: ['Mama & copilul'],
        category_slug: this.slugifyCategory('Mama & copilul'),
        mapping_status: 'manual-override' as const,
        confidence: 0.5
      };
    }
    
    // Generate canonical ID
    const canonicalId = this.generateCanonicalId({
      ...rawProduct,
      name,
      brand,
      price
    });
    
    // Build canonical product
    const canonicalProduct: CanonicalProduct = {
      canonical_id: canonicalId,
      source: this.generateSource(rawProduct, options.sourceFile),
      
      // Product information
      title: this.cleanProductName(name),
      brand: brand,
      description: rawProduct.description,
      
      // Category information
      category_path: categoryResult.category_path,
      category_slug: categoryResult.category_slug,
      mapping_status: categoryResult.mapping_status,
      
      // Media
      images: image ? [{
        url: image,
        role: 'main' as const
      }] : [],
      
      // Pricing
      pricing: {
        price: parsedPrice.value,
        currency: 'RON' as const,
        unit_price: parsedUnitPrice ? {
          value: parsedUnitPrice.value,
          unit: parsedUnitPrice.unit
        } : undefined,
        original_price: rawProduct.originalPrice ? parsePrice(rawProduct.originalPrice).value : undefined,
        discount: promoText ? {
          type: this.parseDiscountType(promoText),
          value: this.parseDiscountValue(promoText),
          meta: promoText
        } : undefined
      },
      
      // Pack information
      pack: {
        size: parsedSize.size || 1,
        unit: parsedSize.unit
      },
      
      // Stock information
      stock: {
        in_stock: rawProduct.inStock ?? rawProduct.stock ?? true,
        status: this.parseStockStatus(rawProduct)
      },
      
      // Identifiers
      gtin: rawProduct.gtin || rawProduct.ean,
      
      // Attributes
      attributes: {
        country: this.extractCountry(rawProduct),
        dietary: this.extractDietaryInfo(rawProduct),
        allergens: this.extractAllergens(rawProduct),
        promo_flags: this.extractPromoFlags(rawProduct)
      },
      
      // URLs
      urls: {
        product: rawProduct.url,
        shop_category: undefined
      },
      
      // Audit trail
      audit: this.generateAudit([
        `Mapped category: ${categoryResult.category_path.join(' > ')}`,
        `Price confidence: ${parsedPrice.confidence}`,
        `Size confidence: ${parsedSize.confidence}`
      ])
    };
    
    return canonicalProduct;
  }
  
  /**
   * Check if this normalizer can handle the data format
   */
  canHandle(rawProduct: unknown): boolean {
    if (!super.canHandle(rawProduct)) return false;
    
    const product = rawProduct as RawVendorProduct;
    
    // Check for your actual data structure (CSS selector field names)
    const hasName = product.image_image__nanvf_description || product.name;
    const hasPrice = product.span || product.price;
    
    return !!(hasName && (typeof hasPrice === 'number' || typeof hasPrice === 'string'));
  }
  
  /**
   * Get schema information
   */
  getSchema() {
    return {
      requiredFields: ['image_image__nanvf_description', 'span'],
      optionalFields: [
        'productdefaultcard_brand__ix27n', 'image_image__nanvf_image', 
        'productdefaultcard_root__5axhf_url', 'productprice_perunit__4wcmu',
        'button_content__uztcc', 'category', 'gtin', 'ean',
        'inStock', 'stock', 'size', 'weight', 'originalPrice', 
        'fatContent', 'organic',
        // Legacy field names for backwards compatibility
        'name', 'brand', 'image', 'url', 'price', 'unitPrice', 'promoLabel'
      ],
      description: 'Freshful product data scraped from website with CSS selector field names'
    };
  }
  
  /**
   * Clean and standardize product names
   */
  private cleanProductName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^\w/, c => c.toUpperCase());
  }
  
  /**
   * Extract category from filename
   */
  private extractCategoryFromFilename(filename: string): string {
    if (!filename) return 'unknown';
    
    // Extract from pattern: "category-name-gama-variata----freshful-ro-..."
    const match = filename.match(/^([^-]+(?:-[^-]+)*)-gama-variata/);
    if (match) {
      const extractedCategory = match[1].replace(/-/g, ' ').trim();
      
      // Map to canonical categories
      const categoryMapping = this.getCategoryMapping();
      return categoryMapping[extractedCategory] || extractedCategory;
    }
    
    // Fallback: just use first part before first dash
    const firstPart = filename.split('-')[0];
    return firstPart || 'unknown';
  }

  /**
   * Create a slug from a category name
   */
  private slugifyCategory(category: string): string {
    return category
      .toLowerCase()
      .replace(/[ăâîșț]/g, (char) => {
        const map: Record<string, string> = { 'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't' };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get category mapping from filename categories to canonical categories
   */
  private getCategoryMapping(): Record<string, string> {
    return {
      // Baby & Children
      'alimente bebe': 'Mama & copilul',
      'igiena bebe': 'Mama & copilul',
      'puericultura': 'Mama & copilul',
      
      // Pet Shop
      'pisici': 'Pet Shop',
      'caini': 'Pet Shop',
      'pasari si rozatoare': 'Pet Shop',
      'pesti si testoase': 'Pet Shop',
      
      // Meat & Fish
      'alte carnuri': 'Carne & pește',
      'carne de pasare': 'Carne & pește',
      'carne de porc': 'Carne & pește', 
      'carne de vita si oaie': 'Carne & pește',
      'icre si salate de icre': 'Carne & pește',
      'mici si specialitati': 'Carne & pește',
      'peste afumat': 'Carne & pește',
      'peste si sushi': 'Carne & pește',
      'specialitati de peste': 'Carne & pește',
      
      // Mezeluri & Ready Meals
      'mezeluri': 'Mezeluri & ready meals',
      'mezeluri feliate': 'Mezeluri & ready meals',
      'paste proaspete': 'Mezeluri & ready meals',
      'pizza si aluat': 'Mezeluri & ready meals',
      'ready meals': 'Mezeluri & ready meals',
      
      // Produse vegetale
      'carne si specialitati vegetale': 'Produse vegetale',
      'bauturi creme si grasimi vegetale': 'Produse vegetale',
      
      // Înghețată & congelate
      'inghetata si deserturi congelate': 'Înghețată & congelate',
      'carne si peste congelate': 'Înghețată & congelate',
      'legume si fructe congelate': 'Înghețată & congelate',
      'semipreparate congelate': 'Înghețată & congelate',
      
      // Dairy & Eggs
      'amestecuri lactate si grasimi vegetale': 'Lactate & ouă',
      'branzeturi': 'Lactate & ouă',
      'iaurt desert si sana': 'Lactate & ouă',
      'lactate uht': 'Lactate & ouă',
      'lapte si lactate eco': 'Lactate & ouă',
      'lapte smantana si branza proaspata': 'Lactate & ouă',
      'ou': 'Lactate & ouă',
      'unt': 'Lactate & ouă',
      
      // Băuturi
      'apa': 'Băuturi',
      'bauturi carbogazoase': 'Băuturi',
      'bauturi necarbogazoase si siropuri': 'Băuturi',
      'bauturi spirtoase': 'Băuturi',
      'bere': 'Băuturi',
      'tutun': 'Băuturi',
      'vinuri': 'Băuturi',
      
      // Fruits & Vegetables
      'fructe proaspete': 'Fructe & legume',
      'fructe si legume uscate': 'Fructe & legume',
      'legume proaspete': 'Fructe & legume',
      'sucuri naturale': 'Fructe & legume',
      'verdeturi si ierburi aromatice': 'Fructe & legume',
      
      // Bakery & Pastry
      'paine': 'Brutărie & patiserie',
      'patiserie': 'Brutărie & patiserie',
      
      // Băcănie
      'condimente si sosuri': 'Băcănie',
      'conserve': 'Băcănie',
      'deronatait': 'Băcănie',
      'faina zahar si produse gourmet': 'Băcănie',
      'paste orez si legume uscate': 'Băcănie',
      'ulei si otet': 'Băcănie',
      
      // Dulciuri & mic dejun
      'biscuiti napolitane si prajituri': 'Dulciuri & mic dejun',
      'bomboane si ciocolata': 'Dulciuri & mic dejun',
      'cereale si mic dejun': 'Dulciuri & mic dejun',
      'cafea si ceai': 'Dulciuri & mic dejun',
      
      // Dietetic, ECO & internațional
      'produse dietetice si naturiste': 'Dietetic, ECO & internațional',
      'produse ecologice': 'Dietetic, ECO & internațional',
      'produse internationale': 'Dietetic, ECO & internațional',
      'suplimente alimentare': 'Dietetic, ECO & internațional',
      
      // Cosmetice
      'barbierit si ingrijire ten': 'Cosmetice',
      'ceara benzi si creme depilatoare': 'Cosmetice',
      'demachiante si creme': 'Cosmetice',
      'deodorante si parfumuri': 'Cosmetice',
      'dermatocosmetice si parafarmacie': 'Cosmetice',
      'igiena dentara': 'Cosmetice',
      'igiena intima': 'Cosmetice',
      'ingrijirea parului': 'Cosmetice',
      'repelent': 'Cosmetice',
      'sapunuri si geluri de dus': 'Cosmetice',
      
      // Detergenți & igienizare
      'curatenie si intretinerea casei': 'Detergenți & igienizare',
      'hartie igienica servetele si prosoape': 'Detergenți & igienizare',
      'spalare si intretinere rufe': 'Detergenți & igienizare',
      
      // Casă & agrement
      'articole de menaj': 'Casă & agrement',
      'electrocasnice mici': 'Casă & agrement',
      'bricolaj si auto': 'Casă & agrement',
      'birotica si papetarie': 'Casă & agrement',
      'gradina': 'Casă & agrement',
      'jucarii': 'Casă & agrement',
      'accesorii itc gama variata': 'Casă & agrement',
      'textile si accesorii': 'Casă & agrement'
    };
  }

  /**
   * Parse discount type from promo label
   */
  private parseDiscountType(promoLabel: string): 'percent' | 'price_drop' | null {
    if (!promoLabel) return null;
    
    const label = promoLabel.toLowerCase();
    
    if (label.includes('%') || label.includes('procent')) {
      return 'percent';
    }
    
    if (label.includes('lei') || label.includes('ron')) {
      return 'price_drop';
    }
    
    return null;
  }
  
  /**
   * Parse discount value from promo label
   */
  private parseDiscountValue(promoLabel: string): number {
    if (!promoLabel) return 0;
    
    const percentMatch = promoLabel.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]);
    }
    
    const priceMatch = promoLabel.match(/(\d+(?:[.,]\d+)?)\s*lei/i);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', '.'));
    }
    
    return 0;
  }
  
  /**
   * Parse stock status
   */
  private parseStockStatus(rawProduct: RawVendorProduct): 'in_stock' | 'out_of_stock' | 'limited_stock' {
    if (rawProduct.availability) {
      switch (rawProduct.availability.toLowerCase()) {
        case 'in_stock': return 'in_stock';
        case 'out_of_stock': return 'out_of_stock';
        case 'limited_stock': return 'limited_stock';
      }
    }
    
    const inStock = rawProduct.inStock ?? rawProduct.stock ?? true;
    return inStock ? 'in_stock' : 'out_of_stock';
  }
  
  /**
   * Extract country information
   */
  private extractCountry(rawProduct: RawVendorProduct): string | undefined {
    // Look for country in various fields
    const searchText = [
      rawProduct.name,
      rawProduct.description,
      rawProduct.brand
    ].filter(Boolean).join(' ').toLowerCase();
    
    const countries = {
      'romania': 'România',
      'italian': 'Italia',
      'france': 'Franța',
      'germany': 'Germania',
      'spain': 'Spania'
    };
    
    for (const [key, value] of Object.entries(countries)) {
      if (searchText.includes(key)) {
        return value;
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract dietary information
   */
  private extractDietaryInfo(rawProduct: RawVendorProduct): string[] {
    const dietary: string[] = [];
    const searchText = [
      rawProduct.name,
      rawProduct.description
    ].filter(Boolean).join(' ').toLowerCase();
    
    const dietaryKeywords = {
      'bio': 'bio',
      'organic': 'bio',
      'vegan': 'vegan',
      'vegetarian': 'vegetarian',
      'gluten-free': 'gluten-free',
      'fără gluten': 'gluten-free',
      'lactose-free': 'lactose-free',
      'fără lactoză': 'lactose-free'
    };
    
    for (const [keyword, flag] of Object.entries(dietaryKeywords)) {
      if (searchText.includes(keyword) && !dietary.includes(flag)) {
        dietary.push(flag);
      }
    }
    
    // Check organic flag directly
    if (rawProduct.organic) {
      dietary.push('bio');
    }
    
    return Array.from(new Set(dietary));
  }
  
  /**
   * Extract allergen information
   */
  private extractAllergens(rawProduct: RawVendorProduct): string[] {
    const allergens: string[] = [];
    const searchText = [
      rawProduct.name,
      rawProduct.description
    ].filter(Boolean).join(' ').toLowerCase();
    
    const allergenKeywords = {
      'gluten': 'gluten',
      'lactose': 'lactose',
      'nuts': 'nuts',
      'nuci': 'nuts',
      'eggs': 'eggs',
      'ouă': 'eggs',
      'soy': 'soy',
      'soia': 'soy'
    };
    
    for (const [keyword, allergen] of Object.entries(allergenKeywords)) {
      if (searchText.includes(keyword)) {
        allergens.push(allergen);
      }
    }
    
    return Array.from(new Set(allergens));
  }
  
  /**
   * Extract promotion flags
   */
  private extractPromoFlags(rawProduct: RawVendorProduct): string[] {
    const flags: string[] = [];
    
    if (rawProduct.promoLabel) {
      flags.push('discount');
    }
    
    if (rawProduct.promotional) {
      flags.push('discount');
    }
    
    const searchText = [
      rawProduct.name,
      rawProduct.promoLabel
    ].filter(Boolean).join(' ').toLowerCase();
    
    if (searchText.includes('nou') || searchText.includes('new')) {
      flags.push('new');
    }
    
    if (searchText.includes('limitat') || searchText.includes('limited')) {
      flags.push('limited');
    }
    
    return Array.from(new Set(flags));
  }
}
