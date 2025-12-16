import { auth } from '@/lib/auth';
import { getFriends, getPendingRequests } from '@/actions/friendship';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlus, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FriendRequestItem } from '@/components/friends/FriendRequestItem';

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const { friends, error: friendsError } = await getFriends();
  const { requests, error: requestsError } = await getPendingRequests();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-primary"></h1>
        <Link href="/friends/add">
          <Button>
            <UserPlus className="w-5 h-5" />
            Add Friend
          </Button>
        </Link>
      </div>

      {requests && requests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4">Pending Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <FriendRequestItem key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}

      <div>
        {/* <h2 className="text-xl font-bold text-primary mb-4">Your Friends</h2> */}
        {friends && friends.length === 0 && (
          <div className="text-center py-10 opacity-50 border-2 border-dashed border-gray-200 rounded-xl">
            <p>No friends added yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends?.map(friend => (
            <Card
              key={friend.id}
              variant="edged"
              className="flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-primary text-xl">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} className="w-full h-full rounded-full" />
                ) : (
                  friend.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary">{friend.name}</h3>
                <p className="text-xs text-gray-500">{friend.email}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
