'use client';

import { useState } from 'react';
import { recordPayment } from '@/actions/payment';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { X, HandCoins, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Member = {
  id: string; // userId
  name: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentUserId: string;
};

export function GroupSettleUpModal({ isOpen, onClose, members, currentUserId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [receiverId, setReceiverId] = useState(members.find(m => m.id !== currentUserId)?.id || '');
  const [amount, setAmount] = useState('');

  async function handleSettleUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await recordPayment({
      payerId: currentUserId,
      receiverId: receiverId,
      amount: parseFloat(amount),
      description: 'Settle up'
    });

    if (res.error) setError(res.error);
    else {
      onClose();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-0 max-w-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-primary flex items-center gap-2">
            <HandCoins className="w-6 h-6" /> Settle Up
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSettleUp} className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-400">Payer</span>
              <span className="font-bold text-gray-800">You</span>
            </div>
            <ArrowRight className="text-gray-300" />
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-bold text-gray-400">Recipient</span>
              <select
                className="bg-white border border-gray-200 text-sm font-bold rounded-lg px-2 py-1 w-full text-center"
                value={receiverId}
                onChange={e => setReceiverId(e.target.value)}
              >
                {members
                  .filter(m => m.id !== currentUserId)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                className="input-edged pl-8 text-lg"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold">{error}</div>}

          <Button type="submit" isLoading={loading}>
            Pay & Settle
          </Button>
        </form>
      </div>
    </Modal>
  );
}
