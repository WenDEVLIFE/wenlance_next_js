'use client';

import React, { useState } from 'react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomText } from './CustomText';
import { SavingsUtilizationModel } from '@/app/model/SavingsUtilizationModel';

interface AddDepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savingsId: string;
  savingsTitle: string;
  onAddDeposit: (deposit: SavingsUtilizationModel) => void;
}

export const AddDepositDialog: React.FC<AddDepositDialogProps> = ({
  isOpen,
  onClose,
  savingsId,
  savingsTitle,
  onAddDeposit,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    setErrorMsg('');
    const parsedAmount = parseFloat(amount);
    
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    // Mapping description to 'title' since the React TS model requires 'title'.
    const deposit: SavingsUtilizationModel = {
      savingsId,
      amount: parsedAmount,
      title: description.trim(),
      date: new Date(),
    };

    onAddDeposit(deposit);
    
    // Clear inputs for next time
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleClose = () => {
    setErrorMsg('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <CustomText
            label="Add Deposit"
            fontWeight={700}
            fontSize={20}
            className="transition-colors"
          />
          <CustomText
            label={savingsTitle}
            fontWeight={500}
            fontSize={14}
            className="text-white/70 transition-colors"
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
            hint="e.g., 1000.00"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow numbers and decimal point
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
          />

          {/* Description (Maps to title) */}
          <CustomTextField
            label="Description (Optional)"
            hint="Add any notes about this deposit"
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
            Add Deposit
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddDepositDialog;
