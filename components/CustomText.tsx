'use client';

import React from 'react';

interface CustomTextProps {
  label: string;
  fontWeight?: number | string;
  fontSize?: number | string;
  color?: string;
  className?: string;
}

/**
 * CustomText component converted from Flutter.
 * Provides a consistent text style using specific font properties.
 */
export const CustomText: React.FC<CustomTextProps> = ({
  label,
  fontWeight = 500,
  fontSize = 16,
  color,
  className = '',
}) => {
  return (
    <span
      className={className}
      style={{
        fontWeight,
        fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
        color: color || 'inherit',
        fontFamily: "'ElmsSans', system-ui, -apple-system, sans-serif",
      }}
    >
      {label}
    </span>
  );
};

export default CustomText;
