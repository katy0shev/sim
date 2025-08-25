import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { devDb } from '@/lib/dev-db'
import { env } from '@/lib/env'
import { isDev } from '@/lib/environment'
import * as schema from '@/db/schema'

let db: any

if (isDev && process.env.DEV_STORAGE_LOCAL_JSON === 'true') {
  console.log('Using fake DB for development')
  db = devDb as any
} else {
  // In production, use the Vercel-generated POSTGRES_URL
  // In development, use the direct DATABASE_URL
  const connectionString = env.POSTGRES_URL ?? env.DATABASE_URL

  const postgresClient = postgres(connectionString, {
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 30,
    max: 60,
    onnotice: () => {},
  })

  const drizzleClient = drizzle(postgresClient, { schema })

  declare global {
    var database: PostgresJsDatabase<typeof schema> | undefined
  }

  db = global.database || drizzleClient
  if (isDev) global.database = db
}

export { db }
