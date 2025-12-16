import { FriendBalance } from '@/actions/balances';
import { User, MoveRight } from 'lucide-react';

export function BalancesList({ balances }: { balances: FriendBalance[] }) {
  if (balances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-primary-light/50 p-4 rounded-full mb-4">
          <User className="h-8 w-8 text-primary/50" />
        </div>
        <h3 className="text-lg font-bold text-primary">No balances yet</h3>
        <p className="text-sm text-primary/60">You are all settled up! Add an expense to get started.</p>
      </div>
    );
  }

  const youOwe = balances.filter(b => b.amount < 0);
  const owesYou = balances.filter(b => b.amount > 0);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* You Owe Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-primary flex items-center gap-2">
          YOU OWE
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-red-100 text-red-600">{youOwe.length}</span>
        </h3>
        <div className="space-y-3">
          {youOwe.length === 0 ? (
            <p className="text-sm text-primary/40 italic">You don't owe anyone.</p>
          ) : (
            youOwe.map(balance => (
              <div
                key={balance.friendId}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-red-100 bg-red-50/30 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold border-2 border-white shadow-sm">
                    {balance.avatarUrl ? (
                      <img
                        src={balance.avatarUrl}
                        alt={balance.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      balance.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-primary">{balance.name}</p>
                    <p className="text-xs text-red-600 font-medium">you owe</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-red-600">${Math.abs(balance.amount).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Owes You Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-primary flex items-center gap-2">
          OWES YOU
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
            {owesYou.length}
          </span>
        </h3>
        <div className="space-y-3">
          {owesYou.length === 0 ? (
            <p className="text-sm text-primary/40 italic">No one owes you.</p>
          ) : (
            owesYou.map(balance => (
              <div
                key={balance.friendId}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm">
                    {balance.avatarUrl ? (
                      <img
                        src={balance.avatarUrl}
                        alt={balance.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      balance.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-primary">{balance.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">owes you</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600">${balance.amount.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
