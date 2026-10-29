import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { readAuthConfig } from '../config/env.js';
import { db } from '../db/index.js';
import { user, session, account, verification } from '../db/schema.js';

const config = readAuthConfig();

export const auth = betterAuth({
  secret: config.secret,
  baseURL: config.baseURL,
  basePath: '/api/auth',
  trustedOrigins: [config.trustedOrigin],
  database: drizzleAdapter(db, { provider: 'pg', schema: { user, session, account, verification } }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128, autoSignIn: true },
  user: {
    additionalFields: {
      role: { type: 'string', fieldName: 'role', defaultValue: 'user', input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
});
