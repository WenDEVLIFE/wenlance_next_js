'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Wallet, AlertTriangle } from 'lucide-react';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedFAB } from '@/components/AnimatedFAB';
import { AnimatedDialog } from '@/components/AnimatedDialog';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { CustomButton } from '@/components/CustomButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { AppColors } from '@/lib/utils/colors';
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
    <AnimatedCard className="bg-white dark:bg-[#023E8A] border border-zinc-100 dark:border-transparent">
      <div className="p-4 flex flex-col items-start w-full">
        {/* Title + Amount */}
        <div className="flex justify-between items-center w-full">
          <span className="text-base font-semibold transition-colors">
            {expense.title}
          </span>
          <span className="text-base font-bold text-[#023E8A] dark:text-[#48CAE4]">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        <div className="h-2" />

        {/* Category Badge + Date */}
        <div className="flex justify-between items-center w-full">
          <span className="px-3 py-1 rounded-md text-xs font-medium bg-[#ADE8F4] dark:bg-[#0096C7] transition-colors">
            {expense.category}
          </span>
          <span className="text-xs text-zinc-400 transition-colors">
            {formatDate(expense.date)}
          </span>
        </div>

        {/* Description */}
        {expense.description && (
          <>
            <div className="h-2" />
            <p className="text-sm text-zinc-500 dark:text-white/70">
              {expense.description}
            </p>
          </>
        )}

        <div className="h-3" />

        {/* Actions */}
        <div className="flex justify-end gap-2 w-full">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-[#023E8A] dark:text-[#48CAE4] hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            title="Edit"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-red-500 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 size={20} />
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
      <Wallet size={80} className="text-zinc-400 dark:text-zinc-600" />
      <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Expenses</h2>
      <p className="text-base text-zinc-500 dark:text-zinc-400">Track your expenses here</p>
      <div className="pt-4 w-full max-w-xs">
        <CustomButton label="Add Expense" onClick={onAdd} />
      </div>
    </div>
  );
}

// ─── ErrorView ──────────────────────────────────────────────
function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <AlertTriangle size={64} className="text-red-500" />
      <h2 className="text-xl font-bold text-red-500">Error</h2>
      <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-md">{message}</p>
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
      <div className="min-h-screen bg-soft-gradient dark:bg-zinc-950 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold ttransition-colors duration-500">
              Your Expenses
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1 rounded-full shadow-lg border border-white/20">
                <ThemeToggle iconSize={22} />
              </div>
              <AnimatedFAB
                onPressed={openAdd}
                backgroundColor={AppColors.primary}
                className="!h-11 !w-11"
              >
                <Plus size={20} />
              </AnimatedFAB>
            </div>
          </header>

          {/* Content */}
          {isLoading && expenses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-32">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold transition-colors">
              Delete Expense
            </h2>
            <p className="text-base transition-colors">
              Are you sure you want to delete &ldquo;{expenseToDelete?.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setExpenseToDelete(null);
                }}
                className="
                  flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
                  bg-[#0096C7] hover:bg-[#0077B6] text-white
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
