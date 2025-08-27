import { SearchParams } from '@/types/search';

export function searchParamsToUrl(params: SearchParams): string {
  const urlParams = new URLSearchParams();
  
  if (params.q) urlParams.set('q', params.q);
  if (params.cat) urlParams.set('cat', params.cat);
  if (params.stores && params.stores.length > 0) {
    urlParams.set('stores', params.stores.join(','));
  }
  if (params.price_min !== undefined) {
    urlParams.set('price_min', params.price_min.toString());
  }
  if (params.price_max !== undefined) {
    urlParams.set('price_max', params.price_max.toString());
  }
  if (params.promo) urlParams.set('promo', 'true');
  if (params.availability && params.availability !== 'all') {
    urlParams.set('availability', params.availability);
  }
  if (params.props && params.props.length > 0) {
    urlParams.set('props', params.props.join(','));
  }
  if (params.sort && params.sort !== 'relevance') {
    urlParams.set('sort', params.sort);
  }
  if (params.page && params.page > 1) {
    urlParams.set('page', params.page.toString());
  }
  if (params.pageSize && params.pageSize !== 24) {
    urlParams.set('pageSize', params.pageSize.toString());
  }

  return urlParams.toString();
}

export function urlToSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: SearchParams = {};
  
  const q = searchParams.get('q');
  if (q) params.q = q;
  
  const cat = searchParams.get('cat');
  if (cat) params.cat = cat;
  
  const stores = searchParams.get('stores');
  if (stores) params.stores = stores.split(',');
  
  const priceMin = searchParams.get('price_min');
  if (priceMin) params.price_min = parseInt(priceMin, 10);
  
  const priceMax = searchParams.get('price_max');
  if (priceMax) params.price_max = parseInt(priceMax, 10);
  
  const promo = searchParams.get('promo');
  if (promo === 'true') params.promo = true;
  
  const availability = searchParams.get('availability');
  if (availability === 'in_stock') params.availability = 'in_stock';
  
  const props = searchParams.get('props');
  if (props) params.props = props.split(',');
  
  const sort = searchParams.get('sort');
  if (sort) params.sort = sort as any;
  
  const page = searchParams.get('page');
  if (page) params.page = parseInt(page, 10);
  
  const pageSize = searchParams.get('pageSize');
  if (pageSize) params.pageSize = parseInt(pageSize, 10);
  
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
    'eco': 'Eco',
    'made_in_ro': 'Made in RO',
    'gluten_free': 'Fără gluten'
  };
  return labels[badge] || badge;
}

export function getStoreLabel(storeId: string): string {
  const labels: Record<string, string> = {
    'kaufland': 'Kaufland',
    'carrefour': 'Carrefour',
    'mega': 'Mega Image',
    'auchan': 'Auchan',
    'freshful': 'Freshful',
    'lidl': 'Lidl'
  };
  return labels[storeId] || storeId;
}

export function getStoreBadgeClass(storeId: string): string {
  const classes: Record<string, string> = {
    'kaufland': 'bg-red-600 text-white',
    'carrefour': 'bg-blue-600 text-white',
    'mega': 'bg-yellow-600 text-white',
    'auchan': 'bg-orange-600 text-white',
    'freshful': 'bg-green-600 text-white',
    'lidl': 'bg-blue-500 text-white'
  };
  return classes[storeId] || 'bg-muted text-muted-foreground';
}