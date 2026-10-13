"use client";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  message: string;
  progress?: number;
}

export default function LoadingOverlay({ message, progress }: LoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 当进度达到 100% 时，延迟移除遮罩层
    if (progress === 1) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500); // 500ms 延迟

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">{message}</div>
            {typeof progress === 'number' && (
              <div className="text-sm text-gray-500">
                {Math.round(progress * 100)}%
              </div>
            )}
          </div>
          
          {/* 进度条 */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all duration-300 ease-out"
              style={{ 
                width: `${typeof progress === 'number' ? progress * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 