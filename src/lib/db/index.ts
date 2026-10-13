import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { resolve } from 'path';

// 确保数据库目录存在
const DB_PATH = resolve(process.cwd(), 'data/db/sqlite.db');

// 初始化 SQLite 数据库连接
const sqlite = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' 
    ? console.log 
    : undefined,
});

// 启用外键约束
sqlite.pragma('foreign_keys = ON');

// 导出 drizzle 实例
export const db = drizzle(sqlite, { schema });

// 确保在进程退出时关闭数据库连接
process.on('exit', () => {
  sqlite.close();
}); 