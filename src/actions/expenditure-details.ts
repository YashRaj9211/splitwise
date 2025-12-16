'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { ExpenseType } from '@/generated/prisma/enums';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export type ExpenseDetailItem = {
  id: string;
  description: string;
  amount: number;
  type: 'PERSONAL' | 'SPLIT_SHARE' | 'BORROWED'; // Borrowed is also part of your expenditure
  date: Date;
  groupName?: string;
};

export type DailyExpenditure = {
  date: string; // MM/dd
  total: number;
  items: ExpenseDetailItem[];
};

export async function getMonthlyExpenditureBreakdown() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const userId = session.user.id;
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  try {
    // 1. Personal Expenses
    const personalExpenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        type: ExpenseType.PERSONAL,
        expenseDate: { gte: startDate, lte: endDate }
      },
      select: { id: true, description: true, amount: true, expenseDate: true }
    });

    // 2. My Share of Splits (This matches logic in stats.ts)
    // - If I paid and split with others, my share is an expenditure.
    // - If someone else paid and I owe them, my share is also an expenditure (borrowed).
    const mySplits = await prisma.expenseSplit.findMany({
      where: {
        userId: userId,
        expense: {
          expenseDate: { gte: startDate, lte: endDate }
        }
      },
      include: {
        expense: {
          select: {
            id: true,
            description: true,
            expenseDate: true,
            userId: true, // Payer ID
            group: { select: { name: true } }
          }
        }
      }
    });

    // Aggregation
    const items: ExpenseDetailItem[] = [];

    // Add Personal
    personalExpenses.forEach(e => {
      items.push({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        type: 'PERSONAL',
        date: e.expenseDate
      });
    });

    // Add Splits
    mySplits.forEach(s => {
      const isPayer = s.expense.userId === userId;
      items.push({
        id: s.id, // Using split ID for uniqueness
        description: s.expense.description,
        amount: Number(s.amount),
        type: isPayer ? 'SPLIT_SHARE' : 'BORROWED',
        date: s.expense.expenseDate,
        groupName: s.expense.group?.name
      });
    });

    // Group by Date for UI
    const grouped: Record<string, DailyExpenditure> = {};

    items.forEach(item => {
      const dateKey = format(item.date, 'MM/dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, total: 0, items: [] };
      }
      grouped[dateKey].items.push(item);
      grouped[dateKey].total += item.amount;
    });

    // Convert to array and sort by date descending
    const result = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));

    return { breakdown: result };
  } catch (error) {
    console.error('Error fetching expenditure breakdown:', error);
    return { error: 'Failed to fetch breakdown' };
  }
}
