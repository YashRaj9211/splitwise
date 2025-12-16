'use client';

import { DailyStat } from '@/actions/stats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DailySpendGraph({ data }: { data: DailyStat[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border-thick border-primary bg-white p-6">
        <p className="text-primary/50 font-bold">No data available for this month</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-thick border-primary bg-white p-6 shadow-[4px_4px_0px_var(--color-primary)]">
      <h3 className="text-xl font-black text-primary mb-6">Daily Spend Overview</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#1e293b" tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }} />
            <YAxis
              stroke="#1e293b"
              tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }}
              tickFormatter={value => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #1e293b',
                borderRadius: '8px',
                boxShadow: '4px 4px 0px #1e293b'
              }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Total Expenditure */}
            <Line
              type="monotone"
              dataKey="totalExpenditure"
              name="Total Expenditure"
              stroke="#1e293b"
              strokeWidth={3}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Personal */}
            <Line
              type="monotone"
              dataKey="personal"
              name="Personal"
              stroke="#2563eb" // Blue
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />

            {/* Borrowed */}
            <Line
              type="monotone"
              dataKey="borrowed"
              name="Borrowed"
              stroke="#dc2626" // Red
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />

            {/* Lent */}
            <Line
              type="monotone"
              dataKey="lent"
              name="Lent"
              stroke="#059669" // Emerald
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
