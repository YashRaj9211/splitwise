'use client';

import { useEffect, useState } from 'react';
import { getMonthlyExpenditureBreakdown, DailyExpenditure } from '@/actions/expenditure-details';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loader2, Calendar } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ExpenditureBreakdownModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyExpenditure[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !data) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const res = await getMonthlyExpenditureBreakdown();
    if (res.error) setError(res.error);
    else setData(res.breakdown || []);
    setLoading(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-0 max-w-md h-[98%] flex flex-col mt-5">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
        <h3 className="font-black text-lg text-gray-800">Monthly Breakdown</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
          Close
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 content-area">
        {loading ? (
          <div className="flex h-full items-center justify-center text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : data?.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No expenses this month.</div>
        ) : (
          <div className="space-y-6">
            {data?.map(day => (
              <div key={day.date} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 mb-2 border-b border-gray-100 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Calendar className="w-4 h-4" />
                    {day.date}
                  </div>
                  <div className="font-black text-gray-800">${day.total.toFixed(2)}</div>
                </div>

                <div className="space-y-2">
                  {day.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100/50 hover:border-primary/20 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-gray-700 text-sm">{item.description}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.type === 'PERSONAL'
                                ? 'bg-blue-100 text-blue-600'
                                : item.type === 'BORROWED'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}
                          >
                            {item.type === 'SPLIT_SHARE' ? 'MY SHARE' : item.type}
                          </span>
                          {item.groupName && <span className="text-[10px] text-gray-400">{item.groupName}</span>}
                        </div>
                      </div>
                      <div className="font-bold text-gray-800 text-sm">${item.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
