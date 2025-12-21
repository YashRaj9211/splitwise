'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { ExpenseType } from '@/generated/prisma/enums';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { unstable_cache } from 'next/cache';

export type DailyStat = {
  date: string; // MM/dd
  totalExpenditure: number;
  borrowed: number;
  lent: number;
  personal: number;
};

export type ExpenseStats = {
  totalExpenditure: number;
  borrowed: number;
  lent: number;
  personal: number;
  dailyStats: DailyStat[];
};

export async function getExpenseStats(userId: string): Promise<{ stats: ExpenseStats | null; error?: string }> {
  // Wrap the heavy logic in unstable_cache
  const getCachedStats = unstable_cache(
    async (id: string) => {
      console.time('stats-computation');
      const now = new Date();
      const startDate = startOfMonth(now);
      const endDate = endOfMonth(now);

      try {
        // 1. Fetch relevant data for the current month

        // A. Personal Expenses (User paid, Type=PERSONAL)
        const personalExpenses = await prisma.expense.findMany({
          where: {
            userId: id,
            type: ExpenseType.PERSONAL,
            expenseDate: { gte: startDate, lte: endDate }
          },
          select: { amount: true, expenseDate: true }
        });

        // B. Splits where User is involved
        // B1. My Share of Splits (Total Expenditure component)
        const mySplits = await prisma.expenseSplit.findMany({
          where: {
            userId: id,
            expense: {
              expenseDate: { gte: startDate, lte: endDate }
            }
          },
          include: {
            expense: { select: { expenseDate: true, userId: true } }
          }
        });

        // B3. Lent (Others owe me)
        const lentSplits = await prisma.expenseSplit.findMany({
          where: {
            userId: { not: id }, // Someone else
            expense: {
              userId: id, // I paid
              expenseDate: { gte: startDate, lte: endDate }
            }
          },
          include: {
            expense: { select: { expenseDate: true } }
          }
        });

        // 2. Aggregate Totals
        let totalPersonal = 0;
        let totalMyShareSplits = 0;
        let totalBorrowed = 0;
        let totalLent = 0;

        // Daily Map initialization
        const dailyMap = new Map<string, DailyStat>();
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        days.forEach(day => {
          const dateKey = format(day, 'MM/dd');
          dailyMap.set(dateKey, {
            date: dateKey,
            totalExpenditure: 0,
            borrowed: 0,
            lent: 0,
            personal: 0
          });
        });

        const getDayKey = (date: Date) => format(date, 'MM/dd');

        // Aggregate Personal
        personalExpenses.forEach(exp => {
          const amount = Number(exp.amount);
          totalPersonal += amount;

          const key = getDayKey(exp.expenseDate);
          if (dailyMap.has(key)) {
            const stat = dailyMap.get(key)!;
            stat.personal += amount;
            stat.totalExpenditure += amount;
          }
        });

        // Aggregate My Splits (includes Borrowed)
        mySplits.forEach(split => {
          const amount = Number(split.amount);
          totalMyShareSplits += amount;

          const key = getDayKey(split.expense.expenseDate);
          const isBorrowed = split.expense.userId !== id;

          if (isBorrowed) {
            totalBorrowed += amount;
          }

          if (dailyMap.has(key)) {
            const stat = dailyMap.get(key)!;
            stat.totalExpenditure += amount; // My share is always expenditure
            if (isBorrowed) {
              stat.borrowed += amount;
            }
          }
        });

        // Aggregate Lent
        lentSplits.forEach(split => {
          const amount = Number(split.amount);
          totalLent += amount;

          const key = getDayKey(split.expense.expenseDate);
          if (dailyMap.has(key)) {
            const stat = dailyMap.get(key)!;
            stat.lent += amount;
          }
        });

        // 3. Construct Result
        const totalExpenditure = totalPersonal + totalMyShareSplits;

        const stats: ExpenseStats = {
          totalExpenditure,
          borrowed: totalBorrowed,
          lent: totalLent,
          personal: totalPersonal,
          dailyStats: Array.from(dailyMap.values())
        };
        console.timeEnd('stats-computation');
        return stats;
      } catch (error) {
        console.error('Error in cached calculation:', error);
        return null;
      }
    },
    ['expense-stats'], // Base key
    {
      revalidate: 3600, // Fallback revalidate
      tags: [`expense-stats-${userId}`] // Tag based on User ID
    }
  );

  console.time('stats-total');
  const stats = await getCachedStats(userId);
  console.timeEnd('stats-total');

  if (!stats) return { stats: null, error: 'Failed to calculate stats' };
  return { stats };
}
