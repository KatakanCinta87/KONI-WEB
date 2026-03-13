import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prisma CLI (migrate/db push) should bypass pooler in serverless setups.
    // Fallback keeps local/dev working if DIRECT_URL is not set yet.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
