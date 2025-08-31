/**
 * Data loader for vendor feeds
 */
import { RawVendorProduct, StoreId } from '@/types/product';
import { normalizeLidlProduct } from './normalization/lidlNormalizer';
import { normalizeAuchanProduct } from './normalization/auchanNormalizer';
import { normalizeCarrefourProduct } from './normalization/carrefourNormalizer';
import { normalizeMegaProduct } from './normalization/megaNormalizer';
import { normalizeFreshfulProduct } from './normalization/freshfulNormalizer';

/**
 * Load vendor data from local files or remote URLs
 * Supports multiple files per store (categorized data)
 */
export async function loadVendorData(): Promise<Map<StoreId, RawVendorProduct[]>> {
  const stores: StoreId[] = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'];
  const data = new Map<StoreId, RawVendorProduct[]>();
  
  for (const store of stores) {
    try {
      const storeData = await loadStoreDataFiles(store);
      data.set(store, storeData);
      console.log(`✅ Loaded ${storeData.length} products from ${store}`);
    } catch (error) {
      console.warn(`⚠️ Failed to load data from ${store}:`, error);
      data.set(store, []); // Set empty array on failure
    }
  }
  
  return data;
}

/**
 * Load all data files for a specific store
 * Handles multiple categorized files per store
 */
async function loadStoreDataFiles(store: StoreId): Promise<RawVendorProduct[]> {
  const allProducts: RawVendorProduct[] = [];
  
  try {
    // First try to load single file (for backwards compatibility)
    const singleFileData = await loadSingleStoreFile(store);
    if (singleFileData.length > 0) {
      return singleFileData;
    }
  } catch (error) {
    console.log(`No single file for ${store}, trying multiple files...`);
  }
  
  try {
    // Try to load multiple files from store directory
    const multiFileData = await loadMultipleStoreFiles(store);
    return multiFileData;
  } catch (error) {
    console.warn(`Failed to load any data for ${store}:`, error);
    return [];
  }
}

/**
 * Load data from a single store file (backwards compatibility)
 */
async function loadSingleStoreFile(store: StoreId): Promise<RawVendorProduct[]> {
  const feedUrl = getFeedUrl(store);
  
  if (!feedUrl) {
    return [];
  }
  
  const response = await fetch(feedUrl);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!Array.isArray(data)) {
    throw new Error('Feed data is not an array');
  }
  
  return data;
}

/**
 * Load data from multiple categorized files per store
 */
