"use client";
import { useState } from "react";

interface BackgroundPanelProps {
  onColorChange: (color: string) => void;
  currentColor: string;
  disabled?: boolean;
}

export default function BackgroundPanel({ 
  onColorChange, 
  currentColor = "transparent",
  disabled = false 
}: BackgroundPanelProps) {
  const [customColor, setCustomColor] = useState(currentColor);

  const commonColors = [
    { color: "transparent", name: "透明" },
    { color: "#ffffff", name: "白色" },
    { color: "#87CEEB", name: "蓝色" },
    { color: "#FF0000", name: "红色" },
  ];

  return (
    <div className="space-y-4">
      {/* 添加小标题 */}
      <div className="text-sm font-medium">设置背景色</div>

      {/* 常用颜色选择 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">常用颜色</label>
        <div className="grid grid-cols-2 gap-2">
          {commonColors.map(({ color, name }) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              disabled={disabled}
              className={`flex items-center gap-2 p-2 rounded border text-sm transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-foreground/5'}
                ${currentColor === color ? 'border-foreground' : 'border-gray-200'}
              `}
            >
              <div
                className={`w-4 h-4 rounded border ${color === 'transparent' ? 'border-dashed border-gray-400' : ''}`}
                style={{ 
                  backgroundColor: color,
                  borderWidth: color === 'transparent' ? 2 : 1
                }}
              />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义颜色选择器 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">自定义颜色</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={customColor === 'transparent' ? '#ffffff' : customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            disabled={disabled}
            className="h-10 w-10 rounded cursor-pointer"
          />
          <button
            onClick={() => onColorChange(customColor)}
            disabled={disabled}
            className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-foreground/5'
              }
              ${currentColor === customColor ? 'border-foreground' : 'border-gray-200'}
            `}
          >
            应用颜色
          </button>
        </div>
      </div>
    </div>
  );
} 