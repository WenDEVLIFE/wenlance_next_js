'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  CalendarIcon,
  ChartSquareIcon,
  GraphUpIcon,
  MedalStarIcon,
  TargetIcon,
} from '@solar-icons/react/linear';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { summarizeIncomePerformance } from '../../model/PerformanceStats';
import type { SaleModel } from '../../model/SaleModel';
import { saleRepository } from '@/lib/repositories/SaleRepository';
import { performanceRepository, DEFAULT_PERFORMANCE_SETTINGS } from '@/lib/repositories/PerformanceRepository';
import type { PerformanceSettings } from '@/lib/repositories/PerformanceRepository';

// Code-split heavy charting bundle so the target card and KPIs paint first
const IncomePerformanceChart = dynamic(
  () => import('@/components/IncomePerformanceChart').then((mod) => mod.IncomePerformanceChart),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

/**
 * Parses the target input. An empty field means 0 while typing is still allowed,
 * and a negative value is clamped so the stored target never drops below 0.
 */
const parseTargetInput = (value: string): number | null => {
  if (value.trim() === '') return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;

  return Math.max(parsed, 0);
};

type SaveStatus = 'idle' | 'saved' | 'error';

export default function PerformanceView() {
  const [sales, setSales] = useState<SaleModel[]>([]);
  const [settings, setSettings] = useState<PerformanceSettings>(DEFAULT_PERFORMANCE_SETTINGS);
  const [salesLoaded, setSalesLoaded] = useState(false);

  const [targetInput, setTargetInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const hasEditedTarget = useRef(false);

  useEffect(() => {
    const unsubscribeSales = saleRepository.listenToSales((liveSales) => {
      setSales(liveSales);
      setSalesLoaded(true);
    });
    const unsubscribeSettings = performanceRepository.listenToSettings(setSettings);

    return () => {
      unsubscribeSales();
      unsubscribeSettings();
    };
  }, []);

  // Mirror the stored target into the input until the user starts editing it.
  useEffect(() => {
    if (hasEditedTarget.current) return;
    setTargetInput(settings.monthlyIncomeTarget > 0 ? String(settings.monthlyIncomeTarget) : '');
  }, [settings.monthlyIncomeTarget]);

  // Memoize the derivation so parent re-renders do not recompute the summary
  const perf = useMemo(
    () => summarizeIncomePerformance(sales, settings.monthlyIncomeTarget),
    [sales, settings.monthlyIncomeTarget]
  );

  const parsedTarget = parseTargetInput(targetInput);
  const isTargetDirty = parsedTarget !== null && parsedTarget !== settings.monthlyIncomeTarget;

  const handleTargetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    hasEditedTarget.current = true;
    setTargetInput(event.target.value);
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const handleTargetBlur = () => {
    if (parsedTarget === null) return;
    if (parsedTarget !== Number(targetInput)) {
      setTargetInput(parsedTarget > 0 ? String(parsedTarget) : '');
    }
  };

  const handleSave = async () => {
    if (parsedTarget === null) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await performanceRepository.saveSettings({ monthlyIncomeTarget: parsedTarget });
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving performance settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!salesLoaded) {
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
                Performance
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Freelance income performance against your monthly target
              </p>
            </div>
            <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
              <ThemeToggle iconSize={22} />
            </div>
          </header>

          <div className="space-y-6 pb-12">
            {/* Target Card */}
            <AnimatedListItem index={0}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Monthly income target</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Your target is stored with your account
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                    <TargetIcon size={22} />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="income-target" className="sr-only">Monthly income target</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                      id="income-target"
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={targetInput}
                      onChange={handleTargetChange}
                      onBlur={handleTargetBlur}
                      placeholder="0"
                      className="w-full sm:w-56 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm tabular-nums text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving || !isTargetDirty}
                      className="h-11 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving…' : 'Save target'}
                    </button>
                    {saveStatus === 'saved' && (
                      <span role="status" className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>
                    )}
                    {saveStatus === 'error' && (
                      <span role="status" className="text-sm text-rose-600 dark:text-rose-400">
                        Could not save target
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedListItem>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard
                index={1}
                title="This Month"
                value={formatCurrency(perf.thisMonthIncome)}
                icon={<GraphUpIcon size={22} />}
                footer={
                  <div className="space-y-2">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {(perf.thisMonthProgress * 100).toFixed(1)}% of target
                    </span>
                    <ProgressBar value={perf.thisMonthProgress} />
                  </div>
                }
              />
              <MetricCard
                index={2}
                title="Year To Date"
                value={formatCurrency(perf.ytdIncome)}
                icon={<ChartSquareIcon size={22} />}
                footer={
                  <div className="space-y-2">
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {(perf.ytdProgress * 100).toFixed(1)}% of {formatCurrency(perf.ytdTarget)}
                    </span>
                    <ProgressBar value={perf.ytdProgress} />
                  </div>
                }
              />
              <MetricCard
                index={3}
                title="Monthly Average"
                value={formatCurrency(perf.averageMonthlyIncome)}
                icon={<CalendarIcon size={22} />}
                footer={
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    across {perf.monthsElapsed} months
                  </span>
                }
              />
              <MetricCard
                index={4}
                title="Best Month"
                value={perf.bestMonth ? perf.bestMonth.month : '—'}
                icon={<MedalStarIcon size={22} />}
                footer={
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {perf.bestMonth ? formatCurrency(perf.bestMonth.amount) : 'No income yet'}
                  </span>
                }
              />
            </div>

            {/* Chart Card */}
            <AnimatedListItem index={5}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  Income Trend
                </h3>
                <IncomePerformanceChart months={perf.months} target={perf.monthlyTarget} />
              </div>
            </AnimatedListItem>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

interface MetricCardProps {
  index: number;
  title: string;
  value: string;
  footer: React.ReactNode;
  icon: React.ReactNode;
}

function MetricCard({ index, title, value, footer, icon }: MetricCardProps) {
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
          <div className="p-2.5 rounded-xl border text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            {icon}
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          {footer}
        </div>
      </div>
    </AnimatedListItem>
  );
}

function ProgressBar({ value }: { value: number }) {
  const width = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
