'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 mb-3 text-zinc-400 dark:text-zinc-600">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Financial Overview Chart */}
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Income vs Expenses Breakdown</p>

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
                  formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--card-foreground)',
                    fontSize: '12px',
                    padding: '8px 10px',
                  }}
                  itemStyle={{ color: 'var(--card-foreground)' }}
                  labelStyle={{ color: 'var(--card-foreground)', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <LegendItem label="Total Income" color="#10b981" value={totalIncome} formatCurrency={formatCurrency} />
            <LegendItem label="Total Expenses" color="#ef4444" value={totalExpenses} formatCurrency={formatCurrency} />
            <LegendItem label="Net Income" color="#0284c7" value={netIncome} formatCurrency={formatCurrency} />
          </div>
        </div>
      </div>

      {/* Expenses by Category Chart */}
      {totalExpensesByCategory > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Expenses by Category</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Breakdown of your spending</p>

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
                    formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      color: 'var(--card-foreground)',
                      fontSize: '12px',
                      padding: '8px 10px',
                    }}
                    itemStyle={{ color: 'var(--card-foreground)' }}
                    labelStyle={{ color: 'var(--card-foreground)', fontWeight: 600 }}
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

interface LegendItemProps {
  label: string;
  color: string;
  value: number;
  formatCurrency: (v: number) => string;
  percentage?: number;
}

const LegendItem = ({ label, color, value, formatCurrency, percentage }: LegendItemProps) => (
  <div className="flex items-center gap-3 w-full">
    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
    <div className="flex flex-col w-full min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        {percentage !== undefined && (
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums shrink-0">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
        {formatCurrency(value)}
      </span>
    </div>
  </div>
);

export default FinancialPieChart;
