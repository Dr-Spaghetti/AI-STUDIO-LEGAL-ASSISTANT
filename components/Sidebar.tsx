import React, { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'viewer';
  avatarUrl?: string;
}

interface Settings {
  firmName?: string;
  logoUrl?: string;
  brandPrimaryColor?: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
  onLogout?: () => void;
  settings?: Settings;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, settings }) => {
  const firmName = settings?.firmName || 'TED LAW FIRM';
  const logoUrl = settings?.logoUrl;
  const primaryColor = settings?.brandPrimaryColor || '#00FFC8';
  const [showUserMenu, setShowUserMenu] = useState(false);
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
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={firmName}
            className="h-10 w-10 object-contain mr-3 rounded-lg shrink-0"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0"
            style={{
              backgroundColor: `${primaryColor}1a`,
              border: `1px solid ${primaryColor}`
            }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: primaryColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-white font-bold text-sm tracking-wider truncate">
            {firmName.toUpperCase()}
          </h1>
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
                  ? 'border-l-2'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E2128]'
                }`}
              style={isActive ? {
                background: 'linear-gradient(to right, var(--primary-accent, #00FFC8)33, transparent)',
                color: 'var(--primary-accent, #00FFC8)',
                borderLeftColor: 'var(--primary-accent, #00FFC8)'
              } : undefined}
            >
              <Icon name={item.icon} active={isActive} />
              <span className="text-[15px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User/Footer Area */}
      <div className="p-6 border-t border-[#1E2128] relative">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm"
                style={{
                  background: `linear-gradient(to bottom right, var(--primary-accent, #00FFC8), color-mix(in srgb, var(--primary-accent, #00FFC8) 60%, black))`
                }}
              >
                  {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TL'}
              </div>
              <div className="flex-1">
                  <p className="text-sm text-white font-medium">{user?.name || 'Staff User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'View Profile'}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1A1D24] border border-[#2D3139] rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[#9CA3AF] hover:bg-[#2D3139] hover:text-white flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-[#9CA3AF] hover:bg-[#2D3139] hover:text-white flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Team Management
                </button>
              )}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 border-t border-[#2D3139]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

// Simple Icon Helper
const Icon = ({ name, active }: { name: string, active: boolean }) => {
    const style = active ? { color: 'var(--primary-accent, #00FFC8)' } : undefined;
    const className = active ? "w-5 h-5" : "w-5 h-5 text-gray-500 group-hover:text-white";

    switch(name) {
        case 'grid':
            return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
        case 'bar-chart':
            return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
        case 'clock':
            return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
        case 'workflow':
            return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>;
        case 'shield':
            return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
        case 'settings':
            return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
        default:
            return null;
    }
}

export default Sidebar;
