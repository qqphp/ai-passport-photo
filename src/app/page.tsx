"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ImageUploader from "@/components/photo/ImageUploader";
import ImagePreview from "@/components/photo/ImagePreview";
import ToolPanel from "@/components/photo/ToolPanel";
import LoadingOverlay from "@/components/LoadingOverlay";
import { removeBackground, type LoadingProgress } from "@/services/image-processing";
import type { PhotoState, PhotoToolTab, PhotoSize } from "@/types/photo";
import type { ImageCropperRef } from "@/components/photo/ImageCropper";
import Toast from "@/components/ui/Toast";
import SizeCloud from "@/components/photo/SizeCloud";

export default function Home() {
  const [activeTab, setActiveTab] = useState<PhotoToolTab>("background");
  const [photoState, setPhotoState] = useState<PhotoState>({
    originalImage: null,
    processedImage: null,
    rotation: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [currentSize, setCurrentSize] = useState<PhotoSize | undefined>();
  const imageCropperRef = useRef<ImageCropperRef>(null);
  const originalImageUrlRef = useRef<string | null>(null);
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState("transparent");
  const [error, setError] = useState<string | null>(null);

  const releaseOriginalImage = useCallback(() => {
    if (originalImageUrlRef.current) {
      URL.revokeObjectURL(originalImageUrlRef.current);
      originalImageUrlRef.current = null;
    }
  }, []);

  useEffect(() => releaseOriginalImage, [releaseOriginalImage]);

  const getLoadingMessage = (progress: LoadingProgress) => {
    switch (progress.stage) {
      case 'uploading':
        return '上传图片...';
      case 'processing':
        return '处理图片...';
      case 'downloading':
        return '下载结果...';
      default:
        return '加载中...';
    }
  };

  const handleImageUpload = async (file: File) => {
    releaseOriginalImage();
    const imageUrl = URL.createObjectURL(file);
    originalImageUrlRef.current = imageUrl;
    let completed = false;

    try {
      setIsProcessing(true);
      
      // 将文件转换为 base64
      const base64Image = await fileToBase64(file);
      
      // 处理图片
      const processedImage = await removeBackground(base64Image, setLoadingProgress);
      if (originalImageUrlRef.current !== imageUrl) return;
      completed = true;
      
      // 更新状态
      setPhotoState({
        originalImage: imageUrl,
        processedImage,
        rotation: 0,
      });
      
      setCurrentBackgroundColor('transparent');
      setCurrentSize(undefined);
      setActiveTab('background');
    } catch (error) {
      if (originalImageUrlRef.current !== imageUrl) return;
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("图片处理失败，请重试");
      }
      // 清理状态
      setPhotoState(prev => ({
        ...prev,
        originalImage: null,
        processedImage: null,
        rotation: 0,
      }));
    } finally {
      if (originalImageUrlRef.current === imageUrl) {
        if (!completed) releaseOriginalImage();
        setIsProcessing(false);
        setLoadingProgress(null);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleBackgroundChange = (color: string) => {
    if (!photoState.processedImage) return;
    setCurrentBackgroundColor(color);
  };

  const handleSizeChange = (size: PhotoSize) => {
    setCurrentSize(size);
    // 这里添加调整尺寸的逻辑
    console.log("调整尺寸:", size);
  };

  const handleReselect = () => {
    releaseOriginalImage();
    setPhotoState({
      originalImage: null,
      processedImage: null,
      rotation: 0,
    });
  };

  const handleSave = async () => {
    if (!photoState.processedImage) return;

    try {
      const img = new Image();
      img.src = photoState.processedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
      }

      if (currentSize) {
        // 设置画布尺寸为证件照尺寸
        canvas.width = currentSize.sd_width;
        canvas.height = currentSize.sd_height;

        // 设置背景色
        if (currentBackgroundColor !== 'transparent') {
          ctx.fillStyle = currentBackgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 获取裁剪区域信息
        const cropInfo = imageCropperRef.current?.getCropInfo();
        if (!cropInfo) {
          throw new Error('无法获取裁剪信息');
        }

        // 创建临时画布用于旋转
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          throw new Error('无法创建临时 Canvas 上下文');
        }

        // 设置临时画布尺寸
        tempCanvas.width = cropInfo.width;
        tempCanvas.height = cropInfo.height;

        // 在临时画布上绘制裁剪区域
        tempCtx.drawImage(
          img,
          cropInfo.x,
          cropInfo.y,
          cropInfo.width,
          cropInfo.height,
          0,
          0,
          cropInfo.width,
          cropInfo.height
        );

        // 如果有旋转角度，应用旋转
        if (photoState.rotation) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((photoState.rotation * Math.PI) / 180);
          ctx.drawImage(
            tempCanvas,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
          );
          ctx.restore();
        } else {
          // 如果没有旋转，直接绘制到最终画布
          ctx.drawImage(
            tempCanvas,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      } else {
        // 如果没有选择尺寸，使用原图尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 设置背景色
        if (currentBackgroundColor !== 'transparent') {
          ctx.fillStyle = currentBackgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 如果有旋转角度，应用旋转
        if (photoState.rotation) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((photoState.rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0);
        }
      }

      // 修改下载逻辑以支持移动端
      const croppedImageUrl = canvas.toDataURL('image/png');
      
      // 检测是否为移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // 移动端：打开新窗口显示图片，用户可以长按保存
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>保存图片</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body {
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #f5f5f5;
                    font-family: system-ui, sans-serif;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                  }
                  p {
                    text-align: center;
                    color: #666;
                    padding: 1rem;
                    margin: 0;
                  }
                </style>
              </head>
              <body>
                <p>长按图片即可保存</p>
                <img src="${croppedImageUrl}" alt="证件照">
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // 如果无法打开新窗口，回退到直接显示图片
          window.location.href = croppedImageUrl;
        }
      } else {
        // 桌面端：使用常规下载方式
        const link = document.createElement('a');
        link.href = croppedImageUrl;
        link.download = 'processed-photo.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleRotate = async (angle: number) => {
    if (!photoState.originalImage) return;
    setIsProcessing(true);
    
    try {
      // 直接使用已处理的图片，只更新旋转角度
      setPhotoState(prev => ({
        ...prev,
        rotation: angle,
      }));
    } catch (error) {
      console.error('图片旋转失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = useCallback(() => {
    // 重置所有相关状态
    setPhotoState(prev => ({
      ...prev,
      rotation: 0,
    }));
    setCurrentBackgroundColor('transparent');
    setCurrentSize(undefined);
    setActiveTab('background');
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  return (
    <>
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      {loadingProgress && (
        <LoadingOverlay
          message={getLoadingMessage(loadingProgress)}
          progress={loadingProgress.progress}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧图片区域 */}
          <div className="space-y-6">
            {!photoState.originalImage ? (
              <ImageUploader 
                onUpload={handleImageUpload} 
                onError={handleError}
                onReset={handleReset}
              />
            ) : (
              <ImagePreview
                ref={imageCropperRef}
                originalImage={photoState.originalImage}
                processedImage={photoState.processedImage}
                currentSize={currentSize}
                rotation={photoState.rotation}
                isProcessing={isProcessing}
                onReselect={handleReselect}
                onSave={handleSave}
                backgroundColor={currentBackgroundColor}
              />
            )}
          </div>

          {/* 右侧工具面板 */}
          <div>
            <ToolPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onBackgroundChange={handleBackgroundChange}
              onSizeChange={handleSizeChange}
              onRotate={handleRotate}
              currentSize={currentSize}
              currentRotation={photoState.rotation || 0}
              currentColor={currentBackgroundColor}
              disabled={!photoState.originalImage || isProcessing}
            />
          </div>
        </div>
      </div>
      
      <SizeCloud />
    </>
  );
}
