import { AddFriendForm } from '@/components/friends/AddFriendForm';

export default function AddFriendPage() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-black text-primary mb-2">Add Friend</h1>
      <p className="text-gray-500 mb-6">Invite your friends to Splitwise to start sharing expenses.</p>
      <AddFriendForm />
    </div>
  );
}
