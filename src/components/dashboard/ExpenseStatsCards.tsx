'use client';
import { useState } from 'react';
import { ExpenditureBreakdownModal } from '@/components/dashboard/ExpenditureBreakdownModal';
import { ExpenseStats } from '@/actions/stats';
import { Wallet, CreditCard, ArrowRightLeft, User, Info } from 'lucide-react';

export function ExpenseStatsCards({ stats }: { stats: ExpenseStats }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const cards = [
    {
      title: 'Total Expenditure',
      amount: stats.totalExpenditure,
      icon: Wallet,
      color: 'bg-primary',
      textColor: 'text-white',
      description: 'Includes your personal expenses + your share of split expenses',
      onClick: () => setShowBreakdown(true)
    },
    {
      title: 'Borrowed',
      amount: stats.borrowed,
      icon: ArrowRightLeft,
      color: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Lent',
      amount: stats.lent,
      icon: CreditCard,
      color: 'bg-emerald-100',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Personal',
      amount: stats.personal,
      icon: User,
      color: 'bg-blue-100',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div
            key={card.title}
            onClick={card.onClick}
            className={`rounded-xl border-thick border-primary bg-white p-6 shadow-[4px_4px_0px_var(--color-primary)] transition-transform hover:-translate-y-1 ${
              card.onClick ? 'cursor-pointer hover:shadow-[6px_6px_0px_var(--color-primary)]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl border-2 border-primary ${card.color}`}>
                <card.icon className={`h-6 w-6 ${card.textColor === 'text-white' ? 'text-white' : 'text-primary'}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-bold text-primary/60">{card.title}</p>
                {card.description && (
                  <div className="group relative">
                    <Info className="h-4 w-4 text-primary/40 hover:text-primary cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-primary text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg z-10 pointer-events-none text-center font-medium">
                      {card.description}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                    </div>
                  </div>
                )}
              </div>
              <h3
                className={`text-2xl font-black ${card.textColor === 'text-white' ? 'text-primary' : card.textColor}`}
              >
                ${card.amount.toFixed(2)}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <ExpenditureBreakdownModal isOpen={showBreakdown} onClose={() => setShowBreakdown(false)} />
    </>
  );
}
