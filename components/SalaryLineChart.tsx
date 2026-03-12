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
import { CustomText } from './CustomText';

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
      <div className="flex flex-col items-center justify-center p-12 rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#023E8A]/20 backdrop-blur-xl">
        <div className="w-12 h-12 mb-4 text-zinc-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
        </div>
        <CustomText label="No salary data available" fontWeight={600} fontSize={16} className="text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="p-8 rounded-[32px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#023E8A]/20 backdrop-blur-xl shadow-sm w-full">
      <div className="mb-6">
        <CustomText label="Salary Projection by Year" fontWeight={700} fontSize={18} className="block mb-1 text-black dark:text-white" />
        <CustomText label="Total income per year" fontWeight={400} fontSize={14} className="text-zinc-600 dark:text-white/60 block" />
      </div>

      <div className="h-64 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              tick={{ fontSize: 11, fill: '#888' }}
              width={60}
            />
            <Tooltip 
              formatter={(value: any) => [formatCurrency(value), 'Amount']}
              contentStyle={{ 
                backgroundColor: 'rgba(24, 24, 27, 0.8)',
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(8px)',
                color: '#fff'
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-around pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <StatItem label="Total Years" value={stats.totalYears.toString()} />
        <StatItem label="Highest Year" value={stats.highestYear} />
        <StatItem label="Total Earned" value={formatCurrency(stats.totalEarned)} isPrimary />
      </div>
    </div>
  );
};

const StatItem = ({ label, value, isPrimary }: { label: string; value: string; isPrimary?: boolean }) => (
  <div className="flex flex-col items-center">
    <CustomText 
      label={value} 
      fontWeight={700} 
      fontSize={16} 
      className={isPrimary ? "text-blue-500" : "text-zinc-900 dark:text-zinc-100"} 
    />
    <CustomText 
      label={label} 
      fontWeight={400} 
      fontSize={12} 
      className="text-zinc-500 mt-1" 
    />
  </div>
);

export default SalaryLineChart;
