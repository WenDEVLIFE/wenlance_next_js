"use client";

import React, { useState, useMemo } from "react";
import {
  Landmark,
  Wallet,
  ArrowDownCircle,
  Briefcase,
  TrendingUp,
  Banknote,
  Calendar,
  TrendingDown,
  Minus,
  AlertCircle
} from "lucide-react";
import { AnimatedListItem } from "@/components/AnimatedListItem";
import { FinancialPieChart } from "@/components/FinancialPieChart";
import { SalaryLineChart } from "@/components/SalaryLineChart";
import { MonthlySalaryLineChart } from "@/components/MonthlySalaryLineChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageTransition } from "@/components/PageTransition";
import { AppColors } from "@/lib/utils/colors";

// Interfaces based on Flutter version
export interface DashboardStats {
  thisMonthSalesIncome: number;
  thisMonthSalaryPercentageChange: number;
  thisMonthExpenses: number;
  thisMonthExpensesPercentageChange: number;
  totalExpenses: number;
  totalExpensesPercentageChange: number;
  totalProjects: number;
  totalProjectsPercentageChange: number;
  totalSalesIncome: number;
  totalSalary: number; // For current year
  totalSalaryPercentageChange: number;
  lastYearSalary: number;
  lastYearSalaryPercentageChange: number;
}

const mockStats: DashboardStats = {
  thisMonthSalesIncome: 45000,
  thisMonthSalaryPercentageChange: 12.5,
  thisMonthExpenses: 12000,
  thisMonthExpensesPercentageChange: -5.2,
  totalExpenses: 85000,
  totalExpensesPercentageChange: 8.3,
  totalProjects: 24,
  totalProjectsPercentageChange: 2,
  totalSalesIncome: 350000,
  totalSalary: 350000,
  totalSalaryPercentageChange: 15.7,
  lastYearSalary: 280000,
  lastYearSalaryPercentageChange: 10.2,
};

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(mockStats);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gradient dark:bg-zinc-950">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-gradient dark:bg-zinc-950 p-6 text-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error loading dashboard</h2>
        <p className="text-zinc-500 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-soft-gradient dark:bg-zinc-950 transition-colors duration-500">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white transition-colors">
                Dashboard
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Overview of your financial and project statistics
              </p>
            </div>
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-full shadow-lg border border-white/20">
              <ThemeToggle iconSize={26} />
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard
              index={0}
              title="This Month Salary"
              value={formatCurrency(stats.thisMonthSalesIncome)}
              percentage={stats.thisMonthSalaryPercentageChange}
              icon={<Landmark size={24} />}
              color="#10B981"
            />
            <StatCard
              index={1}
              title="This Month Expenses"
              value={formatCurrency(stats.thisMonthExpenses)}
              percentage={stats.thisMonthExpensesPercentageChange}
              icon={<Wallet size={24} />}
              color="#EF4444"
            />
            <StatCard
              index={2}
              title="Total Expenses"
              value={formatCurrency(stats.totalExpenses)}
              percentage={stats.totalExpensesPercentageChange}
              icon={<ArrowDownCircle size={24} />}
              color="#F59E0B"
            />
            <StatCard
              index={3}
              title="Total Projects"
              value={stats.totalProjects.toString()}
              percentage={stats.totalProjectsPercentageChange}
              icon={<Briefcase size={24} />}
              color={AppColors.primary}
            />
            <StatCard
              index={4}
              title="Total Sales Income"
              value={formatCurrency(stats.totalSalesIncome)}
              percentage={stats.totalSalaryPercentageChange}
              icon={<TrendingUp size={24} />}
              color="#10B981"
            />
            <StatCard
              index={5}
              title={`This Year Sales (${new Date().getFullYear()})`}
              value={formatCurrency(stats.totalSalary)}
              percentage={stats.totalSalaryPercentageChange}
              icon={<Banknote size={24} />}
              color={AppColors.info}
            />
            <StatCard
              index={6}
              title={`Last Year Sales (${new Date().getFullYear() - 1})`}
              value={formatCurrency(stats.lastYearSalary)}
              percentage={stats.lastYearSalaryPercentageChange}
              icon={<Calendar size={24} />}
              color={AppColors.secondary}
            />
          </div>

          {/* Charts Section */}
          <div className="space-y-8 pb-12">
            <AnimatedListItem index={6}>
              <FinancialPieChart
                stats={{
                  totalSalesIncome: stats.totalSalesIncome,
                  totalExpenses: stats.totalExpenses
                }} expenses={[]} />
            </AnimatedListItem>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AnimatedListItem index={7}>
                <SalaryLineChart sales={[]} />
              </AnimatedListItem>
              <AnimatedListItem index={8}>
                <MonthlySalaryLineChart />
              </AnimatedListItem>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

interface StatCardProps {
  index: number;
  title: string;
  value: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ index, title, value, percentage, icon, color }: StatCardProps) {
  const isIncrease = percentage > 0;
  const isDecrease = percentage < 0;

  return (
    <AnimatedListItem index={index}>
      <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
        {/* Decorative background gradient */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.07] transition-opacity"
          style={{
            background: `radial-gradient(circle at top right, ${color}, transparent)`
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div
              className="p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              {icon}
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold`}
              style={{
                backgroundColor: isIncrease ? '#10B9811A' : isDecrease ? '#EF44441A' : '#71717a1A',
                color: isIncrease ? '#10B981' : isDecrease ? '#EF4444' : '#71717a'
              }}
            >
              {isIncrease ? <TrendingUp size={14} /> : isDecrease ? <TrendingDown size={14} /> : <Minus size={14} />}
              {Math.abs(percentage).toFixed(1)}%
            </div>
          </div>

          <div className="mt-auto">
            <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">
              {title}
            </h3>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      </div>
    </AnimatedListItem>
  );
}
