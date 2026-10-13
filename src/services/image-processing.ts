export type LoadingProgress = {
  stage: 'uploading' | 'processing' | 'downloading';
  progress: number;
};

export type ProgressCallback = (progress: LoadingProgress) => void;

export async function removeBackground(
  imageData: string,
  onProgress?: ProgressCallback
): Promise<string> {
  try {
    onProgress?.({ stage: 'uploading', progress: 0.3 });

    const response = await fetch('/api/process-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64: imageData }),
    });

    const data = await response.json();

    if (data.Code) {
      throw new Error(data.Message);
    }

    if (!data.Data?.ImageURL) {
      throw new Error('处理结果无效，请重试');
    }

    onProgress?.({ stage: 'downloading', progress: 0.8 });

    // 将 HTTP URL 转换为 HTTPS 以避免混合内容警告
    // 阿里云 OSS 默认返回 HTTP URL，但同时支持 HTTPS 访问
    const processedImageUrl = data.Data.ImageURL.replace(/^http:/, 'https:');

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const processedImageResponse = await fetch(processedImageUrl, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!processedImageResponse.ok) {
          throw new Error(`HTTP error! status: ${processedImageResponse.status}`);
        }

        const processedImageBlob = await processedImageResponse.blob();
        
        // Convert to base64
        const reader = new FileReader();
        const processedBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read processed image'));
          reader.readAsDataURL(processedImageBlob);
        });

        onProgress?.({ stage: 'downloading', progress: 1 });
        return processedBase64;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(`Failed to download processed image after ${maxRetries} attempts`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    throw new Error('Failed to download processed image');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('图片处理失败，请重试');
  }
} 