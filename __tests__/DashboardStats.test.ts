import { describe, it, expect } from 'vitest';
import { getMonthlyExpenseData, getPeakExpenseMonth } from '@/app/model/DashboardStats';
import type { ExpenseModel } from '@/app/model/ExpenseModel';

function expense(amount: number, date: Date, title = 'Expense'): ExpenseModel {
  return {
    title,
    category: 'Other',
    amount,
    date,
    description: '',
  };
}

describe('DashboardStats expenses', () => {
  const year = 2026;

  describe('getPeakExpenseMonth', () => {
    it('should pick the month with the highest total across three months', () => {
      const expenses = [
        expense(1000, new Date(2026, 0, 15)),
        expense(5000, new Date(2026, 1, 10)),
        expense(1200, new Date(2026, 1, 20)),
        expense(2000, new Date(2026, 2, 5)),
      ];

      const peak = getPeakExpenseMonth(expenses, year);

      expect(peak).not.toBeNull();
      expect(peak?.month).toBe('Feb');
      expect(peak?.year).toBe(year);
      expect(peak?.amount).toBe(6200);
      expect(peak?.count).toBe(2);
    });

    it('should ignore expenses from other years', () => {
      const expenses = [
        expense(9000, new Date(2025, 7, 15)),
        expense(500, new Date(2026, 3, 1)),
        expense(300, new Date(2026, 4, 1)),
      ];

      const peak = getPeakExpenseMonth(expenses, year);

      expect(peak?.month).toBe('Apr');
      expect(peak?.amount).toBe(500);
    });

    it('should return null for an empty list', () => {
      expect(getPeakExpenseMonth([], year)).toBeNull();
    });

    it('should return null when the year has no expenses', () => {
      const expenses = [expense(1500, new Date(2025, 5, 10))];

      expect(getPeakExpenseMonth(expenses, year)).toBeNull();
    });

    it('should pick the earliest month when totals tie', () => {
      const expenses = [
        expense(1000, new Date(2026, 2, 15)),
        expense(1000, new Date(2026, 0, 15)),
        expense(400, new Date(2026, 1, 15)),
      ];

      const peak = getPeakExpenseMonth(expenses, year);

      expect(peak?.month).toBe('Jan');
      expect(peak?.amount).toBe(1000);
    });

    it('should report the peak share of the yearly total', () => {
      const expenses = [
        expense(250, new Date(2026, 0, 5)),
        expense(250, new Date(2026, 3, 5)),
        expense(250, new Date(2026, 7, 5)),
        expense(250, new Date(2026, 10, 5)),
      ];

      const peak = getPeakExpenseMonth(expenses, year);
      const yearTotal = getMonthlyExpenseData(expenses, year).reduce((sum, m) => sum + m.amount, 0);

      expect(peak?.share).toBeCloseTo(0.25, 10);
      expect(peak?.share).toBe(peak?.amount !== undefined ? peak.amount / yearTotal : undefined);
      expect(yearTotal).toBe(1000);
    });
  });

  describe('getMonthlyExpenseData', () => {
    it('should always return 12 months in calendar order', () => {
      const months = getMonthlyExpenseData([], year);

      expect(months).toHaveLength(12);
      expect(months.map(m => m.month)).toEqual([
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ]);
      expect(months.every(m => m.amount === 0 && m.count === 0)).toBe(true);
    });

    it('should sum amounts and count records per month', () => {
      const expenses = [
        expense(100, new Date(2026, 0, 5)),
        expense(250, new Date(2026, 0, 25)),
        expense(400, new Date(2026, 8, 10)),
      ];

      const months = getMonthlyExpenseData(expenses, year);
      const january = months[0];
      const september = months[8];

      expect(january.amount).toBe(350);
      expect(january.count).toBe(2);
      expect(september.amount).toBe(400);
      expect(september.count).toBe(1);

      const total = months.reduce((sum, m) => sum + m.amount, 0);
      expect(total).toBe(750);
    });

    it('should skip invalid dates instead of throwing', () => {
      const invalidDate = new Date('not-a-date');
      const expenses = [
        expense(100, new Date(2026, 0, 5)),
        expense(999, invalidDate),
        expense(999, '2026-01-10' as unknown as Date),
      ];

      const months = getMonthlyExpenseData(expenses, year);

      expect(months[0].amount).toBe(100);
      expect(months.reduce((sum, m) => sum + m.count, 0)).toBe(1);
    });
  });
});
