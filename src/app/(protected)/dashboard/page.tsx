import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getFriendBalances } from '@/actions/balances';
import { getExpenseStats } from '@/actions/stats';
import { BalancesList } from '@/components/dashboard/BalancesList';
import { ExpenseStatsCards } from '@/components/dashboard/ExpenseStatsCards';
import { DailySpendGraph } from '@/components/dashboard/DailySpendGraph';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const [balancesData, statsData] = await Promise.all([
    getFriendBalances(session.user.id),
    getExpenseStats(session.user.id)
  ]);

  const { balances, error: balancesError } = balancesData;
  const { stats, error: statsError } = statsData;

  return (
    <div className="space-y-8">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-primary">Dashboard</h2>
      </div> */}

      {/* Stats Cards */}
      {statsError ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">
          Error loading stats: {statsError}
        </div>
      ) : stats ? (
        <ExpenseStatsCards stats={stats} />
      ) : null}

      {/* Graph */}
      {stats?.dailyStats && <DailySpendGraph data={stats.dailyStats} />}

      {/* Balances List */}
      <h3 className="text-xl font-black text-primary border-t-thick border-primary pt-8">Friend Balances</h3>
      {balancesError ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">
          Error loading balances: {balancesError}
        </div>
      ) : (
        <BalancesList balances={balances} />
      )}
    </div>
  );
}
