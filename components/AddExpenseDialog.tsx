'use client';

import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, ChevronDown } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomButton } from './CustomButton';
import { CustomText } from './CustomText';
import { ExpenseModel } from '@/app/model/ExpenseModel';

interface AddExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: ExpenseModel | null;
  onSave: (expense: ExpenseModel) => void;
}

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
  'Other',
];

/**
 * AddExpenseDialog component converted from SwiftUI.
 * Provides a dialog for adding or editing an expense with animated entry/exit.
 */
export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  isOpen,
  onClose,
  expenseToEdit = null,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Populate fields when editing
  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toFixed(2));
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDescription('');
    }
  }, [expenseToEdit, isOpen]);

  const isValid = title.trim() !== '' && amount.trim() !== '';

  const handleSave = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) return;

    const expense: ExpenseModel = {
      id: expenseToEdit?.id,
      title: title.trim(),
      category,
      amount: amountValue,
      date: expenseToEdit?.date ?? new Date(),
      description: description.trim(),
    };

    onSave(expense);
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6 flex flex-col gap-5">
        {/* Header */}
        <CustomText
          label={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
          fontWeight={700}
          fontSize={20}
          className="text-blue-900 dark:text-white"
        />

        {/* Scrollable Form */}
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
          {/* Title Field */}
          <CustomTextField
            label="Expense Title"
            hint="e.g., Lunch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            prefixIcon={<Tag size={18} />}
          />

          {/* Amount Field */}
          <CustomTextField
            label="Amount"
            hint="e.g., 50.00"
            value={amount}
            onChange={(e) => {
              // Allow only valid decimal input
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
            prefixIcon={<DollarSign size={18} />}
          />

          {/* Category Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Category"
              fontWeight={600}
              fontSize={14}
              className="text-blue-900 dark:text-zinc-100"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                  bg-zinc-50 dark:bg-zinc-900 border-1.5 border-zinc-200 dark:border-zinc-800
                  hover:border-blue-400 dark:hover:border-blue-600
                  text-blue-900 dark:text-white
                "
              >
                <span>{category}</span>
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isCategoryOpen && (
                <div
                  className="
                    absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                    bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                  "
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer
                        ${
                          cat === category
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                        }
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <CustomTextField
            label="Description (Optional)"
            hint="Add any notes about this expense"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLines={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="
              flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
              bg-zinc-100 dark:bg-white/10
              text-blue-900 dark:text-white
              hover:bg-zinc-200 dark:hover:bg-white/20
            "
          >
            Cancel
          </button>

          <div className="flex-1">
            <CustomButton
              label={expenseToEdit ? 'Update Expense' : 'Add Expense'}
              onClick={handleSave}
              disabled={!isValid}
            />
          </div>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddExpenseDialog;
