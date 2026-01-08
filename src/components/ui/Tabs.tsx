import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  children?: React.ReactNode;
  variant?: 'default' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  onChange,
  children,
  variant = 'default',
}) => {
  const [activeTab, setActiveTab] = useState(
    defaultTabId || tabs[0]?.id || ''
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const tabClasses = {
    default:
      'px-4 py-2 text-sm font-semibold border-b-2 transition-colors',
    pills:
      'px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
  };

  const activeTabClasses = {
    default:
      'border-[#00FFA3] text-[#00FFA3] bg-transparent',
    pills:
      'bg-[#00FFA3] text-black',
  };

  const inactiveTabClasses = {
    default:
      'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300',
    pills:
      'bg-[#2D3139] text-gray-300 hover:bg-[#3D4149]',
  };

  return (
    <div className="w-full">
      {/* Tab List */}
      <div
        className={`flex gap-2 ${
          variant === 'default'
            ? 'border-b border-[#2D3139]'
            : 'bg-[#16181D] p-2 rounded-lg'
        }`}
        role="tablist"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 ${tabClasses[variant]} ${
              activeTab === tab.id
                ? activeTabClasses[variant]
                : inactiveTabClasses[variant]
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-[#00FFA3]/20 text-[#00FFA3]">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {children && (
        <div className="mt-4" role="tabpanel">
          {children}
        </div>
      )}
    </div>
  );
};
