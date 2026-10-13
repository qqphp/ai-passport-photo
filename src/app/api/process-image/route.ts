import { imageSegClient, createRuntimeOptions } from '@/config/alicloud';
import * as ImageSeg20191230 from '@alicloud/imageseg20191230';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 临时文件目录
const TEMP_DIR = path.join(process.cwd(), 'temp');

// 确保临时目录存在
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB
const MIN_DIMENSION = 32;
const MAX_DIMENSION = 6000;

async function validateImage(buffer: Buffer): Promise<{ isValid: boolean; message?: string }> {
  // 检查文件大小
  if (buffer.length > MAX_FILE_SIZE) {
    return { isValid: false, message: '图片大小不能超过 40MB' };
  }

  try {
    // 使用 sharp 检查图片格式和分辨率
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return { isValid: false, message: '无法读取图片信息' };
    }

    if (metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION) {
      return { isValid: false, message: '图片分辨率不能小于 32×32 像素' };
    }

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      return { isValid: false, message: '图片分辨率不能超过 6000×6000 像素' };
    }

    // 检查格式
    const format = metadata.format?.toLowerCase();
    if (!['jpeg', 'jpg', 'png', 'bmp'].includes(format || '')) {
      return { isValid: false, message: '仅支持 JPG、JPEG、PNG、BMP 格式的图片' };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Image validation error:', error);
    return { isValid: false, message: '图片验证失败，请确保上传正确的图片格式' };
  }
}

export async function POST(request: Request) {
  let tempFilePath: string | null = null;
  
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { 
          RequestId: uuidv4(),
          Code: 'InvalidParameter',
          Message: '请提供图片数据'
        },
        { status: 400 }
      );
    }

    // 解码并验证图片
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 验证图片
    const validation = await validateImage(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          RequestId: uuidv4(),
          Code: 'InvalidImage',
          Message: validation.message || '图片验证失败'
        },
        { status: 400 }
      );
    }

    // 保存图片到临时文件
    await ensureTempDir();
    const fileName = `${uuidv4()}.png`;
    tempFilePath = path.join(TEMP_DIR, fileName);
    await fs.writeFile(tempFilePath, buffer);

    // 创建文件流
    const fileStream = createReadStream(tempFilePath);

    // 调用阿里云高清人体分割 API
    const segmentRequest = new ImageSeg20191230.SegmentHDBodyAdvanceRequest({
      imageURLObject: fileStream
    });

    const runtime = createRuntimeOptions();

    try {
      const response = await imageSegClient.segmentHDBodyAdvance(
        segmentRequest,
        runtime
      );

      // 成功响应
      if (response?.body?.data?.imageURL) {
        return NextResponse.json({
          RequestId: response.body.requestId,
          Data: {
            ImageURL: response.body.data.imageURL
          }
        });
      }

      // 如果没有 URL，返回错误响应
      return NextResponse.json(
        {
          RequestId: response.body.requestId || uuidv4(),
          Code: 'ProcessingError',
          Message: '图片处理失败，请重试'
        },
        { status: 500 }
      );

    } catch (apiError: any) {
      // 处理阿里云 API 错误
      console.error('Aliyun API Error:', apiError);
      return NextResponse.json(
        {
          RequestId: apiError.data?.requestId || uuidv4(),
          HostId: apiError.data?.hostId,
          Code: apiError.code,
          Message: apiError.message || '图片处理失败，请重试',
          Recommend: apiError.data?.recommend
        },
        { status: apiError.statusCode || 500 }
      );
    }

  } catch (error: any) {
    console.error('General processing error:', error);
    
    // 处理其他未知错误
    return NextResponse.json(
      {
        RequestId: uuidv4(),
        Code: 'UnknownError',
        Message: '图片处理失败，请重试'
      },
      { status: 500 }
    );
  } finally {
    // 清理临时文件
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (error) {
        console.error('Failed to delete temp file:', error);
      }
    }
  }
} 