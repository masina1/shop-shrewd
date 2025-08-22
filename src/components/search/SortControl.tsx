import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortControlProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultsCount: number;
}

export function SortControl({ sortBy, onSortChange, resultsCount }: SortControlProps) {
  const sortOptions = [
    { value: 'relevance', label: 'Best Match' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'promo_desc', label: 'Highest Discount' },
    { value: 'newest', label: 'Newest First' }
  ];

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Best Match';

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {resultsCount.toLocaleString()} products
      </div>
      
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          <SelectValue>{currentSortLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}