import React, { useState } from 'react';

interface ConflictCheck {
  id: string;
  clientName: string;
  opposingParty: string;
  status: 'pending' | 'clear' | 'conflict';
  checkedAt?: string;
}

interface FollowUpItem {
  id: string;
  clientName: string;
  reason: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
}

interface CallInsight {
  id: string;
  callId: string;
  clientName: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'high' | 'medium' | 'low';
  keyTopics: string[];
  summary: string;
  date: string;
}

const WorkflowPanel: React.FC = () => {
  const [conflictChecksEnabled, setConflictChecksEnabled] = useState(true);
  const [followUpEnabled, setFollowUpEnabled] = useState(true);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);

  // Mock data for conflict checks
  const conflictChecks: ConflictCheck[] = [
    { id: '1', clientName: 'Sarah Jenkins', opposingParty: 'ABC Corp', status: 'clear', checkedAt: '2024-01-10 09:15' },
    { id: '2', clientName: 'Michael Ross', opposingParty: 'Smith Holdings', status: 'pending' },
    { id: '3', clientName: 'Amanda Chen', opposingParty: 'Delta LLC', status: 'conflict', checkedAt: '2024-01-10 08:30' },
  ];

  // Mock data for follow-ups
  const followUpItems: FollowUpItem[] = [
    { id: '1', clientName: 'David Kim', reason: 'Document collection pending', dueDate: '2024-01-12', priority: 'high', status: 'pending' },
    { id: '2', clientName: 'Sarah Jenkins', reason: 'Schedule consultation', dueDate: '2024-01-15', priority: 'medium', status: 'pending' },
    { id: '3', clientName: 'Robert Fox', reason: 'Insurance info needed', dueDate: '2024-01-11', priority: 'high', status: 'overdue' },
    { id: '4', clientName: 'Emily Watson', reason: 'Follow up on case status', dueDate: '2024-01-18', priority: 'low', status: 'pending' },
  ];

  // Mock data for AI call insights
  const callInsights: CallInsight[] = [
    {
      id: '1',
      callId: 'CALL-001',
      clientName: 'Sarah Jenkins',
      sentiment: 'positive',
      urgency: 'medium',
      keyTopics: ['Personal Injury', 'Car Accident', 'Insurance Claim'],
      summary: 'Client involved in rear-end collision. Has medical records and police report. Seeking representation for injury claim.',
      date: '2024-01-10',
    },
    {
      id: '2',
      callId: 'CALL-002',
      clientName: 'Michael Ross',
      sentiment: 'neutral',
      urgency: 'high',
      keyTopics: ['Criminal Defense', 'DUI', 'Court Date'],
      summary: 'Client facing DUI charges. Court date in 2 weeks. Needs immediate legal consultation.',
      date: '2024-01-10',
    },
    {
      id: '3',
      callId: 'CALL-003',
      clientName: 'Amanda Chen',
      sentiment: 'negative',
      urgency: 'high',
      keyTopics: ['Family Law', 'Divorce', 'Custody'],
      summary: 'Client seeking divorce representation. Custody dispute involved. Emotional situation.',
      date: '2024-01-09',
    },
  ];

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/10';
      case 'neutral': return 'text-gray-400 bg-gray-500/10';
      case 'negative': return 'text-red-400 bg-red-500/10';
    }
  };

  const getStatusIcon = (status: ConflictCheck['status']) => {
    switch (status) {
      case 'clear':
        return <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case 'conflict':
        return <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
      case 'pending':
        return <svg className="w-5 h-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Workflow Automation</h1>
        <p className="text-lg text-gray-400">Manage conflict checks, follow-ups, and AI-powered call analysis</p>
      </div>

      {/* Conflict Checks Section */}
      <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#2D3139]">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${conflictChecksEnabled ? 'bg-[#00FFC8]/20 border border-[#00FFC8]' : 'bg-[#2D3139] border border-[#3D4149]'}`}>
              <svg className={`w-6 h-6 ${conflictChecksEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Conflict Checks</h3>
              <p className="text-base text-gray-400">Automated conflict of interest screening</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{conflictChecks.filter(c => c.status === 'pending').length} pending</span>
            <div
              className={`toggle-switch ${conflictChecksEnabled ? 'active' : ''}`}
              onClick={() => setConflictChecksEnabled(!conflictChecksEnabled)}
            ></div>
          </div>
        </div>
        {conflictChecksEnabled && (
          <div className="p-6">
            <div className="space-y-3">
              {conflictChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="text-base text-white font-medium">{check.clientName}</p>
                      <p className="text-sm text-gray-500">vs. {check.opposingParty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {check.checkedAt && <span className="text-sm text-gray-500">{check.checkedAt}</span>}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      check.status === 'clear' ? 'bg-green-500/20 text-green-400' :
                      check.status === 'conflict' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full px-4 py-3 bg-[#0F1115] border border-[#2D3139] rounded-lg text-white text-base font-medium hover:border-[#00FFC8]/50 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Run New Conflict Check
            </button>
          </div>
        )}
      </div>

      {/* Follow-up Queue Section */}
      <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#2D3139]">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${followUpEnabled ? 'bg-[#00FFC8]/20 border border-[#00FFC8]' : 'bg-[#2D3139] border border-[#3D4149]'}`}>
              <svg className={`w-6 h-6 ${followUpEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Follow-up Queue</h3>
              <p className="text-base text-gray-400">Pending client follow-ups and reminders</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{followUpItems.filter(f => f.status !== 'completed').length} active</span>
            <div
              className={`toggle-switch ${followUpEnabled ? 'active' : ''}`}
              onClick={() => setFollowUpEnabled(!followUpEnabled)}
            ></div>
          </div>
        </div>
        {followUpEnabled && (
          <div className="p-6">
            <div className="space-y-3">
              {followUpItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'overdue' ? 'bg-red-400' :
                      item.priority === 'high' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="text-base text-white font-medium">{item.clientName}</p>
                      <p className="text-sm text-gray-500">{item.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Due: {item.dueDate}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    {item.status === 'overdue' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400">
                        Overdue
                      </span>
                    )}
                    <button className="p-2 hover:bg-[#2D3139] rounded-lg transition">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full px-4 py-3 bg-[#0F1115] border border-[#2D3139] rounded-lg text-white text-base font-medium hover:border-[#00FFC8]/50 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Follow-up Task
            </button>
          </div>
        )}
      </div>

      {/* AI Call Analysis Section */}
      <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#2D3139]">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${aiAnalysisEnabled ? 'bg-[#00FFC8]/20 border border-[#00FFC8]' : 'bg-[#2D3139] border border-[#3D4149]'}`}>
              <svg className={`w-6 h-6 ${aiAnalysisEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Call Analysis</h3>
              <p className="text-base text-gray-400">Automated insights from call transcripts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{callInsights.length} analyzed</span>
            <div
              className={`toggle-switch ${aiAnalysisEnabled ? 'active' : ''}`}
              onClick={() => setAiAnalysisEnabled(!aiAnalysisEnabled)}
            ></div>
          </div>
        </div>
        {aiAnalysisEnabled && (
          <div className="p-6">
            <div className="space-y-4">
              {callInsights.map((insight) => (
                <div key={insight.id} className="p-5 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(insight.sentiment)}`}>
                        {insight.sentiment}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(insight.urgency)}`}>
                        {insight.urgency} urgency
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{insight.date}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{insight.clientName}</h4>
                  <p className="text-base text-gray-400 mb-3">{insight.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {insight.keyTopics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#2D3139] text-gray-300 text-sm rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-[#0F1115] rounded-lg border border-[#2D3139] text-center">
                <p className="text-3xl font-bold text-[#00FFC8]">{callInsights.length}</p>
                <p className="text-sm text-gray-500 mt-1">Calls Analyzed</p>
              </div>
              <div className="p-4 bg-[#0F1115] rounded-lg border border-[#2D3139] text-center">
                <p className="text-3xl font-bold text-yellow-400">{callInsights.filter(i => i.urgency === 'high').length}</p>
                <p className="text-sm text-gray-500 mt-1">High Priority</p>
              </div>
              <div className="p-4 bg-[#0F1115] rounded-lg border border-[#2D3139] text-center">
                <p className="text-3xl font-bold text-green-400">{callInsights.filter(i => i.sentiment === 'positive').length}</p>
                <p className="text-sm text-gray-500 mt-1">Positive Sentiment</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowPanel;
