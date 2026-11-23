import { describe, it, expect } from 'vitest';
import { summarizeIncomePerformance } from '@/app/model/PerformanceStats';
import type { SaleModel } from '@/app/model/SaleModel';

// June 15, 2026 → monthsElapsed is 6.
const NOW = new Date(2026, 5, 15);

function sale(amount: number, dateReceived: Date, title = 'Sale'): SaleModel {
  return {
    title,
    category: 'Design',
    amount,
    dateReceived,
  };
}

describe('PerformanceStats income performance', () => {
  describe('months', () => {
    it('should always return 12 months in calendar order', () => {
      const perf = summarizeIncomePerformance([], 0, NOW);

      expect(perf.months).toHaveLength(12);
      expect(perf.months.map(m => m.month)).toEqual([
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ]);
      expect(perf.months.every(m => m.amount === 0)).toBe(true);
    });

    it('should report months elapsed for the month of now', () => {
      expect(summarizeIncomePerformance([], 0, NOW).monthsElapsed).toBe(6);
      expect(summarizeIncomePerformance([], 0, new Date(2026, 11, 1)).monthsElapsed).toBe(12);
      expect(summarizeIncomePerformance([], 0, new Date(2026, 0, 1)).monthsElapsed).toBe(1);
    });

    it('should sum income into the matching month', () => {
      const sales = [
        sale(1000, new Date(2026, 0, 5)),
        sale(2500, new Date(2026, 0, 25)),
        sale(4000, new Date(2026, 5, 10)),
      ];

      const perf = summarizeIncomePerformance(sales, 0, NOW);

      expect(perf.months[0].amount).toBe(3500);
      expect(perf.months[5].amount).toBe(4000);
      expect(perf.months[1].amount).toBe(0);
    });
  });

  describe('sums', () => {
    it('should report this-month and year-to-date income', () => {
      const sales = [
        sale(1000, new Date(2026, 0, 15)),
        sale(2000, new Date(2026, 2, 10)),
        sale(500, new Date(2026, 5, 1)),
        sale(700, new Date(2026, 5, 20)),
      ];

      const perf = summarizeIncomePerformance(sales, 5000, NOW);

      expect(perf.thisMonthIncome).toBe(1200);
      expect(perf.ytdIncome).toBe(4200);
    });

    it('should ignore sales from other years', () => {
      const sales = [
        sale(9000, new Date(2025, 7, 15)),
        sale(500, new Date(2026, 3, 1)),
        sale(300, new Date(2026, 4, 1)),
      ];

      const perf = summarizeIncomePerformance(sales, 1000, NOW);

      expect(perf.ytdIncome).toBe(800);
      expect(perf.ytdTarget).toBe(6000);
    });

    it('should skip invalid dates instead of throwing', () => {
      const sales = [
        sale(100, new Date(2026, 0, 5)),
        sale(999, new Date('not-a-date')),
        sale(999, '2026-01-10' as unknown as Date),
      ];

      const perf = summarizeIncomePerformance(sales, 1000, NOW);

      expect(perf.ytdIncome).toBe(100);
      expect(perf.thisMonthIncome).toBe(0);
      expect(perf.months[0].amount).toBe(100);
    });
  });

  describe('progress against the target', () => {
    it('should compute this-month and YTD progress ratios', () => {
      const sales = [
        sale(1000, new Date(2026, 0, 15)),
        sale(3000, new Date(2026, 1, 15)),
        sale(1500, new Date(2026, 5, 10)),
      ];

      const perf = summarizeIncomePerformance(sales, 2000, NOW);

      expect(perf.thisMonthProgress).toBeCloseTo(0.75, 10);
      expect(perf.ytdProgress).toBeCloseTo(5500 / 12000, 10);
      expect(perf.ytdTarget).toBe(12000);
    });

    it('should allow progress above 100%', () => {
      const sales = [sale(3000, new Date(2026, 5, 10))];

      const perf = summarizeIncomePerformance(sales, 1000, NOW);

      expect(perf.thisMonthProgress).toBeCloseTo(3, 10);
      expect(perf.remainingToTarget).toBe(0);
    });

    it('should never return a negative remaining amount', () => {
      const short = summarizeIncomePerformance([sale(200, new Date(2026, 5, 10))], 1000, NOW);
      const over = summarizeIncomePerformance([sale(2000, new Date(2026, 5, 10))], 1000, NOW);

      expect(short.remainingToTarget).toBe(800);
      expect(over.remainingToTarget).toBe(0);
    });

    it('should return zero progress without NaN or Infinity when the target is 0', () => {
      const sales = [sale(1500, new Date(2026, 5, 10))];

      const perf = summarizeIncomePerformance(sales, 0, NOW);

      expect(perf.thisMonthProgress).toBe(0);
      expect(perf.ytdProgress).toBe(0);
      expect(perf.ytdTarget).toBe(0);
      expect(Number.isFinite(perf.thisMonthProgress)).toBe(true);
      expect(Number.isFinite(perf.ytdProgress)).toBe(true);
      expect(Number.isFinite(perf.averageMonthlyIncome)).toBe(true);
    });

    it('should treat a negative target as 0', () => {
      const perf = summarizeIncomePerformance([sale(500, new Date(2026, 5, 10))], -2500, NOW);

      expect(perf.monthlyTarget).toBe(0);
      expect(perf.thisMonthProgress).toBe(0);
      expect(perf.ytdProgress).toBe(0);
      expect(perf.remainingToTarget).toBe(0);
    });
  });

  describe('averages and best month', () => {
    it('should divide YTD income by the months elapsed', () => {
      const sales = [
        sale(1200, new Date(2026, 0, 15)),
        sale(1800, new Date(2026, 2, 10)),
        sale(600, new Date(2026, 5, 10)),
      ];

      const perf = summarizeIncomePerformance(sales, 2000, NOW);

      expect(perf.averageMonthlyIncome).toBeCloseTo(3600 / 6, 10);
      expect(perf.averageMonthlyIncome).not.toBeCloseTo(3600 / 12, 10);
    });

    it('should pick the highest month', () => {
      const sales = [
        sale(500, new Date(2026, 0, 5)),
        sale(4000, new Date(2026, 1, 5)),
        sale(1000, new Date(2026, 3, 5)),
      ];

      const perf = summarizeIncomePerformance(sales, 2000, NOW);

      expect(perf.bestMonth?.month).toBe('Feb');
      expect(perf.bestMonth?.amount).toBe(4000);
    });

    it('should keep the earliest month when totals tie', () => {
      const sales = [
        sale(1000, new Date(2026, 3, 5)),
        sale(1000, new Date(2026, 0, 5)),
        sale(500, new Date(2026, 6, 5)),
      ];

      const perf = summarizeIncomePerformance(sales, 2000, NOW);

      expect(perf.bestMonth?.month).toBe('Jan');
      expect(perf.bestMonth?.amount).toBe(1000);
    });

    it('should return null for the best month when the year has no income', () => {
      const perf = summarizeIncomePerformance([], 2000, NOW);

      expect(perf.bestMonth).toBeNull();
      expect(perf.ytdIncome).toBe(0);
      expect(perf.averageMonthlyIncome).toBe(0);
    });
  });
});
