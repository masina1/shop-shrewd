import { SearchResult, SearchParams } from '@/types/search';
import { getStoreLabel } from '@/utils/searchUtils';

interface ResultSummaryProps {
  result: SearchResult;
  searchParams: SearchParams;
}

export function ResultSummary({ result, searchParams }: ResultSummaryProps) {
  const buildSummary = () => {
    const parts: string[] = [];
    
    // Total count
    parts.push(`${result.total.toLocaleString()} products`);
    
    // Filters
    const filters: string[] = [];
    
    if (searchParams.cat) {
      filters.push(searchParams.cat);
    }
    
    if (searchParams.stores?.length) {
      const storeNames = searchParams.stores.map(getStoreLabel);
      if (storeNames.length === 1) {
        filters.push(storeNames[0]);
      } else if (storeNames.length <= 3) {
        filters.push(storeNames.join(' + '));
      } else {
        filters.push(`${storeNames.length} stores`);
      }
    }
    
    if (searchParams.min || searchParams.max) {
      const min = searchParams.min || 0;
      const max = searchParams.max || '∞';
      filters.push(`Price: ${min}–${max} RON`);
    }
    
    if (searchParams.promo) {
      filters.push('Promo');
    }
    
    if (searchParams.inStock) {
      filters.push('In stock');
    }
    
    if (filters.length > 0) {
      parts.push(filters.join(' · '));
    }
    
    return parts.join(' · ');
  };

  return (
    <p className="text-muted-foreground mt-2">
      {buildSummary()}
      {result.page > 1 && ` · Page ${result.page}`}
    </p>
  );
}