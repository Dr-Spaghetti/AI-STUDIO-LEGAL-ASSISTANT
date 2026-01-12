// ============================================
// Lead Detail View - Full Lead Profile
// ============================================
// Displays complete lead information with activity timeline

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Send,
  ExternalLink,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  TrendingUp,
  Shield,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Lead {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  case_type: string;
  case_description?: string;
  status: LeadStatus;
  score: number;
  tier: 'hot' | 'warm' | 'cold' | 'disqualified';
  source?: string;
  jurisdiction?: string;
  consent: {
    terms_accepted: boolean;
    sms_opt_in: boolean;
    email_opt_in: boolean;
    recording_consent?: boolean;
    consented_at?: string;
  };
  qualification?: {
    score: number;
    tier: string;
    factors: Record<string, number>;
  };
  metadata?: {
    calendly?: {
      event_name?: string;
      start_time?: string;
      cancel_url?: string;
      reschedule_url?: string;
    };
    utm_source?: string;
    utm_campaign?: string;
    referrer?: string;
  };
  emergency_flag: boolean;
  created_at: string;
  updated_at: string;
}

type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'appointment_scheduled'
  | 'consultation_complete'
  | 'retained'
  | 'lost';

interface Activity {
  id: string;
  type: 'status_change' | 'message' | 'appointment' | 'note' | 'call' | 'email';
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, unknown>;
}

interface Message {
  id: string;
  channel: 'sms' | 'email' | 'chat';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

interface Props {
  leadId: string;
  onBack?: () => void;
  onUpdate?: (lead: Lead) => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_LEAD: Lead = {
  id: '1',
  tenant_id: 'tenant-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@email.com',
  phone: '(555) 123-4567',
  case_type: 'Personal Injury',
  case_description: 'Car accident on Highway 101. Other driver ran red light. Suffered whiplash and back injuries. Medical bills accumulating.',
  status: 'qualified',
  score: 85,
  tier: 'hot',
  source: 'Google Ads',
  jurisdiction: 'California',
  consent: {
    terms_accepted: true,
    sms_opt_in: true,
    email_opt_in: true,
    recording_consent: true,
    consented_at: '2024-06-15T10:30:00Z',
  },
  qualification: {
    score: 85,
    tier: 'hot',
    factors: {
      case_value: 28,
      liability_clarity: 18,
      timeline: 16,
      injury_severity: 12,
      geographic_match: 8,
      insurance_status: 3,
    },
  },
  metadata: {
    calendly: {
      event_name: '30-Minute Consultation',
      start_time: '2024-06-20T14:00:00Z',
      cancel_url: 'https://calendly.com/cancel/abc123',
      reschedule_url: 'https://calendly.com/reschedule/abc123',
    },
    utm_source: 'google',
    utm_campaign: 'pi_california_2024',
  },
  emergency_flag: false,
  created_at: '2024-06-15T10:30:00Z',
  updated_at: '2024-06-15T14:22:00Z',
};

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Consultation Scheduled',
    description: '30-Minute Consultation on June 20, 2024 at 2:00 PM',
    timestamp: '2024-06-15T14:22:00Z',
  },
  {
    id: '2',
    type: 'message',
    title: 'SMS Sent',
    description: 'Appointment confirmation sent',
    timestamp: '2024-06-15T14:20:00Z',
  },
  {
    id: '3',
    type: 'status_change',
    title: 'Status Changed',
    description: 'New → Qualified',
    timestamp: '2024-06-15T12:00:00Z',
    user: 'AI Assistant',
  },
  {
    id: '4',
    type: 'call',
    title: 'Intake Call Completed',
    description: 'Duration: 8 minutes',
    timestamp: '2024-06-15T10:45:00Z',
  },
  {
    id: '5',
    type: 'note',
    title: 'AI Summary',
    description: 'Clear liability case. Client has photos of accident scene and medical records.',
    timestamp: '2024-06-15T10:45:00Z',
    user: 'AI Assistant',
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    channel: 'sms',
    direction: 'outbound',
    content: 'Hi John, thank you for contacting Smith & Associates. Your consultation is confirmed for June 20th at 2:00 PM. Reply CONFIRM to confirm.',
    timestamp: '2024-06-15T14:20:00Z',
    status: 'delivered',
  },
  {
    id: '2',
    channel: 'sms',
    direction: 'inbound',
    content: 'CONFIRM',
    timestamp: '2024-06-15T14:25:00Z',
  },
  {
    id: '3',
    channel: 'sms',
    direction: 'outbound',
    content: 'Great! We look forward to speaking with you. If you need to reschedule, reply RESCHEDULE.',
    timestamp: '2024-06-15T14:26:00Z',
    status: 'delivered',
  },
];

