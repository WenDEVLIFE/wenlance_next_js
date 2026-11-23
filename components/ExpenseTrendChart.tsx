'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { ExpenseTrendSummary, MonthlyExpenseModel } from '@/app/model/DashboardStats';

interface ExpenseTrendChartProps {
  data: MonthlyExpenseModel[];
  summary: ExpenseTrendSummary;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatYAxis = (value: number) => {
  if (value >= 1000) {
    return `₱${(value / 1000).toFixed(0)}k`;
  }
  return `₱${value}`;
};

/**
 * ExpenseTrendChart shows monthly spending for the current year.
 * Content-only by design: the dashboard card supplies surface, padding and border.
 */
export const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ data, summary }) => {
  if (summary.yearTotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 mb-3 text-zinc-400 dark:text-zinc-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3v18h18M7 14l4-4 3 3 5-5"
            />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No expenses recorded this year</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Monthly spending this year</p>

      <div className="h-64 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#71717a' }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--card-foreground)',
                fontSize: '12px',
                padding: '8px 10px',
              }}
              itemStyle={{ color: '#e11d48' }}
              labelStyle={{ color: 'var(--card-foreground)', fontWeight: 600 }}
              formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => [
                formatCurrency(Number(value)),
                'Spent',
              ]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#e11d48"
              strokeWidth={2}
              fill="#e11d48"
              fillOpacity={0.08}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-base font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {formatCurrency(summary.thisMonth)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This Month</p>
        </div>
        <div>
          <p className="text-base font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {summary.peakMonth}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Peak Month</p>
        </div>
        <div>
          <p className="text-base font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {formatCurrency(summary.yearTotal)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Year Total</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTrendChart;
