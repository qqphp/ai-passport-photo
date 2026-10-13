"use client";
import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import type { PhotoSize } from '@/types/photo';

export interface ImageCropperRef {
  getCropInfo: () => { x: number; y: number; width: number; height: number; } | null;
}

interface ImageCropperProps {
  image: string;
  photoSize: PhotoSize;
  disabled?: boolean;
  backgroundColor?: string;
  rotation?: number;
}

function createCrop(
  mediaWidth: number,
  mediaHeight: number,
  photoSize: PhotoSize,
  previousCrop?: Crop,
): Crop {
  // 确保输入值有效
  if (!mediaWidth || !mediaHeight || mediaWidth <= 0 || mediaHeight <= 0) {
    return {
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80 * (photoSize.sd_height / photoSize.sd_width),
    };
  }

  let displayWidth = mediaWidth;
  let displayHeight = mediaHeight;

  // 应用缩放系数以确保图片不会过大
  const maxDimension = 800; // 设置最大尺寸
  const scale = Math.min(1, maxDimension / Math.max(displayWidth, displayHeight));
  displayWidth *= scale;
  displayHeight *= scale;

  // 计算裁剪框尺寸，默认占裁剪区域的80%
  const targetRatio = photoSize.sd_width / photoSize.sd_height;
  const cropArea = displayWidth * displayHeight;
  const targetArea = cropArea * 0.8;

  // 根据目标面积和目标比例计算宽高
  let cropWidth = Math.sqrt(targetArea * targetRatio);
  let cropHeight = cropWidth / targetRatio;

  // 如果计算出的尺寸超出显示范围，需要按比例缩小
  if (cropWidth > displayWidth || cropHeight > displayHeight) {
    const scaleX = displayWidth / cropWidth;
    const scaleY = displayHeight / cropHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    cropWidth *= scale;
    cropHeight *= scale;
  }

  // 确保裁剪框不会太小
  const minSize = Math.min(displayWidth, displayHeight) * 0.2;
  cropWidth = Math.max(cropWidth, minSize);
  cropHeight = Math.max(cropHeight, minSize / targetRatio);

  // 如果有之前的裁剪位置，尽量保持
  if (previousCrop?.x !== undefined && previousCrop?.y !== undefined) {
    const x = Math.min(Math.max(previousCrop.x, 0), displayWidth - cropWidth);
    const y = Math.min(Math.max(previousCrop.y, 0), displayHeight - cropHeight);
    
    return {
      unit: 'px',
      x: Number.isFinite(x) ? x : (displayWidth - cropWidth) / 2,
      y: Number.isFinite(y) ? y : (displayHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    };
  }

  return {
    unit: 'px',
    x: (displayWidth - cropWidth) / 2,
    y: (displayHeight - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

export default forwardRef<ImageCropperRef, ImageCropperProps>(function ImageCropper({
  image,
  photoSize,
  disabled = false,
  backgroundColor = 'transparent',
  rotation = 0,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const previousCropRef = useRef<Crop | undefined>(undefined);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // 当裁剪区域变化时更新位置
  const onCropChange = useCallback((newCrop: Crop) => {
    setCrop(newCrop);
    previousCropRef.current = newCrop;
  }, []);

  // 获取裁剪信息的方法
  const getCropInfo = useCallback(() => {
    if (!imageRef.current || !crop) return null;

    const image = imageRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 确保所有值都是有效的数字
    if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY) ||
        !Number.isFinite(crop.x) || !Number.isFinite(crop.y) ||
        !Number.isFinite(crop.width) || !Number.isFinite(crop.height)) {
      return null;
    }

    return {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };
  }, [crop]);

  // 暴露 getCropInfo 方法给父组件
  useImperativeHandle(ref, () => ({
    getCropInfo
  }), [getCropInfo]);

  // 计算图片展示尺寸
  const calculateDisplaySize = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const img = imageRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;

    let displayWidth, displayHeight;

    // 如果图片比例比容器宽，以容器宽度为准
    if (imageAspectRatio > containerWidth / containerHeight) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imageAspectRatio;
    } else {
      // 否则以容器高度为准
      displayHeight = containerHeight;
      displayWidth = containerHeight * imageAspectRatio;
    }

    setImageSize({ width: displayWidth, height: displayHeight });
  }, []);

  // 监听容器大小变化
  useEffect(() => {
    const observer = new ResizeObserver(calculateDisplaySize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [calculateDisplaySize]);

  // 初始化或更新裁剪区域
  const initializeCrop = useCallback(() => {
    if (!photoSize || !imageRef.current) return;

    const img = imageRef.current;
    const newCrop = createCrop(
      img.width,
      img.height,
      photoSize,
      previousCropRef.current
    );
    
    setCrop(newCrop);
  }, [photoSize]);

  // 图片加载完成后计算尺寸和初始化裁剪区域
  const onImageLoad = useCallback(() => {
    calculateDisplaySize();
    initializeCrop();
  }, [calculateDisplaySize, initializeCrop]);

  // 当照片尺寸改变时重新初始化裁剪区域
  useEffect(() => {
    if (imageRef.current) {
      initializeCrop();
    }
  }, [photoSize, initializeCrop]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-gray-50"
      style={backgroundColor === 'transparent' ? {} : { backgroundColor }}
    >
      <div 
        className="relative"
        style={{
          width: imageSize.width,
          height: imageSize.height,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        <ReactCrop
          crop={crop}
          onChange={onCropChange}
          locked={false}
          className={disabled ? 'pointer-events-none opacity-50' : ''}
          minWidth={50}
          minHeight={50}
          keepSelection
          aspect={photoSize ? photoSize.sd_width / photoSize.sd_height : undefined}
        >
          <img
            ref={imageRef}
            src={image}
            alt="裁剪预览"
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onLoad={onImageLoad}
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
        </ReactCrop>
      </div>
    </div>
  );
});
