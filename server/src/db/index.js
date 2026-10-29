import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'
import { readDatabaseUrl } from '../config/env.js'
const connectionString = readDatabaseUrl()
const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })
