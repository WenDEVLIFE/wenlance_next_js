'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomText } from './CustomText';

export interface ExpenseModel {
  category: string;
  amount: number;
  label: string;
}

export interface DashboardStats {
  totalSalesIncome: number;
  totalExpenses: number;
}

interface FinancialPieChartProps {
  stats: DashboardStats;
  expenses: ExpenseModel[];
}

/**
 * FinancialPieChart component converted from Flutter.
 * Displays Income vs Expenses and Expense Breakdown by Category.
 */
export const FinancialPieChart: React.FC<FinancialPieChartProps> = ({ stats, expenses }) => {
  const totalIncome = stats.totalSalesIncome;
  const totalExpenses = stats.totalExpenses;
  const netIncome = totalIncome - totalExpenses;
  const totalOverall = totalIncome + totalExpenses;

  // Overview Data
  const overviewData = [
    { name: 'Total Income', value: totalIncome, color: '#10b981' }, // Success color
    { name: 'Total Expenses', value: totalExpenses, color: '#ef4444' }, // Error color
  ].filter(d => d.value > 0);

  // Category Data
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const categoryColors: Record<string, string> = {
    'Food': '#f59e0b',
    'Transportation': '#3b82f6',
    'Entertainment': '#60a5fa',
    'Utilities': '#06b6d4',
    'Healthcare': '#ef4444',
    'Shopping': '#93c5fd',
    'Other': '#71717a',
  };

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const totalExpensesByCategory = sortedCategories.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (totalOverall === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 mb-4 text-zinc-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        </div>
        <CustomText label="No data available" fontWeight={600} fontSize={16} className="text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Financial Overview Chart */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm dark:shadow-zinc-950">
        <CustomText label="Financial Overview" fontWeight={700} fontSize={18} className="mb-1 block" />
        <CustomText label="Income vs Expenses Breakdown" fontWeight={400} fontSize={14} className="text-zinc-500 mb-6 block" />
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full h-48 md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overviewData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {overviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <LegendItem label="Total Income" color="#10b981" value={totalIncome} formatCurrency={formatCurrency} />
            <LegendItem label="Total Expenses" color="#ef4444" value={totalExpenses} formatCurrency={formatCurrency} />
            <LegendItem label="Net Income" color="#3b82f6" value={netIncome} formatCurrency={formatCurrency} />
          </div>
        </div>
      </div>

      {/* Expenses by Category Chart */}
      {totalExpensesByCategory > 0 && (
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm dark:shadow-zinc-950">
          <CustomText label="Expenses by Category" fontWeight={700} fontSize={18} className="mb-1 block" />
          <CustomText label="Breakdown of your spending" fontWeight={400} fontSize={14} className="text-zinc-500 mb-6 block" />

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full h-48 md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sortedCategories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={categoryColors[entry.name] || categoryColors['Other']} 
                        stroke="none" 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-1/2">
              {sortedCategories.map((entry, i) => (
                <LegendItem 
                  key={i}
                  label={entry.name} 
                  color={categoryColors[entry.name] || categoryColors['Other']} 
                  value={entry.value} 
                  formatCurrency={formatCurrency}
                  percentage={(entry.value / totalExpensesByCategory) * 100}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ label, color, value, formatCurrency, percentage }: any) => (
  <div className="flex items-center gap-3 w-full">
    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
    <div className="flex flex-col w-full min-w-0">
      <div className="flex items-center justify-between gap-2">
        <CustomText label={label} fontWeight={500} fontSize={12} className="text-zinc-500 truncate" />
        {percentage !== undefined && (
          <CustomText label={`${percentage.toFixed(1)}%`} fontWeight={600} fontSize={11} className="text-zinc-600 shrink-0" />
        )}
      </div>
      <CustomText label={formatCurrency(value)} fontWeight={700} fontSize={14} className="text-zinc-900 dark:text-zinc-100" />
    </div>
  </div>
);

export default FinancialPieChart;
