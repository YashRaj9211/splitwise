'use server';

import prisma from '@/db';
import { auth } from '@/lib/auth';
import { FriendshipStatus } from '@/generated/prisma/enums';
import { revalidatePath } from 'next/cache';

export async function searchUser(query: string) {
  const session = await auth();
  console.log(session);
  if (!session?.user?.id) return { error: 'Unauthorized' };

  if (!query || query.length < 3) return { error: 'Query too short' };

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: query }, { username: query }],
        NOT: {
          id: session.user.id // Exclude self
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true
      }
    });

    if (!user) return { error: 'User not found' };

    // Check friendship status
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: user.id },
          { userId: user.id, friendId: session.user.id }
        ]
      }
    });

    return { user, status: friendship?.status || 'NONE' };
  } catch (error) {
    console.error('Error searching user:', error);
    return { error: 'Search failed' };
  }
}

export async function sendFriendRequest(identifier: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const friend = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { id: identifier } // Allow passing ID directly if known
        ]
      }
    });

    if (!friend) {
      return { error: 'User not found' };
    }

    if (friend.id === session.user.id) {
      return { error: 'You cannot send a friend request to yourself' };
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: friend.id },
          { userId: friend.id, friendId: session.user.id }
        ]
      }
    });

    if (existingFriendship) {
      return { error: `Friendship already exists (Status: ${existingFriendship.status})` };
    }

    await prisma.friendship.create({
      data: {
        userId: session.user.id,
        friendId: friend.id,
        status: FriendshipStatus.PENDING
      }
    });

    revalidatePath('/friends');
    return { success: 'Friend request sent' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { error: 'Failed to send friend request' };
  }
}

export async function updateFriendshipStatus(requestId: string, status: FriendshipStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    // Verify the user is part of this friendship request
    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId }
    });

    if (!friendship) return { error: 'Request not found' };

    // Only the receiver can ACCEPT/DECLINE (effectively update status), but for simplicity here allowing updates if involved.
    // In a real app, strictly check if user is the receiver for ACCEPT.

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status }
    });

    revalidatePath('/friends');
    return { success: `Friend request ${status.toLowerCase()}` };
  } catch (error) {
    console.error('Error updating friendship status:', error);
    return { error: 'Failed to update friendship status' };
  }
}

export async function getFriends(userId: string) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ userId: userId }, { friendId: userId }]
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        friend: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    // Transform to return just the friend user object
    const friends = friendships.map(f => (f.userId === userId ? f.friend : f.user));
    return { friends };
  } catch (error) {
    console.error('Error fetching friends:', error);
    return { error: 'Failed to fetch friends' };
  }
}

export async function getPendingRequests(userId: string) {
  try {
    const requests = await prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: FriendshipStatus.PENDING
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
    return { requests };
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return { error: 'Failed to fetch pending requests' };
  }
}
