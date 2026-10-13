import fs from 'fs';
import path from 'path';

export function getWechatPrivateKey(): string {
  try {
    // 从项目根目录的 wxpay 文件夹读取私钥文件
    const keyPath = path.join(process.cwd(), 'wxpay', 'apiclient_key.pem');
    const privateKey = fs.readFileSync(keyPath, 'utf8');
    return privateKey;
  } catch (error) {
    console.error('Failed to read WeChat private key:', error);
    throw new Error('Failed to read WeChat private key');
  }
} 