// ============================================
// Conversation View - Full Chat Transcript
// ============================================
// View complete conversation with AI analysis

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Bot,
  Phone,
  Mail,
  Calendar,
  FileText,
  Download,
  Share2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    emergency_detected?: boolean;
    intent?: string;
    entities?: Record<string, string>;
  };
}

interface ConversationData {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  case_type: string;
  channel: 'chat' | 'sms' | 'voice';
  status: 'active' | 'completed' | 'abandoned';
  messages: Message[];
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  ai_analysis: {
    summary: string;
    case_strength: 'strong' | 'moderate' | 'weak';
    key_facts: string[];
    recommended_actions: string[];
    extracted_info: {
      incident_date?: string;
      incident_location?: string;
      injuries?: string[];
      witnesses?: number;
      insurance_info?: string;
    };
  };
  emergency_events: Array<{
    type: string;
    detected_at: string;
    message_id: string;
  }>;
}

interface Props {
  conversationId: string;
  onBack: () => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_CONVERSATION: ConversationData = {
  id: '1',
  lead_id: '1',
  lead_name: 'John Doe',
  lead_email: 'john@email.com',
  lead_phone: '(555) 123-4567',
  case_type: 'Personal Injury',
  channel: 'chat',
  status: 'completed',
  started_at: '2024-06-15T10:30:00Z',
  ended_at: '2024-06-15T10:45:00Z',
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help you with your legal inquiry. Before we begin, I want to let you know that I'm an AI assistant. How can I help you today?",
      timestamp: '2024-06-15T10:30:00Z',
    },
    {
      id: '2',
      role: 'user',
      content: "Hi, I was in a car accident last week and I think I might need a lawyer.",
      timestamp: '2024-06-15T10:30:30Z',
    },
    {
      id: '3',
      role: 'assistant',
      content: "I'm sorry to hear about your accident. I can help gather some information to see how we might be able to assist you. Can you tell me a bit more about what happened?",
      timestamp: '2024-06-15T10:31:00Z',
    },
    {
      id: '4',
      role: 'user',
      content: "I was driving on Highway 101 when another car ran a red light and hit my car on the driver's side. The police came and gave the other driver a ticket.",
      timestamp: '2024-06-15T10:32:00Z',
      metadata: {
        intent: 'describe_incident',
        entities: { location: 'Highway 101', fault: 'other_driver' },
      },
    },
    {
      id: '5',
      role: 'assistant',
      content: "That sounds like a serious accident. I'm glad you're able to speak with us. Were you injured in the accident?",
      timestamp: '2024-06-15T10:32:30Z',
    },
    {
      id: '6',
      role: 'user',
      content: "Yes, I have whiplash and back pain. I've been to the doctor twice already and they want me to do physical therapy.",
      timestamp: '2024-06-15T10:33:15Z',
      metadata: {
        intent: 'describe_injuries',
        entities: { injuries: 'whiplash, back pain', treatment: 'physical therapy' },
      },
    },
    {
      id: '7',
      role: 'assistant',
      content: "I'm sorry to hear about your injuries. It's important that you continue following your doctor's treatment plan. Do you have photos from the accident scene or documentation from the police?",
      timestamp: '2024-06-15T10:34:00Z',
    },
    {
      id: '8',
      role: 'user',
      content: "Yes, I took pictures of both cars and I have the police report number. I also got the other driver's insurance information.",
      timestamp: '2024-06-15T10:35:00Z',
    },
    {
      id: '9',
      role: 'assistant',
      content: "Excellent - that documentation will be very helpful. Based on what you've shared, this sounds like a case where you may be entitled to compensation for your medical bills, lost wages, and pain and suffering. Would you like to schedule a free consultation with one of our attorneys to discuss your options?",
      timestamp: '2024-06-15T10:36:00Z',
    },
    {
      id: '10',
      role: 'user',
      content: "Yes, I would like that. When is the soonest I can speak with someone?",
      timestamp: '2024-06-15T10:37:00Z',
    },
    {
      id: '11',
      role: 'assistant',
      content: "Great! I can schedule you for a consultation. We have availability tomorrow at 2:00 PM or 4:00 PM. Which works better for you?",
      timestamp: '2024-06-15T10:37:30Z',
    },
    {
      id: '12',
      role: 'user',
      content: "2:00 PM works for me.",
      timestamp: '2024-06-15T10:38:00Z',
    },
    {
      id: '13',
      role: 'assistant',
      content: "Perfect! I've scheduled your consultation for tomorrow at 2:00 PM. You'll receive a confirmation email and SMS shortly. Is there anything else you'd like to know before then?",
      timestamp: '2024-06-15T10:38:30Z',
    },
    {
      id: '14',
      role: 'user',
      content: "No, I think that's everything. Thank you for your help!",
      timestamp: '2024-06-15T10:39:00Z',
    },
    {
      id: '15',
      role: 'assistant',
      content: "You're welcome! Take care and we'll speak with you tomorrow. In the meantime, please continue following your doctor's recommendations and keep all documentation related to the accident safe.",
      timestamp: '2024-06-15T10:39:30Z',
    },
  ],
  ai_analysis: {
    summary: 'Strong personal injury case involving a car accident on Highway 101. The other driver ran a red light and was cited by police. Client sustained whiplash and back injuries requiring ongoing physical therapy. Client has photos, police report, and insurance information. Consultation scheduled.',
    case_strength: 'strong',
    key_facts: [
      'Car accident on Highway 101',
      'Other driver ran red light (cited by police)',
      'Client has whiplash and back pain',
      'Currently undergoing physical therapy',
      'Photos of accident scene available',
      'Police report documented',
      "Other driver's insurance information obtained",
    ],
    recommended_actions: [
      'Review police report during consultation',
      'Obtain medical records',
      'Document ongoing treatment and expenses',
      'Consider demand letter to insurance',
    ],
    extracted_info: {
      incident_date: 'Last week (approx. June 8, 2024)',
      incident_location: 'Highway 101',
      injuries: ['Whiplash', 'Back pain'],
      witnesses: 0,
      insurance_info: 'Obtained from other driver',
    },
  },
  emergency_events: [],
};

