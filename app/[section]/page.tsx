import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardView from '@/app/features/dashboard/DashboardView';
import ExpensesView from '@/app/features/expenses/ExpensesView';
import ProjectsView from '@/app/features/projects/ProjectsView';
import SalaryView from '@/app/features/salary/SalaryView';
import SavingsView from '@/app/features/savings/SavingsView';
import TasksView from '@/app/features/tasks/TasksView';
import PerformanceView from '@/app/features/performance/PerformanceView';

// Code-split heavy WebLLM bundle so initial navigation stays fast
const AIAssistantView = dynamic(() => import('@/app/features/ai/AIAssistantView'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// Central route map — add new sections here
const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  expenses: ExpensesView,
  projects: ProjectsView,
  salary: SalaryView,
  savings: SavingsView,
  tasks: TasksView,
  performance: PerformanceView,
  ai: AIAssistantView,
};

interface PageProps {
  params: Promise<{ section: string }>;
}

export default async function Page({ params }: PageProps) {
  const { section } = await params;
  const View = views[section];

  if (!View) {
    notFound();
  }

  return <View />;
}

// Pre-render all known sections at build time
export function generateStaticParams() {
  return Object.keys(views).map((section) => ({ section }));
}
