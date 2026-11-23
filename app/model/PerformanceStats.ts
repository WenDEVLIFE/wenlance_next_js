import type { SaleModel } from './SaleModel';

/**
 * Income total for one calendar month of a performance year.
 */
export interface MonthlyIncomeModel {
  month: string;
  amount: number;
}

/**
 * Derived income performance for the year that contains `now`.
 */
export interface IncomePerformance {
  monthlyTarget: number;
  /** Always 12 entries for the year of `now`, Jan..Dec. */
  months: MonthlyIncomeModel[];
  /** now.getMonth() + 1, so a June date reports 6. */
  monthsElapsed: number;
  thisMonthIncome: number;
  /** thisMonthIncome / monthlyTarget, 0 when there is no target. */
  thisMonthProgress: number;
  /** max(monthlyTarget - thisMonthIncome, 0). */
  remainingToTarget: number;
  ytdIncome: number;
  ytdTarget: number;
  ytdProgress: number;
  averageMonthlyIncome: number;
  /** Highest month of the year, null when the year total is 0. */
  bestMonth: MonthlyIncomeModel | null;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Accepts only a real Date instance with a valid timestamp so bad records are skipped.
 */
const isValidSaleDate = (value: Date): boolean => value instanceof Date && !isNaN(value.getTime());

/**
 * Normalizes the user target: negative values (and non-finite input) mean "no target".
 */
const normalizeTarget = (target: number): number =>
  Number.isFinite(target) && target > 0 ? target : 0;

/**
 * Summarizes freelance income against a monthly target for the year of `now`.
 * Sales outside that year and records with an invalid `dateReceived` are ignored.
 */
export const summarizeIncomePerformance = (
  sales: SaleModel[],
  monthlyTarget: number,
  now: Date = new Date()
): IncomePerformance => {
  const year = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const monthsElapsed = currentMonthIndex + 1;
  const target = normalizeTarget(monthlyTarget);

  const monthlyTotals = new Array<number>(12).fill(0);

  sales.forEach((sale) => {
    if (!isValidSaleDate(sale.dateReceived)) return;
    if (sale.dateReceived.getFullYear() !== year) return;

    monthlyTotals[sale.dateReceived.getMonth()] += sale.amount;
  });

  const months = MONTH_LABELS.map((month, index) => ({
    month,
    amount: monthlyTotals[index],
  }));

  const ytdIncome = monthlyTotals.reduce((sum, amount) => sum + amount, 0);
  const thisMonthIncome = months[currentMonthIndex]?.amount ?? 0;
  const ytdTarget = target * monthsElapsed;

  // Average convention: divide YTD by months elapsed, not by 12, so an unfinished
  // year reports what was actually earned per month so far instead of a projection.
  const averageMonthlyIncome = monthsElapsed > 0 ? ytdIncome / monthsElapsed : 0;

  // Earliest month wins ties: only a strictly greater amount replaces the best month.
  const bestMonth =
    ytdIncome > 0
      ? months.reduce<MonthlyIncomeModel | null>(
          (best, month) => (best === null || month.amount > best.amount ? month : best),
          null
        )
      : null;

  return {
    monthlyTarget: target,
    months,
    monthsElapsed,
    thisMonthIncome,
    thisMonthProgress: target > 0 ? thisMonthIncome / target : 0,
    remainingToTarget: Math.max(target - thisMonthIncome, 0),
    ytdIncome,
    ytdTarget,
    ytdProgress: ytdTarget > 0 ? ytdIncome / ytdTarget : 0,
    averageMonthlyIncome,
    bestMonth,
  };
};
