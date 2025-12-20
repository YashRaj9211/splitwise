'use client';

import { useState } from 'react';
import { ExpenseItem } from '@/components/expenses/ExpenseItem';
import { Button } from '@/components/ui/Button';
import { Plus, Settings, Users, HandCoins } from 'lucide-react';
import { GroupBalances } from './GroupBalances';
import { GroupSettingsModal } from './GroupSettingsModal';
import { GroupSettleUpModal } from './GroupSettleUpModal';
import Link from 'next/link';
import { Expense } from '@/generated/prisma/client';

type Props = {
  group: any; // Using any for complex Prisma includes, or define strictly if possible
  expenses: any[];
  balances: any[];
  currentUserId: string;
};

export function GroupDetailsView({ group, expenses, balances, currentUserId }: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

  const members = group.members.map((m: any) => ({
    id: m.userId,
    name: m.user.name,
    avatarUrl: m.user.avatarUrl,
    email: m.user.email
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Group Header */}
      <div className="bg-white border-thick border-primary rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="w-full md:auto">
              <h1 className="text-3xl md:text-4xl font-black text-primary mb-2 break-words">{group.name}</h1>
              <p className="text-secondary-text max-w-lg mb-4 text-sm md:text-base">{group.description}</p>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {members.map((member: any) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden shrink-0"
                      title={member.name}
                    >
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-500 ml-2 whitespace-nowrap">{members.length} members</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
              <Link href={`/expenses/create?groupId=${group.id}`} className="w-full md:w-auto">
                <Button className="w-full whitespace-nowrap">
                  <Plus className="w-5 h-5" />
                  Add Expense
                </Button>
              </Link>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outlined" onClick={() => setIsSettleUpOpen(true)} className="flex-1 md:flex-none whitespace-nowrap">
                  <HandCoins className="w-5 h-5" />
                  Settle Up
                </Button>
                <Button variant="outlined" onClick={() => setIsSettingsOpen(true)} className="px-3 shrink-0">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balances Section */}
      <GroupBalances balances={balances} members={members} currentUserId={currentUserId} />

      {/* Expenses Section */}
      <div className="pb-10">
        <h2 className="text-2xl font-bold text-primary mb-4">Expenses</h2>
        {expenses && expenses.length === 0 && (
          <div className="text-center py-10 opacity-50 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p>No expenses in this group yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {expenses?.map(expense => (
            <ExpenseItem key={expense.id} expense={expense} currentUserId={currentUserId} />
          ))}
        </div>
      </div>

      {/* Modals */}
      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        group={group}
        currentUserId={currentUserId}
      />

      <GroupSettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
