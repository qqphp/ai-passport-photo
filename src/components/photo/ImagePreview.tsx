"use client";
import { forwardRef, useState } from 'react';
import ImageCropper, { type ImageCropperRef } from './ImageCropper';
import type { PhotoSize } from '@/types/photo';

interface ImagePreviewProps {
  originalImage: string;
  processedImage: string | null;
  currentSize?: PhotoSize;
  rotation?: number;
  isProcessing?: boolean;
  onReselect: () => void;
  onSave: () => void;
  backgroundColor: string;
}

const ProcessedImage = ({ image, backgroundColor = 'transparent', rotation = 0 }: { 
  image: string, 
  backgroundColor: string,
  rotation?: number 
}) => {
  const style = {
    ...(backgroundColor === 'transparent' ? {} : { backgroundColor }),
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={style}>
      <img
        src={image}
        alt="效果图"
        className="max-h-full w-auto object-contain"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
};

const ImagePreview = forwardRef<ImageCropperRef, ImagePreviewProps>(function ImagePreview({
  originalImage,
  processedImage,
  currentSize,
  rotation = 0,
  isProcessing = false,
  onReselect,
  onSave,
  backgroundColor,
}, ref) {
  const [showProcessed, setShowProcessed] = useState(true);

  return (
    <div className="space-y-4">
      {/* 切换按钮组 */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-background">
          <button
            onClick={() => setShowProcessed(false)}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${!showProcessed
                ? "bg-foreground text-background"
                : "hover:bg-foreground/5"
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            原图
          </button>
          <button
            onClick={() => setShowProcessed(true)}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${showProcessed
                ? "bg-foreground text-background"
                : "hover:bg-foreground/5"
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            效果图
          </button>
        </div>
      </div>

      {/* 图片预览区域 */}
      <div className="aspect-[4/3] relative border rounded-lg overflow-hidden bg-gray-50">
        <div className="absolute inset-0">
          {showProcessed && processedImage ? (
            currentSize ? (
              <ImageCropper
                ref={ref}
                image={processedImage}
                photoSize={currentSize}
                disabled={isProcessing}
                backgroundColor={backgroundColor}
                rotation={rotation}
              />
            ) : (
              <ProcessedImage 
                image={processedImage} 
                backgroundColor={backgroundColor}
                rotation={rotation}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={originalImage}
                alt="原图"
                className="max-h-full w-auto object-contain"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            </div>
          )}
        </div>
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <div className="text-sm">处理中...</div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={onReselect}
            disabled={isProcessing}
            className={`w-28 px-3 py-2 rounded-md text-sm font-medium transition-colors
              border border-foreground/20 hover:bg-foreground/5
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            新图
          </button>
          <button
            onClick={onSave}
            disabled={isProcessing}
            className={`w-28 px-3 py-2 rounded-md text-sm font-medium transition-colors
              bg-foreground text-background hover:bg-foreground/90
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            保存
          </button>
        </div>
        {currentSize && (
          <p className="text-center text-sm text-gray-500">
            提示：您可以拖动或调整裁剪框的大小，以获得最佳的裁剪效果
          </p>
        )}
      </div>
    </div>
  );
});

export default ImagePreview;
