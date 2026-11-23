import { DashboardData } from "@/lib/repositories/DashboardRepository";
import { MonthlySaleModel } from "@/components/MonthlySalaryLineChart";
import { ExpenseModel } from "./ExpenseModel";

/**
 * DashboardStats interface converted from Swift.
 * Contains both raw values and previous period values for trend calculation.
 */
export interface DashboardStats {
  thisMonthSalary: number;
  thisMonthExpenses: number;
  totalExpenses: number;
  totalProjects: number;
  totalSalary: number;
  lastYearSalary: number;
  totalSalesIncome: number;
  thisMonthSalesIncome: number;
  totalSavings: number;

  // Previous period values for percentage calculation
  lastMonthSalary?: number;
  lastMonthExpenses?: number;
  previousTotalExpenses?: number;
  previousTotalProjects?: number;
  previousTotalSalary?: number;
  yearBeforeLastSalary?: number;
}

/**
 * Utility functions to calculate percentage changes, mirroring Swift computed properties.
 */
export const calculatePercentageChange = (current: number, previous?: number): number | null => {
  if (previous === undefined || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

/**
 * Enriched stats object that includes calculated percentage changes.
 */
export interface EnrichedDashboardStats extends DashboardStats {
  thisMonthSalaryPercentageChange: number | null;
  thisMonthExpensesPercentageChange: number | null;
  totalExpensesPercentageChange: number | null;
  totalProjectsPercentageChange: number | null;
  totalSalaryPercentageChange: number | null;
  lastYearSalaryPercentageChange: number | null;
  totalSavingsPercentageChange: number | null;
}

/**
 * Transforms raw DashboardStats into EnrichedDashboardStats with computed trends.
 */
export const enrichDashboardStats = (stats: DashboardStats): EnrichedDashboardStats => {
  return {
    ...stats,
    thisMonthSalaryPercentageChange: calculatePercentageChange(stats.thisMonthSalary, stats.lastMonthSalary),
    thisMonthExpensesPercentageChange: calculatePercentageChange(stats.thisMonthExpenses, stats.lastMonthExpenses),
    totalExpensesPercentageChange: calculatePercentageChange(stats.totalExpenses, stats.previousTotalExpenses),
    totalProjectsPercentageChange: calculatePercentageChange(stats.totalProjects, stats.previousTotalProjects),
    totalSalaryPercentageChange: calculatePercentageChange(stats.totalSalary, stats.previousTotalSalary),
    lastYearSalaryPercentageChange: calculatePercentageChange(stats.lastYearSalary, stats.yearBeforeLastSalary),
    totalSavingsPercentageChange: 0, // Simplified for now since we don't have previous savings yet
  };
};

/**
 * Calculates DashboardStats from raw DashboardData.
 */
export const calculateDashboardStats = (data: DashboardData): DashboardStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();
  
  const lastYear = currentYear - 1;
  const yearBeforeLast = currentYear - 2;

  const thisMonthSales = data.sales.filter(s => s.dateReceived.getMonth() === currentMonth && s.dateReceived.getFullYear() === currentYear);
  const lastMonthSales = data.sales.filter(s => s.dateReceived.getMonth() === lastMonth && s.dateReceived.getFullYear() === lastMonthYear);
  
  const thisMonthExpensesList = data.expenses.filter(e => e.date.getMonth() === currentMonth && e.date.getFullYear() === currentYear);
  const lastMonthExpensesList = data.expenses.filter(e => e.date.getMonth() === lastMonth && e.date.getFullYear() === lastMonthYear);

  const thisYearSales = data.sales.filter(s => s.dateReceived.getFullYear() === currentYear);
  const lastYearSales = data.sales.filter(s => s.dateReceived.getFullYear() === lastYear);
  const yearBeforeLastSales = data.sales.filter(s => s.dateReceived.getFullYear() === yearBeforeLast);

  const totalSales = data.sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const thisMonthSalary = thisMonthSales.reduce((sum, s) => sum + s.amount, 0);
  const thisMonthExpenses = thisMonthExpensesList.reduce((sum, e) => sum + e.amount, 0);

  // Savings Aggregation
  const totalSavings = data.savings.reduce((sum, s) => sum + s.amount, 0);
  const totalUtilized = data.utilizations.reduce((sum, u) => sum + u.amount, 0);
  const netSavings = totalSavings - totalUtilized;

  return {
    thisMonthSalary,
    thisMonthExpenses,
    totalExpenses,
    totalProjects: data.projects.length,
    totalSalary: thisYearSales.reduce((sum, s) => sum + s.amount, 0),
    lastYearSalary: lastYearSales.reduce((sum, s) => sum + s.amount, 0),
    totalSalesIncome: totalSales,
    thisMonthSalesIncome: thisMonthSalary,
    
    lastMonthSalary: lastMonthSales.reduce((sum, s) => sum + s.amount, 0),
    lastMonthExpenses: lastMonthExpensesList.reduce((sum, e) => sum + e.amount, 0),
    previousTotalExpenses: totalExpenses - thisMonthExpenses,
    previousTotalProjects: data.projects.filter(p => p.startDate < new Date(currentYear, currentMonth, 1)).length,
    previousTotalSalary: lastYearSales.reduce((sum, s) => sum + s.amount, 0),
    yearBeforeLastSalary: yearBeforeLastSales.reduce((sum, s) => sum + s.amount, 0),
    
    // Add netSavings to stats if desired in the model
    totalSavings: netSavings,
  };
};

/**
 * Aggregates sales into monthly data for the current year.
 */
export const getMonthlySalaryData = (sales: Array<{ amount: number; dateReceived?: Date; date?: Date }>): MonthlySaleModel[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const monthlyTotals = new Array(12).fill(0);
  
  sales.forEach(sale => {
    const saleDate = sale.dateReceived || sale.date;
    if (saleDate && saleDate.getFullYear() === currentYear) {
      monthlyTotals[saleDate.getMonth()] += sale.amount;
    }
  });

  return months.map((month, index) => ({
    month,
    amount: monthlyTotals[index]
  }));
};

/**
 * Monthly expense aggregate for one month of a specific year.
 */
export interface MonthlyExpenseModel {
  month: string;
  amount: number;
  count: number;
}

/**
 * The month with the highest total expenses inside a specific year.
 */
export interface PeakExpenseMonth {
  month: string;
  year: number;
  amount: number;
  count: number;
  share: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns true only for a real, valid Date instance so bad records are skipped.
 */
const isValidExpenseDate = (date: Date): boolean => date instanceof Date && !isNaN(date.getTime());

/**
 * Aggregates expenses into 12 monthly totals (Jan..Dec) for the given year.
 * Records with a missing or invalid date, or a different year, are skipped.
 */
export const getMonthlyExpenseData = (
  expenses: ExpenseModel[],
  year: number = new Date().getFullYear()
): MonthlyExpenseModel[] => {
  const monthlyTotals = new Array<number>(12).fill(0);
  const monthlyCounts = new Array<number>(12).fill(0);

  expenses.forEach(expense => {
    if (!isValidExpenseDate(expense.date)) return;
    if (expense.date.getFullYear() !== year) return;

    const monthIndex = expense.date.getMonth();
    monthlyTotals[monthIndex] += expense.amount;
    monthlyCounts[monthIndex] += 1;
  });

  return MONTH_LABELS.map((month, index) => ({
    month,
    amount: monthlyTotals[index],
    count: monthlyCounts[index],
  }));
};

/**
 * Finds the month with the highest total expenses in the given year.
 * Returns null when the year has no expenses. On an exact tie the earliest
 * month wins, because only a strictly greater amount replaces the current peak.
 */
export const getPeakExpenseMonth = (
  expenses: ExpenseModel[],
  year: number = new Date().getFullYear()
): PeakExpenseMonth | null => {
  const monthlyData = getMonthlyExpenseData(expenses, year);
  const yearTotal = monthlyData.reduce((sum, month) => sum + month.amount, 0);

  if (yearTotal === 0) return null;

  const peak = monthlyData.reduce((best, current) => current.amount > best.amount ? current : best, monthlyData[0]);

  return {
    month: peak.month,
    year,
    amount: peak.amount,
    count: peak.count,
    share: peak.amount / yearTotal,
  };
};
