"use client";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface ImageProcessorProps {
  imageUrl: string;
  onProcessed: (result: string) => void;
  onError?: (error: string) => void;
}

export default function ImageProcessor({ imageUrl, onProcessed, onError }: ImageProcessorProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateUsage = async () => {
    try {
      if (!token) {
        toast({
          title: "请先登录",
          description: "登录后即可使用图片处理功能",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch('/api/user/usage/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          toast({
            title: "使用次数不足",
            description: "请升级会员以获取更多使用次数",
            variant: "destructive",
          });
          return false;
        }
        throw new Error('Failed to update usage');
      }

      const data = await response.json();
      return true;
    } catch (error) {
      console.error('Update usage error:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      });
      return false;
    }
  };

  const processImage = async () => {
    if (!imageUrl) return;
    
    setIsProcessing(true);
    try {
      // 先检查并更新使用次数
      const canProceed = await updateUsage();
      if (!canProceed) {
        setIsProcessing(false);
        return;
      }

      // 调用图片处理 API
      const response = await fetch('/api/photo/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result = await response.json();
      onProcessed(result.processedImageUrl);
    } catch (error) {
      console.error('Process image error:', error);
      toast({
        title: "处理失败",
        description: "图片处理失败，请重试",
        variant: "destructive",
      });
      onError?.('图片处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {isProcessing && (
        <LoadingOverlay message="正在处理图片..." />
      )}
      <button
        onClick={processImage}
        disabled={isProcessing || !imageUrl}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "处理中..." : "开始处理"}
      </button>
    </div>
  );
} 