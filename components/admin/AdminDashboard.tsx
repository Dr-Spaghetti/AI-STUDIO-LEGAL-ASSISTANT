// ============================================
// Admin Dashboard - Tenant Management Panel
// ============================================
// Internal admin interface for managing tenants,
// leads, integrations, and system configuration

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Link2,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Tenant {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'starter' | 'professional' | 'enterprise';
  created_at: string;
  settings: {
    branding: {
      primary_color: string;
      logo_url?: string;
    };
    features: string[];
  };
  stats: {
    leads_total: number;
    leads_this_month: number;
    conversion_rate: number;
    avg_response_time: number;
  };
}

interface Lead {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  case_type: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number;
  tier: 'hot' | 'warm' | 'cold' | 'disqualified';
  created_at: string;
  emergency_flag: boolean;
}

interface Integration {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  type: 'clio' | 'calendly' | 'twilio' | 'sendgrid';
  status: 'connected' | 'disconnected' | 'error';
  last_sync?: string;
  error_message?: string;
}

interface SystemStats {
  total_tenants: number;
  active_tenants: number;
  total_leads: number;
  leads_today: number;
  emergency_events: number;
  api_calls_today: number;
}

// ============================================
// MOCK DATA (Replace with Supabase queries)
// ============================================

const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    name: 'Smith & Associates',
    slug: 'smith-associates',
    custom_domain: 'intake.smithlaw.com',
    status: 'active',
    plan: 'professional',
    created_at: '2024-01-15',
    settings: {
      branding: { primary_color: '#00FFC8' },
      features: ['sms', 'calendly', 'clio'],
    },
    stats: {
      leads_total: 1247,
      leads_this_month: 89,
      conversion_rate: 34.2,
      avg_response_time: 4.5,
    },
  },
  {
    id: '2',
    name: 'Johnson Legal Group',
    slug: 'johnson-legal',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-02-20',
    settings: {
      branding: { primary_color: '#3B82F6' },
      features: ['sms', 'calendly', 'clio', 'voice'],
    },
    stats: {
      leads_total: 3420,
      leads_this_month: 234,
      conversion_rate: 41.8,
      avg_response_time: 2.1,
    },
  },
  {
    id: '3',
    name: 'Davis Family Law',
    slug: 'davis-family',
    status: 'inactive',
    plan: 'starter',
    created_at: '2024-03-10',
    settings: {
      branding: { primary_color: '#8B5CF6' },
      features: ['calendly'],
    },
    stats: {
      leads_total: 156,
      leads_this_month: 0,
      conversion_rate: 22.5,
      avg_response_time: 12.3,
    },
  },
];

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    tenant_id: '1',
    tenant_name: 'Smith & Associates',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    case_type: 'Personal Injury',
    status: 'qualified',
    score: 85,
    tier: 'hot',
    created_at: '2024-06-15T10:30:00Z',
    emergency_flag: false,
  },
  {
    id: '2',
    tenant_id: '2',
    tenant_name: 'Johnson Legal Group',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@email.com',
    phone: '(555) 987-6543',
    case_type: 'Family Law',
    status: 'new',
    score: 62,
    tier: 'warm',
    created_at: '2024-06-15T11:45:00Z',
    emergency_flag: true,
  },
];

const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    tenant_id: '1',
    tenant_name: 'Smith & Associates',
    type: 'clio',
    status: 'connected',
    last_sync: '2024-06-15T12:00:00Z',
  },
  {
    id: '2',
    tenant_id: '1',
    tenant_name: 'Smith & Associates',
    type: 'calendly',
    status: 'connected',
    last_sync: '2024-06-15T11:30:00Z',
  },
  {
    id: '3',
    tenant_id: '2',
    tenant_name: 'Johnson Legal Group',
    type: 'twilio',
    status: 'error',
    error_message: 'API key expired',
  },
];

const MOCK_STATS: SystemStats = {
  total_tenants: 47,
  active_tenants: 42,
  total_leads: 15420,
  leads_today: 127,
  emergency_events: 3,
  api_calls_today: 45230,
};

// ============================================
// COMPONENT
// ============================================

