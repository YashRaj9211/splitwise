'use client';

import { useState } from 'react';
import { updateFriendshipStatus } from '@/actions/friendship';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FriendshipStatus } from '@/generated/prisma/enums';

type Props = {
  request: {
    id: string;
    user: {
      id: string;
      name: string;
    };
  };
};

export function FriendRequestItem({ request }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (status: FriendshipStatus) => {
    setIsLoading(true);
    try {
      await updateFriendshipStatus(request.id, status);
      // Revalidate happens on server, page should refresh if using router?
      // Server actions with revalidatePath usually trigger a refresh automatically on client.
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="flat" className="flex items-center justify-between bg-yellow-50 border-yellow-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center font-bold text-yellow-700">
          {request.user.name.charAt(0)}
        </div>
        <span className="font-bold text-primary">{request.user.name}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          className="py-1 px-3 text-sm h-8"
          onClick={() => handleAction(FriendshipStatus.ACCEPTED)}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          className="py-1 px-3 text-sm h-8 text-red-500 hover:bg-red-50"
          onClick={() => handleAction(FriendshipStatus.BLOCKED)} // Or just delete? For now BLOCKED or DECLINED if we had it. Enum has BLOCKED.
          isLoading={isLoading}
          disabled={isLoading}
        >
          Ignore
        </Button>
      </div>
    </Card>
  );
}
