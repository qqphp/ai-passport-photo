import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') });

// 导出配置
export const DATABASE_URL = process.env.DATABASE_URL || 'file:./data.db'; 