type TabType = 'overview' | 'tenants' | 'leads' | 'integrations' | 'settings';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data state
  const [tenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [integrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [stats] = useState<SystemStats>(MOCK_STATS);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'tenants' as const, label: 'Tenants', icon: Building2 },
    { id: 'leads' as const, label: 'Leads', icon: Users },
    { id: 'integrations' as const, label: 'Integrations', icon: Link2 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Legal Intake SaaS Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => setIsLoading(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <nav className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab stats={stats} tenants={tenants} leads={leads} />}
        {activeTab === 'tenants' && <TenantsTab tenants={tenants} searchQuery={searchQuery} />}
        {activeTab === 'leads' && <LeadsTab leads={leads} searchQuery={searchQuery} />}
        {activeTab === 'integrations' && <IntegrationsTab integrations={integrations} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// ============================================
// TAB COMPONENTS
// ============================================

function OverviewTab({ stats, tenants, leads }: { stats: SystemStats; tenants: Tenant[]; leads: Lead[] }) {
  const statCards = [
    { label: 'Total Tenants', value: stats.total_tenants, subtext: `${stats.active_tenants} active`, icon: Building2, color: 'cyan' },
    { label: 'Total Leads', value: stats.total_leads.toLocaleString(), subtext: `${stats.leads_today} today`, icon: Users, color: 'green' },
    { label: 'Emergency Events', value: stats.emergency_events, subtext: 'Requires attention', icon: AlertTriangle, color: 'red' },
    { label: 'API Calls Today', value: stats.api_calls_today.toLocaleString(), subtext: 'Within limits', icon: BarChart3, color: 'purple' },
  ];

  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tenants */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Tenants</h3>
          <div className="space-y-3">
            {tenants.slice(0, 5).map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tenant.settings.branding.primary_color }}
                  />
                  <div>
                    <div className="text-white font-medium">{tenant.name}</div>
                    <div className="text-gray-500 text-sm">{tenant.stats.leads_this_month} leads this month</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">{tenant.stats.conversion_rate}%</div>
                  <div className="text-gray-500 text-sm">conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {lead.emergency_flag && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <div className="text-white font-medium">{lead.first_name} {lead.last_name}</div>
                    <div className="text-gray-500 text-sm">{lead.tenant_name} • {lead.case_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lead.tier === 'hot' ? 'bg-red-500/20 text-red-400' :
                    lead.tier === 'warm' ? 'bg-yellow-500/20 text-yellow-400' :
                    lead.tier === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {lead.tier.toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm">{lead.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantsTab({ tenants, searchQuery }: { tenants: Tenant[]; searchQuery: string }) {
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    inactive: 'bg-gray-500/20 text-gray-400',
    suspended: 'bg-red-500/20 text-red-400',
  };

  const planColors = {
    starter: 'bg-gray-500/20 text-gray-400',
    professional: 'bg-cyan-500/20 text-cyan-400',
    enterprise: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Tenants ({filteredTenants.length})</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg font-medium hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Tenant</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Plan</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Leads</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Conversion</th>
              <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <React.Fragment key={tenant.id}>
                <tr className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)}
                        className="text-gray-500 hover:text-white"
                      >
                        {expandedTenant === tenant.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tenant.settings.branding.primary_color }}
                      />
                      <div>
                        <div className="text-white font-medium">{tenant.name}</div>
                        <div className="text-gray-500 text-sm">{tenant.custom_domain || `${tenant.slug}.legalintake.ai`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tenant.status]}`}>
                      {tenant.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${planColors[tenant.plan]}`}>
                      {tenant.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-white">{tenant.stats.leads_total.toLocaleString()}</div>
                    <div className="text-gray-500 text-sm">{tenant.stats.leads_this_month} this month</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-green-400 font-medium">{tenant.stats.conversion_rate}%</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedTenant === tenant.id && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 bg-gray-800/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-gray-500 text-sm mb-1">Created</div>
                          <div className="text-white">{new Date(tenant.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-1">Avg Response Time</div>
                          <div className="text-white">{tenant.stats.avg_response_time} min</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-1">Features</div>
                          <div className="flex flex-wrap gap-1">
                            {tenant.settings.features.map((f) => (
                              <span key={f} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-1">Primary Color</div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: tenant.settings.branding.primary_color }}
                            />
                            <span className="text-white">{tenant.settings.branding.primary_color}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadsTab({ leads, searchQuery }: { leads: Lead[]; searchQuery: string }) {
  const filteredLeads = leads.filter(
    (l) =>
      l.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-yellow-500/20 text-yellow-400',
    qualified: 'bg-green-500/20 text-green-400',
    converted: 'bg-purple-500/20 text-purple-400',
    lost: 'bg-gray-500/20 text-gray-400',
  };

  const tierColors = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    disqualified: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">All Leads ({filteredLeads.length})</h2>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500">
            <option value="">All Tenants</option>
            <option value="1">Smith & Associates</option>
            <option value="2">Johnson Legal Group</option>
          </select>
          <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500">
            <option value="">All Tiers</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Lead</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Tenant</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Case Type</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Score</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Created</th>
              <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {lead.emergency_flag && (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">{lead.first_name} {lead.last_name}</div>
                      <div className="text-gray-500 text-sm">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-300">{lead.tenant_name}</td>
                <td className="px-4 py-4 text-gray-300">{lead.case_type}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded border text-xs font-medium ${tierColors[lead.tier]}`}>
                      {lead.tier.toUpperCase()}
                    </span>
                    <span className="text-gray-400">{lead.score}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[lead.status]}`}>
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-400 text-sm">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsTab({ integrations }: { integrations: Integration[] }) {
  const integrationInfo = {
    clio: { name: 'Clio', description: 'Practice management sync', icon: '⚖️' },
    calendly: { name: 'Calendly', description: 'Appointment scheduling', icon: '📅' },
    twilio: { name: 'Twilio', description: 'SMS automation', icon: '📱' },
    sendgrid: { name: 'SendGrid', description: 'Email automation', icon: '📧' },
  };

  const statusColors = {
    connected: 'bg-green-500/20 text-green-400 border-green-500/30',
    disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusIcons = {
    connected: Check,
    disconnected: X,
    error: AlertTriangle,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Integration Status</h2>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(integrationInfo).map(([type, info]) => {
          const count = integrations.filter((i) => i.type === type && i.status === 'connected').length;
          const errorCount = integrations.filter((i) => i.type === type && i.status === 'error').length;

          return (
            <div key={type} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{info.icon}</span>
                {errorCount > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {errorCount} error{errorCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="text-white font-semibold">{info.name}</div>
              <div className="text-gray-500 text-sm mb-3">{info.description}</div>
              <div className="text-cyan-400 text-sm">{count} connected</div>
            </div>
          );
        })}
      </div>

      {/* Integration Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Tenant</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Integration</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Last Sync</th>
              <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => {
              const info = integrationInfo[integration.type];
              const StatusIcon = statusIcons[integration.status];

              return (
                <tr key={integration.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-4 text-white">{integration.tenant_name}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span className="text-white">{info.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${statusColors[integration.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {integration.status.toUpperCase()}
                      </span>
                      {integration.error_message && (
                        <span className="text-red-400 text-sm">{integration.error_message}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-sm">
                    {integration.last_sync
                      ? new Date(integration.last_sync).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    new_signups_enabled: true,
    api_rate_limit: 1000,
    default_plan: 'starter',
    emergency_notifications: true,
    audit_log_retention_days: 90,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">System Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">General</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-white">Maintenance Mode</div>
                <div className="text-gray-500 text-sm">Disable all tenant access</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.maintenance_mode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="text-white">New Signups</div>
                <div className="text-gray-500 text-sm">Allow new tenant registrations</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, new_signups_enabled: !settings.new_signups_enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.new_signups_enabled ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.new_signups_enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="text-white">Emergency Notifications</div>
                <div className="text-gray-500 text-sm">Send alerts for emergency events</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emergency_notifications: !settings.emergency_notifications })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emergency_notifications ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.emergency_notifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">API & Limits</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">API Rate Limit (per minute)</label>
              <input
                type="number"
                value={settings.api_rate_limit}
                onChange={(e) => setSettings({ ...settings, api_rate_limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Default Plan for New Tenants</label>
              <select
                value={settings.default_plan}
                onChange={(e) => setSettings({ ...settings, default_plan: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Audit Log Retention (days)</label>
              <input
                type="number"
                value={settings.audit_log_retention_days}
                onChange={(e) => setSettings({ ...settings, audit_log_retention_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-900 border border-red-900/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
              <div className="text-white font-medium mb-1">Clear All Test Data</div>
              <div className="text-gray-400 text-sm mb-3">
                Remove all test tenants and leads. This action cannot be undone.
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                Clear Test Data
              </button>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
              <div className="text-white font-medium mb-1">Reset System</div>
              <div className="text-gray-400 text-sm mb-3">
                Reset the entire system to initial state. Requires confirmation.
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                Reset System
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-cyan-500 text-black rounded-lg font-medium hover:bg-cyan-400 transition-colors">
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
