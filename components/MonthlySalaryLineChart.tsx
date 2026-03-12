'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
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
      className="w-full h-[400px] bg-white dark:bg-[#023E8A]/20 backdrop-blur-xl p-8 rounded-[32px] border border-zinc-200 dark:border-white/10 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold transition-colors duration-500">Monthly Salary Distribution</h3>
        <p className="text-sm transition-colors duration-500">Earnings breakdown per month</p>
      </div>

      <ResponsiveContainer width="100%" height="60%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
            tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(24, 24, 27, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              color: '#fff'
            }}
            itemStyle={{ color: '#60a5fa' }}
            formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#monthGradient)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Row */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xl font-bold text-primary dark:text-[#60a5fa]">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
              chartData[new Date().getMonth()]?.amount || 0
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This Month</p>
        </div>
        <div>
          <p className="text-xl font-bold text-primary dark:text-[#60a5fa]">
            {chartData.some(d => d.amount > 0)
              ? chartData.reduce((prev, current) => (prev.amount > current.amount) ? prev : current).month
              : "N/A"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Best Month</p>
        </div>
        <div>
          <p className="text-xl font-bold text-primary dark:text-[#60a5fa]">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
              chartData.reduce((acc, curr) => acc + curr.amount, 0) / (new Date().getMonth() + 1)
            )}
          </p>
          <p className="text-xs text-zinc-300 dark:text-zinc-300 font-medium">Avg/Month</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MonthlySalaryLineChart;
