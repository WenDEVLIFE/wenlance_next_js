'use client';

import React, { useState, useEffect } from 'react';
import { 
  AddIcon, 
  Pen2Icon, 
  TrashBinTrashIcon, 
  Wallet2Icon, 
  DangerTriangleIcon 
} from '@solar-icons/react/linear';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { CustomButton } from '@/components/CustomButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { ExpenseModel } from '@/app/model/ExpenseModel';
import { expenseRepository } from '@/lib/repositories/ExpenseRepository';

// ─── Helpers ────────────────────────────────────────────────
function formatDate(date: Date): string {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

// ─── ExpenseCard ────────────────────────────────────────────
interface ExpenseCardProps {
  expense: ExpenseModel;
  onEdit: () => void;
  onDelete: () => void;
}

function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <AnimatedCard className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="p-5 flex flex-col items-start w-full">
        {/* Title + Amount */}
        <div className="flex justify-between items-center w-full">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {expense.title}
          </span>
          <span className="text-base font-bold tabular-nums text-sky-600 dark:text-sky-400">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        <div className="h-2.5" />

        {/* Category Badge + Date */}
        <div className="flex justify-between items-center w-full">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
            {expense.category}
          </span>
          <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            {formatDate(expense.date)}
          </span>
        </div>

        {/* Description */}
        {expense.description && (
          <>
            <div className="h-2.5" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {expense.description}
            </p>
          </>
        )}

        <div className="h-3" />

        {/* Actions */}
        <div className="flex justify-end gap-1.5 w-full pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-zinc-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Edit"
          >
            <Pen2Icon size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Delete"
          >
            <TrashBinTrashIcon size={18} />
          </button>
        </div>
      </div>
    </AnimatedCard>
  );
}

// ─── EmptyExpensesView ──────────────────────────────────────
function EmptyExpensesView({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <Wallet2Icon size={64} className="text-zinc-300 dark:text-zinc-700" />
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No Expenses Recorded</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">Track your daily and monthly freelance operations by recording new expenses.</p>
      <div className="pt-2 w-full max-w-xs">
        <CustomButton label="Add Expense" onClick={onAdd} />
      </div>
    </div>
  );
}

// ─── ErrorView ──────────────────────────────────────────────
function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <DangerTriangleIcon size={56} className="text-red-500" />
      <h2 className="text-xl font-bold text-red-500">Error Loading Expenses</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">{message}</p>
    </div>
  );
}

// ─── ExpensesView (main) ────────────────────────────────────
export default function ExpensesView() {
  const [expenses, setExpenses] = useState<ExpenseModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseModel | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseModel | null>(null);

  // Real-time listener
  useEffect(() => {
    const unsubscribe = expenseRepository.listenToExpenses((data) => {
      setExpenses(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Handlers ──
  const handleSave = async (expense: ExpenseModel) => {
    try {
      if (expenseToEdit) {
        await expenseRepository.updateExpense({
          ...expense,
          id: expenseToEdit.id,
        });
      } else {
        await expenseRepository.addExpense(expense);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete?.id) return;
    try {
      await expenseRepository.deleteExpense(expenseToDelete.id);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setShowDeleteDialog(false);
      setExpenseToDelete(null);
    }
  };

  const openAdd = () => {
    setExpenseToEdit(null);
    setShowAddDialog(true);
  };

  const openEdit = (expense: ExpenseModel) => {
    setExpenseToEdit(expense);
    setShowAddDialog(true);
  };

  const openDelete = (expense: ExpenseModel) => {
    setExpenseToDelete(expense);
    setShowDeleteDialog(true);
  };

  // ── Render ──
  return (
    <PageTransition>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Expenses
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Log and monitor operational costs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                <ThemeToggle iconSize={20} />
              </div>
              <AnimatedFAB
                onPressed={openAdd}
                className="!h-10 !w-10 !bg-sky-600 hover:!bg-sky-500 text-white"
              >
                <AddIcon size={20} />
              </AnimatedFAB>
            </div>
          </header>

          {/* Content */}
          {isLoading && expenses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-32">
              <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errorMessage ? (
            <ErrorView message={errorMessage} />
          ) : expenses.length === 0 ? (
            <EmptyExpensesView onAdd={openAdd} />
          ) : (
            <div className="flex flex-col gap-3 pb-24">
              {expenses.map((expense, index) => (
                <AnimatedListItem key={expense.id ?? index} index={index}>
                  <ExpenseCard
                    expense={expense}
                    onEdit={() => openEdit(expense)}
                    onDelete={() => openDelete(expense)}
                  />
                </AnimatedListItem>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <AddExpenseDialog
          isOpen={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            setExpenseToEdit(null);
          }}
          expenseToEdit={expenseToEdit}
          onSave={handleSave}
        />

        {/* Delete Confirmation Dialog */}
        <AnimatedDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setExpenseToDelete(null);
          }}
        >
          <div className="p-6 flex flex-col gap-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Delete Expense
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete &ldquo;{expenseToDelete?.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setExpenseToDelete(null);
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
