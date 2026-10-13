"use client";
import { useState, useEffect, useRef } from "react";
import photoData from "@/data/merged_response.json";
import type { PhotoSize } from "@/types/photo";

interface PhotoSearchProps {
  onSelect: (size: PhotoSize) => void;
  disabled?: boolean;
}

export default function PhotoSearch({ onSelect, disabled = false }: PhotoSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<typeof photoData.data.list>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 处理搜索
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const filtered = photoData.data.list.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.specs.toLowerCase().includes(searchLower) ||
        (item.another_name && item.another_name.toLowerCase().includes(searchLower))
      );
    });

    // 根据是否是热门和匹配度排序
    const sorted = filtered.sort((a, b) => {
      // 首先按热门程度排序
      if (a.is_hot !== b.is_hot) {
        return b.is_hot - a.is_hot;
      }
      
      // 然后按名称匹配度排序（完全匹配的排在前面）
      const aExactMatch = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bExactMatch = b.name.toLowerCase() === searchTerm.toLowerCase();
      if (aExactMatch !== bExactMatch) {
        return aExactMatch ? -1 : 1;
      }

      // 最后按名称长度排序（较短的排在前面）
      return a.name.length - b.name.length;
    });

    setResults(sorted.slice(0, 10)); // 限制显示前10个结果
  }, [searchTerm]);

  // 处理点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: typeof photoData.data.list[0]) => {
    onSelect({
      id: `photo-${item.id}`,
      name: item.name,
      width: item.width,
      height: item.height,
      print: item.print as 1 | 2,
      specs: item.specs,
      sd_width: item.sd_width,
      sd_height: item.sd_height,
      sd_dpi: item.sd_dpi,
      sd_size_min: item.sd_size_min,
      sd_size_max: item.sd_size_max,
    });
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="搜索证件照类型..."
          disabled={disabled}
          className={`w-full px-4 py-2 border rounded-lg text-sm transition-colors
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'hover:border-foreground/50 focus:border-foreground focus:outline-none'
            }
          `}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5 transition-colors border-b last:border-b-0"
            >
              <div className="font-medium flex items-center gap-2">
                {item.name}
                {item.is_hot === 1 && (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    热门
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {item.width}×{item.height}mm ({item.sd_width}×{item.sd_height}px)
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 