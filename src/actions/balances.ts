'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';

export type FriendBalance = {
  friendId: string;
  name: string;
  avatarUrl: string | null;
  email: string;
  amount: number; // Positive = They owe you, Negative = You owe them
};

export async function getFriendBalances(): Promise<{ balances: FriendBalance[]; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { balances: [], error: 'Unauthorized' };
  }

  const userId = session.user.id;

  try {
    // 1. Get all ExpenseSplits where I am involved (either as payer or split-er)
    // We need to aggregate by friend.

    // A. Amounts friends owe ME:
    // I paid (Expense.userId == Me), Friend split (Split.userId = Friend), !isPaid
    const owesMe = await prisma.expenseSplit.findMany({
      where: {
        isPaid: false,
        expense: {
          userId: userId // I paid
        },
        userId: { not: userId } // Someone else split
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    // B. Amounts I owe friends:
    // Friend paid (Expense.userId = Friend), I split (Split.userId = Me), !isPaid
    const iOwe = await prisma.expenseSplit.findMany({
      where: {
        userId: userId, // I split
        isPaid: false,
        expense: {
          userId: { not: userId } // Someone else paid
        }
      },
      include: {
        expense: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } } // Payer details
          }
        }
      }
    });

    const balanceMap = new Map<string, FriendBalance>();

    // Process "Owes Me"
    for (const split of owesMe) {
      const friend = split.user;
      const amount = Number(split.amount);

      if (!balanceMap.has(friend.id)) {
        balanceMap.set(friend.id, {
          friendId: friend.id,
          name: friend.name,
          avatarUrl: friend.avatarUrl,
          email: friend.email,
          amount: 0
        });
      }
      const current = balanceMap.get(friend.id)!;
      current.amount += amount;
    }

    // Process "I Owe"
    for (const split of iOwe) {
      const friend = split.expense.user; // The payer is the friend I owe
      const amount = Number(split.amount);

      if (!balanceMap.has(friend.id)) {
        balanceMap.set(friend.id, {
          friendId: friend.id,
          name: friend.name,
          avatarUrl: friend.avatarUrl,
          email: friend.email,
          amount: 0
        });
      }
      const current = balanceMap.get(friend.id)!;
      current.amount -= amount; // Subtract what I owe
    }

    // Convert map to array and sort
    const balances = Array.from(balanceMap.values())
      .filter(b => Math.abs(b.amount) > 0.01) // Filter out settled/zero balances
      .sort((a, b) => b.amount - a.amount); // Sort by amount desc (Owes me most -> I owe most)

    return { balances };
  } catch (error) {
    console.error('Error calculating balances:', error);
    return { balances: [], error: 'Failed to calculate balances' };
  }
}
