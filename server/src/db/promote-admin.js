import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { user } from './schema.js';

const email = process.argv[2]?.trim().toLowerCase();

try {
  if (!email) {
    console.error('Usage: npm run admin:promote -- owner@example.com');
    process.exitCode = 1;
  } else {
    const [promotedUser] = await db
      .update(user)
      .set({ role: 'admin' })
      .where(eq(user.email, email))
      .returning({ email: user.email, role: user.role });

    if (!promotedUser) {
      console.error(`No user exists with the email ${email}. Create the account first.`);
      process.exitCode = 1;
    } else {
      console.log(`Promoted ${promotedUser.email} to ${promotedUser.role}.`);
    }
  }
} catch {
  console.error('Admin promotion failed. Check the database connection and apply migrations first.');
  process.exitCode = 1;
} finally {
  try {
    await db.$client.end();
  } catch {
    console.error('Failed to close the database connection.');
    process.exitCode = 1;
  }
}