// ============================================
// COMPONENT
// ============================================

export function ConversationView({ conversationId, onBack }: Props) {
  const [showAnalysis, setShowAnalysis] = useState(true);
  const conversation = MOCK_CONVERSATION; // In production, fetch by ID

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const caseStrengthColors = {
    strong: 'bg-green-500/20 text-green-400 border-green-500/30',
    moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    weak: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{conversation.lead_name}</h1>
            <p className="text-gray-400 text-sm">
              {conversation.case_type} • {formatDate(conversation.started_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Messages</div>
              <div className="text-2xl font-bold text-white">{conversation.messages.length}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Duration</div>
              <div className="text-2xl font-bold text-white">
                {conversation.duration_seconds
                  ? `${Math.floor(conversation.duration_seconds / 60)}m`
                  : '15m'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="text-2xl font-bold text-white capitalize">{conversation.status}</div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Transcript</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-cyan-500 text-black' : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-cyan-500/20 text-cyan-100'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                      {message.metadata?.intent && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                          {message.metadata.intent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Analysis */}
        <div className="space-y-4">
          {/* Lead Quick Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Lead Info</h3>
            <div className="space-y-3">
              <a
                href={`tel:${conversation.lead_phone}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg"
              >
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-white">{conversation.lead_phone}</span>
              </a>
              <a
                href={`mailto:${conversation.lead_email}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg"
              >
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-white">{conversation.lead_email}</span>
              </a>
              <button className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg w-full">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-cyan-400">View Full Profile</span>
                <ExternalLink className="w-3 h-3 ml-auto text-gray-500" />
              </button>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full p-4 flex items-center justify-between border-b border-gray-800"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
              </div>
              {showAnalysis ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showAnalysis && (
              <div className="p-4 space-y-4">
                {/* Case Strength */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Case Strength</div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      caseStrengthColors[conversation.ai_analysis.case_strength]
                    }`}
                  >
                    {conversation.ai_analysis.case_strength.toUpperCase()}
                  </span>
                </div>

                {/* Summary */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Summary</div>
                  <p className="text-gray-300 text-sm">{conversation.ai_analysis.summary}</p>
                </div>

                {/* Key Facts */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Key Facts</div>
                  <ul className="space-y-1">
                    {conversation.ai_analysis.key_facts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Extracted Info */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Extracted Information</div>
                  <div className="space-y-2 text-sm">
                    {conversation.ai_analysis.extracted_info.incident_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Incident Date</span>
                        <span className="text-white">{conversation.ai_analysis.extracted_info.incident_date}</span>
                      </div>
                    )}
                    {conversation.ai_analysis.extracted_info.incident_location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="text-white">{conversation.ai_analysis.extracted_info.incident_location}</span>
                      </div>
                    )}
                    {conversation.ai_analysis.extracted_info.injuries && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Injuries</span>
                        <span className="text-white">{conversation.ai_analysis.extracted_info.injuries.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <div className="text-gray-400 text-sm mb-2">Recommended Actions</div>
                  <ul className="space-y-1">
                    {conversation.ai_analysis.recommended_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConversationView;
