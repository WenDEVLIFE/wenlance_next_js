'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomText } from './CustomText';
import { SavingsUtilizationModel } from '@/app/model/SavingsUtilizationModel';

interface AddUtilizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savingsId: string;
  savingsTitle: string;
  currentBalance: number;
  onAddUtilization: (utilization: SavingsUtilizationModel) => void;
}

const utilizationTypes = [
  'Withdrawal',
  'Transfer',
  'Expense',
  'Payment',
  'Other',
];

export const AddUtilizationDialog: React.FC<AddUtilizationDialogProps> = ({
  isOpen,
  onClose,
  savingsId,
  savingsTitle,
  currentBalance,
  onAddUtilization,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUtilizationType, setSelectedUtilizationType] = useState('Withdrawal');
  const [isUtilizationTypeOpen, setIsUtilizationTypeOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val).replace('PHP', '₱').trim();
  };

  const handleSave = () => {
    setErrorMsg('');
    const parsedAmount = parseFloat(amount);
    
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    if (parsedAmount > currentBalance) {
      setErrorMsg(`Insufficient balance. Available: ${formatCurrency(currentBalance)}`);
      return;
    }

    // Mapping description to 'title' as per the React type conventions we've been using
    const utilization: SavingsUtilizationModel = {
      savingsId,
      amount: parsedAmount,
      utilizationType: selectedUtilizationType,
      title: description.trim(),
      description: description.trim(),
      date: new Date(),
    };

    onAddUtilization(utilization);
    
    // Clear state
    setAmount('');
    setDescription('');
    setSelectedUtilizationType('Withdrawal');
    onClose();
  };

  const handleClose = () => {
    setErrorMsg('');
    setAmount('');
    setDescription('');
    setIsUtilizationTypeOpen(false);
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <CustomText
            label="Record Utilization"
            fontWeight={700}
            fontSize={20}
            className="transition-colors"
          />
          <CustomText
            label={savingsTitle}
            fontWeight={500}
            fontSize={14}
            className="text-white/70 transition-colors mt-1"
          />
          <CustomText
            label={`Available Balance: ${formatCurrency(currentBalance)}`}
            fontWeight={600}
            fontSize={14}
            className="text-blue-400 mt-1"
          />
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
          {/* Amount */}
          <CustomTextField
            label="Amount"
            hint="e.g., 500.00"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow numbers and decimal point
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
          />

          {/* Utilization Type Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Utilization Type"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUtilizationTypeOpen(!isUtilizationTypeOpen)}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                  bg-white border border-zinc-300
                  hover:border-blue-400 hover:bg-blue-50
                  text-black
                "
              >
                <span className="truncate">{selectedUtilizationType}</span>
                <ChevronDown
                  size={16}
                  className={`text-black transition-transform duration-200 flex-shrink-0 ${
                    isUtilizationTypeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUtilizationTypeOpen && (
                <div className="
                  absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                  bg-white border border-zinc-200 dark:border-zinc-700 text-black
                  max-h-60 overflow-y-auto
                ">
                  {utilizationTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedUtilizationType(type);
                        setIsUtilizationTypeOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors
                        ${type === selectedUtilizationType
                          ? 'bg-blue-50 text-black font-semibold hover:bg-blue-50'
                          : 'text-zinc-700 text-black hover:bg-blue-50'
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <CustomTextField
            label="Description (Optional)"
            hint="Add any notes about this utilization"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLines={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
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
            className="
              flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
              text-white hover:bg-white/10 border border-white/20
            "
          >
            Record Utilization
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddUtilizationDialog;
