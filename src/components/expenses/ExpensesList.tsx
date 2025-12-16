'use client';

import { format } from 'date-fns';
import { ExpenseItem } from './ExpenseItem';

interface ExpensesListProps {
  expenses: any[];
  currentUserId: string;
}

interface ExpenseGroup {
  month: string;
  expenses: any[];
}

export function ExpensesList({ expenses, currentUserId }: ExpensesListProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-10 opacity-50">
        <p>No expenses yet.</p>
      </div>
    );
  }

  // Group expenses by Month Year using a Map to preserve insertion order (since input is sorted)
  const groupsMap = new Map<string, any[]>();

  expenses.forEach(expense => {
    const date = new Date(expense.expenseDate);
    const key = format(date, 'MMMM yyyy');

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key)!.push(expense);
  });

  // Convert to array
  const groups: ExpenseGroup[] = Array.from(groupsMap.entries()).map(([month, groupExpenses]) => ({
    month,
    expenses: groupExpenses
  }));

  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <div key={group.month} className="flex flex-col gap-2">
          <div className="sticky top-20 z-10 bg-primary-light/95 backdrop-blur-sm py-2 px-1 border-b mb-2">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider">{group.month}</h3>
          </div>
          <div className="flex flex-col gap-2">
            {group.expenses.map((expense: any) => (
              <ExpenseItem key={expense.id} expense={expense} currentUserId={currentUserId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
