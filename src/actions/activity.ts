'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';

export async function getActivityLog(userId: string, limit = 20) {
  try {
    // Fetch expenses where user is involved
    const activities = await prisma.expense.findMany({
      where: {
        OR: [
          { userId: userId }, // Created/Paid by me
          { splits: { some: { userId: userId } } } // I am in the split
        ]
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        group: { select: { name: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // We can post-process these to add "Action Text" or handle on client.
    // Returning raw data is better for flexible UI.
    return { activities };
  } catch (error) {
    console.error('Error fetching activity:', error);
    return { error: 'Failed to fetch activity' };
  }
}
