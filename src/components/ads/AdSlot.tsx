import { AdSlot as AdSlotType } from '@/types/ads';
import { cn } from '@/lib/utils';
import { useAds } from '@/contexts/AdsContext';

interface AdSlotProps {
  slot: AdSlotType;
  className?: string;
  showPreview?: boolean;
}

export function AdSlot({ slot, className, showPreview = false }: AdSlotProps) {
  const { previewMode } = useAds();
  
  // Don't render anything if status is off and not in global preview mode and not forced preview
  if (slot.status === 'off' && !previewMode && !showPreview) {
    return null;
  }

  // Get the largest size for display
  const primarySize = slot.sizes[0] || { width: 300, height: 250 };
  
  const isPreviewMode = slot.status === 'preview' || previewMode || showPreview;
  
  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground text-sm font-medium transition-colors',
        isPreviewMode ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-border',
        className
      )}
      style={{
        width: primarySize.width,
        height: primarySize.height,
        maxWidth: '100%'
      }}
    >
      <div className="text-center p-4">
        <div className="font-semibold mb-1">
          {slot.section}
        </div>
        <div className="text-xs opacity-75">
          {primarySize.width} × {primarySize.height}
        </div>
        <div className="text-xs opacity-75 mt-1">
          {slot.provider.toUpperCase()}
        </div>
        {isPreviewMode && (
          <div className="text-xs font-medium text-amber-600 mt-2">
            PREVIEW
          </div>
        )}
      </div>
    </div>
  );
}