'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Edit, Trash2, Plus } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddSalesDialog } from '@/components/AddSalesDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { SaleModel } from '@/app/model/SaleModel';
import { saleRepository } from '@/lib/repositories/SaleRepository';
import AppColors from '@/lib/utils/colors';

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
  }).format(amount);
}

function getServiceTypeColorClass(serviceType: string, isText: boolean = false) {
  switch (serviceType) {
    case 'Freelancing Software Service':
      return isText ? 'text-blue-500' : 'bg-blue-500/10 border-blue-500';
    case 'Computer Hardware Services':
      return isText ? 'text-violet-500' : 'bg-violet-500/10 border-violet-500';
    case 'Consulting Work':
      return isText ? 'text-amber-500' : 'bg-amber-500/10 border-amber-500';
    case 'Software Development':
      return isText ? 'text-emerald-500' : 'bg-emerald-500/10 border-emerald-500';
    case 'Web Development':
      return isText ? 'text-cyan-500' : 'bg-cyan-500/10 border-cyan-500';
    case 'Mobile App Development':
      return isText ? 'text-pink-500' : 'bg-pink-500/10 border-pink-500';
    case 'UI/UX Design':
      return isText ? 'text-indigo-500' : 'bg-indigo-500/10 border-indigo-500';
    case 'Cloud Services':
      return isText ? 'text-orange-500' : 'bg-orange-500/10 border-orange-500';
    case 'Technical Support':
      return isText ? 'text-teal-500' : 'bg-teal-500/10 border-teal-500';
    default:
      return isText ? 'text-zinc-500' : 'bg-zinc-500/10 border-zinc-500';
  }
}

// ─── Main View ──────────────────────────────────────────────
export default function SalaryView() {
  const [sales, setSales] = useState<SaleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showingAddDialog, setShowingAddDialog] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleModel | null>(null);

  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<SaleModel | null>(null);

  // Computed totals
  const totalSales = sales.reduce((acc, curr) => acc + curr.amount, 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  // Subscribe to sales
  useEffect(() => {
    try {
      const unsubscribe = saleRepository.listenToSales((data) => {
        setSales(data);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-zinc-50 dark:bg-[#03045E] transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative px-6 py-6 pb-24">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white transition-colors">
              Sales & Income
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-full shadow-lg border border-white/20">
                <ThemeToggle iconSize={22} />
              </div>
              <AnimatedFAB
                backgroundColor={AppColors.primary}
                onPressed={() => {
                  setSaleToEdit(null);
                  setShowingAddDialog(true);
                }}
                className="!h-11 !w-11"
                tooltip="Add Sales"
              >
                <Plus size={20} />
              </AnimatedFAB>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-zinc-500 dark:text-zinc-400">
                Loading sales...
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500 text-center flex-col px-4">
                <AnimatedCard className="bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-900/50">
                  <h3 className="text-lg font-bold mb-2">Failed to load sales</h3>
                  <p className="text-sm opacity-80">{error}</p>
                </AnimatedCard>
              </div>
            ) : sales.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center mt-20">
                <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-full mb-4">
                  <TrendingUp size={40} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 transition-colors">
                  Sales & Income
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                  Track your sales and income here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">

                {/* Summary Cards */}
                <div className="flex gap-4">
                  <AnimatedCard className="flex-1 bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent">
                    <div className="p-4 flex flex-col items-start w-full">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 transition-colors uppercase tracking-wider mb-2">
                        Total Income
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-[#48CAE4] transition-colors truncate w-full">
                        {formatCurrency(totalSales).replace('PHP', '₱').trim()}
                      </span>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard className="flex-1 bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent">
                    <div className="p-4 flex flex-col items-start w-full">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 transition-colors uppercase tracking-wider mb-2">
                        Avg Income
                      </span>
                      <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 transition-colors truncate w-full">
                        {formatCurrency(averageSale).replace('PHP', '₱').trim()}
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
                        <AnimatedCard className="bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent">
                          <div className="p-4 flex flex-col items-start w-full">
                            <div className="flex justify-between items-start w-full">
                              <div className="flex flex-col">
                                <span className="text-xl font-bold text-blue-600 dark:text-[#48CAE4] transition-colors">
                                  {formatCurrency(sale.amount).replace('PHP', '₱').trim()}
                                </span>
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-300 mt-1">
                                  {formatDate(sale.dateReceived)}
                                </span>
                              </div>
                              <div className={`px-3 py-1 border rounded-full ${statusColorContainer}`}>
                                <span className={`text-[11px] font-semibold ${statusColorText}`}>
                                  {sale.category}
                                </span>
                              </div>
                            </div>

                            {sale.title && (
                              <div className="mt-3 text-sm font-normal text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                                {sale.title}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 w-full mt-4 border-t border-zinc-100 dark:border-white/10 pt-3">
                              <button
                                onClick={() => {
                                  setSaleToEdit(sale);
                                  setShowingAddDialog(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 dark:text-[#48CAE4] hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
                              >
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSaleToDelete(sale);
                                  setShowingDeleteDialog(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
                              >
                                <Trash2 size={16} />
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
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
              Delete Sales Entry
            </h2>
            <p className="text-base text-zinc-600 dark:text-white/70 transition-colors">
              Are you sure you want to delete this sales entry of ₱{formatCurrency(saleToDelete?.amount || 0).replace('PHP', '').trim()}? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteDialog(false);
                  setSaleToDelete(null);
                }}
                className="
                  flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
                  bg-zinc-100 dark:bg-[#0096C7] text-zinc-700 dark:text-white
                  hover:bg-zinc-200 dark:hover:bg-[#0077B6]
                "
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="
                  flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
                  bg-red-500 text-white hover:bg-red-600
                "
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
