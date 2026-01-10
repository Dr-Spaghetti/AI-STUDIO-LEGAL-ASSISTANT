// ============================================
// SMS Template Manager
// ============================================
// Create and manage follow-up SMS templates

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  MessageSquare,
  Clock,
  Tag,
  AlertTriangle,
  Check,
  Eye,
  ChevronDown,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SMSTemplate {
  id: string;
  name: string;
  category: 'follow_up' | 'appointment' | 'document' | 'check_in' | 'custom';
  content: string;
  variables: string[];
  delay_minutes?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  tenantId: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_TEMPLATES: SMSTemplate[] = [
  {
    id: '1',
    name: 'Initial Follow-up',
    category: 'follow_up',
    content: 'Hi {{first_name}}, thank you for contacting {{firm_name}} about your {{case_type}} case. We\'re reviewing your information and will be in touch soon. Reply to this message if you have any questions.',
    variables: ['first_name', 'firm_name', 'case_type'],
    delay_minutes: 30,
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-10T14:30:00Z',
  },
  {
    id: '2',
    name: 'Appointment Reminder',
    category: 'appointment',
    content: 'Reminder: Your consultation with {{firm_name}} is scheduled for {{appointment_time}}. Reply CONFIRM to confirm or RESCHEDULE if you need to change the time.',
    variables: ['firm_name', 'appointment_time'],
    delay_minutes: 1440, // 24 hours before
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-01T09:00:00Z',
  },
  {
    id: '3',
    name: 'Document Request',
    category: 'document',
    content: 'Hi {{first_name}}, to move forward with your {{case_type}} case, we need the following documents: {{documents}}. You can reply to this message with photos or use our secure portal.',
    variables: ['first_name', 'case_type', 'documents'],
    active: true,
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-02-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'Weekly Check-in',
    category: 'check_in',
    content: 'Hi {{first_name}}, {{firm_name}} here. Just checking in on your {{case_type}} case. Any updates or questions? We\'re here to help.',
    variables: ['first_name', 'firm_name', 'case_type'],
    delay_minutes: 10080, // 7 days
    active: false,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-05-15T11:00:00Z',
  },
];

const VARIABLE_OPTIONS = [
  { value: 'first_name', label: 'First Name', example: 'John' },
  { value: 'last_name', label: 'Last Name', example: 'Doe' },
  { value: 'firm_name', label: 'Firm Name', example: 'Smith & Associates' },
  { value: 'case_type', label: 'Case Type', example: 'Personal Injury' },
  { value: 'appointment_time', label: 'Appointment Time', example: 'Tomorrow at 2:00 PM' },
  { value: 'documents', label: 'Requested Documents', example: 'Police report, medical records' },
  { value: 'attorney_name', label: 'Attorney Name', example: 'John Smith' },
];

const CATEGORY_OPTIONS = [
  { value: 'follow_up', label: 'Follow-up', color: 'cyan' },
  { value: 'appointment', label: 'Appointment', color: 'purple' },
  { value: 'document', label: 'Document Request', color: 'yellow' },
  { value: 'check_in', label: 'Check-in', color: 'green' },
  { value: 'custom', label: 'Custom', color: 'gray' },
];

// ============================================
// COMPONENT
// ============================================

export function TemplateManager({ tenantId }: Props) {
  const [templates, setTemplates] = useState<SMSTemplate[]>(MOCK_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SMSTemplate | null>(null);

  const createNewTemplate = (): SMSTemplate => ({
    id: `new-${Date.now()}`,
    name: '',
    category: 'custom',
    content: '',
    variables: [],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const handleSave = (template: SMSTemplate) => {
    if (isCreating) {
      setTemplates((prev) => [...prev, { ...template, id: `${Date.now()}` }]);
    } else {
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...template, updated_at: new Date().toISOString() } : t))
      );
    }
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleDuplicate = (template: SMSTemplate) => {
    const newTemplate = {
      ...template,
      id: `${Date.now()}`,
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const toggleActive = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const categoryColors: Record<string, string> = {
    follow_up: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    appointment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    document: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    check_in: 'bg-green-500/20 text-green-400 border-green-500/30',
    custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">SMS Templates</h2>
          <p className="text-gray-400 mt-1">Manage follow-up message templates</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(createNewTemplate());
            setIsCreating(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-gray-900 border rounded-xl overflow-hidden ${
              template.active ? 'border-gray-800' : 'border-gray-800/50 opacity-60'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{template.name}</h3>
                    {!template.active && (
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded border text-xs ${categoryColors[template.category]}`}>
                    {CATEGORY_OPTIONS.find((c) => c.value === template.category)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setIsCreating(false);
                    }}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {template.content}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-gray-500">
                  {template.delay_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDelay(template.delay_minutes)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {template.variables.length} variables
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(template.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    template.active ? 'bg-cyan-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      template.active ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          isCreating={isCreating}
          onSave={handleSave}
          onCancel={() => {
            setEditingTemplate(null);
            setIsCreating(false);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}

// ============================================
// TEMPLATE EDITOR
// ============================================

function TemplateEditor({
  template,
  isCreating,
  onSave,
  onCancel,
}: {
  template: SMSTemplate;
  isCreating: boolean;
  onSave: (t: SMSTemplate) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(template);
  const [charCount, setCharCount] = useState(template.content.length);

  const insertVariable = (variable: string) => {
    const newContent = `${form.content}{{${variable}}}`;
    setForm((prev) => ({
      ...prev,
      content: newContent,
      variables: [...new Set([...prev.variables, variable])],
    }));
    setCharCount(newContent.length);
  };

  const handleContentChange = (content: string) => {
    // Extract variables from content
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = matches.map((m) => m.replace(/[{}]/g, ''));

    setForm((prev) => ({
      ...prev,
      content,
      variables: [...new Set(variables)],
    }));
    setCharCount(content.length);
  };

  const isValid = form.name.trim() && form.content.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">
            {isCreating ? 'Create Template' : 'Edit Template'}
          </h3>
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Name */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Template Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Initial Follow-up"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as SMSTemplate['category'] }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delay */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Send Delay (optional)</label>
            <select
              value={form.delay_minutes || ''}
              onChange={(e) => setForm((prev) => ({
                ...prev,
                delay_minutes: e.target.value ? parseInt(e.target.value) : undefined,
              }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="">Immediate</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="1440">24 hours</option>
              <option value="2880">48 hours</option>
              <option value="10080">7 days</option>
            </select>
          </div>

          {/* Variables */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Insert Variable</label>
            <div className="flex flex-wrap gap-2">
              {VARIABLE_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  onClick={() => insertVariable(v.value)}
                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700"
                >
                  {`{{${v.value}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-sm">Message Content</label>
              <span className={`text-sm ${charCount > 160 ? 'text-yellow-400' : 'text-gray-500'}`}>
                {charCount}/160 {charCount > 160 && `(${Math.ceil(charCount / 160)} segments)`}
              </span>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Type your message here. Use {{variable}} for dynamic content."
              rows={5}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
            />
            {charCount > 160 && (
              <p className="mt-1 text-yellow-400 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Long messages will be split into multiple segments
              </p>
            )}
          </div>

          {/* Used Variables */}
          {form.variables.length > 0 && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">Variables Used</label>
              <div className="flex flex-wrap gap-2">
                {form.variables.map((v) => (
                  <span key={v} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEMPLATE PREVIEW
// ============================================

function TemplatePreview({
  template,
  onClose,
}: {
  template: SMSTemplate;
  onClose: () => void;
}) {
  // Replace variables with example values
  const previewContent = template.content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    const option = VARIABLE_OPTIONS.find((v) => v.value === variable);
    return option?.example || match;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Preview: {template.name}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Phone Preview */}
          <div className="bg-gray-800 rounded-2xl p-4 max-w-xs mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Messages</span>
              <span className="text-gray-500 text-xs">now</span>
            </div>
            <div className="bg-gray-700 rounded-2xl rounded-bl-none p-3">
              <p className="text-white text-sm">{previewContent}</p>
            </div>
            <p className="mt-2 text-gray-500 text-xs text-center">
              Reply STOP to opt out
            </p>
          </div>

          {/* Info */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Character count</span>
              <span className="text-white">{previewContent.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Segments</span>
              <span className="text-white">{Math.ceil(previewContent.length / 160)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function formatDelay(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

export default TemplateManager;
