'use client';

import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

export interface MonthlySaleModel {
  month: string;
  amount: number;
}

interface MonthlySalaryLineChartProps {
  data?: MonthlySaleModel[];
}

/**
 * MonthlySalaryLineChart component converted from Flutter.
 * Visualizes salary distribution across months with a premium area/line chart.
 */
export const MonthlySalaryLineChart: React.FC<MonthlySalaryLineChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (data) return data;

    // Mock data for the current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      amount: Math.floor(Math.random() * 30000) + 15000,
    }));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Earnings breakdown per month</p>

      <div className="h-[360px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
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
              itemStyle={{ color: '#0284c7' }}
              labelStyle={{ color: 'var(--card-foreground)', fontWeight: 600 }}
              formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => [`₱${Number(value).toLocaleString()}`, 'Amount']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0284c7"
              strokeWidth={2}
              fill="#0284c7"
              fillOpacity={0.08}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Row */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-base font-semibold tabular-nums text-sky-600 dark:text-sky-400">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
              chartData[new Date().getMonth()]?.amount || 0
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This Month</p>
        </div>
        <div>
          <p className="text-base font-semibold tabular-nums text-sky-600 dark:text-sky-400">
            {chartData.some(d => d.amount > 0)
              ? chartData.reduce((prev, current) => (prev.amount > current.amount) ? prev : current).month
              : "N/A"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Best Month</p>
        </div>
        <div>
          <p className="text-base font-semibold tabular-nums text-sky-600 dark:text-sky-400">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
              chartData.reduce((acc, curr) => acc + curr.amount, 0) / (new Date().getMonth() + 1)
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg/Month</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MonthlySalaryLineChart;
