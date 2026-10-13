import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ViapiUtil from '@alicloud/viapi-utils';
import * as Util from '@alicloud/tea-util';

// 临时文件目录
const TEMP_DIR = path.join(process.cwd(), 'temp');

// 确保临时目录存在
export async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

// 保存 base64 图片到临时文件
export async function saveBase64ToTemp(base64Data: string): Promise<string> {
  await ensureTempDir();
  
  // 移除 base64 前缀
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Image, 'base64');
  
  // 生成临时文件路径
  const fileName = `${uuidv4()}.png`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  // 写入文件
  await fs.writeFile(filePath, buffer);
  
  return filePath;
}

// 上传文件到阿里云OSS并返回URL
export async function uploadToOSS(filePath: string): Promise<string> {
  const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;

  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Missing Alibaba Cloud credentials');
  }

  // 配置 ViapiUtil 的上传选项
  const uploadOptions = {
    timeout: 30000,  // 30秒超时
    retryTimes: 3,   // 重试3次
  };

  // 使用 runtime 选项进行上传
  const runtime = new Util.RuntimeOptions({
    readTimeout: 30000,     // 读取超时 30 秒
    connectTimeout: 10000,  // 连接超时 10 秒
    retryable: true,       // 允许重试
    maxRetries: 3,         // 最大重试次数
  });

  try {
    // 初始化上传工具
    ViapiUtil.InitClient(accessKeyId, accessKeySecret);
    
    // 执行上传，带重试机制
    let lastError;
    for (let i = 0; i < uploadOptions.retryTimes; i++) {
      try {
        const ossUrl = await ViapiUtil.upload(
          accessKeyId,
          accessKeySecret,
          filePath,
          uploadOptions
        );
        return ossUrl;
      } catch (error) {
        lastError = error;
        if (i < uploadOptions.retryTimes - 1) {
          // 等待后重试，使用指数退避
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
          continue;
        }
      }
    }
    throw lastError;
  } catch (error) {
    console.error('Failed to upload to OSS:', error);
    throw new Error('Failed to upload image to OSS');
  }
}

// 删除临时文件
export async function deleteTempFile(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete temp file:', error);
  }
}

// 获取文件的完整 URL
export function getFileUrl(filePath: string, req: Request) {
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const relativePath = path.relative(process.cwd(), filePath);
  return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
} 