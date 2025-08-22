import { SearchParams } from '@/types/search';

export function searchParamsToUrl(params: SearchParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.stores?.length) searchParams.set('stores', params.stores.join(','));
  if (params.cat) searchParams.set('cat', params.cat);
  if (params.min !== undefined) searchParams.set('min', params.min.toString());
  if (params.max !== undefined) searchParams.set('max', params.max.toString());
  if (params.promo) searchParams.set('promo', 'true');
  if (params.inStock) searchParams.set('inStock', 'true');
  if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
  if (params.sort && params.sort !== 'relevance') searchParams.set('sort', params.sort);
  if (params.page && params.page > 1) searchParams.set('page', params.page.toString());

  return searchParams.toString();
}

export function urlToSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: SearchParams = {};
  
  const q = searchParams.get('q');
  if (q) params.q = q;

  const stores = searchParams.get('stores');
  if (stores) params.stores = stores.split(',');

  const cat = searchParams.get('cat');
  if (cat) params.cat = cat;

  const min = searchParams.get('min');
  if (min) params.min = parseFloat(min);

  const max = searchParams.get('max');
  if (max) params.max = parseFloat(max);

  const promo = searchParams.get('promo');
  if (promo === 'true') params.promo = true;

  const inStock = searchParams.get('inStock');
  if (inStock === 'true') params.inStock = true;

  const tags = searchParams.get('tags');
  if (tags) params.tags = tags.split(',');

  const sort = searchParams.get('sort');
  if (sort) params.sort = sort as SearchParams['sort'];

  const page = searchParams.get('page');
  if (page) params.page = parseInt(page);

  return params;
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} RON`;
}

export function formatCategoryPath(path: string[]): string {
  return path.join(' › ');
}

export function getBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    'eco': 'ECO',
    'gluten_free': 'Fără gluten',
    'made_in_ro': 'Made in RO',
    'congelat': 'Congelat'
  };
  return labels[badge] || badge;
}

export function getStoreLabel(storeId: string): string {
  const labels: Record<string, string> = {
    'kaufland': 'Kaufland',
    'carrefour': 'Carrefour',
    'mega': 'Mega Image',
    'auchan': 'Auchan',
    'freshful': 'Freshful'
  };
  return labels[storeId] || storeId;
}