async function loadMultipleStoreFiles(store: StoreId): Promise<RawVendorProduct[]> {
  const allProducts: RawVendorProduct[] = [];
  
  // Try to get file list from a manifest or discovery endpoint
  const storeFiles = await discoverStoreFiles(store);
  
  for (const fileName of storeFiles) {
    try {
      const fileUrl = `/data/dev/${store}/${fileName}`;
      const response = await fetch(fileUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Add category information extracted from filename
          const category = extractCategoryFromFilename(fileName);
          
          // Debug specific file
          if (fileName.includes('faina-zahar')) {
            console.log(`🔧 Category Debug: "${fileName}" → extracted: "${category}"`);
          }
          
          let normalizedProducts: RawVendorProduct[];
          
          // Apply store-specific normalizers
          if (store === 'lidl') {
            normalizedProducts = data.map(product => {
              const normalized = normalizeLidlProduct(product);
              return {
                ...normalized,
                category: category, // Override category from filename
                _sourceFile: fileName,
                _extractedCategory: category
              };
            });
          } else if (store === 'auchan') {
            normalizedProducts = data
              .map(product => normalizeAuchanProduct(product))
              .filter(product => product !== null) // Remove out-of-stock products
              .map(product => ({
                ...product!,
                category: category, // Override category from filename
                _sourceFile: fileName,
                _extractedCategory: category
              }));
          } else if (store === 'carrefour') {
            normalizedProducts = data
              .map(product => normalizeCarrefourProduct(product))
              .filter(product => product !== null) // Remove out-of-stock products
              .map(product => ({
                ...product!,
                category: category, // Override category from filename
                _sourceFile: fileName,
                _extractedCategory: category
              }));
          } else if (store === 'mega') {
            normalizedProducts = data
              .map(product => normalizeMegaProduct(product))
              .filter(product => product !== null) // Remove products without prices
              .map(product => ({
                ...product!,
                category: category, // Override category from filename
                _sourceFile: fileName,
                _extractedCategory: category
              }));
          } else if (store === 'freshful') {
            normalizedProducts = data
              .map(product => normalizeFreshfulProduct(product))
              .filter(product => product !== null) // Remove products without prices
              .map(product => ({
                ...product!,
                category: category, // Override category from filename
                _sourceFile: fileName,
                _extractedCategory: category
              }));
          } else {
            // Use standard format for other stores (Kaufland)
            normalizedProducts = data.map(product => ({
              ...product,
              _sourceFile: fileName,
              _extractedCategory: category
            }));
          }
          
          allProducts.push(...normalizedProducts);
          console.log(`📁 Loaded ${data.length} products from ${store}/${fileName}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${store}/${fileName}:`, error);
    }
  }
  
  return allProducts;
}

/**
 * Discover available files for a store
 * Auto-discover files from the actual directory structure
 */
async function discoverStoreFiles(store: StoreId): Promise<string[]> {
  // Real filenames based on your actual data structure
  const storeFiles: Record<StoreId, string[]> = {
    lidl: [
      'alimente-si-bauturi-filtered-100pct-2025-08-27T14-38-58-867Z.json',
      'bebelusi--copii-si-jucarii-2025-08-27T14-42-17-981Z.json',
      'bricolaj-si-gradina2025-08-27T14-39-45-262Z.json',
      'bucatarie-si-gospodarie-filtered-86pct-2025-08-27T14-39-23-363Z.json',
      'locuinta-si-amenajare-2025-08-27T14-40-12-171Z.json',
      'moda-si-accesorii-2025-08-27T14-40-32-651Z.json'
    ],
    auchan: [
      'articole-si-produse-pentru-bebelusi-si-nou-nascuti---auchan-ro---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-26T18-55-45-610Z.json',
      'bacanie---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-25T18-10-16-492Z.json',
      'bauturi--apa--sucuri--bere--whisky--si-tutun---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-25T19-15-46-826Z.json',
      'brutarie--cofetarie--gastro---gama-variata-pe-auchan-ro---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-25T21-18-26-676Z.json',
      'casa-si-curatenie---gama-diversa---auchan-online---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-26T17-34-01-117Z.json',
      'congelate---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-25T20-22-49-275Z.json',
      'fructe-si-legume-proaspete---auchan-ro---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-25T20-04-04-621Z.json',
      'ingrijire-personala-si-cosmetice--auchan-online---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-26T18-27-14-379Z.json',
      'lactate--carne--mezeluri---peste---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-25T16-29-58-966Z.json',
      'pet-shop---magazin-pentru-animale---auchan-ro---auchan-ro---prospetime-si-calitate-pentru-familia-ta-2025-08-26T19-09-19-894Z.json'
    ],
    carrefour: [
      'articole-si-produse-pentru-bebelusi---carrefour---carrefour-romania-2025-08-27T06-57-54-880Z.json',
      'bacanie---lichide---carrefour-romania-2025-08-25T14-59-24-883Z.json',
      'casa--gradina---petshop---carrefour-romania-2025-08-27T09-31-56-612Z.json'
    ],
    kaufland: [],
    mega: [
      'animale-de-companie-2025-08-26T16-26-06-273Z.json',
      'apa-si-sucuri-2025-08-25T20-54-24-066Z.json',
      'bauturi-2025-08-25T21-02-14-048Z.json',
      'bun-la-pret-2025-08-25T20-28-53-758Z.json',
      'cosmetice-si-ingrijire-personala-2025-08-26T16-19-45-503Z.json',
      'curatenie-si-nealimentare-2025-08-26T16-24-35-425Z.json',
      'dulciuri-si-snacks-2025-08-25T20-47-03-248Z.json',
      'equilibrium-2025-08-25T21-46-17-156Z.json',
      'equilibrium-2025-08-25T21-46-39-623Z.json',
      'fructe-si-legume-proaspete-comanda-online-de-la-mega-image-2025-08-25T20-32-31-978Z.json',
      'ingrediente-culinare-2025-08-25T20-52-42-136Z.json',
      'lactate-si-oua-livrare-acasa-de-la-mega-image-2025-08-25T20-34-11-013Z.json',
      'mama-si-ingrijire-copil-2025-08-26T16-13-26-265Z.json',
      'mega-gustul-bun-de-luat-acasa-2025-08-25T20-31-21-573Z.json',
      'mezeluri--carne-si-ready-meal-2025-08-25T20-36-43-981Z.json',
      'paine--cafea--cereale-si-mic-dejun-2025-08-25T20-41-32-787Z.json',
      'produse-congelate-2025-08-25T20-38-12-055Z.json',
      'promotii-2025-08-26T16-47-37-697Z.json'
    ],
    freshful: [
      'accesorii-itc-gama-variata----freshful-ro-2025-08-27T10-40-36-220Z.json',
      'alimente-bebe-gama-variata----freshful-ro-2025-08-27T09-56-21-993Z.json',
      'alte-carnuri-gama-variata----freshful-ro-2025-08-27T08-19-41-242Z.json',
      'amestecuri-lactate-si-grasimi-vegetale-gama-variata----freshful-ro-2025-08-27T08-32-21-656Z.json',
      'apa-gama-variata----freshful-ro-2025-08-27T08-46-30-023Z.json',
      'articole-de-menaj-gama-variata----freshful-ro-2025-08-27T10-36-24-078Z.json',
      'barbierit-si-ingrijire-ten-gama-variata----freshful-ro-2025-08-27T09-42-43-570Z.json',
      'bauturi-carbogazoase-gama-variata----freshful-ro-2025-08-27T08-47-29-555Z.json',
      'bauturi-creme-si-grasimi-vegetale-gama-variata----freshful-ro-2025-08-27T08-37-56-145Z.json',
      'bauturi-necarbogazoase-si-siropuri-gama-variata----freshful-ro-2025-08-27T08-42-54-618Z.json',
      'bauturi-spirtoase-gama-variata----freshful-ro-filtered-100pct-2025-08-27T08-54-21-877Z.json',
      'bere-gama-variata----freshful-ro-2025-08-27T08-48-46-609Z.json',
      'birotica-si-papetarie-gama-variata----freshful-ro-2025-08-27T10-39-11-822Z.json',
      'biscuiti-napolitane-si-prajituri-gama-variata----freshful-ro-filtered-100pct-2025-08-27T09-14-19-319Z.json',
      'bomboane-si-ciocolata-gama-variata----freshful-ro-2025-08-27T09-31-21-826Z.json',
      'branzeturi-gama-variata----freshful-ro-2025-08-27T08-31-13-554Z.json',
      'bricolaj-si-auto-gama-variata----freshful-ro-2025-08-27T10-17-12-767Z.json',
      'cafea-si-ceai-gama-variata----freshful-ro-2025-08-27T09-29-49-574Z.json',
      'caini-gama-variata----freshful-ro-filtered-100pct-2025-08-27T10-43-38-843Z.json',
      'carne-de-pasare-gama-variata----freshful-ro-2025-08-27T08-19-21-882Z.json',
      'carne-de-porc-gama-variata----freshful-ro-2025-08-27T08-18-38-904Z.json',
      'carne-de-vita-si-oaie-gama-variata----freshful-ro-2025-08-27T08-18-12-024Z.json',
      'carne-si-peste-congelate-gama-variata----freshful-ro-2025-08-27T08-39-38-109Z.json',
      'carne-si-specialitati-vegetale-gama-variata----freshful-ro-2025-08-27T08-36-29-507Z.json',
      'ceara-benzi-si-creme-depilatoare-gama-variata----freshful-ro-2025-08-27T09-45-10-775Z.json',
      'cereale-si-mic-dejun-gama-variata----freshful-ro-2025-08-27T09-28-01-904Z.json',
      'condimente-si-sosuri-gama-variata----freshful-ro-2025-08-27T09-00-21-285Z.json',
      'conserve-gama-variata----freshful-ro-2025-08-27T08-58-24-586Z.json',
      'curatenie-si-intretinerea-casei-gama-variata----freshful-ro-2025-08-27T10-02-05-792Z.json',
      'demachiante-si-creme-gama-variata----freshful-ro-2025-08-27T09-44-05-771Z.json',
      'deodorante-si-parfumuri-gama-variata----freshful-ro-2025-08-27T09-40-43-410Z.json',
      'dermatocosmetice-si-parafarmacie-gama-variata----freshful-ro-2025-08-27T09-53-33-665Z.json',
      'deronatait-gama-variata----freshful-ro-filtered-100pct-2025-08-27T09-01-57-452Z.json',
      'electrocasnice-mici-gama-variata----freshful-ro-2025-08-27T10-41-09-748Z.json',
      'faina-zahar-si-produse-gourmet-gama-variata----freshful-ro-filtered-100pct-2025-08-27T09-03-12-314Z.json',
      'fructe-proaspete-gama-variata----freshful-ro-2025-08-27T08-22-37-496Z.json',
      'fructe-si-legume-uscate-gama-variata----freshful-ro-2025-08-27T08-25-01-930Z.json',
      'gradina-gama-variata----freshful-ro-2025-08-27T10-17-51-372Z.json',
      'hartie-igienica-servetele-si-prosoape-gama-variata----freshful-ro-2025-08-27T10-14-40-520Z.json',
      'iaurt-desert-si-sana-gama-variata----freshful-ro-2025-08-27T08-29-12-766Z.json',
      'icre-si-salate-de-icre-gama-variata----freshful-ro-2025-08-27T08-21-42-991Z.json',
      'igiena-bebe-gama-variata----freshful-ro-filtered-100pct-2025-08-27T09-57-19-432Z.json',
      'igiena-dentara-gama-variata----freshful-ro-2025-08-27T09-51-03-884Z.json',
      'igiena-intima-gama-variata----freshful-ro-2025-08-27T09-49-53-171Z.json',
      'inghetata-si-deserturi-congelate-gama-variata----freshful-ro-filtered-100pct-2025-08-27T08-39-20-511Z.json',
      'ingrijirea-parului-gama-variata----freshful-ro-2025-08-27T09-47-54-564Z.json',
      'jucarii-gama-variata----freshful-ro-2025-08-27T10-40-16-907Z.json',
      'lactate-uht-gama-variata----freshful-ro-2025-08-27T08-27-43-008Z.json',
      'lapte-si-lactate-eco-gama-variata----freshful-ro-2025-08-27T08-32-10-725Z.json',
      'lapte-smantana-si-branza-proaspata--gama-variata----freshful-ro-filtered-99pct-2025-08-27T08-27-03-785Z.json',
      'legume-proaspete-gama-variata----freshful-ro-2025-08-27T08-23-29-922Z.json',
      'legume-si-fructe-congelate-gama-variata----freshful-ro-2025-08-27T08-40-38-244Z.json',
      'mezeluri-feliate-gama-variata----freshful-ro-2025-08-27T08-34-59-890Z.json',
      'mezeluri-gama-variata----freshful-ro-2025-08-27T08-33-56-625Z.json',
      'mici-si-specialitati-gama-variata----freshful-ro-2025-08-27T08-20-29-884Z.json',
      'ou-gama-variata----freshful-ro-2025-08-27T08-29-24-973Z.json',
      'paine-gama-variata----freshful-ro-2025-08-27T08-15-09-477Z.json',
      'pasari-si-rozatoare-gama-variata----freshful-ro-2025-08-27T10-43-56-248Z.json',
      'paste-orez-si-legume-uscate-gama-variata----freshful-ro-2025-08-27T08-56-30-964Z.json',
      'paste-proaspete-gama-variata----freshful-ro-filtered-97pct-2025-08-27T08-35-20-055Z.json',
      'patiserie-gama-variata----freshful-ro-2025-08-27T08-17-25-552Z.json',
      'peste-afumat-gama-variata----freshful-ro-2025-08-27T08-21-23-050Z.json',
      'peste-si-sushi-gama-variata----freshful-ro-2025-08-27T08-21-13-282Z.json',
      'pisici-gama-variata----freshful-ro-filtered-100pct-2025-08-27T10-42-33-695Z.json',
      'pizza-si-aluat-gama-variata----freshful-ro-2025-08-27T08-35-11-943Z.json',
      'produse-dietetice-si-naturiste-gama-variata----freshful-ro-2025-08-27T09-37-17-946Z.json',
      'produse-ecologice-gama-variata----freshful-ro-2025-08-27T09-35-15-609Z.json',
      'produse-internationale-gama-variata----freshful-ro-2025-08-27T09-39-28-833Z.json',
      'puericultura-gama-variata----freshful-ro-2025-08-27T09-58-02-360Z.json',
      'ready-meals-gama-variata----freshful-ro-2025-08-27T08-36-00-520Z.json',
      'repelent-gama-variata----freshful-ro-2025-08-27T09-53-44-597Z.json',
      'sapunuri-si-geluri-de-dus-gama-variata----freshful-ro-2025-08-27T09-53-06-261Z.json',
      'semipreparate-congelate-gama-variata----freshful-ro-2025-08-27T08-41-31-997Z.json',
      'spalare-si-intretinere-rufe-gama-variata----freshful-ro-2025-08-27T09-59-26-145Z.json',
      'specialitati-de-peste-gama-variata----freshful-ro-2025-08-27T08-21-50-727Z.json',
      'sucuri-naturale-gama-variata----freshful-ro-2025-08-27T08-26-07-521Z.json',
      'suplimente-alimentare-gama-variata----freshful-ro-2025-08-27T09-37-54-229Z.json',
      'textile-si-accesorii-gama-variata----freshful-ro-2025-08-27T10-40-56-491Z.json',
      'tutun-gama-variata----freshful-ro-2025-08-27T08-55-39-207Z.json',
      'ulei-si-otet-gama-variata----freshful-ro-2025-08-27T09-00-56-568Z.json',
      'unt-gama-variata----freshful-ro-2025-08-27T08-27-29-973Z.json',
      'verdeturi-si-ierburi-aromatice-gama-variata----freshful-ro-2025-08-27T08-24-11-743Z.json',
      'vinuri-gama-variata----freshful-ro-2025-08-27T08-52-25-848Z.json'
    ]
  };
  
  return storeFiles[store] || [];
}

/**
 * Extract category information from filename
 */
function extractCategoryFromFilename(filename: string): string {
  // Remove timestamp and extensions
  let category = filename
    .replace(/-\d{4}-\d{2}-\d{2}T[\d-]+Z\.json$/, '')
    .replace(/\.json$/, '')
    .replace(/-gama-variata----freshful-ro/, '') // Remove Freshful specific patterns
    .replace(/----freshful-ro/, '')
    .replace(/---carrefour-romania/, '') // Remove Carrefour specific patterns
    .replace(/---carrefour/, '')
    .replace(/---auchan-ro---prospetime-si-calitate-pentru-familia-ta/, '') // Remove Auchan specific patterns  
    .replace(/---auchan-ro/, '')
    .replace(/-filtered-\d+pct/, '') // Remove filtered percentage patterns
    .replace(/^(.+?)(?:-gama)?$/, '$1'); // Remove trailing -gama
  
  // Debug for specific problematic file
  if (filename.includes('faina-zahar')) {
    console.log(`🔧 Cleaning Debug: "${filename}" → cleaned: "${category}"`);
  }
  
  // Map filename patterns to categories
  const categoryMappings: Record<string, string> = {
    // Lidl patterns
    'alimente-si-bauturi': 'Băcănie',
    'bebelusi-copii-si-jucarii': 'Copii & Bebeluși',
    'bricolaj-si-gradina': 'Casa & Grădină',
    'bucatarie-si-gospodarie': 'Casa & Grădină',
    'locuinta-si-amenajare': 'Casa & Grădină',
    'moda-si-accesorii': 'Modă & Accesorii',
    
    // Auchan patterns
    'bacanie': 'Băcănie',
    'bauturi': 'Băuturi',
    'lactate--carne--mezeluri': 'Lactate & Carne',
    'fructe-si-legume': 'Fructe & Legume',
    'congelate': 'Produse Congelate',
    'brutarie--cofetarie': 'Brutărie & Cofetărie',
    'ingrijire-personala': 'Îngrijire Personală',
    'casa-si-curatenie': 'Casa & Grădină',
    'pet-shop': 'Pet Shop',
    'articole-si-produse-pentru-bebelusi': 'Copii & Bebeluși',
    'articole-si-produse-pentru-bebelusi-si-nou-nascuti': 'Copii & Bebeluși',
    'bauturi--apa--sucuri--bere--whisky--si-tutun': 'Băuturi',
    
    // Carrefour patterns
    'casa--gradina---petshop': 'Casa & Grădină',
    'bacanie---lichide': 'Băcănie',
    'lichide': 'Băuturi',
    
    // Mega patterns
    'apa-si-sucuri': 'Băuturi',
    'lactate-si-oua': 'Lactate & Ouă',
    'mezeluri--carne': 'Carne & Mezeluri',
    'fructe-si-legume': 'Fructe & Legume',
    'dulciuri-si-snacks': 'Dulciuri & Snacks',
    'paine--cafea--cereale': 'Brutărie & Cereale',
    'ingrediente-culinare': 'Băcănie',
    'cosmetice-si-ingrijire': 'Cosmetice & Îngrijire',
    'curatenie-si-nealimentare': 'Curățenie',
    'mama-si-ingrijire-copil': 'Copii & Bebeluși',
    'animale-de-companie': 'Pet Shop',
    // 'promotii': Skip - mixed category promotional file, let content categorization work
    'equilibrium': 'Bio & Sănătate',
    // 'bun-la-pret': Skip - mixed category promotional file, let content categorization work
    
    // Freshful patterns (very detailed!)
    'apa': 'Băuturi',
    'accesorii-itc': 'Electronice & IT',
    'alimente-bebe': 'Copii & Bebeluși',
    'alte-carnuri': 'Carne & Mezeluri',
    'amestecuri-lactate': 'Lactate & Brânzeturi',
    'bauturi-carbogazoase': 'Băuturi',
    'bauturi-necarbogazoase': 'Băuturi',
    'bauturi-creme': 'Băuturi',
    'bauturi-spirtoase': 'Băuturi Alcoolice',
    'bere': 'Băuturi Alcoolice',
    'vinuri': 'Băuturi Alcoolice',
    'sucuri-naturale': 'Băuturi',
    'branzeturi': 'Lactate & Brânzeturi',
    'branzeturi-gama': 'Lactate & Brânzeturi',
    'iaurt-desert': 'Lactate & Iaurt',
    'lapte-smantana': 'Lactate & Lapte',
    'lactate-uht': 'Lactate & Lapte',
    'unt': 'Lactate & Unt',
    'unt-gama': 'Lactate & Unt',
    // NOTE: 'ou' pattern removed because it matches 'produse', 'gourmet', etc.
    'ou-gama': 'Ouă',
    'ou': 'Ouă', // Freshful egg pattern
    'oua': 'Ouă', // Add specific egg patterns only
    'carne-de-pasare': 'Carne & Păsări',
    'carne-de-porc': 'Carne & Porc',
    'carne-de-vita': 'Carne & Vită',
    'mezeluri': 'Mezeluri',
    'mezeluri-gama': 'Mezeluri',
    'mezeluri-feliate': 'Mezeluri',
    'peste-afumat': 'Pește & Fructe de Mare',
    'peste-si-sushi': 'Pește & Fructe de Mare',
    'icre-si-salate': 'Pește & Fructe de Mare',
    'fructe-proaspete': 'Fructe & Legume',
    'legume-proaspete': 'Fructe & Legume',
    'verdeturi-si-ierburi': 'Fructe & Legume',
    'fructe-si-legume-uscate': 'Fructe & Legume',
    'paine': 'Brutărie & Patiserie',
    'paine-gama': 'Brutărie & Patiserie',
    'patiserie': 'Brutărie & Patiserie', 
    'patiserie-gama': 'Brutărie & Patiserie',
    'biscuiti-napolitane': 'Dulciuri & Biscuiți',
    'bomboane-si-ciocolata': 'Dulciuri & Ciocolată',
    'cereale-si-mic-dejun': 'Cereale & Mic Dejun',
    'cafea-si-ceai': 'Cafea & Ceai',
    'condimente-si-sosuri': 'Condimente & Sosuri',
    'conserve': 'Conserve',
    'conserve-gama': 'Conserve',
    'paste-orez': 'Paste & Orez',
    'faina-zahar': 'Băcănie',
    'faina-zahar-si-produse-gourmet': 'Băcănie',
    'produse-gourmet': 'Băcănie', // Additional pattern for gourmet products
    'ulei-si-otet': 'Ulei & Oțet',
    'produse-congelate': 'Produse Congelate',
    'inghetata-si-deserturi': 'Înghețată & Deserturi',
    'curatenie-si-intretinerea': 'Curățenie',
    'spalare-si-intretinere-rufe': 'Curățenie',
    'hartie-igienica': 'Igienă & Curățenie',
    'sapunuri-si-geluri': 'Igienă Personală',
    'igiena-dentara': 'Igienă Dentară',
    'igiena-intima': 'Igienă Intimă',
    'barbierit-si-ingrijire-ten': 'Îngrijire Personală',
    'demachiante-si-creme': 'Cosmetice',
    'deodorante-si-parfumuri': 'Parfumuri',
    'ingrijirea-parului': 'Îngrijire Păr',
    'dermatocosmetice': 'Dermatocosmetice',
    'alimente-bebe': 'Copii & Bebeluși',
    'igiena-bebe': 'Copii & Bebeluși',
    'puericultura-gama': 'Copii & Bebeluși',
    'jucarii-gama': 'Jucării',
    'caini': 'Pet Shop',
    'caini-gama': 'Pet Shop',
    'pisici': 'Pet Shop',
    'pisici-gama': 'Pet Shop',
    'pasari-si-rozatoare': 'Pet Shop',
    'produse-dietetice': 'Sănătate & Wellness',
    'produse-ecologice': 'Bio & Eco',
    'suplimente-alimentare': 'Suplimente',
    'tutun': 'Tutun',
    'tutun-gama': 'Tutun',
    'electrocasnice-mici': 'Electrocasnice',
    'birotica-si-papetarie': 'Birotică',
    'textile-si-accesorii': 'Textile',
    'bricolaj-si-auto': 'Bricolaj & Auto',
    'gradina': 'Grădină',
    'gradina-gama': 'Grădină',
    'articole-de-menaj': 'Articole de Menaj',
    
    // Missing patterns from console warnings
    'mega-gustul-bun-de-luat-acasa': 'Oferte Speciale',
    'carne-si-specialitati-vegetale': 'Carne & Mezeluri',
    'ceara-benzi-si-creme-depilatoare': 'Cosmetice',
    'deronatait': 'Băcănie',
    'jucarii': 'Jucării',
    'lapte-si-lactate-eco': 'Lactate & Lapte',
    'mici-si-specialitati': 'Carne & Mezeluri',
    'paste-proaspete': 'Paste & Orez',
    'pizza-si-aluat': 'Produse Congelate',
    'produse-internationale': 'Băcănie',
    'puericultura': 'Copii & Bebeluși',
    'ready-meals': 'Produse Congelate',
    'repelent': 'Cosmetice',
    'specialitati-de-peste': 'Pește & Fructe de Mare',
    'bebelusi--copii-si-jucarii': 'Copii & Bebeluși'
  };
  
  // Find best match
  for (const [pattern, mappedCategory] of Object.entries(categoryMappings)) {
    if (category.includes(pattern)) {
      if (filename.includes('faina-zahar')) {
        console.log(`🎯 Match found: "${category}" contains "${pattern}" → "${mappedCategory}"`);
      }
      return mappedCategory;
    }
  }
  
  // Debug logging for unmapped categories
  if (filename.includes('faina-zahar')) {
    console.log(`❌ No match found for: "${category}" → defaulting to "Other"`);
  }
  console.log(`⚠️  Unmapped category: "${filename}" → "${category}"`);
  
  return 'Other';
}

/**
 * Get feed URL for a store based on environment variables
 */
function getFeedUrl(store: StoreId): string | undefined {
  const envKey = `VITE_FEED_${store.toUpperCase()}`;
  const envValue = import.meta.env[envKey];
  
  if (!envValue) {
    // Fallback to local dev files
    return `/data/dev/${store}.json`;
  }
  
  // Handle relative paths for local development
  if (envValue.startsWith('/')) {
    return envValue;
  }
  
  // Return absolute URLs as-is
  return envValue;
}

/**
 * Get app configuration from environment variables
 */
export function getAppConfig() {
  return {
    appEnv: import.meta.env.VITE_APP_ENV || 'development',
    stage: import.meta.env.VITE_STAGE || 'development',
    imageMode: import.meta.env.VITE_IMAGE_MODE || 'hotlink',
    distanceFlag: import.meta.env.VITE_FEATURE_DISTANCE_FLAG === 'true',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    mapsApiKey: import.meta.env.VITE_MAPS_API_KEY
  };
}

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  return getAppConfig().appEnv === 'development';
}

