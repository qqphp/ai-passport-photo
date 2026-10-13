import { sql } from 'drizzle-orm';
import { 
  sqliteTable, 
  text, 
  integer,
  real,
  index
} from 'drizzle-orm/sqlite-core';

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  openId: text('open_id').notNull().unique(),
  nickname: text('nickname'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 订单表
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  orderNo: text('order_no').notNull().unique(),
  amount: real('amount').notNull(),
  planType: text('plan_type', { enum: ['vip', 'lifetime'] }).notNull(),
  status: text('status', { 
    enum: ['pending', 'paid', 'failed', 'cancelled']
  }).notNull().default('pending'),
  paymentMethod: text('payment_method', { 
    enum: ['wechat'] 
  }).notNull(),
  transactionId: text('transaction_id'),
  paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  orderNoIdx: index('order_no_idx').on(table.orderNo),
  statusIdx: index('status_idx').on(table.status),
}));

// 会员表
export const memberships = sqliteTable('memberships', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  planType: text('plan_type', { enum: ['free', 'vip', 'lifetime'] }).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  remainingUses: integer('remaining_uses').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert; 