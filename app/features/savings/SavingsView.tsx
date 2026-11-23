'use client';

import React, { useState, useEffect } from 'react';
import { 
  PiggyBankIcon, 
  AddIcon, 
  MinusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrashBinTrashIcon, 
  Pen2Icon, 
  DangerCircleIcon 
} from '@solar-icons/react/linear';
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
      return isText ? 'text-rose-600 dark:text-rose-400' : 'bg-rose-500/10 border-rose-500/30';
    case 'vacation':
      return isText ? 'text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30';
    case 'investment':
      return isText ? 'text-sky-600 dark:text-sky-400' : 'bg-sky-500/10 border-sky-500/30';
    case 'education':
      return isText ? 'text-violet-600 dark:text-violet-400' : 'bg-violet-500/10 border-violet-500/30';
    case 'house':
      return isText ? 'text-amber-600 dark:text-amber-400' : 'bg-amber-500/10 border-amber-500/30';
    case 'car':
      return isText ? 'text-indigo-600 dark:text-indigo-400' : 'bg-indigo-500/10 border-indigo-500/30';
    case 'retirement':
      return isText ? 'text-pink-600 dark:text-pink-400' : 'bg-pink-500/10 border-pink-500/30';
    default:
      return isText ? 'text-zinc-600 dark:text-zinc-400' : 'bg-zinc-500/10 border-zinc-500/30';
  }
}

