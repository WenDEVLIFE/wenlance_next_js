"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  BankIcon,
  Wallet2Icon,
  RoundAltArrowDownIcon,
  SuitcaseLinesIcon,
  GraphUpIcon,
  Banknote2Icon,
  CalendarIcon,
  DangerCircleIcon,
  GraphDownIcon,
  MinusIcon,
} from "@solar-icons/react/linear";
import { AnimatedListItem } from "@/components/AnimatedListItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageTransition } from "@/components/PageTransition";
import { enrichDashboardStats, calculateDashboardStats, getMonthlySalaryData, getMonthlyExpenseData, getPeakExpenseMonth, summarizeExpenseTrend } from "../../model/DashboardStats";
import { dashboardRepository, DashboardData } from "@/lib/repositories/DashboardRepository";

// Code-split heavy charting bundle to optimize First Input Delay and initial render
const FinancialPieChart = dynamic(
  () => import("@/components/FinancialPieChart").then((mod) => mod.FinancialPieChart),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const SalaryLineChart = dynamic(
  () => import("@/components/SalaryLineChart").then((mod) => mod.SalaryLineChart),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const MonthlySalaryLineChart = dynamic(
  () => import("@/components/MonthlySalaryLineChart").then((mod) => mod.MonthlySalaryLineChart),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const ExpenseTrendChart = dynamic(
  () => import("@/components/ExpenseTrendChart").then((mod) => mod.ExpenseTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ expenses: [], sales: [], projects: [], savings: [], utilizations: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = dashboardRepository.listenToDashboard((liveData) => {
      setData(liveData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memoize statistics derivation to prevent redundant recalculation on parent re-renders
  const stats = useMemo(() => {
    const rawStats = calculateDashboardStats(data);
    return enrichDashboardStats(rawStats);
  }, [data]);

  const monthlySalaryData = useMemo(() => {
    return getMonthlySalaryData(data.sales);
  }, [data.sales]);

  const peakExpenseMonth = useMemo(() => getPeakExpenseMonth(data.expenses), [data.expenses]);

  const monthlyExpenseData = useMemo(() => getMonthlyExpenseData(data.expenses), [data.expenses]);

  const expenseSummary = useMemo(() => summarizeExpenseTrend(monthlyExpenseData), [monthlyExpenseData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const peakExpenseFooter = peakExpenseMonth
    ? `${formatCompactCurrency(peakExpenseMonth.amount)} · ${(peakExpenseMonth.share * 100).toFixed(1)}% of ${peakExpenseMonth.year} · ${peakExpenseMonth.count} ${peakExpenseMonth.count === 1 ? "record" : "records"}`
    : "No expenses recorded";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <DangerCircleIcon size={56} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Error loading dashboard</h2>
        <p className="text-zinc-500 text-sm max-w-md">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Dashboard
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Real-time financial metrics, project status, and annual forecasts
              </p>
            </div>
            <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
              <ThemeToggle iconSize={22} />
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            <StatCard
              index={0}
              title="This Month Salary"
              value={formatCurrency(stats.thisMonthSalary)}
              percentage={stats.thisMonthSalaryPercentageChange ?? 0}
              icon={<BankIcon size={22} />}
              badgeColor="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              index={1}
              title="This Month Expenses"
              value={formatCurrency(stats.thisMonthExpenses)}
              percentage={stats.thisMonthExpensesPercentageChange ?? 0}
              icon={<Wallet2Icon size={22} />}
              badgeColor="text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
            />
            <StatCard
              index={2}
              title="Total Expenses"
              value={formatCurrency(stats.totalExpenses)}
              percentage={stats.totalExpensesPercentageChange ?? 0}
              icon={<RoundAltArrowDownIcon size={22} />}
              badgeColor="text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
            />
            <StatCard
              index={3}
              title="Total Projects"
              value={stats.totalProjects.toString()}
              percentage={stats.totalProjectsPercentageChange ?? 0}
              icon={<SuitcaseLinesIcon size={22} />}
              badgeColor="text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20"
            />
            <StatCard
              index={4}
              title="Total Sales Income"
              value={formatCurrency(stats.totalSalesIncome)}
              percentage={stats.totalSalaryPercentageChange ?? 0}
              icon={<GraphUpIcon size={22} />}
              badgeColor="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              index={5}
              title={`This Year Sales (${new Date().getFullYear()})`}
              value={formatCurrency(stats.totalSalary)}
              percentage={stats.totalSalaryPercentageChange ?? 0}
              icon={<Banknote2Icon size={22} />}
              badgeColor="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            />
            <StatCard
              index={6}
              title={`Last Year Sales (${new Date().getFullYear() - 1})`}
              value={formatCurrency(stats.lastYearSalary)}
              percentage={stats.lastYearSalaryPercentageChange ?? 0}
              icon={<CalendarIcon size={22} />}
              badgeColor="text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20"
            />
            <StatCard
              index={7}
              title="Total Savings"
              value={formatCurrency(stats.totalSavings ?? 0)}
              percentage={stats.totalSavingsPercentageChange ?? 0}
              icon={<GraphUpIcon size={22} />}
              badgeColor="text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20"
            />
            <StatCard
              index={8}
              title="Peak Expense Month"
              value={peakExpenseMonth ? `${peakExpenseMonth.month} ${peakExpenseMonth.year}` : "—"}
              icon={<CalendarIcon size={22} />}
              badgeColor="text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
              footer={peakExpenseFooter}
            />
          </div>

          {/* Charts Section */}
          <div className="space-y-6 pb-12">
            <AnimatedListItem index={9}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  Financial Distribution
                </h3>
                <FinancialPieChart
                  stats={{
                    totalSalesIncome: stats.totalSalesIncome,
                    totalExpenses: stats.totalExpenses
                  }} 
                  expenses={data.expenses.map(e => ({
                    category: e.category,
                    amount: e.amount,
                    label: e.title
                  }))} 
                />
              </div>
            </AnimatedListItem>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnimatedListItem index={10}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                    Salary Trend
                  </h3>
                  <SalaryLineChart sales={data.sales.map(s => ({
                    dateReceived: s.dateReceived,
                    amount: s.amount
                  }))} />
                </div>
              </AnimatedListItem>

              <AnimatedListItem index={11}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                    Monthly Overview
                  </h3>
                  <MonthlySalaryLineChart data={monthlySalaryData} />
                </div>
              </AnimatedListItem>
            </div>

            <AnimatedListItem index={12}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  Expense Trend
                </h3>
                <ExpenseTrendChart data={monthlyExpenseData} summary={expenseSummary} />
              </div>
            </AnimatedListItem>
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
  percentage?: number;
  footer?: React.ReactNode;
  icon: React.ReactNode;
  badgeColor: string;
}

function StatCard({ index, title, value, percentage, footer, icon, badgeColor }: StatCardProps) {
  const change = percentage ?? 0;
  const isIncrease = change > 0;
  const isDecrease = change < 0;

  return (
    <AnimatedListItem index={index}>
      <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              {title}
            </span>
            <div className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {value}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border ${badgeColor}`}>
            {icon}
          </div>
        </div>

        {/* Change indicator */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs font-medium">
          {footer ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{footer}</span>
          ) : (
            <>
              {isIncrease && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <GraphUpIcon size={14} />
                  +{change.toFixed(1)}%
                </span>
              )}
              {isDecrease && (
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 tabular-nums">
                  <GraphDownIcon size={14} />
                  {change.toFixed(1)}%
                </span>
              )}
              {!isIncrease && !isDecrease && (
                <span className="inline-flex items-center gap-1 text-zinc-400 dark:text-zinc-500 tabular-nums">
                  <MinusIcon size={14} />
                  0.0%
                </span>
              )}
              <span className="text-zinc-400 dark:text-zinc-500 text-[11px] ml-1">vs previous period</span>
            </>
          )}
        </div>
      </div>
    </AnimatedListItem>
  );
}
