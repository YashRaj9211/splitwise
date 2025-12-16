import { auth } from '@/lib/auth';
import { getFriends } from '@/actions/friendship';
import { getUserGroups } from '@/actions/group';
import { CreateExpenseForm } from '@/components/expenses/CreateExpenseForm';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CreateExpensePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const resolvedParams = await searchParams;
  const groupId = typeof resolvedParams.groupId === 'string' ? resolvedParams.groupId : undefined;

  const { friends } = await getFriends();
  const { groups } = await getUserGroups();

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h1 className="text-3xl font-black text-primary mb-6">Add Expense</h1>
      <CreateExpenseForm
        friends={friends || []}
        groups={groups || []}
        currentUserId={session.user.id!}
        defaultGroupId={groupId}
      />
    </div>
  );
}
