import prisma from '@/db';
import { auth } from '@/lib/auth';
import { getGroupExpenses } from '@/actions/expense';
import { getGroupBalances } from '@/actions/group';
import { GroupDetailsView } from '@/components/groups/GroupDetailsView';
import { notFound, redirect } from 'next/navigation';

interface GroupPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailsPage({ params }: GroupPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  // Fetch Group Details
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { name: true, avatarUrl: true, email: true } } }
      }
    }
  });

  if (!group) return notFound();

  // Check if user is member
  const isMember = group.members.some(m => m.userId === session.user?.id);
  if (!isMember) {
    return <div className="p-8 text-red-500">You are not a member of this group.</div>;
  }

  const [expensesData, balancesData] = await Promise.all([getGroupExpenses(id), getGroupBalances(id)]);
  
  const expenses = 'expenses' in expensesData ? expensesData.expenses : [];
  const balances = 'balances' in balancesData ? balancesData.balances : [];

  if ('error' in expensesData) console.error('Error fetching expenses:', expensesData.error);
  if ('error' in balancesData) console.error('Error fetching balances:', balancesData.error);

  return (
    <GroupDetailsView
      group={group}
      expenses={expenses || []}
      balances={balances || []}
      currentUserId={session.user.id!}
    />
  );
}
