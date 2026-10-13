import type { Config } from 'drizzle-kit';
import { resolve } from 'path';

export default {
  schema: './src/lib/db/schema.ts',
  driver: 'better-sqlite',
  dbCredentials: {
    url: resolve(process.cwd(), 'data/db/sqlite.db'),
  },
  out: './drizzle',
  verbose: true,
  strict: true,
} satisfies Config; 