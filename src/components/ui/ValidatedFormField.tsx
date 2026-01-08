import React from 'react';
import { Input } from './Input';

interface ValidatedFormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

export const ValidatedFormField: React.FC<ValidatedFormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = 'text',
  placeholder,
  required,
  helperText,
  icon,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-semibold text-gray-200">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
        {touched && !error && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Valid
          </span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          error={touched ? error : undefined}
          className={icon ? 'pl-10' : ''}
        />
      </div>

      {touched && !error && helperText && (
        <p className="text-xs text-gray-400">{helperText}</p>
      )}

      {touched && error && (
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};
