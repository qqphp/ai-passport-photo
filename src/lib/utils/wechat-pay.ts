import axios from 'axios';
import crypto from 'crypto';
import { getWechatPrivateKey } from './payment';
import path from 'path';
import fs from 'fs';

interface WechatPayConfig {
  appid: string;
  mchid: string;
  privateKey: string;
  serialNo: string;
  apiV3Key: string;
}

export class WechatPay {
  private config: WechatPayConfig;

  constructor() {
    // 检查必要的环境变量
    const requiredEnvVars = {
      'WECHAT_APP_ID': process.env.WECHAT_APP_ID,
      'WECHAT_MCH_ID': process.env.WECHAT_MCH_ID,
      'WECHAT_SERIAL_NO': process.env.WECHAT_SERIAL_NO,
      'WECHAT_APIV3_KEY': process.env.WECHAT_APIV3_KEY,
    };

    // 检查是否所有必要的环境变量都存在
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    try {
      const privateKey = getWechatPrivateKey();
      
      this.config = {
        appid: process.env.WECHAT_APP_ID!,
        mchid: process.env.WECHAT_MCH_ID!,
        privateKey,
        serialNo: process.env.WECHAT_SERIAL_NO!,
        apiV3Key: process.env.WECHAT_APIV3_KEY!,
      };
    } catch (error) {
      throw new Error('Failed to initialize WechatPay configuration');
    }
  }

  // 生成签名
  private generateSignature(method: string, url: string, timestamp: string, nonce: string, body: string = '') {
    // 按照规则拼接签名字符串
    const signString = [
      method,
      url,
      timestamp,
      nonce,
      body,
      ''  // 注意：最后要加一个空行
    ].join('\n');

    // 使用商户私钥对签名串进行签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signString);
    return sign.sign(this.config.privateKey, 'base64');
  }

