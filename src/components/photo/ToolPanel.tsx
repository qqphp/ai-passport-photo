import { useState } from "react";
import type { PhotoToolTab, PhotoSize } from "@/types/photo";
import BackgroundPanel from "./BackgroundPanel";
import SizePanel from "./SizePanel";
import SettingsPanel from "./SettingsPanel";

interface ToolPanelProps {
  activeTab: PhotoToolTab;
  onTabChange: (tab: PhotoToolTab) => void;
  onBackgroundChange: (color: string) => void;
  onSizeChange: (size: PhotoSize) => void;
  onRotate: (angle: number) => void;
  currentSize?: PhotoSize;
  currentRotation: number;
  currentColor: string;
  disabled?: boolean;
}

export default function ToolPanel({
  activeTab,
  onTabChange,
  onBackgroundChange,
  onSizeChange,
  onRotate,
  currentSize,
  currentRotation,
  currentColor,
  disabled = false,
}: ToolPanelProps) {
  const tabs: { id: PhotoToolTab; name: string }[] = [
    { id: "background", name: "照片设置" },
    { id: "size", name: "照片尺寸" },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 工具选项卡 */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={disabled}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? "bg-foreground text-background"
                : "hover:bg-foreground/5"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 工具内容区域 */}
      <div className="p-4">
        {activeTab === "background" ? (
          <div className="space-y-6">
            <BackgroundPanel 
              onColorChange={onBackgroundChange}
              currentColor={currentColor}
              disabled={disabled} 
            />
            <div className="relative">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
              <SettingsPanel
                onRotate={onRotate}
                currentRotation={currentRotation}
                disabled={disabled}
              />
            </div>
          </div>
        ) : (
          <SizePanel 
            onSizeChange={onSizeChange} 
            currentSize={currentSize}
            disabled={disabled} 
          />
        )}
      </div>
    </div>
  );
} 