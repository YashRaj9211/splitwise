'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { ExpenseType, SplitType } from '@/generated/prisma/enums';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

type CreateExpenseInput = {
  description: string;
  amount: number;
  currency?: string;
  note?: string;
  date: Date;
  type: ExpenseType;
  payerId?: string; // Opt-in payer ID
  groupId?: string;
  categoryId?: string;
  splits: {
    userId: string;
    amount: number;
    splitType: SplitType;
    percentage?: number;
  }[];
};

export async function createExpense(data: CreateExpenseInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  // Use provided payerId or default to current user.
  // In a real app, verify that 'payerId' is a friend or group member.
  const payerId = data.payerId || session.user.id;

  try {
    // Basic validation can go here (e.g., check if splits sum up to amount)

    const expense = await prisma.$transaction(async tx => {
      // 1. Create the Expense
      const newExpense = await tx.expense.create({
        data: {
          description: data.description,
          amount: data.amount,
          currency: data.currency || 'INR',
          note: data.note,
          expenseDate: data.date,
          type: data.type,
          userId: payerId, // Payer
          groupId: data.groupId,
          categoryId: data.categoryId
        }
      });

      // 2. Create Splits
      if (data.type === ExpenseType.SPLIT && data.splits.length > 0) {
        await tx.expenseSplit.createMany({
          data: data.splits.map(split => ({
            expenseId: newExpense.id,
            userId: split.userId,
            amount: split.amount,
            splitType: split.splitType,
            percentage: split.percentage,
            isPaid: split.userId === payerId // Payer's split is auto-paid
          }))
        });
      }

      return newExpense;
    });

    if (data.groupId) {
      (revalidateTag as any)(`group-expenses-${data.groupId}`);
      (revalidateTag as any)(`group-balances-${data.groupId}`);
      revalidatePath(`/groups/${data.groupId}`);
    } else {
      revalidatePath('/dashboard');
    }

    // Always invalidate user-specific caches for the payer and potential split participants (simplified for payer here)
    // Ideally we iterate over all participants, but for now let's at least hit the creator/payer
    (revalidateTag as any)(`user-expenses-${payerId}`);
    (revalidateTag as any)(`expense-stats-${payerId}`);
    (revalidateTag as any)(`friend-balances-${payerId}`);

    // Also invalidate for other participants
    data.splits.forEach(split => {
      (revalidateTag as any)(`user-expenses-${split.userId}`);
      (revalidateTag as any)(`expense-stats-${split.userId}`);
      (revalidateTag as any)(`friend-balances-${split.userId}`);
    });

    return { success: 'Expense created', expense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { error: 'Failed to create expense' };
  }
}

export async function deleteExpense(expenseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { splits: true }
    });

    if (!expense) return { error: 'Expense not found' };

    await prisma.expense.delete({
      where: { id: expenseId }
    });

    // Invalidate caches
    (revalidateTag as any)(`user-expenses-${expense.userId}`);
    (revalidateTag as any)(`expense-stats-${expense.userId}`);
    (revalidateTag as any)(`friend-balances-${expense.userId}`);

    if (expense.groupId) {
      (revalidateTag as any)(`group-expenses-${expense.groupId}`);
      (revalidateTag as any)(`group-balances-${expense.groupId}`);
    }

    expense.splits.forEach(split => {
      (revalidateTag as any)(`user-expenses-${split.userId}`);
      (revalidateTag as any)(`expense-stats-${split.userId}`);
      (revalidateTag as any)(`friend-balances-${split.userId}`);
    });

    revalidatePath('/dashboard');
    return { success: 'Expense deleted' };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error: 'Failed to delete expense' };
  }
}

export async function getGroupExpenses(groupId: string) {
  const getCachedGroupExpenses = unstable_cache(
    async (id: string) => {
      try {
        const expenses = await prisma.expense.findMany({
          where: { groupId: id },
          include: {
            user: { select: { name: true, avatarUrl: true } }, // Payer
            splits: { include: { user: { select: { name: true } } } }
          },
          orderBy: { expenseDate: 'desc' }
        });
        return { expenses };
      } catch (error) {
        console.error('Error fetching group expenses:', error);
        return { error: 'Failed to fetch expenses' };
      }
    },
    ['group-expenses'],
    {
      revalidate: 3600,
      tags: [`group-expenses-${groupId}`]
    }
  );

  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  return getCachedGroupExpenses(groupId);
}

export async function getUserExpenses(userId: string) {
  const getCachedExpenses = unstable_cache(
    async (id: string) => {
      console.time('getUserExpenses-computation');
      try {
        // Fetch expenses where user is payer OR user is involved in split
        const expenses = await prisma.expense.findMany({
          where: {
            OR: [{ userId: id }, { splits: { some: { userId: id } } }]
          },
          include: {
            user: { select: { name: true, avatarUrl: true } }, // Payer
            splits: { include: { user: { select: { name: true } } } },
            group: { select: { name: true } }
          },
          orderBy: { expenseDate: 'desc' }
        });

        const safeExpenses = expenses.map(expense => ({
          ...expense,
          amount: Number(expense.amount),
          splits: expense.splits.map(split => ({
            ...split,
            amount: Number(split.amount),
            percentage: split.percentage ? Number(split.percentage) : null
          }))
        }));

        console.timeEnd('getUserExpenses-computation');
        return { expenses: safeExpenses };
      } catch (error) {
        console.error('Error fetching user expenses:', error);
        return { expenses: [], error: 'Failed to fetch expenses' };
      }
    },
    ['user-expenses'],
    {
      revalidate: 3600,
      tags: [`user-expenses-${userId}`]
    }
  );

  return getCachedExpenses(userId);
}

export async function settleExpenseSplit(splitId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const split = await prisma.expenseSplit.findUnique({
      where: { id: splitId },
      include: { expense: true }
    });

    if (!split) return { error: 'Split not found' };

    const isDebtor = split.userId === session.user.id;
    const isPayer = split.expense.userId === session.user.id;

    if (!isDebtor && !isPayer) return { error: 'Not authorized' };

    await prisma.expenseSplit.update({
      where: { id: splitId },
      data: { isPaid: true }
    });

    const payerId = split.expense.userId;
    const debtorId = split.userId;

    // Invalidate caches
    (revalidateTag as any)(`friend-balances-${payerId}`);
    (revalidateTag as any)(`friend-balances-${debtorId}`);
    (revalidateTag as any)(`expense-stats-${payerId}`);
    (revalidateTag as any)(`expense-stats-${debtorId}`);

    // Also invalidate lists? Maybe not needed for just settlement status unless UI shows it.
    // But balances are definitely affected.
    (revalidateTag as any)(`user-expenses-${payerId}`);
    (revalidateTag as any)(`user-expenses-${debtorId}`);

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: 'Expense settled' };
  } catch (error) {
    console.error('Error settling expense:', error);
    return { error: 'Failed to settle expense' };
  }
}
