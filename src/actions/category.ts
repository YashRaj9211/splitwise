'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createCategory(name: string, icon?: string, color?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color
      }
    });

    revalidatePath('/expenses');
    return { success: 'Category created', category };
  } catch (error) {
    console.error('Error creating category:', error);
    return { error: 'Failed to create category' };
  }
}

export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return { categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { error: 'Failed to fetch categories' };
  }
}
