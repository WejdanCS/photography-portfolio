import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from './db/index.js';
import { user, session, account, verification } from './db/schema.js';

const { BETTER_AUTH_SECRET, BETTER_AUTH_URL, CLIENT_URL } = process.env;

if (!BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must contain at least 32 random characters.');
}

if (!BETTER_AUTH_URL || !CLIENT_URL) {
  throw new Error('BETTER_AUTH_URL and CLIENT_URL must be set in the server environment.');
}

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: [new URL(CLIENT_URL).origin],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  // Sessions are stored in Postgres and renewed after one day of activity.
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
