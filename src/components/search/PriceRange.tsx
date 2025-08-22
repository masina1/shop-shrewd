import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PriceRangeProps {
  min?: number;
  max?: number;
  bounds?: { min: number; max: number };
  onChange: (min?: number, max?: number) => void;
}

export function PriceRange({ min, max, bounds, onChange }: PriceRangeProps) {
  const [minValue, setMinValue] = useState(min?.toString() || '');
  const [maxValue, setMaxValue] = useState(max?.toString() || '');

  useEffect(() => {
    setMinValue(min?.toString() || '');
    setMaxValue(max?.toString() || '');
  }, [min, max]);

  const handleApply = () => {
    const minNum = minValue ? parseFloat(minValue) : undefined;
    const maxNum = maxValue ? parseFloat(maxValue) : undefined;
    
    // Validate values
    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      return; // Don't apply invalid range
    }
    
    onChange(minNum, maxNum);
  };

  const handleClear = () => {
    setMinValue('');
    setMaxValue('');
    onChange(undefined, undefined);
  };

  const hasValues = minValue || maxValue;
  const hasChanges = minValue !== (min?.toString() || '') || maxValue !== (max?.toString() || '');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Min RON</label>
          <Input
            type="number"
            placeholder={bounds?.min.toString() || "0"}
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max RON</label>
          <Input
            type="number"
            placeholder={bounds?.max.toString() || "999"}
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {bounds && (
        <p className="text-xs text-muted-foreground">
          Range: {bounds.min.toFixed(2)} - {bounds.max.toFixed(2)} RON
        </p>
      )}

      <div className="flex gap-2">
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1 h-7 text-xs"
          >
            Apply
          </Button>
        )}
        {hasValues && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-7 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}