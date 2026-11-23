'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeClosedIcon } from '@solar-icons/react/linear';
import { CustomText } from './CustomText';

interface CustomTextFieldProps {
  label?: string;
  hint?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmitted?: (value: string) => void;
  isPassword?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  maxLines?: number;
  className?: string;
}

/**
 * CustomTextField component.
 * Includes label support, focus states, and password visibility toggles.
 */
export const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  hint,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onSubmitted,
  isPassword = false,
  prefixIcon,
  suffixIcon,
  disabled = false,
  error,
  maxLines = 1,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isObscured, setIsObscured] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' && onSubmitted) {
      onSubmitted(value || '');
    }
  };

  const inputType = isPassword && isObscured ? 'password' : 'text';
  const isMultiline = (maxLines ?? 1) > 1;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <CustomText
          label={label}
          fontWeight={600}
          fontSize={13}
          className="text-zinc-900 dark:text-zinc-100"
        />
      )}

      <div className="relative group">
        {prefixIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
            {prefixIcon}
          </div>
        )}

        {isMultiline ? (
          <textarea
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={hint || placeholder}
            rows={maxLines}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none
              bg-zinc-50 dark:bg-zinc-800/60 border text-zinc-900 dark:text-zinc-100
              ${isFocused ? 'bg-white dark:bg-zinc-800 border-sky-500 ring-2 ring-sky-500/20' : 'border-zinc-200 dark:border-zinc-700/80'}
              ${error ? 'border-red-500 focus:border-red-500 ring-red-500/20' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800' : ''}
              ${prefixIcon ? 'pl-10' : ''}
              ${(isPassword || suffixIcon) ? 'pr-10' : ''}
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            `}
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={hint || placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none
              bg-zinc-50 dark:bg-zinc-800/60 border text-zinc-900 dark:text-zinc-100
              ${isFocused ? 'bg-white dark:bg-zinc-800 border-sky-500 ring-2 ring-sky-500/20' : 'border-zinc-200 dark:border-zinc-700/80'}
              ${error ? 'border-red-500 focus:border-red-500 ring-red-500/20' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800' : ''}
              ${prefixIcon ? 'pl-10' : ''}
              ${(isPassword || suffixIcon) ? 'pr-10' : ''}
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            `}
          />
        )}

        {(isPassword || suffixIcon) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setIsObscured(!isObscured)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {isObscured ? <EyeIcon size={18} /> : <EyeClosedIcon size={18} />}
              </button>
            ) : suffixIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500 mt-0.5 pl-1 font-medium">{error}</p>
      ) : hint && (
        <p className="text-xs text-zinc-500 mt-0.5 pl-1">{hint}</p>
      )}
    </div>
  );
};

export default CustomTextField;
