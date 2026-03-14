'use client';

import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Minus, ArrowUp, ArrowDown, Trash2, Edit, AlertCircle } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddSavingsDialog } from '@/components/AddSavingsDialog';
import { AddDepositDialog } from '@/components/AddDepositDialog';
import { AddUtilizationDialog } from '@/components/AddUtilizationDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { SavingsModel } from '@/app/model/SavingsModel';
import { SavingsUtilizationModel } from '@/app/model/SavingsUtilizationModel';
import { savingsRepository } from '@/lib/repositories/SavingsRepository';
import AppColors from '@/lib/utils/colors';

// ─── Formatting Helpers ─────────────────────────────────────
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

// ─── Color Helpers ──────────────────────────────────────────
function getSavingsTypeColorClass(type: string, isText: boolean = false) {
  switch (type.toLowerCase()) {
    case 'emergency':
      return isText ? 'text-red-500' : 'bg-red-500/10 border-red-500';
    case 'vacation':
      return isText ? 'text-emerald-500' : 'bg-emerald-500/10 border-emerald-500';
    case 'investment':
      return isText ? 'text-blue-500' : 'bg-blue-500/10 border-blue-500';
    case 'education':
      return isText ? 'text-violet-500' : 'bg-violet-500/10 border-violet-500';
    case 'house':
      return isText ? 'text-amber-500' : 'bg-amber-500/10 border-amber-500';
    case 'car':
      return isText ? 'text-indigo-500' : 'bg-indigo-500/10 border-indigo-500';
    case 'retirement':
      return isText ? 'text-pink-500' : 'bg-pink-500/10 border-pink-500';
    default:
      return isText ? 'text-zinc-500' : 'bg-zinc-500/10 border-zinc-500';
  }
}

function getStorageTypeColorClass(type: string, isText: boolean = false) {
  switch (type.toLowerCase()) {
    case 'bank':
      return isText ? 'text-blue-500' : 'bg-blue-500/10 border-blue-500';
    case 'cash':
      return isText ? 'text-emerald-500' : 'bg-emerald-500/10 border-emerald-500';
    case 'digital wallet':
      return isText ? 'text-violet-500' : 'bg-violet-500/10 border-violet-500';
    case 'investment account':
      return isText ? 'text-amber-500' : 'bg-amber-500/10 border-amber-500';
    default:
      return isText ? 'text-zinc-500' : 'bg-zinc-500/10 border-zinc-500';
  }
}

