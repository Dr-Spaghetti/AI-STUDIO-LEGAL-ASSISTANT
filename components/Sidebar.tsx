import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
    { id: 'history', label: 'Case History', icon: 'clock' },
    { id: 'workflow', label: 'Workflow', icon: 'workflow' },
    { id: 'compliance', label: 'Compliance', icon: 'shield' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="w-64 bg-[#050505] border-r border-[#1E2128] flex flex-col h-full shrink-0">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-[#1E2128]">
        <div className="w-10 h-10 rounded-lg bg-[#00FFC8]/10 border border-[#00FFC8] flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <div>
          <h1 className="text-white font-bold text-base tracking-wider">TED LAW FIRM</h1>
          <p className="text-xs text-gray-500 font-medium tracking-widest">AI RECEPTIONIST</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-[#00FFC8]/20 to-transparent text-[#00FFC8] border-l-2 border-[#00FFC8]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E2128]'
                }`}
            >
              <Icon name={item.icon} active={isActive} />
              <span className="text-[15px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User/Footer Area */}
      <div className="p-6 border-t border-[#1E2128]">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#008F7A] flex items-center justify-center text-black font-bold text-sm">
                  TL
              </div>
              <div>
                  <p className="text-sm text-white font-medium">Ted Law Admin</p>
                  <p className="text-xs text-gray-500">View Profile</p>
              </div>
          </div>
      </div>
    </div>
  );
};

// Simple Icon Helper
const Icon = ({ name, active }: { name: string, active: boolean }) => {
    const colorClass = active ? "text-[#00FFC8]" : "text-gray-500 group-hover:text-white";

    switch(name) {
        case 'grid':
            return <svg className={`w-5 h-5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
        case 'bar-chart':
            return <svg className={`w-5 h-5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
        case 'clock':
            return <svg className={`w-5 h-5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
        case 'workflow':
            return <svg className={`w-5 h-5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>;
        case 'shield':
            return <svg className={`w-5 h-5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
        case 'settings':
            return <svg className={`w-5 h-5 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
        default:
            return null;
    }
}

export default Sidebar;
