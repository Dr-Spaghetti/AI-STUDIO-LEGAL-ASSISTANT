import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block">
          {label}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        {/* Trigger Button */}
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-3 bg-[#16181D] border rounded-lg text-left text-sm transition-all ${
            error
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-[#2D3139] hover:border-[#3D4149] focus:border-[#00FFA3]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            isOpen ? 'border-[#00FFA3]' : ''
          }`}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E2128] border border-[#2D3139] rounded-lg shadow-xl z-50">
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options available
                </div>
              ) : (
                options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value);
                        setIsOpen(false);
                      }
                    }}
                    disabled={option.disabled}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      value === option.value
                        ? 'bg-[#00FFA3]/20 text-[#00FFA3] font-medium'
                        : 'text-white hover:bg-[#2D3139]'
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};
