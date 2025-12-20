'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { ExpenseType } from '@/generated/prisma/enums';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';

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
  console.time('stats');

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  try {
    // 1. Fetch relevant data for the current month

    // A. Personal Expenses (User paid, Type=PERSONAL)
    const personalExpenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        type: ExpenseType.PERSONAL,
        expenseDate: { gte: startDate, lte: endDate }
      },
      select: { amount: true, expenseDate: true }
    });

    // B. Splits where User is involved
    // We need both:
    // - Splits I am part of (Where I owe someone OR I paid and split with myself)
    // - Splits others are part of for expenses I paid (Lent)

    // Fetch all splits for expenses in this month where user is involved either as payer or splitter
    // This is complex to do in one query efficiently, let's break it down.

    // B1. My Share of Splits (Total Expenditure component)
    // Splits where userId = Me.
    const mySplits = await prisma.expenseSplit.findMany({
      where: {
        userId: userId,
        expense: {
          expenseDate: { gte: startDate, lte: endDate }
        }
      },
      include: {
        expense: { select: { expenseDate: true, userId: true } }
      }
    });

    // B2. Borrowed (I owe others)
    // Subset of B1 where expense.userId != Me
    // We can filter this from `mySplits` in memory to avoid double DB hit?
    // Actually, `mySplits` contains "My Share" of everything.
    // If expense.userId == Me, it's my share of my own paid expense.
    // If expense.userId != Me, it's my share of someone else's expense (Borrowed).

    // B3. Lent (Others owe me)
    // Splits where Expense.userId = Me AND Split.userId != Me.
    const lentSplits = await prisma.expenseSplit.findMany({
      where: {
        userId: { not: userId }, // Someone else
        expense: {
          userId: userId, // I paid
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
      const isBorrowed = split.expense.userId !== userId;

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
    // Total Expenditure = Personal + My Share of Splits (which includes borrowed amounts that I consumed)
    const totalExpenditure = totalPersonal + totalMyShareSplits;

    const stats: ExpenseStats = {
      totalExpenditure,
      borrowed: totalBorrowed,
      lent: totalLent,
      personal: totalPersonal,
      dailyStats: Array.from(dailyMap.values())
    };
    console.timeEnd('stats');
    return { stats };
  } catch (error) {
    console.error('Error calculating expense stats:', error);
    return { stats: null, error: 'Failed to calculate stats' };
  }
}
