'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { settleExpenseSplit } from '@/actions/expense';
import { Check } from 'lucide-react';

interface ExpenseItemProps {
  expense: {
    id: string;
    description: string;
    amount: number | any;
    type: 'PERSONAL' | 'SPLIT' | 'INCOME' | string;
    expenseDate: Date;
    userId: string; // Add userId
    user: { name: string | null; avatarUrl?: string | null }; // Payer
    group?: { name: string | null } | null;
    splits: { userId: string; amount: any; isPaid: boolean; id: string; user: { name: string | null } }[];
  };
  currentUserId: string;
}

export function ExpenseItem({ expense, currentUserId }: ExpenseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const date = new Date(expense.expenseDate);
  const isPayer = expense.userId === currentUserId;

  // Find my split
  const mySplit = expense.splits.find(s => s.userId === currentUserId);

  // Stats for details
  const totalSplits = expense.splits.length;
  const settledSplits = expense.splits.filter(s => s.isPaid).length;
  const isFullySettled = totalSplits > 0 && totalSplits === settledSplits;

  // Calculate lent amount if payer
  const myShareWhenPayer = isPayer ? expense.splits.find(s => s.userId === currentUserId)?.amount || 0 : 0;
  const amountLent = Number(expense.amount) - Number(myShareWhenPayer);

  // Helper for "You owe" logic
  const iOweAmount = !isPayer && mySplit && !mySplit.isPaid ? mySplit.amount : 0;
  const iOwedAmount = !isPayer && mySplit ? mySplit.amount : 0;
  const iAmSettled = !isPayer && mySplit && mySplit.isPaid;

  const handleSettle = async (e: React.MouseEvent, splitId: string) => {
    e.stopPropagation();
    setIsLoading(true);
    await settleExpenseSplit(splitId);
    setIsLoading(false);
  };

  return (
    <Card
      variant="flat"
      className={`transition-all duration-200 cursor-pointer mb-2 border hover:border-primary/20 ${
        isFullySettled ? 'bg-gray-50/50' : 'bg-white'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Main Header Row */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <div
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg text-xs font-bold ${
              isFullySettled ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'
            }`}
          >
            <span className="uppercase">{format(date, 'MMM')}</span>
            <span className="text-lg">{format(date, 'dd')}</span>
          </div>
          <div>
            <h4 className={`font-bold text-lg ${isFullySettled ? 'text-gray-500 line-through' : 'text-primary'}`}>
              {expense.description}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {expense.group && (
                <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  {expense.group.name}
                </span>
              )}
              <span>
                {isPayer ? 'You' : expense.user.name} paid ${Number(expense.amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            {expense.type === 'PERSONAL' ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-blue-600 font-bold">You spent</span>
                <span className="font-bold text-blue-600 block text-lg">${Number(expense.amount).toFixed(2)}</span>
              </div>
            ) : isPayer ? (
              // Payer View
              <div className="flex flex-col items-end">
                {Number(myShareWhenPayer) > 0 && (
                  <span className="text-xs text-gray-400 font-bold mb-0.5">
                    your share ${Number(myShareWhenPayer).toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-emerald-600 font-bold">You lent</span>
                <span className="font-bold text-emerald-600 block text-lg">${amountLent.toFixed(2)}</span>
              </div>
            ) : (
              // Debtor View
              <div className="flex flex-col items-end">
                {iAmSettled ? (
                  <>
                    <>
                      <span className="text-xs text-gray-500 font-bold line-through">You owed</span>
                      <span className="font-bold block text-lg text-gray-500 line-through">
                        ${Number(iOwedAmount).toFixed(2)}
                      </span>
                    </>
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Settled
                    </span>
                  </>
                ) : (
                  iOweAmount > 0 && (
                    <>
                      <span className="text-xs text-red-500 font-bold">You owe</span>
                      <span className="font-bold text-red-500 block text-lg">${Number(iOweAmount).toFixed(2)}</span>
                    </>
                  )
                )}
              </div>
            )}
          </div>
          {expense.type !== 'PERSONAL' && (
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && expense.type !== 'PERSONAL' && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>Settlement Progress</span>
              <span>
                {settledSplits} of {totalSplits} settled
              </span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${totalSplits > 0 ? (settledSplits / totalSplits) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Splits List */}
          <div className="space-y-2">
            {expense.splits.map(split => {
              const isSplitPaid = split.isPaid || split.userId === expense.userId;

              return (
                <div key={split.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isSplitPaid ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className={split.userId === currentUserId ? 'font-bold text-primary' : 'text-gray-600'}>
                      {split.userId === currentUserId ? 'You' : split.user?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-600">${Number(split.amount).toFixed(2)}</span>

                    {/* Actions for this split - Only if I OWE */}
                    {(split.userId === currentUserId || isPayer) && !isSplitPaid && (
                      <Button
                        size="sm"
                        variant="outlined"
                        className="h-6 text-xs px-2 py-0 border-green-600 text-green-700 hover:bg-green-50"
                        onClick={e => handleSettle(e, split.id)}
                        isLoading={isLoading}
                      >
                        Settle
                      </Button>
                    )}
                    {isSplitPaid && (
                      <span className="text-xs text-green-600 font-bold px-2 py-0.5 bg-green-50 rounded">Paid</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