function getStorageTypeColorClass(type: string, isText: boolean = false) {
  switch (type.toLowerCase()) {
    case 'bank':
      return isText ? 'text-sky-600 dark:text-sky-400' : 'bg-sky-500/10 border-sky-500/30';
    case 'cash':
      return isText ? 'text-emerald-600 dark:text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30';
    case 'digital wallet':
      return isText ? 'text-violet-600 dark:text-violet-400' : 'bg-violet-500/10 border-violet-500/30';
    case 'investment account':
      return isText ? 'text-amber-600 dark:text-amber-400' : 'bg-amber-500/10 border-amber-500/30';
    default:
      return isText ? 'text-zinc-600 dark:text-zinc-400' : 'bg-zinc-500/10 border-zinc-500/30';
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
      <div className="min-h-screen bg-background transition-colors duration-300 relative">
        <div className="flex flex-col h-full z-10 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

          {error ? (
            <div className="flex flex-col justify-center items-center h-[70vh]">
              <DangerCircleIcon size={64} className="text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-sm text-sm">{error}</p>
            </div>
          ) : isLoading && savings.length === 0 ? (
            <div className="flex justify-center items-center h-[70vh]">
              <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : savings.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-[70vh] text-center">
              <div className="bg-zinc-100 dark:bg-zinc-800/60 p-5 rounded-2xl mb-4 border border-zinc-200/60 dark:border-zinc-700/60">
                <PiggyBankIcon size={48} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                No Savings Yet
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
                Create emergency funds, tax reserves, and investment buckets
              </p>
              <button
                onClick={() => {
                  setSavingsToEdit(null);
                  setShowingAddSavingsDialog(true);
                }}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs"
              >
                <AddIcon size={18} />
                <span>Add Savings Goal</span>
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-8 relative">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Savings Management
                  </h1>
                  <span className="text-sm font-semibold tabular-nums text-sky-600 dark:text-sky-400 mt-1">
                    Total Reserves: {formatCurrency(totalGlobalSavings)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                    <ThemeToggle iconSize={20} />
                  </div>
                  <AnimatedFAB
                    onPressed={() => {
                      setSavingsToEdit(null);
                      setShowingAddSavingsDialog(true);
                    }}
                    className="!h-10 !w-10 !bg-sky-600 hover:!bg-sky-500 text-white"
                    tooltip="Add Savings"
                  >
                    <AddIcon size={20} />
                  </AnimatedFAB>
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
                      <AnimatedCard className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                        <div className="p-5 flex flex-col w-full">
                          {/* Heading */}
                          <div className="flex flex-col gap-2.5">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                              {saving.title}
                            </h3>
                            <div className="flex gap-2">
                              <div className={`px-2.5 py-0.5 rounded-full border ${typeColorContainer}`}>
                                <span className={`text-[11px] font-semibold ${typeColorText}`}>
                                  {saving.category}
                                </span>
                              </div>
                              <div className={`px-2.5 py-0.5 rounded-full border ${storageColorContainer}`}>
                                <span className={`text-[11px] font-semibold ${storageColorText}`}>
                                  {saving.storageType}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Balances Grid */}
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Initial Target</span>
                              <span className="text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
                                {formatCurrency(saving.amount)}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Balance</span>
                              <span className="text-lg font-bold tabular-nums text-sky-600 dark:text-sky-400 mt-0.5">
                                {formatCurrency(currentBalance)}
                              </span>
                            </div>
                          </div>

                          {/* Sums Grid */}
                          {(totalDeposits > 0 || totalUtilized > 0) && (
                            <div className="flex gap-2 mt-3">
                              {totalDeposits > 0 && (
                                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex flex-col">
                                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Total Deposits</span>
                                  <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {formatCurrency(totalDeposits)}
                                  </span>
                                </div>
                              )}
                              {totalUtilized > 0 && (
                                <div className="flex-1 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex flex-col">
                                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Total Utilized</span>
                                  <span className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5">
                                    {formatCurrency(totalUtilized)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {saving.description && (
                            <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                              {saving.description}
                            </div>
                          )}

                          {/* Recent Transactions List */}
                          {recentUtilizations.length > 0 && (
                            <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                              <h4 className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">Recent Activity</h4>
                              <div className="flex flex-col gap-2">
                                {recentUtilizations.map(u => {
                                  const isDeposit = u.utilizationType === 'Deposit';
                                  return (
                                    <div key={u.id} className="flex justify-between items-center group py-1">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{u.utilizationType}</span>
                                          {isDeposit ? (
                                            <ArrowDownIcon size={12} className="text-emerald-500" />
                                          ) : (
                                            <ArrowUpIcon size={12} className="text-rose-500" />
                                          )}
                                        </div>
                                        {u.description && (
                                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">{u.description}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end tabular-nums">
                                          <span className={`text-xs font-bold ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {isDeposit ? '+' : '-'}{formatCurrency(u.amount)}
                                          </span>
                                          <span className="text-[10px] text-zinc-400">{formatDate(u.date)}</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setUtilizationToDelete(u);
                                            setShowingDeleteUtilizationDialog(true);
                                          }}
                                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-400 hover:text-rose-500 transition-colors"
                                          title="Delete"
                                        >
                                          <TrashBinTrashIcon size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="flex justify-end flex-wrap gap-2 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                            <button
                              onClick={() => {
                                setActiveSavingsForDeposit(saving);
                                setShowingAddDepositDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors text-xs font-semibold"
                            >
                              <AddIcon size={14} />
                              <span>Deposit</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveSavingsForUtilization({ saving, currentBalance });
                                setShowingAddUtilizationDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors text-xs font-semibold"
                            >
                              <MinusIcon size={14} />
                              <span>Withdraw</span>
                            </button>
                            <button
                              onClick={() => {
                                setSavingsToEdit(saving);
                                setShowingAddSavingsDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold"
                            >
                              <Pen2Icon size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSavingsToDelete(saving);
                                setShowingDeleteSavingsDialog(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold"
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
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Savings Goal
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete &ldquo;{savingsToDelete?.title}&rdquo;? This will also delete all associated transactions. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteSavingsDialog(false);
                  setSavingsToDelete(null);
                }}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSavings}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-red-600 hover:bg-red-500 text-white"
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
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Transaction
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete this {utilizationToDelete?.utilizationType?.toLowerCase()} of {formatCurrency(utilizationToDelete?.amount || 0)}?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowingDeleteUtilizationDialog(false);
                  setUtilizationToDelete(null);
                }}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUtilization}
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