// ============================================
// COMPONENT
// ============================================

export function LeadDetailView({ leadId, onBack, onUpdate }: Props) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'activity'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [leadId]);

  async function fetchLeadData() {
    setLoading(true);
    try {
      // In production, fetch from Supabase
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLead(MOCK_LEAD);
      setActivities(MOCK_ACTIVITIES);
      setMessages(MOCK_MESSAGES);
    } catch (err) {
      console.error('Failed to fetch lead:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !lead) return;

    setSending(true);
    try {
      // In production, send via API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const message: Message = {
        id: String(Date.now()),
        channel: 'sms',
        direction: 'outbound',
        content: newMessage,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {lead.first_name} {lead.last_name}
              </h1>
              {lead.emergency_flag && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded border border-red-500/30">
                  EMERGENCY
                </span>
              )}
              <TierBadge tier={lead.tier} score={lead.score} />
            </div>
            <p className="text-gray-400 mt-1">{lead.case_type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusDropdown status={lead.status} onStatusChange={() => {}} />
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`tel:${lead.phone}`}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email
        </a>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <Calendar className="w-4 h-4" />
          Schedule
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <FileText className="w-4 h-4" />
          Push to Clio
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex gap-4">
          {(['overview', 'messages', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab lead={lead} />}
      {activeTab === 'messages' && (
        <MessagesTab
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSendMessage}
          sending={sending}
          lead={lead}
        />
      )}
      {activeTab === 'activity' && <ActivityTab activities={activities} />}
    </div>
  );
}

// ============================================
// TAB COMPONENTS
// ============================================

function OverviewTab({ lead }: { lead: Lead }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Contact Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={lead.phone} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Jurisdiction" value={lead.jurisdiction || 'Not specified'} />
            <InfoRow icon={<TrendingUp className="w-4 h-4" />} label="Source" value={lead.source || 'Direct'} />
          </div>
        </div>

        {/* Case Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Case Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-sm">Case Type</label>
              <p className="text-white">{lead.case_type}</p>
            </div>
            {lead.case_description && (
              <div>
                <label className="text-gray-500 text-sm">Description</label>
                <p className="text-gray-300">{lead.case_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment */}
        {lead.metadata?.calendly && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Scheduled Appointment</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{lead.metadata.calendly.event_name}</p>
                <p className="text-gray-400">
                  {new Date(lead.metadata.calendly.start_time!).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {lead.metadata.calendly.reschedule_url && (
                  <a
                    href={lead.metadata.calendly.reschedule_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700"
                  >
                    Reschedule
                  </a>
                )}
                {lead.metadata.calendly.cancel_url && (
                  <a
                    href={lead.metadata.calendly.cancel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
                  >
                    Cancel
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Lead Score */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Lead Score</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={lead.tier === 'hot' ? '#EF4444' : lead.tier === 'warm' ? '#F59E0B' : '#3B82F6'}
                  strokeWidth="8"
                  strokeDasharray={`${(lead.score / 100) * 352} 352`}
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{lead.score}</span>
              </div>
            </div>
          </div>

          {lead.qualification?.factors && (
            <div className="space-y-2">
              {Object.entries(lead.qualification.factors).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-white">+{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consent Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Consent Status</h3>
          <div className="space-y-3">
            <ConsentRow
              label="Terms Accepted"
              granted={lead.consent.terms_accepted}
            />
            <ConsentRow
              label="SMS Opt-in"
              granted={lead.consent.sms_opt_in}
            />
            <ConsentRow
              label="Email Opt-in"
              granted={lead.consent.email_opt_in}
            />
            <ConsentRow
              label="Recording Consent"
              granted={lead.consent.recording_consent || false}
            />
            {lead.consent.consented_at && (
              <p className="text-gray-500 text-xs mt-2">
                Consented: {new Date(lead.consent.consented_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        {lead.metadata?.utm_source && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Attribution</h3>
            <div className="space-y-2 text-sm">
              {lead.metadata.utm_source && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Source</span>
                  <span className="text-white">{lead.metadata.utm_source}</span>
                </div>
              )}
              {lead.metadata.utm_campaign && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Campaign</span>
                  <span className="text-white">{lead.metadata.utm_campaign}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesTab({
  messages,
  newMessage,
  setNewMessage,
  onSend,
  sending,
  lead,
}: {
  messages: Message[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  lead: Lead;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Messages List */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.direction === 'outbound'
                  ? 'bg-cyan-500/20 text-cyan-100'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                {msg.status && msg.direction === 'outbound' && (
                  <span className="text-xs text-gray-500">{msg.status}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      {lead.consent.sms_opt_in ? (
        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
            />
            <button
              onClick={onSend}
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-800 p-4 bg-yellow-500/10">
          <p className="text-yellow-400 text-sm text-center">
            SMS consent not granted. Lead must opt-in before receiving messages.
          </p>
        </div>
      )}
    </div>
  );
}

function ActivityTab({ activities }: { activities: Activity[] }) {
  const icons: Record<Activity['type'], React.ReactNode> = {
    status_change: <TrendingUp className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
    appointment: <Calendar className="w-4 h-4" />,
    note: <FileText className="w-4 h-4" />,
    call: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                {icons[activity.type]}
              </div>
              {index < activities.length - 1 && (
                <div className="w-px h-full bg-gray-800 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{activity.title}</h4>
                <span className="text-gray-500 text-sm">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              {activity.description && (
                <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
              )}
              {activity.user && (
                <p className="text-gray-500 text-xs mt-1">by {activity.user}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function TierBadge({ tier, score }: { tier: string; score: number }) {
  const colors = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    disqualified: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`px-2 py-1 rounded border text-xs font-medium ${colors[tier as keyof typeof colors]}`}>
      {tier.toUpperCase()} • {score}
    </span>
  );
}

function StatusDropdown({ status, onStatusChange }: { status: LeadStatus; onStatusChange: (s: LeadStatus) => void }) {
  const [open, setOpen] = useState(false);

  const statuses: { value: LeadStatus; label: string; color: string }[] = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
    { value: 'appointment_scheduled', label: 'Appointment Scheduled', color: 'bg-purple-500' },
    { value: 'consultation_complete', label: 'Consultation Complete', color: 'bg-cyan-500' },
    { value: 'retained', label: 'Retained', color: 'bg-emerald-500' },
    { value: 'lost', label: 'Lost', color: 'bg-gray-500' },
  ];

  const current = statuses.find((s) => s.value === status)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
      >
        <div className={`w-2 h-2 rounded-full ${current.color}`} />
        <span className="text-white">{current.label}</span>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-10">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onStatusChange(s.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-gray-300">{s.label}</span>
              {s.value === status && <CheckCircle className="w-4 h-4 text-cyan-400 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-800 rounded-lg text-gray-400">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-white">{value}</p>
      </div>
    </div>
  );
}

function ConsentRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      {granted ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-600" />
      )}
    </div>
  );
}

export default LeadDetailView;
