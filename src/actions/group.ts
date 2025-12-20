'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { GroupRole } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';
import { revalidatePath } from 'next/cache';

export async function createGroup(name: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: session.user.id,
            role: GroupRole.ADMIN
          }
        }
      }
    });

    revalidatePath('/groups');
    return { success: 'Group created', group };
  } catch (error) {
    console.error('Error creating group:', error);
    return { error: 'Failed to create group' };
  }
}

export async function addMemberToGroup(groupId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      return { error: 'User not found' };
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: userToAdd.id
        }
      }
    });

    if (existingMember) {
      return { error: 'User is already a member of this group' };
    }

    await prisma.groupMember.create({
      data: {
        groupId,
        userId: userToAdd.id,
        role: GroupRole.MEMBER
      }
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: 'Member added to group' };
  } catch (error) {
    console.error('Error adding member to group:', error);
    return { error: 'Failed to add member to group' };
  }
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: 'Member removed from group' };
  } catch (error) {
    console.error('Error removing member from group:', error);
    return { error: 'Failed to remove member from group' };
  }
}

export async function updateGroupDetails(groupId: string, data: Prisma.GroupUpdateInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await prisma.group.update({
      where: { id: groupId },
      data
    });
    revalidatePath(`/groups/${groupId}`);
    return { success: 'Group updated' };
  } catch (error) {
    console.error('Error updating group:', error);
    return { error: 'Failed to update group' };
  }
}

export async function deleteGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    await prisma.group.delete({
      where: { id: groupId }
    });
    revalidatePath('/groups');
    return { success: 'Group deleted' };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { error: 'Failed to delete group' };
  }
}

export async function getUserGroups(userId: string) {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: { userId: userId }
        }
      },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { groups };
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return { error: 'Failed to fetch groups' };
  }
}

export async function getGroupBalances(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group) return { error: 'Group not found' };

    const members = group.members.map(m => m.userId);

    // 1. Fetch Expenses
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true }
    });

    // 2. Fetch Payments (between group members)
    // Heuristic: specific payments not linked to group, but between members
    const payments = await prisma.payment.findMany({
      where: {
        payerId: { in: members },
        receiverId: { in: members }
      }
    });

    // Pairwise Debts: [Debtor][Creditor] = Amount
    const balances: Record<string, Record<string, number>> = {};

    // Initialize
    members.forEach(m => {
      balances[m] = {};
      members.forEach(other => {
        if (m !== other) balances[m][other] = 0;
      });
    });

    // Process Expenses
    expenses.forEach(expense => {
      const payerId = expense.userId;
      expense.splits.forEach(split => {
        if (split.userId !== payerId) {
          // User owes Payer
          const amount = Number(split.amount); // Ensure number
          if (!balances[split.userId]) balances[split.userId] = {}; // Safety
          if (!balances[split.userId][payerId]) balances[split.userId][payerId] = 0;

          balances[split.userId][payerId] += amount;

          // Inverse for tracking (optional, but keep one-way map clean)
          // Actually simpler to just track Debtor->Creditor positive
          if (!balances[payerId]) balances[payerId] = {};
          if (!balances[payerId][split.userId]) balances[payerId][split.userId] = 0;
          balances[payerId][split.userId] -= amount;
        }
      });
    });

    // Process Payments (Reduces Debt)
    payments.forEach(payment => {
      // Payer pays Receiver => Payer owed Receiver, now owes less
      const amount = Number(payment.amount);
      if (balances[payment.payerId] && balances[payment.payerId][payment.receiverId] !== undefined) {
        balances[payment.payerId][payment.receiverId] -= amount;
      }
      if (balances[payment.receiverId] && balances[payment.receiverId][payment.payerId] !== undefined) {
        balances[payment.receiverId][payment.payerId] += amount;
      }
    });

    // Determine Final Edges
    let edges: { from: string; to: string; amount: number }[] = [];

    if (group.simplifyDebts) {
      // SIMPLIFY: Calculate Net Balance per user
      const netBalances: Record<string, number> = {};
      members.forEach(m => (netBalances[m] = 0));

      Object.keys(balances).forEach(u1 => {
        Object.keys(balances[u1]).forEach(u2 => {
          // if u1 owes u2 positive amount
          netBalances[u1] -= balances[u1][u2];
          netBalances[u2] += balances[u1][u2];
        });
      });

      // This double counts?
      // Logic: if balances[A][B] = 10, A owes B 10.
      // net[A] -= 10, net[B] += 10.
      // But we also have balances[B][A] = -10.
      // net[B] -= (-10) => +10. net[A] += (-10) => -10.
      // Result: A = -20, B = +20. Double counted.
      // Fix: Only process positive edges or iterate unique pairs.

      // Reset and redo correct net calculation
      members.forEach(m => (netBalances[m] = 0));
      members.forEach(u1 => {
        members.forEach(u2 => {
          if (u1 < u2) {
            // Unique pairs
            const val = balances[u1]?.[u2] || 0;
            // val > 0 => u1 owes u2.
            // val < 0 => u2 owes u1.
            netBalances[u1] -= val;
            netBalances[u2] += val;
          }
        });
      });

      // Greedy Matching
      const debtors = members.filter(m => netBalances[m] < -0.01).sort((a, b) => netBalances[a] - netBalances[b]); // Most negative first
      const creditors = members.filter(m => netBalances[m] > 0.01).sort((a, b) => netBalances[b] - netBalances[a]); // Most positive first

      // We use mutable values
      const finalNets = { ...netBalances };

      let i = 0; // debtor index
      let j = 0; // creditor index

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const debtAmount = Math.abs(finalNets[debtor]);
        const creditAmount = finalNets[creditor];

        const settleAmount = Math.min(debtAmount, creditAmount);

        edges.push({ from: debtor, to: creditor, amount: Number(settleAmount.toFixed(2)) });

        finalNets[debtor] += settleAmount;
        finalNets[creditor] -= settleAmount;

        if (Math.abs(finalNets[debtor]) < 0.01) i++;
        if (finalNets[creditor] < 0.01) j++;
      }
    } else {
      // NO SIMPLIFY: Just clean up direct edges
      members.forEach(u1 => {
        members.forEach(u2 => {
          // Only take positive debts to avoid duplicates (A->B positive means B->A negative)
          if (balances[u1]?.[u2] > 0.01) {
            edges.push({ from: u1, to: u2, amount: Number(balances[u1][u2].toFixed(2)) });
          }
        });
      });
    }

    return { balances: edges };
  } catch (error) {
    console.error('Error calculating group balances:', error);
    return { error: 'Failed to calculate balances' };
  }
}
