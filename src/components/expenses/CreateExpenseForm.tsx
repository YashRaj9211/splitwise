'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createExpense } from '@/actions/expense';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Receipt, Check, AlertCircle } from 'lucide-react';
import { ExpenseType, SplitType } from '@/generated/prisma/enums';

type Props = {
  friends: any[];
  groups: any[];
  currentUserId: string;
  defaultGroupId?: string;
};

type Participant = {
  userId: string;
  name: string;
  isSelected: boolean;
};

type SplitMode = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export function CreateExpenseForm({ friends, groups, currentUserId, defaultGroupId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroupId || '');
  const [payerId, setPayerId] = useState<string>(currentUserId);

  // Split Logic
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');

  // Stores raw input strings for splits to allow typing decimals
  // Key: userId, Value: string (amount or percentage)
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});

  // Initialize/Reset participants
  useEffect(() => {
    // Group Logic (If we had members, we'd load them here)
    // For now, we load friends + self
    const friendParticipants = friends.map(f => ({ userId: f.id, name: f.name, isSelected: false }));
    setParticipants([{ userId: currentUserId, name: 'You', isSelected: true }, ...friendParticipants]);
  }, [friends, currentUserId]);

  // Reset split values when participants or mode changes
  useEffect(() => {
    setSplitValues({});
  }, [splitMode]);

  const toggleParticipant = (userId: string) => {
    // If unselecting the payer, reset payer to self? No, enforce payer must be selected.
    setParticipants(prev => {
      const next = prev.map(p => (p.userId === userId ? { ...p, isSelected: !p.isSelected } : p));

      // If the payer was just deselected, warn or prevent?
      // Better: If payer is not selected, we auto-select them if they are chosen in dropdown?
      // Actually, let's just force payer to be 'selected' implicitly?
      // No, Splitwise logic: Payer must be involved? Usually yes.
      // Let's just unchecked 'isSelected' if toggled. Payer dropdown is separate.
      return next;
    });
  };

  const selectedParticipants = useMemo(() => participants.filter(p => p.isSelected), [participants]);

  // Ensure payer is in participants?
  useEffect(() => {
    if (!selectedParticipants.find(p => p.userId === payerId)) {
      // If payer is not in selected list, maybe warn?
      // Or just allow it (someone paid but isn't part of the split? Unusual but possible: Gifts)
      // But Expense schema requires a payer.
    }
  }, [payerId, selectedParticipants]);

  // --- Calculations & Validation ---

  const getSplitFeedback = (): { valid: boolean; message?: string } => {
    const totalAmount = parseFloat(amount) || 0;
    if (totalAmount <= 0) return { valid: true }; // Wait for amount

    if (splitMode === 'EQUAL') return { valid: true };

    if (splitMode === 'EXACT') {
      const currentSum = selectedParticipants.reduce((sum, p) => {
        return sum + (parseFloat(splitValues[p.userId]) || 0);
      }, 0);
      const diff = Math.abs(totalAmount - currentSum);
      if (diff > 0.05) {
        // Floating point tolerance
        return {
          valid: false,
          message: `Sum $${currentSum.toFixed(2)} does not match Total $${totalAmount.toFixed(2)}`
        };
      }
    }

    if (splitMode === 'PERCENTAGE') {
      const currentSum = selectedParticipants.reduce((sum, p) => {
        return sum + (parseFloat(splitValues[p.userId]) || 0);
      }, 0);
      if (Math.abs(100 - currentSum) > 0.1) {
        return { valid: false, message: `Total ${currentSum.toFixed(1)}% does not match 100%` };
      }
    }

    return { valid: true };
  };

  const feedback = getSplitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }

    if (selectedParticipants.length < 1) {
      setError('Select at least one person to split with.');
      setIsLoading(false);
      return;
    }

    if (!feedback.valid) {
      setError(feedback.message || 'Check split amounts.');
      setIsLoading(false);
      return;
    }

    let finalSplits: { userId: string; amount: number; splitType: SplitType; percentage?: number }[] = [];

    if (splitMode === 'EQUAL') {
      const splitAmt = amountNum / selectedParticipants.length;
      finalSplits = selectedParticipants.map(p => ({
        userId: p.userId,
        amount: splitAmt,
        splitType: SplitType.EQUAL
      }));
    } else if (splitMode === 'EXACT') {
      finalSplits = selectedParticipants.map(p => ({
        userId: p.userId,
        amount: parseFloat(splitValues[p.userId]) || 0,
        splitType: SplitType.EXACT
      }));
    } else if (splitMode === 'PERCENTAGE') {
      finalSplits = selectedParticipants.map(p => {
        const pct = parseFloat(splitValues[p.userId]) || 0;
        return {
          userId: p.userId,
          amount: (amountNum * pct) / 100,
          splitType: SplitType.PERCENTAGE,
          percentage: pct
        };
      });
    }

    try {
      const res = await createExpense({
        description,
        amount: amountNum,
        date: new Date(date),
        type: selectedParticipants.length > 1 ? ExpenseType.SPLIT : ExpenseType.PERSONAL,
        payerId: payerId,
        groupId: selectedGroupId || undefined,
        splits: finalSplits
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 1. Header Details */}
        <div className="flex flex-col gap-4">
          <Input
            label="Description"
            placeholder="Dinner, Movie, Rent..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-primary">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
                <input
                  className="input-edged pl-8"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
        </div>

        {/* 2. Payer & Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Paid by</label>
            <select className="input-edged" value={payerId} onChange={e => setPayerId(e.target.value)}>
              {participants.map(p => (
                <option key={p.userId} value={p.userId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Group (Optional)</label>
            <select className="input-edged" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
              <option value="">No Group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Split Mode Tabs */}
        <div>
          <label className="text-sm font-bold text-primary mb-2 block">Split Method</label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['EQUAL', 'EXACT', 'PERCENTAGE'] as SplitMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setSplitMode(mode)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  splitMode === mode ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
                }`}
              >
                {mode === 'EQUAL' ? '=' : mode === 'EXACT' ? '$1.23' : '%'}{' '}
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Participants & Inputs */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-primary">Shared with</label>

          {/* Participant Toggles (Always show to select who is involved) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {participants.map(p => (
              <button
                key={p.userId}
                type="button"
                onClick={() => toggleParticipant(p.userId)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold transition-all
                                    ${
                                      p.isSelected
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'
                                    }
                                `}
              >
                {p.isSelected && <Check className="w-3 h-3" />}
                {p.name}
              </button>
            ))}
          </div>

          {/* Split Inputs (Only for Selected Participants) */}
          {selectedParticipants.length > 0 && splitMode !== 'EQUAL' && (
            <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {selectedParticipants.map(p => (
                <div key={p.userId} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{p.name}</span>
                  <div className="flex items-center gap-2">
                    {splitMode === 'EXACT' && <span className="text-gray-500 font-bold">$</span>}
                    <input
                      type="number"
                      step={splitMode === 'PERCENTAGE' ? '0.1' : '0.01'}
                      className="w-24 p-2 rounded-lg border border-gray-200 text-right font-mono text-sm"
                      placeholder="0"
                      value={splitValues[p.userId] || ''}
                      onChange={e => setSplitValues(prev => ({ ...prev, [p.userId]: e.target.value }))}
                    />
                    {splitMode === 'PERCENTAGE' && <span className="text-gray-500 font-bold">%</span>}
                  </div>
                </div>
              ))}

              {/* Validation Message */}
              {!feedback.valid && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-bold mt-2 pt-2 border-t border-gray-200">
                  <AlertCircle className="w-4 h-4" />
                  {feedback.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Box */}
        {amount && splitMode === 'EQUAL' && selectedParticipants.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-sm text-gray-500">
              Split equally:{' '}
              <strong className="text-primary">
                ${(parseFloat(amount) / selectedParticipants.length).toFixed(2)}/person
              </strong>
            </p>
          </div>
        )}

        {error && <div className="p-3 rounded-xl text-sm font-bold bg-red-100 text-red-700 text-center">{error}</div>}

        <Button type="submit" isLoading={isLoading} disabled={!feedback.valid}>
          <Receipt className="w-5 h-5" />
          Save Expense
        </Button>
      </form>
    </Card>
  );
}
