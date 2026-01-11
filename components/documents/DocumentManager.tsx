// ============================================
// Document Manager - File Management System
// ============================================
// Upload, organize, and manage client documents

import React, { useState, useCallback } from 'react';
import {
  FolderOpen,
  File,
  FileText,
  FileImage,
  Upload,
  Download,
  Trash2,
  Search,
  Grid,
  List,
  MoreVertical,
  Plus,
  X,
  Check,
  Eye,
  Share2,
  Clock,
  User,
  Filter,
  ChevronRight,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  size: number;
  lead_id?: string;
  lead_name?: string;
  category: 'police_report' | 'medical_records' | 'photos' | 'insurance' | 'correspondence' | 'other';
  uploaded_by: string;
  uploaded_at: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  document_count: number;
}

interface Props {
  tenantId: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Police Report - Highway 101.pdf',
    type: 'pdf',
    size: 2450000,
    lead_id: '1',
    lead_name: 'John Doe',
    category: 'police_report',
    uploaded_by: 'John Doe',
    uploaded_at: '2024-06-15T10:30:00Z',
    url: '#',
  },
  {
    id: '2',
    name: 'Medical Records - Dr. Smith.pdf',
    type: 'pdf',
    size: 5120000,
    lead_id: '1',
    lead_name: 'John Doe',
    category: 'medical_records',
    uploaded_by: 'John Doe',
    uploaded_at: '2024-06-14T14:20:00Z',
    url: '#',
  },
  {
    id: '3',
    name: 'Accident Scene Photo 1.jpg',
    type: 'image',
    size: 3200000,
    lead_id: '1',
    lead_name: 'John Doe',
    category: 'photos',
    uploaded_by: 'John Doe',
    uploaded_at: '2024-06-13T09:15:00Z',
    url: '#',
  },
  {
    id: '4',
    name: 'Insurance Claim Form.pdf',
    type: 'pdf',
    size: 890000,
    lead_id: '2',
    lead_name: 'Jane Smith',
    category: 'insurance',
    uploaded_by: 'Sarah Admin',
    uploaded_at: '2024-06-12T11:00:00Z',
    url: '#',
  },
  {
    id: '5',
    name: 'Demand Letter Draft.docx',
    type: 'doc',
    size: 156000,
    lead_id: '1',
    lead_name: 'John Doe',
    category: 'correspondence',
    uploaded_by: 'Attorney Mike',
    uploaded_at: '2024-06-10T16:30:00Z',
    url: '#',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Documents' },
  { value: 'police_report', label: 'Police Reports' },
  { value: 'medical_records', label: 'Medical Records' },
  { value: 'photos', label: 'Photos' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'other', label: 'Other' },
];

// ============================================
// COMPONENT
// ============================================

export function DocumentManager({ tenantId }: Props) {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.lead_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files);
    // In production, upload to Supabase Storage
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleSelectDoc = (id: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocs(newSelected);
  };

  const handleDelete = (ids: string[]) => {
    if (confirm(`Delete ${ids.length} document(s)?`)) {
      setDocuments((prev) => prev.filter((d) => !ids.includes(d.id)));
      setSelectedDocs(new Set());
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-400" />;
      case 'image':
        return <FileImage className="w-8 h-8 text-blue-400" />;
      case 'doc':
        return <FileText className="w-8 h-8 text-blue-400" />;
      default:
        return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  const categoryColors: Record<string, string> = {
    police_report: 'bg-red-500/20 text-red-400',
    medical_records: 'bg-green-500/20 text-green-400',
    photos: 'bg-blue-500/20 text-blue-400',
    insurance: 'bg-yellow-500/20 text-yellow-400',
    correspondence: 'bg-purple-500/20 text-purple-400',
    other: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div
      className="space-y-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-gray-400">{filteredDocuments.length} documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-500 z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocs.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <span className="text-cyan-400">{selectedDocs.size} selected</span>
          <div className="flex-1" />
          <button className="flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => handleDelete(Array.from(selectedDocs))}
            className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button onClick={() => setSelectedDocs(new Set())} className="p-1 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Document List */}
      {viewMode === 'list' ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={() => {
                      if (selectedDocs.size === filteredDocuments.length) {
                        setSelectedDocs(new Set());
                      } else {
                        setSelectedDocs(new Set(filteredDocuments.map((d) => d.id)));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                  />
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Category</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Lead</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Size</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Uploaded</th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => toggleSelectDoc(doc.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <span className="text-white font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${categoryColors[doc.category]}`}>
                      {CATEGORIES.find((c) => c.value === doc.category)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-400">{doc.lead_name || '-'}</td>
                  <td className="px-4 py-4 text-gray-400">{formatFileSize(doc.size)}</td>
                  <td className="px-4 py-4 text-gray-400 text-sm">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete([doc.id])}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-colors ${
                selectedDocs.has(doc.id) ? 'border-cyan-500' : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => toggleSelectDoc(doc.id)}
            >
              <div className="flex justify-center mb-3">
                {getFileIcon(doc.type)}
              </div>
              <p className="text-white text-sm font-medium truncate mb-1">{doc.name}</p>
              <p className="text-gray-500 text-xs">{formatFileSize(doc.size)}</p>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${categoryColors[doc.category]}`}>
                {CATEGORIES.find((c) => c.value === doc.category)?.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No documents found</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-cyan-400 hover:text-cyan-300"
          >
            Upload your first document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}

// ============================================
// MODALS
// ============================================

function UploadModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('other');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // In production, upload to Supabase Storage
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Drop Zone */}
          <label className="block p-8 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-gray-600 text-center">
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-medium">Click to upload or drag and drop</p>
            <p className="text-gray-500 text-sm mt-1">PDF, Images, Documents up to 50MB</p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-white text-sm flex-1 truncate">{file.name}</span>
                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload {files.length > 0 && `(${files.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white truncate">{doc.name}</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {doc.type === 'image' ? (
            <img src={doc.url} alt={doc.name} className="max-w-full mx-auto" />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Preview not available</p>
                <button className="mt-4 text-cyan-400 hover:text-cyan-300">
                  Download to view
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Size</span>
            <p className="text-white">
              {doc.size < 1024 * 1024
                ? `${(doc.size / 1024).toFixed(1)} KB`
                : `${(doc.size / (1024 * 1024)).toFixed(1)} MB`}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Category</span>
            <p className="text-white capitalize">{doc.category.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-gray-500">Uploaded by</span>
            <p className="text-white">{doc.uploaded_by}</p>
          </div>
          <div>
            <span className="text-gray-500">Date</span>
            <p className="text-white">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentManager;
