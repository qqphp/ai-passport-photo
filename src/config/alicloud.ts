import * as ImageSeg20191230 from '@alicloud/imageseg20191230';
import * as OpenApi from '@alicloud/openapi-client';
import * as Util from '@alicloud/tea-util';

// 确保这些环境变量在服务器端可用
const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;

if (!accessKeyId || !accessKeySecret) {
  throw new Error('Missing Alibaba Cloud credentials');
}

// 创建配置
const config = new OpenApi.Config({
  accessKeyId,
  accessKeySecret,
  endpoint: 'imageseg.cn-shanghai.aliyuncs.com',
  // Client 超时参数设置
  connectTimeout: 10000,  // 连接超时 10 秒
  readTimeout: 30000,    // 读取超时 30 秒
});

// 创建客户端实例
export const imageSegClient = new ImageSeg20191230.default(config);

// 创建运行时选项
export const createRuntimeOptions = () => {
  return new Util.RuntimeOptions({
    connectTimeout: 10000,    // 连接超时 10 秒
    readTimeout: 30000,       // 读取超时 30 秒
    autoretry: true,          // 启用自动重试
    maxAttempts: 3,           // 最大重试次数
    backoffPolicy: 'exponential', // 使用指数退避策略
    backoffPeriod: 1000,      // 重试间隔基数（毫秒）
  });
}; 