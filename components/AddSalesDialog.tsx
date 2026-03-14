'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { AnimatedDialog } from './AnimatedDialog';
import { CustomTextField } from './CustomTextField';
import { CustomText } from './CustomText';
import { SaleModel } from '@/app/model/SaleModel';

interface AddSalesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saleToEdit?: SaleModel | null;
  onSave: (sale: SaleModel) => void;
}

const serviceTypes = [
  'Freelancing Software Service',
  'Computer Hardware Services',
  'Consulting Work',
  'Software Development',
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Cloud Services',
  'Technical Support',
  'Other',
];

export const AddSalesDialog: React.FC<AddSalesDialogProps> = ({
  isOpen,
  onClose,
  saleToEdit = null,
  onSave,
}) => {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('Freelancing Software Service');
  const [isServiceTypeOpen, setIsServiceTypeOpen] = useState(false);
  const [dateReceived, setDateReceived] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [errorMsg, setErrorMsg] = useState('');

  const dateRef = useRef<HTMLInputElement>(null);

  // Populate data when editing
  useEffect(() => {
    if (saleToEdit) {
      setAmount(saleToEdit.amount.toString());
      setTitle(saleToEdit.title || '');
      setSelectedServiceType(saleToEdit.category || 'Freelancing Software Service');
      setDateReceived(new Date(saleToEdit.dateReceived).toISOString().split('T')[0]);
    } else {
      setAmount('');
      setTitle('');
      setSelectedServiceType('Freelancing Software Service');
      const d = new Date();
      setDateReceived(d.toISOString().split('T')[0]);
    }
  }, [saleToEdit, isOpen]);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const handleSave = () => {
    setErrorMsg('');
    const parsedAmount = parseFloat(amount);
    
    if (!amount.trim() || isNaN(parsedAmount)) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    const sale: SaleModel = {
      id: saleToEdit?.id,
      title: title.trim(),
      category: selectedServiceType,
      amount: parsedAmount,
      dateReceived: new Date(dateReceived),
    };

    onSave(sale);
    onClose();
  };

  return (
    <AnimatedDialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6 flex flex-col gap-5">
        <CustomText
          label={saleToEdit ? 'Edit Sales Entry' : 'Add New Sales'}
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
          {/* Amount */}
          <CustomTextField
            label="Sales Amount"
            hint="e.g., 5000.00"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow numbers and decimal point
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
          />

          {/* Service Type Selection */}
          <div className="flex flex-col gap-2">
            <CustomText
              label="Service Type"
              fontWeight={600}
              fontSize={14}
              className="transition-colors"
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsServiceTypeOpen(!isServiceTypeOpen)}
                className="
                  w-full flex items-center justify-between px-4 py-4 rounded-xl
                  text-base transition-all duration-200 outline-none cursor-pointer
                  bg-white border border-zinc-300
                  hover:border-blue-400 hover:bg-blue-50
                  text-black
                "
              >
                <span className="truncate">{selectedServiceType}</span>
                <ChevronDown
                  size={16}
                  className={`text-black transition-transform duration-200 flex-shrink-0 ${
                    isServiceTypeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isServiceTypeOpen && (
                <div
                  className="
                    absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden
                    bg-white border border-zinc-200 dark:border-zinc-700 text-black
                    max-h-60 overflow-y-auto
                  "
                >
                  {serviceTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedServiceType(type);
                        setIsServiceTypeOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors
                        ${type === selectedServiceType
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

          {/* Date Received */}
          <div className="flex flex-col gap-2 relative">
            <CustomText
              label="Date Received"
              fontWeight={600}
              fontSize={14}
              className="text-white"
            />
            <div 
              className="relative group cursor-pointer"
              onClick={() => dateRef.current?.showPicker()}
            >
              <div className="
                w-full flex items-center justify-between px-4 py-4 rounded-xl
                bg-white border-1.5 border-zinc-200 dark:border-zinc-800 text-black
                group-hover:bg-blue-50 transition-colors
              ">
                <span className="text-base font-medium">{formatDateLabel(dateReceived)}</span>
                <Calendar size={20} className="text-zinc-600" />
              </div>
              <input
                ref={dateRef}
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="opacity-0 w-0 h-0 absolute overflow-hidden pointer-events-none"
              />
            </div>
          </div>

          {/* Description / Title */}
          <CustomTextField
            label="Description (Optional)"
            hint="e.g., Mobile app development project"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            {saleToEdit ? 'Update Sales' : 'Add Sales'}
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AddSalesDialog;
