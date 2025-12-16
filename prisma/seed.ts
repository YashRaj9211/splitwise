import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { ExpenseType, SplitType, GroupRole, FriendshipStatus } from '../src/generated/prisma/enums';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString } as any);
const prisma = new PrismaClient({ adapter });

import { generateAvatar } from '../src/lib/avatar';

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password', 10);

  const userAlice = await prisma.user.create({
    data: {
      name: 'Alice (Demo)',
      email: 'alice@demo.com',
      username: 'alice',
      password: passwordHash,
      avatarUrl: await generateAvatar('Alice')
    }
  });

  const userBob = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@demo.com',
      username: 'bob',
      password: passwordHash,
      avatarUrl: await generateAvatar('Bob')
    }
  });

  const userCharlie = await prisma.user.create({
    data: {
      name: 'Charlie',
      email: 'charlie@demo.com',
      username: 'charlie',
      password: passwordHash,
      avatarUrl: await generateAvatar('Charlie')
    }
  });

  console.log('✅ Users created: Alice, Bob, Charlie');

  // 2. Create Friendships
  await prisma.friendship.create({
    data: {
      userId: userAlice.id,
      friendId: userBob.id,
      status: FriendshipStatus.ACCEPTED
    }
  });

  // Create reverse friendship for querying convenience if needed, though app logic might handle single direction
  // Assuming the app relies on checking both ways or standardizing
  await prisma.friendship.create({
    data: {
      userId: userBob.id,
      friendId: userAlice.id,
      status: FriendshipStatus.ACCEPTED
    }
  });

  console.log('✅ Friendships established');

  // 3. Create Group
  const group = await prisma.group.create({
    data: {
      name: 'Vegas Trip',
      description: 'Weekend getaway to Las Vegas',

      members: {
        create: [
          { userId: userAlice.id, role: GroupRole.ADMIN },
          { userId: userBob.id, role: GroupRole.MEMBER },
          { userId: userCharlie.id, role: GroupRole.MEMBER }
        ]
      }
    }
  });

  console.log('✅ Group created: Vegas Trip');

  // 4. Expenses

  // Expense 1: Alice pays for Dinner (Split equally among all 3)
  // Amount: 300. Split: 100 each.
  await prisma.expense.create({
    data: {
      description: 'Dinner at Bellagio',
      amount: 300,
      currency: 'USD',
      type: ExpenseType.SPLIT,
      expenseDate: new Date(),
      userId: userAlice.id, // Payer
      groupId: group.id,
      splits: {
        create: [
          { userId: userAlice.id, amount: 100, splitType: SplitType.EQUAL, isPaid: true }, // Payer's share. isPaid=true logic depends on app, usually true for payer unless self-debt? standard splitwise: payer is owed.
          { userId: userBob.id, amount: 100, splitType: SplitType.EQUAL, isPaid: false },
          { userId: userCharlie.id, amount: 100, splitType: SplitType.EQUAL, isPaid: false }
        ]
      }
    }
  });

  // Expense 2: Bob pays for Taxi (Split between Bob and Alice)
  // Amount: 50. Split: 25 each.
  await prisma.expense.create({
    data: {
      description: 'Uber to Hotel',
      amount: 50,
      currency: 'USD',
      type: ExpenseType.SPLIT,
      expenseDate: new Date(),
      userId: userBob.id,
      groupId: group.id,
      splits: {
        create: [
          { userId: userBob.id, amount: 25, splitType: SplitType.EQUAL, isPaid: true },
          { userId: userAlice.id, amount: 25, splitType: SplitType.EQUAL, isPaid: false }
        ]
      }
    }
  });

  // Expense 3: Personal Expense for Alice
  await prisma.expense.create({
    data: {
      description: 'Coffee',
      amount: 5.5,
      currency: 'USD',
      type: ExpenseType.PERSONAL,
      expenseDate: new Date(),
      userId: userAlice.id
    }
  });

  console.log('✅ Expenses added');
  console.log('🌱 Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
