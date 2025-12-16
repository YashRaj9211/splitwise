import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString } as any); // Type cast if needed, or just object
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️  Clearing database...');

  try {
    // Truncate all tables using cascade to handle foreign key constraints
    // We quote table names to handle case sensitivity if Prisma preserved it
    const tables = [
      'User',
      'Friendship',
      'Group',
      'GroupMember',
      'Category',
      'Expense',
      'ExpenseSplit',
      'Payment',
      'Budget'
    ];

    // Construct the TRUNCATE command
    // "TRUNCATE TABLE "Table1", "Table2" ... RESTART IDENTITY CASCADE;"
    const tableNames = tables.map(t => `"${t}"`).join(', ');
    const query = `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`;

    await prisma.$executeRawUnsafe(query);

    console.log('✅ Database cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
