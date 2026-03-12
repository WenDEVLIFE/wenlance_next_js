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
  };
};
