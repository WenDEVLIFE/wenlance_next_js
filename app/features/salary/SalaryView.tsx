'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraphUpIcon, 
  Pen2Icon, 
  TrashBinTrashIcon, 
  AddIcon 
} from '@solar-icons/react/linear';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddSalesDialog } from '@/components/AddSalesDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { SaleModel } from '@/app/model/SaleModel';
import { saleRepository } from '@/lib/repositories/SaleRepository';

// ─── Helpers ────────────────────────────────────────────────
function formatDate(date: Date): string {
  if (!date) return '';
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount).replace('PHP', '₱').trim();
}

function getServiceTypeColorClass(serviceType: string, isText: boolean = false) {
  switch (serviceType) {
    case 'Freelancing Software Service':
      return isText ? 'text-sky-600 dark:text-sky-400' : 'bg-sky-500/10 border-sky-500/30';
    case 'Computer Hardware Services':
      return isText ? 'text-violet-600 dark:text-violet-400' : 'bg-violet-500/10 border-violet-500/30';
    case 'Consulting Work':
      return isText ? 'text-amber-600 dark:text-amber-400' : 'bg-amber-500/10 border-amber-500/30';
    case 'Software Development':
      return isText ? 'text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30';
    case 'Web Development':
      return isText ? 'text-cyan-600 dark:text-cyan-400' : 'bg-cyan-500/10 border-cyan-500/30';
    case 'Mobile App Development':
      return isText ? 'text-pink-600 dark:text-pink-400' : 'bg-pink-500/10 border-pink-500/30';
    case 'UI/UX Design':
      return isText ? 'text-indigo-600 dark:text-indigo-400' : 'bg-indigo-500/10 border-indigo-500/30';
    case 'Cloud Services':
      return isText ? 'text-orange-600 dark:text-orange-400' : 'bg-orange-500/10 border-orange-500/30';
    case 'Technical Support':
      return isText ? 'text-teal-600 dark:text-teal-400' : 'bg-teal-500/10 border-teal-500/30';
    default:
      return isText ? 'text-zinc-600 dark:text-zinc-400' : 'bg-zinc-500/10 border-zinc-500/30';
  }
}

// ─── Main View ──────────────────────────────────────────────
export default function SalaryView() {
  const [sales, setSales] = useState<SaleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const [showingAddDialog, setShowingAddDialog] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleModel | null>(null);

  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<SaleModel | null>(null);

  // Computed totals
  const totalSales = sales.reduce((acc, curr) => acc + curr.amount, 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  // Subscribe to sales
  useEffect(() => {
    const unsubscribe = saleRepository.listenToSales((data) => {
      setSales(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveSale = async (sale: SaleModel) => {
    try {
      if (sale.id) {
        await saleRepository.updateSale(sale);
      } else {
        await saleRepository.addSale(sale);
      }
    } catch (err: any) {
      console.error('Error saving sale:', err);
      alert('Failed to save sale. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!saleToDelete?.id) return;
    try {
      await saleRepository.deleteSale(saleToDelete.id);
      setShowingDeleteDialog(false);
      setSaleToDelete(null);
    } catch (err) {
      console.error('Error deleting sale:', err);
      alert('Failed to delete sale. Please try again.');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Sales & Income
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Record client invoices and freelance revenue
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                <ThemeToggle iconSize={20} />
              </div>
              <AnimatedFAB
                onPressed={() => {
                  setSaleToEdit(null);
                  setShowingAddDialog(true);
                }}
                className="!h-10 !w-10 !bg-sky-600 hover:!bg-sky-500 text-white"
                tooltip="Add Sales"
              >
                <AddIcon size={20} />
              </AnimatedFAB>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500 text-center flex-col px-4">
                <AnimatedCard className="bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-900/50 rounded-2xl">
                  <h3 className="text-base font-bold mb-1">Failed to load sales</h3>
                  <p className="text-xs opacity-80">{error}</p>
                </AnimatedCard>
              </div>
            ) : sales.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center mt-12">
                <div className="bg-zinc-100 dark:bg-zinc-800/60 p-5 rounded-2xl mb-4 border border-zinc-200/60 dark:border-zinc-700/60">
                  <GraphUpIcon size={36} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  No Sales Recorded
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                  Add your first income entry to start tracking revenues.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatedCard className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <div className="p-5 flex flex-col items-start w-full">
                      <span className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Total Income
                      </span>
                      <span className="text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400 truncate w-full">
                        {formatCurrency(totalSales)}
                      </span>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <div className="p-5 flex flex-col items-start w-full">
                      <span className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Average Sale
                      </span>
                      <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 truncate w-full">
                        {formatCurrency(averageSale)}
                      </span>
                    </div>
                  </AnimatedCard>
                </div>

                {/* Sales List */}
                <div className="flex flex-col gap-3 mt-2">
                  {sales.map((sale, index) => {
                    const statusColorContainer = getServiceTypeColorClass(sale.category, false);
                    const statusColorText = getServiceTypeColorClass(sale.category, true);

                    return (
                      <AnimatedListItem key={sale.id || index} index={index}>
                        <AnimatedCard className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                          <div className="p-5 flex flex-col items-start w-full">
                            <div className="flex justify-between items-start w-full">
                              <div className="flex flex-col">
                                <span className="text-lg font-bold tabular-nums text-sky-600 dark:text-sky-400">
                                  {formatCurrency(sale.amount)}
                                </span>
                                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500 mt-1">
                                  {formatDate(sale.dateReceived)}
                                </span>
                              </div>
                              <div className={`px-2.5 py-0.5 border rounded-full ${statusColorContainer}`}>
                                <span className={`text-[11px] font-semibold ${statusColorText}`}>
                                  {sale.category}
                                </span>
                              </div>
                            </div>

                            {sale.title && (
                              <div className="mt-2.5 text-sm font-normal text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                {sale.title}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 w-full mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                              <button
                                onClick={() => {
                                  setSaleToEdit(sale);
                                  setShowingAddDialog(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
                              >
                                <Pen2Icon size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSaleToDelete(sale);
                                  setShowingDeleteDialog(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-semibold"
                              >
                                <TrashBinTrashIcon size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </AnimatedCard>
                      </AnimatedListItem>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <AddSalesDialog
          isOpen={showingAddDialog}
          onClose={() => setShowingAddDialog(false)}
          saleToEdit={saleToEdit}
          onSave={handleSaveSale}
        />

        {/* Delete Confirmation Dialog */}
        <AnimatedDialog
          isOpen={showingDeleteDialog}
          onClose={() => {
            setShowingDeleteDialog(false);
            setSaleToDelete(null);
          }}
        >
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Sale
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete this sale entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteDialog(false);
                  setSaleToDelete(null);
                }}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-red-600 hover:bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </AnimatedDialog>
      </div>
    </PageTransition>
  );
}