/**
 * Load all products from master index files for search
 * This is more efficient than loading category shards separately
 */
export async function loadAllProducts(): Promise<any[]> {
  try {
    console.log('📂 Loading all products from master index files...');

    const shops = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'];
    let allProducts: any[] = [];
    let successfulShops = 0;
    let failedShops = 0;

    for (const shop of shops) {
      try {
        // Try public path first (for browser access)
        let masterIndexPath = `/out/${shop}-final/products.index.jsonl`;
        
        console.log(`🔍 Checking ${shop} at: ${masterIndexPath}`);
        
        // Check if the shop has been processed
        let response: Response;
        try {
          response = await fetch(masterIndexPath);
          if (!response.ok) {
            console.log(`⚠️ Shop ${shop} not accessible at public path: ${response.status} ${response.statusText}`);
            // Try alternative path as fallback
            masterIndexPath = `./out/${shop}-final/products.index.jsonl`;
            console.log(`🔄 Trying fallback path: ${masterIndexPath}`);
            response = await fetch(masterIndexPath);
            if (!response.ok) {
              console.log(`⚠️ Shop ${shop} not accessible at fallback path either: ${response.status} ${response.statusText}`);
              failedShops++;
              continue;
            }
          }
        } catch (error) {
          console.log(`⚠️ Shop ${shop} network error:`, error);
          failedShops++;
          continue;
        }

        // Load master index file
        if (response.ok) {
          const text = await response.text();
          console.log(`📄 Raw text length for ${shop}: ${text.length} characters`);
        
        // Debug first few characters
        console.log(`📝 First 100 chars for ${shop}:`, text.substring(0, 100));
          
          // Check if file is empty or contains HTML
          if (text.trim().length === 0) {
            console.log(`⚠️ Shop ${shop} file is empty`);
            failedShops++;
            continue;
          }
          
          if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
            console.log(`⚠️ Shop ${shop} file contains HTML instead of JSON data`);
            failedShops++;
            continue;
          }
          
          const products = text.trim().split('\n')
            .filter(line => line.trim())
            .map(line => {
              try {
                return JSON.parse(line);
              } catch (e) {
                console.warn(`Failed to parse JSON line in ${shop}/products.index.jsonl:`, line);
                return null;
              }
            })
            .filter(Boolean);

          if (products.length > 0) {
            // Add shop ID to each product
            const enrichedProducts = products.map(product => ({
              ...product,
              storeId: shop
            }));

            allProducts.push(...enrichedProducts);
            successfulShops++;
            console.log(`✅ Loaded ${products.length} products from ${shop} master index`);
          } else {
            console.log(`⚠️ No products parsed from ${shop}`);
            failedShops++;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${shop} master index:`, error);
        failedShops++;
      }
    }

    console.log(`📊 Total products loaded: ${allProducts.length} from ${successfulShops} successful shops`);
    console.log(`📊 Failed shops: ${failedShops} (${shops.filter(s => !allProducts.some(p => p.storeId === s)).join(', ')})`);
    
    if (allProducts.length === 0) {
      console.error('❌ No products found! Check if:');
      console.error('   1. Preprocessor has generated output files');
      console.error('   2. Files are copied to public/out/ directory');
      console.error('   3. Browser can access the files at /out/');
      console.error('   4. Check browser console for network errors');
      console.error('   5. Some shops may have empty or corrupted data files');
    }
    
    return allProducts;

  } catch (error) {
    console.error('Error loading master product index:', error);
    return [];
  }
}

/**
 * Load products organized by category (for category-specific views)
 * This is kept for backward compatibility and specific use cases
 */
export async function loadCategoryShards(): Promise<Map<string, any[]>> {
  const categoryShards = new Map<string, any[]>();

  try {
    console.log('📂 Loading normalized category shards from preprocessor output...');

    const shops = ['auchan', 'carrefour', 'kaufland', 'mega', 'freshful', 'lidl'];

    for (const shop of shops) {
      try {
        const shopOutputPath = `./out/${shop}-final`;
        const byCategoryPath = `${shopOutputPath}/by-category`;

        // Check if the shop has been processed
        try {
          const response = await fetch(`${byCategoryPath}/metadata.json`);
          if (!response.ok) {
            console.log(`⚠️ Shop ${shop} not processed yet, skipping...`);
            continue;
          }
        } catch (error) {
          console.log(`⚠️ Shop ${shop} not processed yet, skipping...`);
          continue;
        }

        // Load all category files for this shop
        const categoryFiles = await getCategoryFiles(shop);

        for (const [categorySlug, categoryName] of categoryFiles) {
          try {
            const response = await fetch(`${byCategoryPath}/${categorySlug}.jsonl`);

            if (response.ok) {
              const text = await response.text();
              const products = text.trim().split('\n')
                .filter(line => line.trim())
                .map(line => {
                  try {
                    return JSON.parse(line);
                  } catch (e) {
                    console.warn(`Failed to parse JSON line in ${shop}/${categorySlug}:`, line);
                    return null;
                  }
                })
                .filter(Boolean);

              if (products.length > 0) {
                // Add shop ID to each product
                const enrichedProducts = products.map(product => ({
                  ...product,
                  storeId: shop
                }));

                if (!categoryShards.has(categoryName)) {
                  categoryShards.set(categoryName, []);
                }
                categoryShards.get(categoryName)!.push(...enrichedProducts);

                console.log(`✅ Loaded ${products.length} products from ${shop}/${categoryName}`);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Failed to load ${shop}/${categorySlug}:`, error);
          }
        }

      } catch (error) {
        console.warn(`⚠️ Failed to process shop ${shop}:`, error);
      }
    }

    console.log(`📊 Total categories with products: ${categoryShards.size}`);

    // Log category counts
    for (const [category, products] of categoryShards) {
      console.log(`   ${category}: ${products.length} products`);
    }

    return categoryShards;

  } catch (error) {
    console.error('Error loading category shards:', error);
    return new Map<string, any[]>();
  }
}

/**
 * Get category files for a specific shop
 */
async function getCategoryFiles(shop: string): Promise<Map<string, string>> {
  const categoryMapping = new Map<string, string>([
    // Map category slugs to readable names
    ['pet-shop', 'Pet Shop'],
    ['casa-menaj', 'Casa & Menaj'],
    ['mama-copilul', 'Mama & Copilul'],
    ['alimente', 'Alimente'],
    ['cosmetice-ingrijire', 'Cosmetice & Îngrijire'],
    ['fructe-legume', 'Fructe & Legume'],
    ['inghetata-congelate', 'Înghețată & Congelate'],
    ['detergenti-igienizare', 'Detergenți & Igienizare'],
    ['brutarie-patiserie', 'Brutărie & Patiserie'],
    ['bauturi', 'Băuturi'],
    ['bacanie', 'Băcănie'],
    ['other', 'Altele']
  ]);
  
  return categoryMapping;
}

/**
 * Get placeholder image URL
 */
export function getPlaceholderImage(): string {
  return '/placeholder.svg';
}
