/**
 * Category mapping engine with 4-tier matching strategy
 * 
 * Implements exact → regex → synonym → fuzzy matching pipeline
 * with confidence scoring and learning capabilities.
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import * as stringSimilarity from 'string-similarity';
import { CategoryMappingResult, CategoryRule, StoreId, UnmappedCategory } from '@/types/canonical.js';
import { config } from '@/config/environment.js';

export interface CategoryHierarchy {
  [key: string]: {
    slug: string;
    subcategories?: { [key: string]: CategoryHierarchy } | Array<{ name: string; slug: string }>;
  };
}

export interface MappingConfig {
  categories: CategoryHierarchy;
  synonyms: Record<string, string[]>;
  units: Record<string, any>;
  matching: {
    exact_match: number;
    regex_match: number;
    synonym_match: number;
    fuzzy_threshold: number;
    minimum_confidence: number;
  };
}

export interface MappingContext {
  shop: StoreId;
  productName?: string;
  brandName?: string;
  originalCategory: string;
  hints?: string[]; // Additional context clues
}

/**
 * Category mapping engine with hierarchical rule matching
 */
export class CategoryMappingEngine {
  private canonicalConfig: MappingConfig | null = null;
  private shopRules: Map<StoreId, CategoryRule[]> = new Map();
  private unmappedQueue: Map<string, UnmappedCategory> = new Map();
  private categoryPaths: Map<string, string[]> = new Map();
  
  constructor() {
    this.initializeEngine();
  }
  
  /**
   * Initialize the mapping engine by loading configurations
   */
  private async initializeEngine(): Promise<void> {
    try {
      // Load canonical categories configuration
      const configPath = path.join(config.paths.canonical, 'categories.yaml');
      const configContent = await fs.readFile(configPath, 'utf-8');
      this.canonicalConfig = YAML.parse(configContent) as MappingConfig;
      
      // Build category path index for fast lookups
      this.buildCategoryPathIndex();
      
      // Load shop-specific rules
      await this.loadShopRules();
      
    } catch (error) {
      console.error('Failed to initialize category mapping engine:', error);
      throw new Error('Category mapping engine initialization failed');
    }
  }
  
  /**
   * Map a category using the 4-tier strategy
   */
  async mapCategory(context: MappingContext): Promise<CategoryMappingResult> {
    if (!this.canonicalConfig) {
      await this.initializeEngine();
    }
    
    // Tier 1: Exact matching
    let result = await this.exactMatch(context);
    if (result.confidence && result.confidence >= this.canonicalConfig!.matching.exact_match) {
      return result;
    }
    
    // Tier 2: Regex matching
    result = await this.regexMatch(context);
    if (result.confidence && result.confidence >= this.canonicalConfig!.matching.regex_match) {
      return result;
    }
    
    // Tier 3: Synonym matching
    result = await this.synonymMatch(context);
    if (result.confidence && result.confidence >= this.canonicalConfig!.matching.synonym_match) {
      return result;
    }
    
    // Tier 4: Fuzzy matching
    result = await this.fuzzyMatch(context);
    if (result.confidence && result.confidence >= this.canonicalConfig!.matching.fuzzy_threshold) {
      return result;
    }
    
    // No match found - add to unmapped queue
    await this.addToUnmappedQueue(context, result);
    
    // Return fallback to parent category
    return this.getFallbackMapping(context);
  }
  
  /**
   * Tier 1: Exact string matching
   */
  private async exactMatch(context: MappingContext): Promise<CategoryMappingResult> {
    const shopRules = this.shopRules.get(context.shop) || [];
    
    // Check shop-specific exact rules first
    for (const rule of shopRules) {
      if (rule.pattern_type === 'exact' && rule.enabled) {
        if (rule.pattern === context.originalCategory) {
          return {
            category_path: rule.target_path,
            category_slug: this.generateCategorySlug(rule.target_path),
            mapping_status: 'ok',
            confidence: this.canonicalConfig!.matching.exact_match,
            rule_id: rule.id
          };
        }
      }
    }
    
    return {
      category_path: ['Other'],
      category_slug: 'other',
      mapping_status: 'unmapped',
      confidence: 0,
      notes: ['No exact match found']
    };
  }
  
  /**
   * Tier 2: Regular expression matching
   */
  private async regexMatch(context: MappingContext): Promise<CategoryMappingResult> {
    const shopRules = this.shopRules.get(context.shop) || [];
    
    for (const rule of shopRules) {
      if (rule.pattern_type === 'regex' && rule.enabled) {
        try {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(context.originalCategory)) {
            return {
              category_path: rule.target_path,
              category_slug: this.generateCategorySlug(rule.target_path),
              mapping_status: 'ok',
              confidence: this.canonicalConfig!.matching.regex_match,
              rule_id: rule.id
            };
          }
        } catch (error) {
          console.warn(`Invalid regex pattern in rule ${rule.id}:`, error);
        }
      }
    }
    
