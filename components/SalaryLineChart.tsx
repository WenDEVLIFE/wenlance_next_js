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

export interface SaleModel {
  dateReceived: Date;
  amount: number;
}

interface SalaryLineChartProps {
  sales: SaleModel[];
}

/**
 * SalaryLineChart component converted from Flutter.
 * Displays yearly salary projections with animations and summary stats.
 */
export const SalaryLineChart: React.FC<SalaryLineChartProps> = ({ sales }) => {
  // Aggregate sales by year
  const chartData = useMemo(() => {
    if (!sales.length) return [];

    const yearlySalary: Record<number, number> = {};
    sales.forEach((sale) => {
      const year = new Date(sale.dateReceived).getFullYear();
      yearlySalary[year] = (yearlySalary[year] || 0) + sale.amount;
    });

    const sortedYears = Object.keys(yearlySalary)
      .map(Number)
      .sort((a, b) => a - b);
    
    // Fill in gaps if needed, or just show last 5 years as per Flutter implementation
    const currentYear = new Date().getFullYear();
    const startYear = sortedYears.length > 0 
      ? (sortedYears.length > 5 ? sortedYears[sortedYears.length - 5] : sortedYears[0])
      : currentYear - 4;
    const endYear = sortedYears.length > 0 ? sortedYears[sortedYears.length - 1] : currentYear;

    const data = [];
    for (let year = startYear; year <= endYear; year++) {
      data.push({
        year: year.toString(),
        amount: yearlySalary[year] || 0,
      });
    }
    return data;
  }, [sales]);

  const stats = useMemo(() => {
    if (!sales.length) return { totalYears: 0, highestYear: 'N/A', totalEarned: 0 };

    const yearlySalary: Record<number, number> = {};
    let totalEarned = 0;
    sales.forEach((sale) => {
      const year = new Date(sale.dateReceived).getFullYear();
      yearlySalary[year] = (yearlySalary[year] || 0) + sale.amount;
      totalEarned += sale.amount;
    });

    const years = Object.keys(yearlySalary).map(Number);
    let highestValue = -1;
    let highestYear = 'N/A';
    
    years.forEach(y => {
      if (yearlySalary[y] > highestValue) {
        highestValue = yearlySalary[y];
        highestYear = y.toString();
      }
    });

    return {
      totalYears: years.length,
      highestYear,
      totalEarned,
    };
  }, [sales]);

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

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 mb-3 text-zinc-400 dark:text-zinc-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No salary data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Total income per year</p>

      <div className="h-64 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
            <XAxis 
              dataKey="year" 
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
              formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => [formatCurrency(Number(value)), 'Amount']}
              contentStyle={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--card-foreground)',
                fontSize: '12px',
                padding: '8px 10px',
              }}
              labelStyle={{ color: 'var(--card-foreground)', fontWeight: 600 }}
              itemStyle={{ color: '#0284c7' }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#0284c7" 
              strokeWidth={2} 
              fill="#0284c7" 
              fillOpacity={0.08} 
              dot={{ r: 2.5, fill: '#0284c7', stroke: 'var(--card)', strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
        <StatItem label="Total Years" value={stats.totalYears.toString()} />
        <StatItem label="Highest Year" value={stats.highestYear} />
        <StatItem label="Total Earned" value={formatCurrency(stats.totalEarned)} isPrimary />
      </div>
    </div>
  );
};

const StatItem = ({ label, value, isPrimary }: { label: string; value: string; isPrimary?: boolean }) => (
  <div>
    <p className={`text-base font-semibold tabular-nums ${isPrimary ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
      {value}
    </p>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
  </div>
);

export default SalaryLineChart;
