import { DashboardData } from '../repositories/DashboardRepository';
import { ExpenseModel } from '../../app/model/ExpenseModel';
import { SaleModel } from '../../app/model/SaleModel';
import { ProjectModel } from '../../app/model/ProjectModel';
import { SavingsModel } from '../../app/model/SavingsModel';

export type ChunkType = 'expense' | 'sale' | 'project' | 'savings' | 'summary';

export interface DataChunk {
  id: string;
  type: ChunkType;
  text: string;
  metadata: Record<string, string | number>;
}

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function expenseToChunk(expense: ExpenseModel, index: number): DataChunk {
  const text = [
    `Expense: ${expense.title}`,
    `Category: ${expense.category}`,
    `Amount: ${formatCurrency(expense.amount)}`,
    `Date: ${formatDate(expense.date)}`,
    expense.description ? `Description: ${expense.description}` : '',
  ].filter(Boolean).join('. ');

  return {
    id: `expense-${expense.id || index}`,
    type: 'expense',
    text,
    metadata: {
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.getTime(),
    },
  };
}

function saleToChunk(sale: SaleModel, index: number): DataChunk {
  const text = [
    `Sale: ${sale.title}`,
    `Category: ${sale.category}`,
    `Amount: ${formatCurrency(sale.amount)}`,
    `Date received: ${formatDate(sale.dateReceived)}`,
  ].filter(Boolean).join('. ');

  return {
    id: `sale-${sale.id || index}`,
    type: 'sale',
    text,
    metadata: {
      title: sale.title,
      category: sale.category,
      amount: sale.amount,
      date: sale.dateReceived.getTime(),
    },
  };
}

function projectToChunk(project: ProjectModel, index: number): DataChunk {
  const text = [
    `Project: ${project.projectName}`,
    `Status: ${project.status}`,
    `Tech stack: ${project.techStacks.join(', ') || 'Not specified'}`,
    `Start date: ${formatDate(project.startDate)}`,
    `Expected end: ${formatDate(project.expectedEndDate)}`,
  ].filter(Boolean).join('. ');

  return {
    id: `project-${project.id || index}`,
    type: 'project',
    text,
    metadata: {
      name: project.projectName,
      status: project.status,
      startDate: project.startDate.getTime(),
      endDate: project.expectedEndDate.getTime(),
    },
  };
}

function savingsToChunk(savings: SavingsModel, index: number): DataChunk {
  const text = [
    `Savings: ${savings.title}`,
    `Category: ${savings.category}`,
    `Target amount: ${formatCurrency(savings.amount)}`,
    `Storage type: ${savings.storageType || 'Bank'}`,
    `Created: ${formatDate(savings.createdAt)}`,
    savings.description ? `Description: ${savings.description}` : '',
  ].filter(Boolean).join('. ');

  return {
    id: `savings-${savings.id || index}`,
    type: 'savings',
    text,
    metadata: {
      title: savings.title,
      category: savings.category,
      amount: savings.amount,
      date: savings.createdAt.getTime(),
    },
  };
}

function summaryChunk(data: DashboardData): DataChunk {
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSales = data.sales.reduce((sum, s) => sum + s.amount, 0);
  const totalSavings = data.savings.reduce((sum, s) => sum + s.amount, 0);
  const activeProjects = data.projects.filter(p => p.status !== 'Completed').length;

  const text = [
    `Financial Summary for Wenlance`,
    `Total expenses: ${formatCurrency(totalExpenses)} across ${data.expenses.length} items`,
    `Total sales/salary: ${formatCurrency(totalSales)} from ${data.sales.length} sources`,
    `Total savings target: ${formatCurrency(totalSavings)} across ${data.savings.length} accounts`,
    `Active projects: ${activeProjects} out of ${data.projects.length} total`,
    `Net balance: ${formatCurrency(totalSales - totalExpenses)}`,
  ].join('. ');

  return {
    id: 'summary',
    type: 'summary',
    text,
    metadata: {
      totalExpenses,
      totalSales,
      totalSavings,
      netBalance: totalSales - totalExpenses,
      expenseCount: data.expenses.length,
      saleCount: data.sales.length,
      projectCount: data.projects.length,
      savingsCount: data.savings.length,
    },
  };
}

export function chunkDashboardData(data: DashboardData): DataChunk[] {
  const chunks: DataChunk[] = [];

  chunks.push(summaryChunk(data));

  data.expenses.forEach((expense, i) => {
    chunks.push(expenseToChunk(expense, i));
  });

  data.sales.forEach((sale, i) => {
    chunks.push(saleToChunk(sale, i));
  });

  data.projects.forEach((project, i) => {
    chunks.push(projectToChunk(project, i));
  });

  data.savings.forEach((savings, i) => {
    chunks.push(savingsToChunk(savings, i));
  });

  return chunks;
}
