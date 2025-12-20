'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';

export async function getDashboardStats(userId: string) {
  console.time('dashboard');

  try {
    // 1. Calculate "You Owe"
    // Splits where I am the user involved, but I didn't pay (or it's just my share), and it's not paid.
    // Wait, 'userId' in Expense is the PAYER.
    // 'userId' in ExpenseSplit is the DEBTOR (person sharing the cost).

    // Scenario A: Someone else paid, I am in split. I owe them.
    // Expense.userId != Me AND Split.userId == Me AND Split.isPaid == false.
    const debts = await prisma.expenseSplit.findMany({
      where: {
        userId: userId, // I am the one splitting
        isPaid: false,
        expense: {
          userId: { not: userId } // I am not the payer
        }
      },
      select: { amount: true }
    });

    const youOwe = debts.reduce((sum, split) => sum + Number(split.amount), 0);

    // Scenario B: I paid, someone else is in split. They owe me.
    // Expense.userId == Me AND Split.userId != Me AND Split.isPaid == false.
    const credits = await prisma.expenseSplit.findMany({
      where: {
        userId: { not: userId }, // Someone else is splitting
        isPaid: false,
        expense: {
          userId: userId // I am the payer
        }
      },
      select: { amount: true }
    });

    const youAreOwed = credits.reduce((sum, split) => sum + Number(split.amount), 0);

    // Total Balance = (What people owe me) - (What I owe people)
    // If positive, I am owed money overall. if negative, I owe money.
    const totalBalance = youAreOwed - youOwe;

    // 2. Recent Activity
    // Expenses where I am either the Payer OR in the splits.
    const recentExpenses = await prisma.expense.findMany({
      where: {
        OR: [{ userId: userId }, { splits: { some: { userId: userId } } }]
      },
      include: {
        user: { select: { name: true, avatarUrl: true } }, // Payer
        splits: {
          include: { user: { select: { name: true } } }
        },
        group: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.timeEnd('dashboard');
    return {
      stats: {
        totalBalance,
        youOwe,
        youAreOwed
      },
      recentActivity: recentExpenses
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { error: 'Failed to fetch dashboard data' };
  }
}
