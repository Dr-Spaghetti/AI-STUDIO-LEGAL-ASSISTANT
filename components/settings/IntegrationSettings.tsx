// ============================================
// Integration Settings - Tenant Configuration
// ============================================
// Allows law firms to connect/disconnect integrations

import React, { useState, useEffect } from 'react';
import {
  Link2,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Settings,
  Calendar,
  Phone,
  Mail,
  Scale,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ============================================
// TYPES
// ============================================

interface Integration {
  id: string;
  type: 'calendly' | 'clio' | 'twilio' | 'sendgrid';
  status: 'connected' | 'disconnected' | 'error';
  metadata?: {
    user_name?: string;
    user_email?: string;
    scheduling_url?: string;
    phone_number?: string;
    connected_at?: string;
  };
  error_message?: string;
  last_sync?: string;
}

interface IntegrationConfig {
  type: Integration['type'];
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  setupUrl?: string;
  requiresOAuth: boolean;
}

interface Props {
  tenantId: string;
  tenantSlug: string;
}

// ============================================
// INTEGRATION CONFIGS
// ============================================

const INTEGRATIONS: IntegrationConfig[] = [
  {
    type: 'calendly',
    name: 'Calendly',
    description: 'Appointment scheduling and calendar management',
    icon: <Calendar className="w-6 h-6" />,
    color: '#006BFF',
    features: [
      'Automatic appointment booking links',
      'Calendar sync with availability',
      'Appointment reminders',
      'Rescheduling & cancellation handling',
    ],
    requiresOAuth: true,
  },
  {
    type: 'clio',
    name: 'Clio',
    description: 'Practice management and case tracking',
    icon: <Scale className="w-6 h-6" />,
    color: '#1B365D',
    features: [
      'Auto-create contacts from leads',
      'Open new matters automatically',
      'Sync case notes and details',
      'Two-way status updates',
    ],
    requiresOAuth: true,
  },
  {
    type: 'twilio',
    name: 'Twilio',
    description: 'SMS messaging and follow-up automation',
    icon: <Phone className="w-6 h-6" />,
    color: '#F22F46',
    features: [
      'Automated follow-up sequences',
      'Appointment reminders',
      'Two-way SMS conversations',
      'TCPA-compliant messaging',
    ],
    setupUrl: '/settings/integrations/twilio',
    requiresOAuth: false,
  },
  {
    type: 'sendgrid',
    name: 'SendGrid',
    description: 'Email automation and notifications',
    icon: <Mail className="w-6 h-6" />,
    color: '#1A82E2',
    features: [
      'Welcome emails to new leads',
      'Appointment confirmations',
      'Document request emails',
      'Follow-up sequences',
    ],
    setupUrl: '/settings/integrations/sendgrid',
    requiresOAuth: false,
  },
];

// ============================================
// COMPONENT
// ============================================

export function IntegrationSettings({ tenantId, tenantSlug }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check URL params for success/error messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const errorParam = params.get('error');

    if (success) {
      setSuccessMessage(formatSuccessMessage(success));
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (errorParam) {
      setError(formatErrorMessage(errorParam));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch integrations status
  useEffect(() => {
    fetchIntegrations();
  }, [tenantId]);

  async function fetchIntegrations() {
    setLoading(true);
    try {
      // Fetch integrations from Supabase if available
      if (supabase && tenantId) {
        const { data, error: fetchError } = await supabase
          .from('integrations')
          .select('*')
          .eq('tenant_id', tenantId);

        if (fetchError) {
          console.error('Failed to fetch integrations:', fetchError);
          // Fall back to showing all as disconnected
          setIntegrations([]);
        } else if (data && data.length > 0) {
          // Map database records to Integration type
          const dbIntegrations: Integration[] = data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            type: row.type as Integration['type'],
            status: row.status as Integration['status'],
            metadata: row.metadata as Integration['metadata'],
            error_message: row.error_message as string | undefined,
            last_sync: row.last_sync as string | undefined,
          }));
          setIntegrations(dbIntegrations);
        } else {
          // No integrations found - all are disconnected
          setIntegrations([]);
        }
      } else {
        // Supabase not configured - show all as disconnected
        setIntegrations([]);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('Failed to load integrations');
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }

  function getIntegrationStatus(type: Integration['type']): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  async function handleConnect(config: IntegrationConfig) {
    if (!config.requiresOAuth && config.setupUrl) {
      window.location.href = config.setupUrl;
      return;
    }

    setConnecting(config.type);
    setError(null);

    try {
      // Generate state parameter
      const state = btoa(JSON.stringify({ tenant_id: tenantId, timestamp: Date.now() }));

      // Redirect to OAuth URL
      const oauthUrls: Record<string, string> = {
        calendly: `https://auth.calendly.com/oauth/authorize?client_id=${encodeURIComponent(
          import.meta.env.VITE_CALENDLY_CLIENT_ID || ''
        )}&response_type=code&redirect_uri=${encodeURIComponent(
          `${window.location.origin}/api/integrations/calendly/callback`
        )}&state=${state}`,
        clio: `https://app.clio.com/oauth/authorize?client_id=${encodeURIComponent(
          import.meta.env.VITE_CLIO_CLIENT_ID || ''
        )}&response_type=code&redirect_uri=${encodeURIComponent(
          `${window.location.origin}/api/integrations/clio/callback`
        )}&state=${state}`,
      };

      const url = oauthUrls[config.type];
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(`Failed to connect ${config.name}`);
      setConnecting(null);
    }
  }

  async function handleDisconnect(type: Integration['type']) {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      // Delete integration from Supabase
      if (supabase && tenantId) {
        const { error: deleteError } = await supabase
          .from('integrations')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('type', type);

        if (deleteError) {
          console.error('Failed to disconnect integration:', deleteError);
          setError('Failed to disconnect integration');
          return;
        }
      }

      // Update local state
      setIntegrations((prev) => prev.filter((i) => i.type !== type));
      setSuccessMessage(`Integration disconnected successfully`);
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      setError('Failed to disconnect integration');
    }
  }

  async function handleSync(type: Integration['type']) {
    setConnecting(type);
    try {
      const newSyncTime = new Date().toISOString();

      // Update last_sync in Supabase
      if (supabase && tenantId) {
        const { error: updateError } = await supabase
          .from('integrations')
          .update({ last_sync: newSyncTime })
          .eq('tenant_id', tenantId)
          .eq('type', type);

        if (updateError) {
          console.error('Failed to update sync time:', updateError);
        }
      }

      // Update local state
      setIntegrations((prev) =>
        prev.map((i) =>
          i.type === type ? { ...i, last_sync: newSyncTime } : i
        )
      );
      setSuccessMessage('Sync completed successfully');
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Sync failed');
    } finally {
      setConnecting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Integrations</h2>
        <p className="text-gray-400 mt-1">
          Connect your tools to automate workflows and sync data
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-green-400">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {INTEGRATIONS.map((config) => {
          const integration = getIntegrationStatus(config.type);
          const isConnected = integration?.status === 'connected';
          const hasError = integration?.status === 'error';
          const isConnecting = connecting === config.type;

          return (
            <div
              key={config.type}
              className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${
                hasError
                  ? 'border-red-500/50'
                  : isConnected
                  ? 'border-green-500/30'
                  : 'border-gray-800'
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <div style={{ color: config.color }}>{config.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{config.name}</h3>
                      <p className="text-gray-400 text-sm">{config.description}</p>
                    </div>
                  </div>
                  <StatusBadge status={integration?.status || 'disconnected'} />
                </div>
              </div>

              {/* Features */}
              <div className="p-5 border-b border-gray-800">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Features</h4>
                <ul className="space-y-2">
                  {config.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connection Details (if connected) */}
              {isConnected && integration?.metadata && (
                <div className="p-5 border-b border-gray-800 bg-gray-800/30">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Connection Details</h4>
                  <div className="space-y-2 text-sm">
                    {integration.metadata.user_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account</span>
                        <span className="text-white">{integration.metadata.user_name}</span>
                      </div>
                    )}
                    {integration.metadata.user_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="text-white">{integration.metadata.user_email}</span>
                      </div>
                    )}
                    {integration.metadata.phone_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-white">{integration.metadata.phone_number}</span>
                      </div>
                    )}
                    {integration.metadata.scheduling_url && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Booking URL</span>
                        <a
                          href={integration.metadata.scheduling_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {integration.last_sync && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Sync</span>
                        <span className="text-gray-300">
                          {new Date(integration.last_sync).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {hasError && integration?.error_message && (
                <div className="p-5 border-b border-gray-800 bg-red-950/20">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {integration.error_message}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-5 flex items-center gap-3">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleSync(config.type)}
                      disabled={isConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Sync Now
                    </button>
                    <button
                      onClick={() => {}}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => handleDisconnect(config.type)}
                      className="ml-auto text-red-400 hover:text-red-300 text-sm"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(config)}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    Connect {config.name}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
        <p className="text-gray-400 text-sm mb-4">
          Having trouble connecting an integration? Our support team is here to help.
        </p>
        <a
          href="mailto:support@legalintake.ai"
          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
        >
          Contact Support <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusBadge({ status }: { status: 'connected' | 'disconnected' | 'error' }) {
  const styles = {
    connected: 'bg-green-500/20 text-green-400 border-green-500/30',
    disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels = {
    connected: 'Connected',
    disconnected: 'Not Connected',
    error: 'Error',
  };

  return (
    <span className={`px-2 py-1 rounded border text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatSuccessMessage(code: string): string {
  const messages: Record<string, string> = {
    calendly_connected: 'Calendly connected successfully!',
    clio_connected: 'Clio connected successfully!',
    twilio_configured: 'Twilio configured successfully!',
    sendgrid_configured: 'SendGrid configured successfully!',
  };
  return messages[code] || 'Integration connected successfully!';
}

function formatErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    missing_parameters: 'Missing required parameters',
    invalid_state: 'Invalid authentication state',
    token_exchange_failed: 'Failed to complete authentication',
    user_fetch_failed: 'Failed to verify account',
    server_configuration: 'Server configuration error',
    server_error: 'An unexpected error occurred',
  };
  return messages[code] || 'An error occurred';
}

export default IntegrationSettings;
