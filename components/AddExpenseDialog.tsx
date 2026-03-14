'use client';

import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, ChevronDown, PhilippinePeso } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
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
      <div className="p-6 flex flex-col gap-5 ">
        {/* Header */}
        <CustomText
          label={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
          fontWeight={700}
          fontSize={20}
          className="transition-colors"
        />

        {/* Scrollable Form */}
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto ">
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
            prefixIcon={<PhilippinePeso size={18} />}
          />

          {/* Category Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Category"
              fontWeight={600}
              fontSize={14}
              className="text-white"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                    bg-white border border-zinc-300 
                  hover:border-blue-400 
                  text-zinc-900 
                "
              >
                <span>{category}</span>
                <ChevronDown
                  size={16}
                  className={` text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isCategoryOpen && (
                <div
                  className="
                     absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                     bg-white border border-zinc-200 
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
                       w-full text-left px-4 py-3 text-sm bg-white cursor-pointer
                        ${cat === category
                          ? 'bg-white text-black font-semibold'
                          : 'text-black hover:bg-zinc-50'
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
              bg-[#0096C7] hover:bg-[#0077B6] text-white
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="
              flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
              text-white hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {expenseToEdit ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddExpenseDialog;
