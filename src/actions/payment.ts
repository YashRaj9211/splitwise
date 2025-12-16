'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
    await prisma.payment.delete({
      where: { id: paymentId }
    });
    revalidatePath('/dashboard');
    return { success: 'Payment deleted' };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { error: 'Failed to delete payment' };
  }
}
