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
  ReferenceLine,
} from 'recharts';
import type { MonthlyIncomeModel } from '@/app/model/PerformanceStats';

interface IncomePerformanceChartProps {
  months: MonthlyIncomeModel[];
  target: number;
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
 * IncomePerformanceChart shows monthly freelance income for the current year.
 * Content-only by design: the performance card supplies surface, padding and border.
 */
export const IncomePerformanceChart: React.FC<IncomePerformanceChartProps> = ({ months, target }) => {
  const hasIncome = months.some((month) => month.amount !== 0);

  if (!hasIncome) {
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No income recorded this year</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Monthly income against your target</p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={months} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              itemStyle={{ color: '#059669' }}
              labelStyle={{ color: 'var(--card-foreground)', fontWeight: 600 }}
              formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => [
                formatCurrency(Number(value)),
                'Earned',
              ]}
            />
            {target > 0 && (
              <ReferenceLine
                y={target}
                stroke="#a1a1aa"
                strokeDasharray="4 4"
                label={{
                  value: 'Target',
                  position: 'insideTopRight',
                  fill: '#71717a',
                  fontSize: 11,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#059669"
              strokeWidth={2}
              fill="#059669"
              fillOpacity={0.08}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomePerformanceChart;
