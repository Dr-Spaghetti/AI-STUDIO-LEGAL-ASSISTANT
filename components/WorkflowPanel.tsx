import React, { useState, useCallback } from 'react';

interface WorkflowState {
  conflictChecks: boolean;
  followUpQueue: boolean;
  aiCallAnalysis: boolean;
}

const WorkflowPanel: React.FC = () => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    conflictChecks: false,
    followUpQueue: true,
    aiCallAnalysis: true,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Toast component
  const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);
    return (
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
      }`}>
        {type === 'success' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="font-medium">{message}</span>
      </div>
    );
  };

  const toggleWorkflow = useCallback((key: keyof WorkflowState) => {
    setWorkflowState(prev => {
      const newValue = !prev[key];
      const labels = {
        conflictChecks: 'Conflict Checks',
        followUpQueue: 'Follow-up Queue',
        aiCallAnalysis: 'AI Call Analysis'
      };
      setToast({
        message: `${labels[key]} ${newValue ? 'enabled' : 'disabled'}`,
        type: 'success'
      });
      return { ...prev, [key]: newValue };
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-white mb-2">Workflow Automation</h1>
        <p className="text-[15px] text-[#9CA3AF]">Automated processes for conflict checks, follow-ups, and call analysis</p>
      </div>

      {/* Three Workflow Cards */}
      <div className="space-y-5">

        {/* Conflict Checks Card */}
        <div className="workflow-card">
          <div className="flex items-start gap-5">
            <div className="icon-container warning">
              <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-semibold text-white tracking-wide">CONFLICT CHECKS</h3>
                <div
                  className={`toggle-switch ${workflowState.conflictChecks ? 'active' : ''}`}
                  onClick={() => toggleWorkflow('conflictChecks')}
                  style={{ cursor: 'pointer' }}
                ></div>
              </div>
              <p className="text-[14px] text-[#6B7280] mb-6">Automated conflict of interest screening for new client intakes</p>

              {/* Empty State */}
              <div className="empty-state">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p>No pending conflict checks</p>
                <p className="text-[12px] mt-1">New intakes will automatically be screened for conflicts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Queue Card */}
        <div className="workflow-card">
          <div className="flex items-start gap-5">
            <div className="icon-container info">
              <svg className="w-6 h-6 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-semibold text-white tracking-wide">FOLLOW-UP QUEUE</h3>
                <div
                  className={`toggle-switch ${workflowState.followUpQueue ? 'active' : ''}`}
                  onClick={() => toggleWorkflow('followUpQueue')}
                  style={{ cursor: 'pointer' }}
                ></div>
              </div>
              <p className="text-[14px] text-[#6B7280] mb-6">Scheduled reminders and pending client follow-ups</p>

              {/* Empty State */}
              <div className="empty-state">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <p>No pending follow-ups</p>
                <p className="text-[12px] mt-1">Follow-ups will appear here when scheduled</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Call Analysis Card */}
        <div className="workflow-card">
          <div className="flex items-start gap-5">
            <div className="icon-container purple">
              <svg className="w-6 h-6 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-semibold text-white tracking-wide">AI CALL ANALYSIS</h3>
                <div
                  className={`toggle-switch ${workflowState.aiCallAnalysis ? 'active' : ''}`}
                  onClick={() => toggleWorkflow('aiCallAnalysis')}
                  style={{ cursor: 'pointer' }}
                ></div>
              </div>
              <p className="text-[14px] text-[#6B7280] mb-6">Automated insights and sentiment analysis from call transcripts</p>

              {/* Empty State */}
              <div className="empty-state">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
                <p>No calls analyzed yet</p>
                <p className="text-[12px] mt-1">Call insights will appear after calls are completed</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-5 mt-2">
        <div className="bg-[#1A1D24] border border-[#2D3139] rounded-xl p-5 text-center">
          <p className="text-[32px] font-bold text-white">0</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Pending Checks</p>
        </div>
        <div className="bg-[#1A1D24] border border-[#2D3139] rounded-xl p-5 text-center">
          <p className="text-[32px] font-bold text-white">0</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Follow-ups Due</p>
        </div>
        <div className="bg-[#1A1D24] border border-[#2D3139] rounded-xl p-5 text-center">
          <p className="text-[32px] font-bold text-white">0</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Calls Analyzed</p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default WorkflowPanel;
