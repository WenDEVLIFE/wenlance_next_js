'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomText } from './CustomText';
import { SavingsModel } from '@/app/model/SavingsModel';

interface AddSavingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savingsToEdit?: SavingsModel | null;
  onAddSavings: (savings: SavingsModel) => void;
}

const savingsTypes = [
  'Emergency',
  'Vacation',
  'Investment',
  'Education',
  'House',
  'Car',
  'Retirement',
  'General',
];

const storageTypes = [
  'Bank',
  'Cash',
  'Digital Wallet',
  'Investment Account',
  'Other',
];

export const AddSavingsDialog: React.FC<AddSavingsDialogProps> = ({
  isOpen,
  onClose,
  savingsToEdit = null,
  onAddSavings,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSavingsType, setSelectedSavingsType] = useState('Emergency');
  const [selectedStorageType, setSelectedStorageType] = useState('Bank');
  const [isSavingsTypeOpen, setIsSavingsTypeOpen] = useState(false);
  const [isStorageTypeOpen, setIsStorageTypeOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate data when editing
  useEffect(() => {
    if (savingsToEdit) {
      setTitle(savingsToEdit.title || '');
      setAmount(savingsToEdit.amount.toString());
      setDescription(savingsToEdit.description || '');
      setSelectedSavingsType(savingsToEdit.category || 'Emergency');
      setSelectedStorageType(savingsToEdit.storageType || 'Bank');
    } else {
      setTitle('');
      setAmount('');
      setDescription('');
      setSelectedSavingsType('Emergency');
      setSelectedStorageType('Bank');
    }
  }, [savingsToEdit, isOpen]);

  const handleSave = () => {
    setErrorMsg('');
    
    if (!title.trim()) {
      setErrorMsg('Please enter a savings title');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    const savings: SavingsModel = {
      id: savingsToEdit?.id,
      title: title.trim(),
      category: selectedSavingsType,
      amount: parsedAmount,
      storageType: selectedStorageType,
      description: description.trim(),
      createdAt: savingsToEdit?.createdAt || new Date(),
    };

    onAddSavings(savings);
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6 flex flex-col gap-5">
        <CustomText
          label={savingsToEdit ? 'Edit Savings' : 'Add New Savings'}
          fontWeight={700}
          fontSize={20}
          className="transition-colors"
        />

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
          {/* Title */}
          <CustomTextField
            label="Savings Title"
            hint="e.g., Emergency Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Amount */}
          <CustomTextField
            label="Amount"
            hint="e.g., 10000.00"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
          />

          {/* Savings Type Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Savings Type"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSavingsTypeOpen(!isSavingsTypeOpen);
                  setIsStorageTypeOpen(false);
                }}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                  bg-white border border-zinc-300
                  hover:border-blue-400 hover:bg-blue-50
                  text-black
                "
              >
                <span className="truncate">{selectedSavingsType}</span>
                <ChevronDown
                  size={16}
                  className={`text-black transition-transform duration-200 flex-shrink-0 ${
                    isSavingsTypeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isSavingsTypeOpen && (
                <div className="
                  absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                  bg-white border border-zinc-200 dark:border-zinc-700 text-black
                  max-h-60 overflow-y-auto
                ">
                  {savingsTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedSavingsType(type);
                        setIsSavingsTypeOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors
                        ${type === selectedSavingsType
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

          {/* Storage Type Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Storage Type"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStorageTypeOpen(!isStorageTypeOpen);
                  setIsSavingsTypeOpen(false);
                }}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                  bg-white border border-zinc-300
                  hover:border-blue-400 hover:bg-blue-50
                  text-black
                "
              >
                <span className="truncate">{selectedStorageType}</span>
                <ChevronDown
                  size={16}
                  className={`text-black transition-transform duration-200 flex-shrink-0 ${
                    isStorageTypeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isStorageTypeOpen && (
                <div className="
                  absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                  bg-white border border-zinc-200 dark:border-zinc-700 text-black
                  max-h-60 overflow-y-auto
                ">
                  {storageTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedStorageType(type);
                        setIsStorageTypeOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors
                        ${type === selectedStorageType
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
            hint="Add any notes about this savings"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLines={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
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
            className="
              flex-1 rounded-xl px-6 py-4 font-semibold text-base transition-colors cursor-pointer
              text-white hover:bg-white/10 border border-white/20
            "
          >
            {savingsToEdit ? 'Update Savings' : 'Add Savings'}
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddSavingsDialog;
