"use client";
import { useState } from "react";
import { photoCategories } from "@/config/photo-sizes";
import type { PhotoSize, PhotoCategory } from "@/types/photo";
import PhotoSearch from "./PhotoSearch";
import SizeDisplay from "./SizeDisplay";

interface SizePanelProps {
  onSizeChange: (size: PhotoSize) => void;
  currentSize?: PhotoSize;
  disabled?: boolean;
}

export default function SizePanel({
  onSizeChange,
  currentSize,
  disabled = false,
}: SizePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // 获取当前选中类别的子类别或尺寸
  const getCurrentItems = () => {
    const category = photoCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    if (selectedSubcategory && category.subcategories) {
      const subcategory = category.subcategories.find(sub => sub.id === selectedSubcategory);
      return subcategory?.sizes || null;
    }

    return category.sizes || category.subcategories || null;
  };

  const currentItems = getCurrentItems();

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <PhotoSearch onSelect={onSizeChange} disabled={disabled} />

      {/* 当前选中的尺寸信息 */}
      {currentSize && (
        <div className="relative">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <div className="py-4">
            <SizeDisplay size={currentSize} />
          </div>
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <div className="text-xs text-center text-gray-500 py-2">或者按分类选择</div>
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      </div>

      {/* 主分类选择 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">选择类别</label>
        <div className="grid grid-cols-2 gap-2">
          {photoCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedSubcategory(null);
              }}
              disabled={disabled}
              className={`p-2 rounded border text-sm transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-foreground/5'}
                ${selectedCategory === category.id ? 'border-foreground' : 'border-gray-200'}
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 子分类或尺寸选择 */}
      {selectedCategory && currentItems && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {selectedSubcategory ? '选择尺寸' : '选择子类别'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {currentItems.map((item: PhotoCategory | PhotoSize) => (
              <button
                key={item.id}
                onClick={() => {
                  if ('sizes' in item) {
                    setSelectedSubcategory(item.id);
                  } else {
                    const photoSize = item as PhotoSize;
                    onSizeChange({
                      ...photoSize,
                      sd_width: photoSize.sd_width,
                      sd_height: photoSize.sd_height,
                      sd_dpi: photoSize.sd_dpi,
                      sd_size_min: photoSize.sd_size_min,
                      sd_size_max: photoSize.sd_size_max,
                    });
                  }
                }}
                disabled={disabled}
                className={`p-2 rounded border text-sm transition-colors
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-foreground/5'}
                  ${currentSize?.id === item.id ? 'border-foreground' : 'border-gray-200'}
                `}
              >
                <div className="text-center">
                  <div>{item.name}</div>
                  {'width' in item && (
                    <div className="text-xs text-gray-500">
                      {item.width}×{item.height}mm
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 返回按钮 */}
      {selectedSubcategory && (
        <button
          onClick={() => setSelectedSubcategory(null)}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-foreground transition-colors"
        >
          ← 返回上级
        </button>
      )}
    </div>
  );
} 