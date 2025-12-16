'use client';

import { Card } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';

type Balance = {
  from: string;
  to: string;
  amount: number;
};

type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type Props = {
  balances: Balance[];
  members: Member[];
  currentUserId: string;
};

export function GroupBalances({ balances, members, currentUserId }: Props) {
  const getMember = (id: string) => members.find(m => m.id === id);

  if (!balances || balances.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-400 border-dashed">
        <p>No debts found. You remain all settled up!</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <h3 className="font-bold text-gray-700">Group Balances</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {balances.map((balance, idx) => {
          const debtor = getMember(balance.from);
          const creditor = getMember(balance.to);

          if (!debtor || !creditor) return null;

          const isMeDebtor = balance.from === currentUserId;
          const isMeCreditor = balance.to === currentUserId;

          return (
            <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
                    {debtor.avatarUrl ? (
                      <img src={debtor.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      debtor.name[0]
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-sm">{isMeDebtor ? 'You' : debtor.name}</span>
                  <span className="text-xs text-red-500 font-bold">owes</span>
                </div>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-gray-400 mb-1">${balance.amount}</span>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>

              <div className="flex items-center gap-3 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-gray-800 text-sm">{isMeCreditor ? 'You' : creditor.name}</span>
                  <span className="text-xs text-green-500 font-bold">gets back</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
                  {creditor.avatarUrl ? (
                    <img src={creditor.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    creditor.name[0]
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
