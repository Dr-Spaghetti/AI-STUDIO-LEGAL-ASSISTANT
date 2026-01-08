import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, touched, helperText, className = '', ...props }, ref) => {
    const hasError = touched && !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          className={`
            w-full bg-[#16181D] border rounded-lg p-3 text-white text-sm
            outline-none transition-colors
            focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/30
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError ? 'border-red-500/50' : 'border-[#2D3139]'}
            ${className}
          `}
          {...props}
        />
        {hasError && error && (
          <p id={`${props.id}-error`} className="text-xs text-red-400 mt-1">{error}</p>
        )}
        {helperText && !hasError && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
