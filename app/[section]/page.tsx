import { notFound } from 'next/navigation';
import DashboardView from '@/app/features/dashboard/DashboardView';
import ExpensesView from '@/app/features/expenses/ExpensesView';

// Central route map — add new sections here
const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  expenses: ExpensesView,
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
