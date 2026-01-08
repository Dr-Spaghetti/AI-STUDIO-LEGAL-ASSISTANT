import React, { useRef, useState } from 'react';

interface FileUploadFieldProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  allowedExtensions?: string[];
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label = 'Upload File',
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFilesSelected,
  disabled = false,
  error,
  helperText,
  allowedExtensions = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds maximum size`);
        return;
      }

      // Check file extension if specified
      if (allowedExtensions.length > 0) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
          console.warn(`File ${file.name} has invalid extension`);
          return;
        }
      }

      validFiles.push(file);
    });

    return validFiles;
  };

  const handleFiles = (files: FileList) => {
    const validFiles = validateFiles(files);
    setSelectedFiles(validFiles);
    onFilesSelected(validFiles);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-200">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed transition-colors cursor-pointer
          ${
            dragActive
              ? 'border-[#00FFA3] bg-[#00FFA3]/5'
              : 'border-[#2D3139] hover:border-[#00FFA3] hover:bg-[#00FFA3]/5'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500 bg-red-500/5' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          aria-label={label}
        />

        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className="p-8 text-center"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8l-8-8m0 0l-4 4m4-4l4 4m12 20v-8m4 0v8m0 0v-8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="text-sm font-medium text-white mb-1">
            Drag and drop your files here
          </p>
          <p className="text-xs text-gray-400">
            or click to browse from your device
          </p>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase">
            Selected Files ({selectedFiles.length})
          </p>
          <div className="space-y-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-[#16181D] rounded border border-[#2D3139]"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <svg
                    className="w-4 h-4 text-[#00FFA3] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 16.5a.5.5 0 01-.5-.5v-5H5a.5.5 0 01-.354-.854l7-7a.5.5 0 11.708.708L5.707 10H8a.5.5 0 01.5.5v5a.5.5 0 01-.5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = selectedFiles.filter(
                      (_, i) => i !== idx
                    );
                    setSelectedFiles(newFiles);
                    onFilesSelected(newFiles);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {(error || helperText) && (
        <p className={`text-xs ${error ? 'text-red-400' : 'text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
