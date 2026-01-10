// ============================================
// Lead List - Searchable & Filterable Table
// ============================================
// Full lead management with bulk actions

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Trash2,
  Tag,
  Send,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  case_type: string;
  status: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold' | 'disqualified';
  source: string;
  created_at: string;
  emergency_flag: boolean;
}

interface Props {
  onSelectLead: (id: string) => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_LEADS: Lead[] = [
  { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@email.com', phone: '(555) 123-4567', case_type: 'Personal Injury', status: 'qualified', score: 85, tier: 'hot', source: 'Google Ads', created_at: '2024-06-15T10:30:00Z', emergency_flag: false },
  { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@email.com', phone: '(555) 987-6543', case_type: 'Family Law', status: 'new', score: 62, tier: 'warm', source: 'Referral', created_at: '2024-06-15T09:15:00Z', emergency_flag: true },
  { id: '3', first_name: 'Mike', last_name: 'Johnson', email: 'mike@email.com', phone: '(555) 456-7890', case_type: 'Car Accident', status: 'appointment_scheduled', score: 78, tier: 'hot', source: 'Organic', created_at: '2024-06-14T16:45:00Z', emergency_flag: false },
  { id: '4', first_name: 'Sarah', last_name: 'Williams', email: 'sarah@email.com', phone: '(555) 321-0987', case_type: 'Workers Comp', status: 'contacted', score: 45, tier: 'cold', source: 'Facebook', created_at: '2024-06-14T14:20:00Z', emergency_flag: false },
  { id: '5', first_name: 'David', last_name: 'Brown', email: 'david@email.com', phone: '(555) 654-3210', case_type: 'Medical Malpractice', status: 'retained', score: 91, tier: 'hot', source: 'Google Ads', created_at: '2024-06-13T11:00:00Z', emergency_flag: false },
  { id: '6', first_name: 'Emily', last_name: 'Davis', email: 'emily@email.com', phone: '(555) 789-0123', case_type: 'Slip & Fall', status: 'lost', score: 32, tier: 'disqualified', source: 'Direct', created_at: '2024-06-12T09:30:00Z', emergency_flag: false },
  { id: '7', first_name: 'Robert', last_name: 'Taylor', email: 'robert@email.com', phone: '(555) 234-5678', case_type: 'Personal Injury', status: 'qualified', score: 73, tier: 'warm', source: 'Referral', created_at: '2024-06-11T15:45:00Z', emergency_flag: false },
  { id: '8', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa@email.com', phone: '(555) 876-5432', case_type: 'Wrongful Death', status: 'new', score: 88, tier: 'hot', source: 'Google Ads', created_at: '2024-06-10T10:15:00Z', emergency_flag: false },
];

const CASE_TYPES = ['All Types', 'Personal Injury', 'Family Law', 'Car Accident', 'Workers Comp', 'Medical Malpractice', 'Slip & Fall', 'Wrongful Death'];
const STATUSES = ['All Statuses', 'new', 'contacted', 'qualified', 'appointment_scheduled', 'retained', 'lost'];
const TIERS = ['All Tiers', 'hot', 'warm', 'cold', 'disqualified'];
const SOURCES = ['All Sources', 'Google Ads', 'Referral', 'Organic', 'Facebook', 'Direct'];

// ============================================
// COMPONENT
// ============================================

export function LeadList({ onSelectLead }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All Tiers');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedCaseType, setSelectedCaseType] = useState('All Types');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'created_at' | 'score' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...MOCK_LEADS];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.first_name.toLowerCase().includes(query) ||
          lead.last_name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query)
      );
    }

    // Filters
    if (selectedTier !== 'All Tiers') {
      result = result.filter((lead) => lead.tier === selectedTier);
    }
    if (selectedStatus !== 'All Statuses') {
      result = result.filter((lead) => lead.status === selectedStatus);
    }
    if (selectedCaseType !== 'All Types') {
      result = result.filter((lead) => lead.case_type === selectedCaseType);
    }
    if (selectedSource !== 'All Sources') {
      result = result.filter((lead) => lead.source === selectedSource);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'score') {
        comparison = a.score - b.score;
      } else if (sortBy === 'name') {
        comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, selectedTier, selectedStatus, selectedCaseType, selectedSource, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedLeads.size === paginatedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  // Export handler
  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Case Type', 'Status', 'Score', 'Tier', 'Source', 'Created'],
      ...filteredLeads.map((l) => [
        `${l.first_name} ${l.last_name}`,
        l.email,
        l.phone,
        l.case_type,
        l.status,
        l.score,
        l.tier,
        l.source,
        new Date(l.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const tierColors = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    disqualified: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    qualified: 'bg-green-500',
    appointment_scheduled: 'bg-purple-500',
    retained: 'bg-cyan-500',
    lost: 'bg-gray-500',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400">{filteredLeads.length} total leads</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-gray-900 border-gray-800 text-gray-400'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <FilterSelect
            label="Tier"
            value={selectedTier}
            options={TIERS}
            onChange={setSelectedTier}
          />
          <FilterSelect
            label="Status"
            value={selectedStatus}
            options={STATUSES}
            onChange={setSelectedStatus}
          />
          <FilterSelect
            label="Case Type"
            value={selectedCaseType}
            options={CASE_TYPES}
            onChange={setSelectedCaseType}
          />
          <FilterSelect
            label="Source"
            value={selectedSource}
            options={SOURCES}
            onChange={setSelectedSource}
          />
        </div>
      )}

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <span className="text-cyan-400">{selectedLeads.size} selected</span>
          <div className="flex-1" />
          <button className="flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            <Send className="w-4 h-4" />
            Send SMS
          </button>
          <button className="flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            <Tag className="w-4 h-4" />
            Update Status
          </button>
          <button className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button onClick={() => setSelectedLeads(new Set())} className="p-1 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                  />
                </th>
                <th
                  className="text-left text-gray-400 text-sm font-medium px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Contact</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Case Type</th>
                <th
                  className="text-left text-gray-400 text-sm font-medium px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('score');
                    setSortOrder(sortBy === 'score' && sortOrder === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
                <th
                  className="text-left text-gray-400 text-sm font-medium px-4 py-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortBy('created_at');
                    setSortOrder(sortBy === 'created_at' && sortOrder === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => onSelectLead(lead.id)}
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {lead.emergency_flag && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-gray-500 text-sm">{lead.source}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-300 text-sm">{lead.email}</div>
                    <div className="text-gray-500 text-sm">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-300">{lead.case_type}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded border text-xs font-medium ${tierColors[lead.tier]}`}>
                      {lead.tier.toUpperCase()} • {lead.score}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[lead.status] || 'bg-gray-500'}`} />
                      <span className="text-gray-300 capitalize">{lead.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-sm">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <div className="text-gray-400 text-sm">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded ${
                  currentPage === page
                    ? 'bg-cyan-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-gray-500 text-xs mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LeadList;