// ─── Main View Component ─────────────────────────────────────
export default function SavingsView() {
  const [savings, setSavings] = useState<SavingsModel[]>([]);
  const [utilizations, setUtilizations] = useState<SavingsUtilizationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [showingAddSavingsDialog, setShowingAddSavingsDialog] = useState(false);
  const [savingsToEdit, setSavingsToEdit] = useState<SavingsModel | null>(null);

  const [showingAddDepositDialog, setShowingAddDepositDialog] = useState(false);
  const [activeSavingsForDeposit, setActiveSavingsForDeposit] = useState<SavingsModel | null>(null);

  const [showingAddUtilizationDialog, setShowingAddUtilizationDialog] = useState(false);
  const [activeSavingsForUtilization, setActiveSavingsForUtilization] = useState<{ saving: SavingsModel, currentBalance: number } | null>(null);

  // Delete State
  const [showingDeleteSavingsDialog, setShowingDeleteSavingsDialog] = useState(false);
  const [savingsToDelete, setSavingsToDelete] = useState<SavingsModel | null>(null);

  const [showingDeleteUtilizationDialog, setShowingDeleteUtilizationDialog] = useState(false);
  const [utilizationToDelete, setUtilizationToDelete] = useState<SavingsUtilizationModel | null>(null);

  // ─── Firebase Subscriptions ──────────────────────────────
  useEffect(() => {
    let unsubscribeSavings: (() => void) | undefined;
    let unsubscribeUtilizations: (() => void) | undefined;

    try {
      unsubscribeSavings = savingsRepository.listenToSavings((data) => {
        setSavings(data);
        setIsLoading(false);
      });
      unsubscribeUtilizations = savingsRepository.listenToUtilizations((data) => {
        setUtilizations(data);
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeSavings) unsubscribeSavings();
      if (unsubscribeUtilizations) unsubscribeUtilizations();
    };
  }, []);

  // ─── Handlers ────────────────────────────────────────────
  const handleSaveSavings = async (saving: SavingsModel) => {
    try {
      if (saving.id) {
        await savingsRepository.updateSavings(saving);
      } else {
        await savingsRepository.addSavings(saving);
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save savings goal.');
    }
  };

  const handleAddDeposit = async (deposit: SavingsUtilizationModel) => {
    try {
      await savingsRepository.addUtilization(deposit);
    } catch (err) {
      console.error('Error recording deposit:', err);
      alert('Failed to record deposit.');
    }
  };

  const handleAddUtilization = async (utilization: SavingsUtilizationModel) => {
    try {
      await savingsRepository.addUtilization(utilization);
    } catch (err) {
      console.error('Error recording usage:', err);
      alert('Failed to record usage.');
    }
  };

  const handleDeleteSavings = async () => {
    if (!savingsToDelete?.id) return;
    try {
      await savingsRepository.deleteSavings(savingsToDelete.id);
      // Clean up its utilizations
      const associatedUtils = utilizations.filter(u => u.savingsId === savingsToDelete.id);
      for (const u of associatedUtils) {
        if (u.id) {
          await savingsRepository.deleteUtilization(u.id);
        }
      }
    } catch (err) {
      console.error('Error deleting savings:', err);
    } finally {
      setShowingDeleteSavingsDialog(false);
      setSavingsToDelete(null);
    }
  };

  const handleDeleteUtilization = async () => {
    if (!utilizationToDelete?.id) return;
    try {
      await savingsRepository.deleteUtilization(utilizationToDelete.id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    } finally {
      setShowingDeleteUtilizationDialog(false);
      setUtilizationToDelete(null);
    }
  };

  // ─── Computations ────────────────────────────────────────
  const calculateBalance = (saving: SavingsModel) => {
    const associatedUtils = utilizations.filter(u => u.savingsId === saving.id);
    const deposits = associatedUtils
      .filter(u => u.utilizationType === 'Deposit')
      .reduce((sum, u) => sum + u.amount, 0);
    const deductions = associatedUtils
      .filter(u => u.utilizationType !== 'Deposit')
      .reduce((sum, u) => sum + u.amount, 0);

    return saving.amount + deposits - deductions;
  };

  const calculateTotalDeposits = (savingId: string) => {
    return utilizations
      .filter(u => u.savingsId === savingId && u.utilizationType === 'Deposit')
      .reduce((sum, u) => sum + u.amount, 0);
  };

  const calculateTotalUtilized = (savingId: string) => {
    return utilizations
      .filter(u => u.savingsId === savingId && u.utilizationType !== 'Deposit')
      .reduce((sum, u) => sum + u.amount, 0);
  };

  const totalGlobalSavings = savings.reduce((acc, currentSaving) => acc + calculateBalance(currentSaving), 0);

  // ─── Rendering ───────────────────────────────────────────
  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-50 dark:bg-[#03045E] transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative px-6 py-6 pb-24">

          {error ? (
            <div className="flex flex-col justify-center items-center h-[70vh]">
              <AlertCircle size={80} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-sm">{error}</p>
            </div>
          ) : isLoading && savings.length === 0 ? (
            <div className="flex justify-center items-center h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : savings.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-[70vh] text-center">
              <PiggyBank size={80} className="text-zinc-300 dark:text-zinc-600 mb-4" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white transition-colors mb-2">
                No Savings Yet
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
                Start saving and track your savings here
              </p>
              <button
                onClick={() => {
                  setSavingsToEdit(null);
                  setShowingAddSavingsDialog(true);
                }}
                className="flex items-center gap-2 bg-[#0096C7] hover:bg-[#0077B6] text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg"
              >
                <Plus size={20} />
                Add Savings
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-8 relative">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white transition-colors">
                    Savings Management
                  </h1>
                  <span className="text-base font-semibold text-blue-600 dark:text-[#48CAE4] transition-colors mt-1">
                    Total Savings: {formatCurrency(totalGlobalSavings)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-full shadow-lg border border-white/20 z-50">
                    <ThemeToggle iconSize={22} />
                  </div>
                  {/* Global Floating FAB */}
                  {savings.length > 0 && (
                    <div className="relative z-50">
                      <AnimatedFAB
                        backgroundColor={AppColors.primary}
                        onPressed={() => {
                          setSavingsToEdit(null);
                          setShowingAddSavingsDialog(true);
                        }}
                        tooltip="Add Savings"
                      >
                        <Plus size={24} color="white" />
                      </AnimatedFAB>
                    </div>
                  )}

                </div>
              </div>
              {/* Items List */}
              <div className="flex flex-col gap-4">

                {savings.map((saving, index) => {
                  const currentBalance = calculateBalance(saving);
                  const totalDeposits = calculateTotalDeposits(saving.id!);
                  const totalUtilized = calculateTotalUtilized(saving.id!);
                  const recentUtilizations = utilizations.filter(u => u.savingsId === saving.id).slice(0, 5);

                  const typeColorText = getSavingsTypeColorClass(saving.category, true);
                  const typeColorContainer = getSavingsTypeColorClass(saving.category, false);
                  const storageColorText = getStorageTypeColorClass(saving.storageType || 'bank', true);
                  const storageColorContainer = getStorageTypeColorClass(saving.storageType || 'bank', false);

                  return (
                    <AnimatedListItem key={saving.id} index={index}>
                      <AnimatedCard className="bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent">
                        <div className="p-5 flex flex-col w-full">
                          {/* Heading */}
                          <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
                              {saving.title}
                            </h3>
                            <div className="flex gap-2">
                              <div className={`px-2.5 py-1 rounded-full border ${typeColorContainer}`}>
                                <span className={`text-[11px] font-semibold ${typeColorText}`}>
                                  {saving.category}
                                </span>
                              </div>
                              <div className={`px-2.5 py-1 rounded-full border ${storageColorContainer}`}>
                                <span className={`text-[11px] font-semibold ${storageColorText}`}>
                                  {saving.storageType}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Balances Grid */}
                          <div className="grid grid-cols-2 gap-4 mt-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-300">Initial Amount</span>
                              <span className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                                {formatCurrency(saving.amount)}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-300">Current Balance</span>
                              <span className="text-lg font-bold text-blue-600 dark:text-[#48CAE4]">
                                {formatCurrency(currentBalance)}
                              </span>
                            </div>
                          </div>

                          {/* Sums Grid */}
                          {(totalDeposits > 0 || totalUtilized > 0) && (
                            <div className="flex gap-2 mt-4">
                              {totalDeposits > 0 && (
                                <div className="flex-1 bg-emerald-500/10 p-3 rounded-xl flex flex-col">
                                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Total Deposits</span>
                                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {formatCurrency(totalDeposits)}
                                  </span>
                                </div>
                              )}
                              {totalUtilized > 0 && (
                                <div className="flex-1 bg-red-500/10 p-3 rounded-xl flex flex-col">
                                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Total Utilized</span>
                                  <span className="text-sm font-bold text-red-600 dark:text-red-400 mt-1">
                                    {formatCurrency(totalUtilized)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {saving.description && (
                            <div className="mt-4 text-[13px] text-zinc-600 dark:text-zinc-300">
                              {saving.description}
                            </div>
                          )}

                          {/* Recent Transactions List */}
                          {recentUtilizations.length > 0 && (
                            <div className="mt-5 border-t border-zinc-100 dark:border-white/10 pt-4">
                              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Recent Transactions</h4>
                              <div className="flex flex-col gap-3">
                                {recentUtilizations.map(u => {
                                  const isDeposit = u.utilizationType === 'Deposit';
                                  return (
                                    <div key={u.id} className="flex justify-between items-center group">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[13px] font-semibold text-zinc-900 dark:text-white">{u.utilizationType}</span>
                                          {isDeposit ? (
                                            <ArrowDown size={12} className="text-emerald-500" />
                                          ) : (
                                            <ArrowUp size={12} className="text-red-500" />
                                          )}
                                        </div>
                                        {u.description && (
                                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-[150px] truncate">{u.description}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                          <span className={`text-[13px] font-bold ${isDeposit ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                            {isDeposit ? '+' : '-'}{formatCurrency(u.amount)}
                                          </span>
                                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{formatDate(u.date)}</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setUtilizationToDelete(u);
                                            setShowingDeleteUtilizationDialog(true);
                                          }}
                                          className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 opacity-60 hover:opacity-100 transition-all"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="flex justify-end flex-wrap gap-2 mt-5 border-t border-zinc-100 dark:border-white/10 pt-4">
                            <button
                              onClick={() => {
                                setActiveSavingsForDeposit(saving);
                                setShowingAddDepositDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10 transition-colors text-[12px] font-semibold"
                            >
                              <Plus size={14} />
                              <span>Add Deposit</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveSavingsForUtilization({ saving, currentBalance });
                                setShowingAddUtilizationDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 dark:text-[#48CAE4] hover:bg-blue-50 dark:hover:bg-white/10 transition-colors text-[12px] font-semibold"
                            >
                              <Minus size={14} />
                              <span>Record Usage</span>
                            </button>
                            <button
                              onClick={() => {
                                setSavingsToEdit(saving);
                                setShowingAddSavingsDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 dark:text-[#48CAE4] hover:bg-blue-50 dark:hover:bg-white/10 transition-colors text-[12px] font-semibold"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSavingsToDelete(saving);
                                setShowingDeleteSavingsDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-white/10 transition-colors text-[12px] font-semibold"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </AnimatedCard>
                    </AnimatedListItem>
                  );
                })}
              </div>
            </>
          )}
        </div>



        {/* Modals */}
        <AddSavingsDialog
          isOpen={showingAddSavingsDialog}
          onClose={() => setShowingAddSavingsDialog(false)}
          savingsToEdit={savingsToEdit}
          onAddSavings={handleSaveSavings}
        />

        {activeSavingsForDeposit && (
          <AddDepositDialog
            isOpen={showingAddDepositDialog}
            onClose={() => {
              setShowingAddDepositDialog(false);
              setActiveSavingsForDeposit(null);
            }}
            savingsId={activeSavingsForDeposit.id!}
            savingsTitle={activeSavingsForDeposit.title}
            onAddDeposit={handleAddDeposit}
          />
        )}

        {activeSavingsForUtilization && (
          <AddUtilizationDialog
            isOpen={showingAddUtilizationDialog}
            onClose={() => {
              setShowingAddUtilizationDialog(false);
              setActiveSavingsForUtilization(null);
            }}
            savingsId={activeSavingsForUtilization.saving.id!}
            savingsTitle={activeSavingsForUtilization.saving.title}
            currentBalance={activeSavingsForUtilization.currentBalance}
            onAddUtilization={handleAddUtilization}
          />
        )}

        {/* Delete Savings Dialog */}
        <AnimatedDialog
          isOpen={showingDeleteSavingsDialog}
          onClose={() => {
            setShowingDeleteSavingsDialog(false);
            setSavingsToDelete(null);
          }}
        >
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
              Delete Savings
            </h2>
            <p className="text-base text-zinc-600 dark:text-white/70 transition-colors">
              Are you sure you want to delete "{savingsToDelete?.title}"? This will also delete all associated transactions. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteSavingsDialog(false);
                  setSavingsToDelete(null);
                }}
                className="flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer bg-zinc-100 dark:bg-[#0096C7] text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#0077B6]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSavings}
                className="flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </AnimatedDialog>

        {/* Delete Utilization Dialog */}
        <AnimatedDialog
          isOpen={showingDeleteUtilizationDialog}
          onClose={() => {
            setShowingDeleteUtilizationDialog(false);
            setUtilizationToDelete(null);
          }}
        >
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
              Delete Transaction
            </h2>
            <p className="text-base text-zinc-600 dark:text-white/70 transition-colors">
              Are you sure you want to delete this {utilizationToDelete?.utilizationType?.toLowerCase()} of {formatCurrency(utilizationToDelete?.amount || 0)}?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteUtilizationDialog(false);
                  setUtilizationToDelete(null);
                }}
                className="flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer bg-zinc-100 dark:bg-[#0096C7] text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#0077B6]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUtilization}
                className="flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer bg-red-500 text-white hover:bg-red-600"
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
