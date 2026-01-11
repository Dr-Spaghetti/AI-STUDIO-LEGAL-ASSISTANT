// ============================================
// Conversation List - All Chat Transcripts
// ============================================
// Browse and filter conversation history

import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  Phone,
  Clock,
  User,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Conversation {
  id: string;
  lead_id: string;
  lead_name: string;
  case_type: string;
  channel: 'chat' | 'sms' | 'voice';
  status: 'active' | 'completed' | 'abandoned';
  message_count: number;
  duration_seconds?: number;
  last_message: string;
  last_message_at: string;
  created_at: string;
  emergency_flag: boolean;
  ai_summary?: string;
}

interface Props {
  onSelectConversation: (id: string) => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    lead_id: '1',
    lead_name: 'John Doe',
    case_type: 'Personal Injury',
    channel: 'chat',
    status: 'completed',
    message_count: 24,
    last_message: 'Thank you, I look forward to the consultation.',
    last_message_at: '2024-06-15T10:45:00Z',
    created_at: '2024-06-15T10:30:00Z',
    emergency_flag: false,
    ai_summary: 'Car accident case with clear liability. Client has photos and medical records.',
  },
  {
    id: '2',
    lead_id: '2',
    lead_name: 'Jane Smith',
    case_type: 'Family Law',
    channel: 'chat',
    status: 'active',
    message_count: 8,
    last_message: 'I need help with my situation...',
    last_message_at: '2024-06-15T11:30:00Z',
    created_at: '2024-06-15T11:15:00Z',
    emergency_flag: true,
    ai_summary: 'Domestic situation - flagged for emergency resources.',
  },
  {
    id: '3',
    lead_id: '3',
    lead_name: 'Mike Johnson',
    case_type: 'Car Accident',
    channel: 'voice',
    status: 'completed',
    message_count: 0,
    duration_seconds: 480,
    last_message: 'Voice call completed',
    last_message_at: '2024-06-14T16:50:00Z',
    created_at: '2024-06-14T16:42:00Z',
    emergency_flag: false,
    ai_summary: 'Rear-end collision case. Other driver cited. Medical treatment ongoing.',
  },
  {
    id: '4',
    lead_id: '4',
    lead_name: 'Sarah Williams',
    case_type: 'Workers Comp',
    channel: 'sms',
    status: 'completed',
    message_count: 12,
    last_message: 'I will send over the documents',
    last_message_at: '2024-06-14T15:00:00Z',
    created_at: '2024-06-14T14:20:00Z',
    emergency_flag: false,
  },
  {
    id: '5',
    lead_id: '5',
    lead_name: 'David Brown',
    case_type: 'Medical Malpractice',
    channel: 'chat',
    status: 'abandoned',
    message_count: 4,
    last_message: 'Let me think about it...',
    last_message_at: '2024-06-13T11:15:00Z',
    created_at: '2024-06-13T11:00:00Z',
    emergency_flag: false,
  },
];

// ============================================
// COMPONENT
// ============================================

export function ConversationList({ onSelectConversation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'chat' | 'sms' | 'voice'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all');

  const filteredConversations = useMemo(() => {
    return MOCK_CONVERSATIONS.filter((conv) => {
      const matchesSearch =
        conv.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.case_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter;
      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [searchQuery, channelFilter, statusFilter]);

  const channelIcons = {
    chat: <MessageSquare className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    voice: <Phone className="w-4 h-4" />,
  };

  const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-gray-500',
    abandoned: 'bg-yellow-500',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversations</h1>
          <p className="text-gray-400">{filteredConversations.length} conversations</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2">
          {/* Channel Filter */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
            {(['all', 'chat', 'sms', 'voice'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => setChannelFilter(channel)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  channelFilter === channel
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {channel === 'all' ? 'All' : channel.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      {/* Conversation List */}
      <div className="space-y-2">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium">
                  {conv.lead_name.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                    conv.channel === 'voice' ? 'bg-purple-500' : 'bg-cyan-500'
                  }`}
                >
                  {channelIcons[conv.channel]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {conv.emergency_flag && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white font-medium">{conv.lead_name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-sm">{conv.case_type}</span>
                  <div className={`w-2 h-2 rounded-full ${statusColors[conv.status]}`} />
                </div>

                <p className="text-gray-400 text-sm truncate mb-2">
                  {conv.last_message}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageSquare className="w-3 h-3" />
                    {conv.channel === 'voice'
                      ? formatDuration(conv.duration_seconds || 0)
                      : `${conv.message_count} messages`}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(conv.last_message_at)}
                  </div>
                </div>

                {conv.ai_summary && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-cyan-400 text-xs font-medium mb-1">AI Summary</div>
                    <p className="text-gray-300 text-sm">{conv.ai_summary}</p>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        ))}

        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationList;