    return {
      category_path: ['Other'],
      category_slug: 'other',
      mapping_status: 'unmapped',
      confidence: 0,
      notes: ['No regex match found']
    };
  }
  
  /**
   * Tier 3: Synonym-based matching
   */
  private async synonymMatch(context: MappingContext): Promise<CategoryMappingResult> {
    if (!this.canonicalConfig?.synonyms) {
      return {
        category_path: ['Other'],
        category_slug: 'other',
        mapping_status: 'unmapped',
        confidence: 0,
        notes: ['No synonyms configured']
      };
    }
    
    const normalizedCategory = context.originalCategory.toLowerCase();
    const combinedText = [
      context.originalCategory,
      context.productName,
      context.brandName,
      ...(context.hints || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    let bestMatch: { path: string[]; confidence: number } | null = null;
    
    // Check each canonical category's synonyms
    for (const [canonicalTerm, synonyms] of Object.entries(this.canonicalConfig.synonyms)) {
      for (const synonym of synonyms) {
        if (normalizedCategory.includes(synonym.toLowerCase()) || 
            combinedText.includes(synonym.toLowerCase())) {
          
          // Find the category path for this canonical term
          const categoryPath = this.findCategoryPath(canonicalTerm);
          if (categoryPath) {
            const confidence = this.canonicalConfig.matching.synonym_match;
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = { path: categoryPath, confidence };
            }
          }
        }
      }
    }
    
    if (bestMatch) {
      return {
        category_path: bestMatch.path,
        category_slug: this.generateCategorySlug(bestMatch.path),
        mapping_status: 'ok',
        confidence: bestMatch.confidence,
        notes: ['Matched via synonyms']
      };
    }
    
    return {
      category_path: ['Other'],
      category_slug: 'other',
      mapping_status: 'unmapped',
      confidence: 0,
      notes: ['No synonym match found']
    };
  }
  
  /**
   * Tier 4: Fuzzy string matching
   */
  private async fuzzyMatch(context: MappingContext): Promise<CategoryMappingResult> {
    const threshold = this.canonicalConfig!.matching.fuzzy_threshold;
    let bestMatch: { path: string[]; confidence: number; matched: string } | null = null;
    
    // Get all possible category paths and their text representations
    const categoryTexts = this.getAllCategoryTexts();
    
    // Test against original category
    for (const [categoryText, categoryPath] of categoryTexts) {
              const confidence = stringSimilarity.compareTwoStrings(
          context.originalCategory.toLowerCase(),
          categoryText.toLowerCase()
        );
      
      if (confidence >= threshold && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { path: categoryPath, confidence, matched: categoryText };
      }
    }
    
    // Also test against product name + brand for context
    if (context.productName || context.brandName) {
      const combinedText = [context.productName, context.brandName]
        .filter(Boolean)
        .join(' ');
      
      for (const [categoryText, categoryPath] of categoryTexts) {
        const confidence = stringSimilarity.compareTwoStrings(
          combinedText.toLowerCase(),
          categoryText.toLowerCase()
        ) * 0.8; // Lower confidence for indirect matching
        
        if (confidence >= threshold && (!bestMatch || confidence > bestMatch.confidence)) {
          bestMatch = { path: categoryPath, confidence, matched: categoryText };
        }
      }
    }
    
    if (bestMatch) {
      return {
        category_path: bestMatch.path,
        category_slug: this.generateCategorySlug(bestMatch.path),
        mapping_status: 'fuzzy-match',
        confidence: bestMatch.confidence,
        notes: [`Fuzzy matched to "${bestMatch.matched}"`]
      };
    }
    
    return {
      category_path: ['Other'],
      category_slug: 'other',
      mapping_status: 'unmapped',
      confidence: 0,
      notes: ['No fuzzy match above threshold']
    };
  }
  
  /**
   * Get fallback mapping (usually parent category)
   */
  private getFallbackMapping(context: MappingContext): CategoryMappingResult {
    // Try to map to a broad category based on keywords
    const broadCategories = [
      { keywords: ['aliment', 'food', 'mancare'], path: ['Alimente'] },
      { keywords: ['băutur', 'drink', 'beverage'], path: ['Băuturi'] },
      { keywords: ['cosmetice', 'cosmetic', 'beauty'], path: ['Cosmetice & Îngrijire'] },
      { keywords: ['casa', 'home', 'household'], path: ['Casa & Menaj'] },
      { keywords: ['copii', 'baby', 'kid'], path: ['Mama & copilul'] }
    ];
    
    const combinedText = [
      context.originalCategory,
      context.productName,
      context.brandName
    ].filter(Boolean).join(' ').toLowerCase();
    
    for (const category of broadCategories) {
      if (category.keywords.some(keyword => combinedText.includes(keyword))) {
        return {
          category_path: category.path,
          category_slug: this.generateCategorySlug(category.path),
          mapping_status: 'fallback-parent',
          confidence: 0.3,
          notes: ['Fallback to broad category']
        };
      }
    }
    
    // Ultimate fallback
    return {
      category_path: ['Other'],
      category_slug: 'other',
      mapping_status: 'unmapped',
      confidence: 0,
      notes: ['No mapping found - using fallback']
    };
  }
  
  /**
   * Add unmapped category to review queue
   */
  private async addToUnmappedQueue(
    context: MappingContext, 
    lastAttempt: CategoryMappingResult
  ): Promise<void> {
    const key = `${context.shop}:${context.originalCategory}`;
    
    if (this.unmappedQueue.has(key)) {
      const existing = this.unmappedQueue.get(key)!;
      existing.count++;
      
      // Add product sample if not already present
      if (existing.sample_products.length < 5 && context.productName) {
        const exists = existing.sample_products.some(p => p.name === context.productName);
        if (!exists) {
          existing.sample_products.push({
            name: context.productName,
            brand: context.brandName
          });
        }
      }
    } else {
      const unmapped: UnmappedCategory = {
        shop: context.shop,
        original_category: context.originalCategory,
        sample_products: context.productName ? [{
          name: context.productName,
          brand: context.brandName
        }] : [],
        count: 1,
        first_seen: new Date().toISOString(),
        suggestions: [lastAttempt]
      };
      
      this.unmappedQueue.set(key, unmapped);
    }
  }
  
  /**
   * Build index of all category paths for fast lookups
   */
  private buildCategoryPathIndex(): void {
    if (!this.canonicalConfig) return;
    
    const buildPaths = (
      hierarchy: CategoryHierarchy, 
      currentPath: string[] = []
    ): void => {
      for (const [name, config] of Object.entries(hierarchy)) {
        const path = [...currentPath, name];
        this.categoryPaths.set(name.toLowerCase(), path);
        this.categoryPaths.set(config.slug, path);
        
        if (config.subcategories) {
          if (Array.isArray(config.subcategories)) {
            // Leaf nodes
            for (const subcat of config.subcategories) {
              const subPath = [...path, subcat.name];
              this.categoryPaths.set(subcat.name.toLowerCase(), subPath);
              this.categoryPaths.set(subcat.slug, subPath);
            }
          } else {
            // Nested hierarchy
            buildPaths(config.subcategories as any, path);
          }
        }
      }
    };
    
    buildPaths(this.canonicalConfig.categories);
  }
  
  /**
   * Get all category text representations for fuzzy matching
   */
  private getAllCategoryTexts(): Map<string, string[]> {
    const categoryTexts = new Map<string, string[]>();
    
    for (const [text, path] of this.categoryPaths.entries()) {
      categoryTexts.set(text, path);
    }
    
    return categoryTexts;
  }
  
  /**
   * Find category path for a canonical term
   */
  private findCategoryPath(canonicalTerm: string): string[] | null {
    return this.categoryPaths.get(canonicalTerm.toLowerCase()) || null;
  }
  
  /**
   * Generate category slug from path
   */
  private generateCategorySlug(categoryPath: string[]): string {
    return categoryPath
      .map(segment => segment
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      )
      .join('/');
  }
  
  /**
   * Load shop-specific mapping rules
   */
  private async loadShopRules(): Promise<void> {
    const shopsDir = config.paths.shops;
    
    try {
      const files = await fs.readdir(shopsDir);
      
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const shop = file.replace(/\.(yaml|yml)$/, '') as StoreId;
          const filePath = path.join(shopsDir, file);
          
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const rules = YAML.parse(content) as CategoryRule[];
            this.shopRules.set(shop, rules);
          } catch (error) {
            console.warn(`Failed to load rules for shop ${shop}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load shop rules directory:', error);
    }
  }
  
  /**
   * Add a new mapping rule (for learning mode)
   */
  async addMappingRule(rule: Omit<CategoryRule, 'id' | 'created_at' | 'usage_count'>): Promise<void> {
    const newRule: CategoryRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      usage_count: 0
    };
    
    const shopRules = this.shopRules.get(rule.shop) || [];
    shopRules.unshift(newRule); // Add to beginning for priority
    this.shopRules.set(rule.shop, shopRules);
    
    // Persist the rule to file
    await this.saveShopRules(rule.shop);
  }
  
  /**
   * Save shop rules to file
   */
  private async saveShopRules(shop: StoreId): Promise<void> {
    const rules = this.shopRules.get(shop) || [];
    const filePath = path.join(config.paths.shops, `${shop}.yaml`);
    
    try {
      await fs.writeFile(filePath, YAML.stringify(rules), 'utf-8');
    } catch (error) {
      console.error(`Failed to save rules for shop ${shop}:`, error);
    }
  }
  
  /**
   * Get unmapped categories for admin review
   */
  getUnmappedQueue(): UnmappedCategory[] {
    return Array.from(this.unmappedQueue.values())
      .sort((a, b) => b.count - a.count); // Sort by frequency
  }
  
  /**
   * Clear unmapped queue entry after manual mapping
   */
  clearUnmappedEntry(shop: StoreId, originalCategory: string): void {
    const key = `${shop}:${originalCategory}`;
    this.unmappedQueue.delete(key);
  }
}
