import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile('.env.local')
  } catch {}
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
