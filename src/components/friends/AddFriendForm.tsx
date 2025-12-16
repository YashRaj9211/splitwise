'use client';

import { useState } from 'react';
import { sendFriendRequest, searchUser } from '@/actions/friendship';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserPlus, Search, Check, UserX } from 'lucide-react';
import { FriendshipStatus } from '@/generated/prisma/enums';

type SearchResult = {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
  status: FriendshipStatus | 'NONE';
} | null;

export function AddFriendForm() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResult(null);
    setError(null);
    setSuccess(null);

    if (!query || query.length < 3) {
      setError('Please enter at least 3 characters.');
      return;
    }

    setIsSearching(true);
    const res = await searchUser(query);
    setIsSearching(false);

    if (res.error) {
      setError(res.error);
    } else if (res.user) {
      setSearchResult({ user: res.user, status: res.status as FriendshipStatus | 'NONE' });
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    setIsSending(true);
    setError(null);

    const res = await sendFriendRequest(searchResult.user.id);
    setIsSending(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess('Friend request sent successfully!');
      // Update local status to prevent duplicate sends
      setSearchResult(prev => (prev ? { ...prev, status: FriendshipStatus.PENDING } : null));
    }
  };

  return (
    <Card className="w-full">
      {/* Search Section */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            name="query"
            placeholder="Enter email or username..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-12"
          />
        </div>
        <Button type="submit" isLoading={isSearching} className="h-full mt-7">
          {/* Input has label space, so margin to align? Or just remove label from input for this specific UI? */}
          {/* The Input component has a label wrapper. If no label is passed, it just renders input. But div wrapper exists. */}
          {/* Easier to just use Search icon button */}
          <Search className="w-5 h-5" />
        </Button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm font-bold bg-red-100 text-red-700 flex items-center gap-2">
          <UserX className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 rounded-xl text-sm font-bold bg-green-100 text-green-700 flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Result Card */}
      {searchResult && !error && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center font-bold text-primary text-xl">
                {searchResult.user.avatarUrl ? (
                  <img src={searchResult.user.avatarUrl} className="w-full h-full rounded-full" />
                ) : (
                  searchResult.user.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary">{searchResult.user.name}</h3>
                <p className="text-sm text-gray-500">
                  @{searchResult.user.username || 'unknown'} • {searchResult.user.email}
                </p>
              </div>
            </div>

            {/* Action Button based on Status */}
            <div>
              {searchResult.status === 'NONE' && (
                <Button onClick={handleSendRequest} isLoading={isSending}>
                  <UserPlus className="w-5 h-5" />
                  Add Friend
                </Button>
              )}
              {searchResult.status === FriendshipStatus.PENDING && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              )}
              {searchResult.status === FriendshipStatus.ACCEPTED && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  Friends
                </span>
              )}
              {/* Blocked? */}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
