import { CreateGroupForm } from '@/components/groups/CreateGroupForm';

export default function CreateGroupPage() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-black text-primary mb-2">Start a New Group</h1>
      <p className="text-gray-500 mb-6">Groups are great for sharing bills like rent, trips, or utility bills.</p>
      <CreateGroupForm />
    </div>
  );
}
