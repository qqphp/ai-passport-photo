"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onError?: (message: string) => void;
  onReset?: () => void;
}

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];

export default function ImageUploader({ onUpload, onError, onReset }: ImageUploaderProps) {
  const validateImage = async (file: File): Promise<boolean> => {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      onError?.('图片大小不能超过 40MB');
      return false;
    }

    // 检查文件格式
    if (!SUPPORTED_FORMATS.includes(file.type.toLowerCase())) {
      onError?.('仅支持 JPG、JPEG、PNG、BMP 格式的图片');
      return false;
    }

    // 检查图片分辨率
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        if (img.width < 32 || img.height < 32) {
          onError?.('图片分辨率不能小于 32×32 像素');
          resolve(false);
          return;
        }

        if (img.width > 6000 || img.height > 6000) {
          onError?.('图片分辨率不能超过 6000×6000 像素');
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        onError?.('图片加载失败，请重试');
        resolve(false);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const isValid = await validateImage(file);
      if (isValid) {
        // 先触发重置
        onReset?.();
        // 再上传新图片
        try {
          await onUpload(file);
        } catch (error) {
          onError?.('上传失败，请重试');
        }
      }
    }
  }, [onUpload, onError, onReset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp']
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-foreground bg-foreground/5' 
          : 'border-foreground/20 hover:border-foreground/40'
        }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="text-4xl">📷</div>
        <div className="text-lg font-medium">
          {isDragActive ? "释放以上传图片" : "点击或拖拽图片至此处"}
        </div>
        <p className="text-sm text-gray-500">
          支持 JPG、PNG、BMP 格式，大小不超过 40MB
          <br />
          图片分辨率需大于 32×32 像素，小于 6000×6000 像素
        </p>
      </div>
    </div>
  );
} 