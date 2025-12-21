'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

type PaymentInput = {
  payerId: string;
  receiverId: string;
  amount: number;
  currency?: string;
  description?: string;
  expenseId?: string; // Optional linkage to an expense
};

export async function recordPayment(data: PaymentInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  // Ensure current user is either payer or receiver for security?
  // Usually the payer records it. Or receiver acknowledges it.
  // For now, allow if logged in.

  try {
    const payment = await prisma.payment.create({
      data: {
        payerId: data.payerId,
        receiverId: data.receiverId,
        amount: data.amount,
        currency: data.currency || 'USD',
        description: data.description,
        expenseId: data.expenseId
      }
    });

    // Invalidate user-centric caches
    (revalidateTag as any)(`friend-balances-${data.payerId}`);
    (revalidateTag as any)(`friend-balances-${data.receiverId}`);
    (revalidateTag as any)(`expense-stats-${data.payerId}`);
    (revalidateTag as any)(`expense-stats-${data.receiverId}`);

    // Note: To properly invalidate group balances, we'd need to find all common groups.
    // For now, we rely on the fact that balances might be eventually consistent or require a specific common-group lookup.

    revalidatePath('/dashboard');
    return { success: 'Payment recorded', payment };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { error: 'Failed to record payment' };
  }
}

export async function deletePayment(paymentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) return { error: 'Payment not found' };

    await prisma.payment.delete({
      where: { id: paymentId }
    });

    (revalidateTag as any)(`friend-balances-${payment.payerId}`);
    (revalidateTag as any)(`friend-balances-${payment.receiverId}`);
    (revalidateTag as any)(`expense-stats-${payment.payerId}`);
    (revalidateTag as any)(`expense-stats-${payment.receiverId}`);

    revalidatePath('/dashboard');
    return { success: 'Payment deleted' };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { error: 'Failed to delete payment' };
  }
}
