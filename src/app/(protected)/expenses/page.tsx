import { auth } from '@/lib/auth';
import { getUserExpenses } from '@/actions/expense';
import { getDashboardStats } from '@/actions/dashboard';
import { ExpensesList } from '@/components/expenses/ExpensesList';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { expenses, error: expenseError } = await getUserExpenses();
  const { stats, error: statsError } = await getDashboardStats();

  const totalBalance = stats?.totalBalance || 0;
  const youOwe = stats?.youOwe || 0;
  const youAreOwed = stats?.youAreOwed || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="edged" className="bg-white">
          <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Total Balance</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-4xl font-black ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {totalBalance >= 0 ? 'Overall, you are owed money.' : 'Overall, you owe money.'}
          </p>
        </Card>

        <Card variant="flat" className="bg-red-50 border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-red-800">You Owe</h3>
          </div>
          <span className="text-2xl font-bold text-red-700">${youOwe.toFixed(2)}</span>
        </Card>

        <Card variant="flat" className="bg-emerald-50 border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-emerald-800">You are Owed</h3>
          </div>
          <span className="text-2xl font-bold text-emerald-700">${youAreOwed.toFixed(2)}</span>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-primary">Expenses</h1>
        <Link href="/expenses/create">
          <Button>
            <Plus className="w-5 h-5" />
            Add Expense
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {expenseError && <p className="text-red-500">Failed to load expenses.</p>}

        <ExpensesList expenses={expenses || []} currentUserId={session.user?.id || ''} />
      </div>
    </div>
  );
}
