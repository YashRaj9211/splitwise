import { auth } from '@/lib/auth';
import { getUserGroups } from '@/actions/group';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');
  const { groups, error } = await getUserGroups(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-primary"></h1>
        <Link href="/groups/create">
          <Button>
            <Plus className="w-5 h-5" />
            Start a New Group
          </Button>
        </Link>
      </div>

      {error && <p className="text-red-500">Failed to load groups.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups && groups.length === 0 && (
          <div className="text-center py-10 opacity-50 border-2 border-dashed border-gray-200 rounded-xl col-span-full">
            <p>You are not in any groups yet.</p>
          </div>
        )}

        {groups?.map(group => (
          <Link href={`/groups/${group.id}`} key={group.id}>
            <Card
              variant="edged"
              className="hover:shadow-[2px_2px_0px_var(--color-primary)] transition-all cursor-pointer h-full flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  {/* Placeholder for group image */}
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">{group.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{group.description || 'No description'}</p>
                </div>
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {group._count.members} Members
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
