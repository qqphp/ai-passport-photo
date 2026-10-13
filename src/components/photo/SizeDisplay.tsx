import type { PhotoSize } from "@/types/photo";

interface SizeDisplayProps {
  size?: PhotoSize;
}

export default function SizeDisplay({ size }: SizeDisplayProps) {
  if (!size) return null;

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{size.name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">实物尺寸</div>
          <div className="font-medium">{size.width} × {size.height} mm</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">像素尺寸</div>
          <div className="font-medium">{size.sd_width} × {size.sd_height} px</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">分辨率要求</div>
          <div className="font-medium">{size.sd_dpi} DPI</div>
        </div>
        {(size.sd_size_min || size.sd_size_max) && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500">文件大小限制</div>
            <div className="font-medium">
              {size.sd_size_min && `${size.sd_size_min}KB`}
              {size.sd_size_min && size.sd_size_max && ' - '}
              {size.sd_size_max && `${size.sd_size_max}KB`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 