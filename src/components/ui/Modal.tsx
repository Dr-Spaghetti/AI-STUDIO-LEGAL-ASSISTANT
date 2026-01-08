import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  children: React.ReactNode;
  closeText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  children,
  closeText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 max-w-[90vw]">
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2D3139]">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-[#2D3139] bg-[#16181D]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#2D3139] hover:bg-[#3D4149] text-white rounded-lg transition-colors font-medium text-sm"
            >
              {closeText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                  confirmVariant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#00FFA3] hover:bg-[#00D88A] text-black'
                }`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
