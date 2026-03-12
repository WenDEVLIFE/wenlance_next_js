import { expenseRepository } from './ExpenseRepository';
import { saleRepository } from './SaleRepository';
import { projectRepository } from './ProjectRepository';
import { savingsRepository } from './SavingsRepository';
import { ExpenseModel } from '../../app/model/ExpenseModel';
import { SaleModel } from '../../app/model/SaleModel';
import { ProjectModel } from '../../app/model/ProjectModel';
import { SavingsModel } from '../../app/model/SavingsModel';
import { SavingsUtilizationModel } from '../../app/model/SavingsUtilizationModel';

export interface DashboardData {
  expenses: ExpenseModel[];
  sales: SaleModel[];
  projects: ProjectModel[];
  savings: SavingsModel[];
  utilizations: SavingsUtilizationModel[];
}

class DashboardRepository {
  /**
   * Listens to all dashboard-related data real-time.
   * @param callback Function called whenever any part of the dashboard data updates.
   * @returns Unsubscribe function to stop all listeners.
   */
  listenToDashboard(callback: (data: DashboardData) => void): () => void {
    let currentData: DashboardData = {
      expenses: [],
      sales: [],
      projects: [],
      savings: [],
      utilizations: []
    };

    const updateData = (partial: Partial<DashboardData>) => {
      currentData = { ...currentData, ...partial };
      callback(currentData);
    };

    const unsubscribeExpenses = expenseRepository.listenToExpenses((expenses) => {
      updateData({ expenses });
    });

    const unsubscribeSales = saleRepository.listenToSales((sales) => {
      updateData({ sales });
    });

    const unsubscribeProjects = projectRepository.listenToProjects((projects) => {
      updateData({ projects });
    });

    const unsubscribeSavings = savingsRepository.listenToSavings((savings) => {
      updateData({ savings });
    });

    const unsubscribeUtilizations = savingsRepository.listenToUtilizations((utilizations) => {
      updateData({ utilizations });
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeSales();
      unsubscribeProjects();
      unsubscribeSavings();
      unsubscribeUtilizations();
    };
  }
}

export const dashboardRepository = new DashboardRepository();
export default dashboardRepository;
