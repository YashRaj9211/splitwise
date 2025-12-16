'use client';

import { useState } from 'react';
import { createGroup } from '@/actions/group';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateGroupForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function clientAction(formData: FormData) {
    setError(null);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    const res = await createGroup(name, description);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.group) {
      // Redirect to the new group
      router.push(`/groups/${res.group.id}`);
    }
  }

  return (
    <Card className="w-full">
      <form action={clientAction} className="flex flex-col gap-4">
        <Input name="name" type="text" label="Group Name" placeholder="Trip to Paris, Apartment 302..." required />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-primary">Description (Optional)</label>
          <textarea
            name="description"
            className="input-edged min-h-[100px]"
            placeholder="Brief description of the group..."
          />
        </div>

        {error && <div className="p-3 rounded-xl text-sm font-bold bg-red-100 text-red-700">{error}</div>}

        <SubmitButton>
          <Users className="w-5 h-5" />
          Create Group
        </SubmitButton>
      </form>
    </Card>
  );
}
