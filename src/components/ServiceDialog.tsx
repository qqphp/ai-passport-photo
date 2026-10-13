import { useEffect, useState } from "react";
import Image from "next/image";

export default function ServiceDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 使用 setTimeout 确保在页面加载完成后显示弹窗
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* 弹窗内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-auto p-6 transform transition-all">
          {/* 关闭按钮 */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">关闭</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 标题 */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              接单啦！一起探索无限可能
            </h3>
          </div>

          {/* 内容 */}
          <div className="mt-4 space-y-4 text-sm text-foreground/80">
            <p>
              专注于微信小程序、APP开发、业务系统开发以及官网定制，提供量身定制的解决方案，帮助您的项目更高效、更优质地落地。无论是从零开始，还是已有项目的二次开发，我都能为您提供专业的技术支持和服务。
            </p>
            
            <div className="text-center">
              <p className="font-medium text-foreground">
                扫码加我微信，我们聊聊您的需求，让我们一起将您的创意变为现实！
              </p>
              
              <div className="mt-4 flex justify-center">
                <Image
                  src="/wechat-qr.png" // 请确保将二维码图片放在 public 目录下
                  alt="微信二维码"
                  width={200}
                  height={200}
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 