import { auth } from '@/lib/auth';
import { getDashboardStats } from '@/actions/dashboard';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';

export default async function ActivityPage() {
  const session = await auth();
  const { recentActivity } = await getDashboardStats();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black text-primary mb-6">Recent Activity</h1>
      <div className="flex flex-col gap-3">
        {recentActivity && recentActivity.length === 0 && <p className="text-gray-500 italic">No recent activity.</p>}

        {recentActivity?.map(expense => {
          const isPayer = expense.userId === session?.user?.id;
          let actionText = '';
          let amountColor = '';
          let amountText = '';

          if (isPayer) {
            actionText = `You paid $${Number(expense.amount).toFixed(2)}`;
            amountColor = 'text-emerald-600';

            const mySplit = expense.splits.find(s => s.userId === session?.user?.id);
            const myShare = mySplit ? Number(mySplit.amount) : 0;
            const lentAmount = Number(expense.amount) - myShare;

            amountText = `you lent $${lentAmount.toFixed(2)}`;
          } else {
            const payerName = expense.user?.name || 'Someone';
            actionText = `${payerName} paid $${Number(expense.amount).toFixed(2)}`;
            amountColor = 'text-red-600';

            const mySplit = expense.splits.find(s => s.userId === session?.user?.id);
            const myAmount = mySplit ? Number(mySplit.amount).toFixed(2) : '0.00';
            amountText = `You owe $${myAmount}`;
          }

          return (
            <Card
              key={expense.id}
              variant="flat"
              className="flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">🧾</div>
                <div>
                  <h4 className="font-bold text-primary">{expense.description}</h4>
                  <p className="text-sm text-gray-500">{actionText}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`block font-bold ${amountColor}`}>{amountText}</span>
                <span className="text-xs text-gray-400">{format(new Date(expense.expenseDate), 'MMM dd')}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
