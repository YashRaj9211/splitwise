'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { BudgetPeriod } from '@/generated/prisma/enums';
import { revalidatePath } from 'next/cache';

type BudgetInput = {
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  categoryId?: string;
};

export async function createBudget(data: BudgetInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        amount: data.amount,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        categoryId: data.categoryId
      }
    });

    revalidatePath('/dashboard'); // or /budget
    return { success: 'Budget created', budget };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { error: 'Failed to create budget' };
  }
}

export async function getBudgets() {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' }
    });
    return { budgets };
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return { error: 'Failed to fetch budgets' };
  }
}