  // 创建支付订单
  async createOrder(orderNo: string, amount: number, description: string) {
    const url = '/v3/pay/transactions/native';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // 根据环境选择正确的 API URL
    const apiUrl = process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_API_URL_LOCAL
      : process.env.NEXT_PUBLIC_API_URL;
    
    const payload = {
      appid: this.config.appid,
      mchid: this.config.mchid,
      description,
      out_trade_no: orderNo,
      notify_url: `${apiUrl}/api/payment/notify`,
      amount: {
        total: Math.round(amount * 100),
        currency: 'CNY'
      },
    };

    const bodyString = JSON.stringify(payload);
    const signature = this.generateSignature(
      'POST',
      url,
      timestamp,
      nonce,
      bodyString
    );

    // 按照规范格式化 Authorization 头
    const token = [
      'WECHATPAY2-SHA256-RSA2048',
      [
        `mchid="${this.config.mchid}"`,
        `nonce_str="${nonce}"`,
        `timestamp="${timestamp}"`,
        `serial_no="${this.config.serialNo}"`,
        `signature="${signature}"`
      ].join(',')
    ].join(' ');

    try {
      const response = await axios.post(
        `https://api.mch.weixin.qq.com${url}`,
        payload,
        {
          headers: {
            'Authorization': token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
        }
      ).catch(error => {
        if (error.response) {
          console.error('Error response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
        }
        throw error;
      });

      return response.data;
    } catch (error) {
      console.error('Create order error:', {
        config: {
          ...this.config,
          privateKey: '***',
          apiV3Key: '***'
        },
        error
      });
      throw error;
    }
  }

  // 验证支付通知
  verifyNotification(headers: Headers, body: string): boolean {
    try {
      // 获取请求头信息（注意使用小写形式）
      const signature = headers.get('wechatpay-signature');
      const timestamp = headers.get('wechatpay-timestamp');
      const nonce = headers.get('wechatpay-nonce');
      const serial = headers.get('wechatpay-serial');
      const signatureType = headers.get('wechatpay-signature-type');

      // 验证必要的头信息是否存在
      if (!signature || !timestamp || !nonce || !serial) {
        console.error('Missing required headers:', {
          signature: !!signature,
          timestamp: !!timestamp,
          nonce: !!nonce,
          serial: !!serial
        });
        return false;
      }

      // 验证签名类型
      if (signatureType !== 'WECHATPAY2-SHA256-RSA2048') {
        console.error('Invalid signature type:', signatureType);
        return false;
      }

      // 构造验签名串
      const message = `${timestamp}\n${nonce}\n${body}\n`;

      // 验证签名
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(Buffer.from(message));

      // 使用公钥验证签名
      const publicKey = this.getPublicKey(serial);
      if (!publicKey) {
        console.error('Failed to get public key for serial:', serial);
        return false;
      }

      const signatureBase64 = Buffer.from(signature, 'base64');

      const result = verify.verify(publicKey, signatureBase64);
      console.log('result:', result);
      return result;

    } catch (error) {
      console.error('Verify notification error:', error);
      return false;
    }
  }

  // 获取公钥的辅助方法
  private getPublicKey(serial: string): string | null {
    try {
      // 从证书文件或配置中获取对应序列号的公钥
      // 这里需要根据你的实际证书存储方式来实现
      const certPath = path.join(process.cwd(), 'wxpay', 'wechatpay_public.pem');

      return fs.readFileSync(certPath, 'utf8');
    } catch (error) {
      console.error('Get public key error:', error);
      return null;
    }
  }

  // 查询订单状态
  async queryOrder(orderNo: string) {
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // 添加必需的查询参数
    const queryParams = new URLSearchParams({
      mchid: this.config.mchid,
    });
    
    const signature = this.generateSignature(
      'GET',
      `${url}?${queryParams.toString()}`,
      timestamp,
      nonce
    );

    const token = [
      'WECHATPAY2-SHA256-RSA2048',
      [
        `mchid="${this.config.mchid}"`,
        `nonce_str="${nonce}"`,
        `timestamp="${timestamp}"`,
        `serial_no="${this.config.serialNo}"`,
        `signature="${signature}"`
      ].join(',')
    ].join(' ');

    try {
      const response = await axios.get(
        `https://api.mch.weixin.qq.com${url}?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': token,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Query order error:', error);
      throw error;
    }
  }

  // 添加解密资源方法
  decryptResource(resource: {
    algorithm: string;
    ciphertext: string;
    associated_data?: string;
    nonce: string;
  }) {
    const { ciphertext, associated_data, nonce } = resource;
    
    try {
      // 解密密文
      const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
      const nonceBuffer = Buffer.from(nonce);
      const apiV3KeyBuffer = Buffer.from(this.config.apiV3Key, 'utf8');

      // 使用 AEAD_AES_256_GCM 算法解密
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        apiV3KeyBuffer,
        nonceBuffer
      );

      // 设置 associated_data（如果有）
      if (associated_data) {
        decipher.setAAD(Buffer.from(associated_data));
      }

      // 获取密文的最后16个字节作为authTag
      const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16);
      decipher.setAuthTag(authTag);

      // 实际的密文部分
      const encryptedData = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16);

      // 解密
      let decryptedBuffer = decipher.update(encryptedData);
      decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);

      // 转换为字符串
      const decryptedStr = decryptedBuffer.toString('utf8');
      
      console.log('Decryption details:', {
        originalCiphertext: ciphertext.substring(0, 50) + '...',
        nonce,
        associated_data,
        decryptedStr: decryptedStr.substring(0, 100) + '...'
      });

      return JSON.parse(decryptedStr);
    } catch (error) {
      console.error('Decrypt resource error:', {
        error,
        errorMessage: error.message,
        resource: {
          algorithm: resource.algorithm,
          ciphertext: resource.ciphertext.substring(0, 50) + '...',
          associated_data: resource.associated_data,
          nonce: resource.nonce
        },
        apiV3KeyLength: this.config.apiV3Key?.length
      });
      throw new Error(`Failed to decrypt notification data: ${error.message}`);
    }
  }
} 