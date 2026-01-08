import React from 'react';

interface CRMExportModalProps {
  isOpen: boolean;
  crmName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CRMExportModal: React.FC<CRMExportModalProps> = ({
  isOpen,
  crmName = 'CRM System',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 max-w-[90vw]">
        <div className="glass-panel rounded-3xl border border-[#2D3139] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00FFA3]/20 to-transparent p-6 border-b border-[#2D3139]">
            <h2 className="text-lg font-bold text-white">Export to {crmName}</h2>
            <p className="text-xs text-gray-400 mt-1">
              {isLoading
                ? 'Processing your export...'
                : 'Are you sure you want to export this client data?'}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-12 h-12 border-3 border-[#00FFA3]/30 border-t-[#00FFA3] rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Exporting data...</p>
              </div>
            ) : (
              <>
                <div className="bg-[#16181D] rounded-lg p-4 space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-[#00FFA3] font-bold">Exported Data:</span>
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-4">
                    <li>✓ Client name and contact information</li>
                    <li>✓ Call transcript and notes</li>
                    <li>✓ Case details and urgency level</li>
                    <li>✓ Appointment information</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-xs text-yellow-300">
                    <span className="font-bold">Note:</span> This action cannot be undone.
                    Make sure all information is accurate before exporting.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!isLoading && (
            <div className="flex gap-3 p-6 border-t border-[#2D3139] bg-[#16181D]">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-[#2D3139] hover:bg-[#3D4149] text-white rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-[#00FFA3] hover:bg-[#00D88A] text-black rounded-lg transition-colors font-medium text-sm"
              >
                Export Now
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CRMExportModal;
