// ============================================
// App Layout - Main Navigation Shell
// ============================================
// Sidebar navigation with tenant branding

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Link2,
  FileText,
  Shield,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Palette,
  UserCog,
  FolderOpen,
  Menu,
  X,
} from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationCenter';

// ============================================
// TYPES
// ============================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: NavItem[];
}

interface Props {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  tenant?: {
    name: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  user?: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}

// ============================================
// NAVIGATION CONFIG
// ============================================

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: <Users className="w-5 h-5" />,
    href: '/leads',
    badge: 12,
  },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/conversations',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <Calendar className="w-5 h-5" />,
    href: '/calendar',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FolderOpen className="w-5 h-5" />,
    href: '/documents',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/analytics',
  },
];

const SETTINGS_ITEMS: NavItem[] = [
  {
    id: 'settings',
    label: 'General',
    icon: <Settings className="w-5 h-5" />,
    href: '/settings',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Link2 className="w-5 h-5" />,
    href: '/settings/integrations',
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: <Palette className="w-5 h-5" />,
    href: '/settings/branding',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <FileText className="w-5 h-5" />,
    href: '/settings/templates',
  },
  {
    id: 'team',
    label: 'Team',
    icon: <UserCog className="w-5 h-5" />,
    href: '/settings/team',
  },
];

// ============================================
// COMPONENT
// ============================================

export function AppLayout({ children, currentPath, onNavigate, tenant, user }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(
    currentPath.startsWith('/settings')
  );

  const primaryColor = tenant?.primaryColor || '#00FFC8';

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="h-8" />
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8" style={{ color: primaryColor }} />
                  <span className="font-bold text-white truncate">
                    {tenant?.name || 'Legal Intake'}
                  </span>
                </div>
              )}
            </div>
          )}
          {collapsed && (
            <Shield className="w-8 h-8 mx-auto" style={{ color: primaryColor }} />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 text-gray-400 hover:text-white rounded"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={currentPath === item.href}
                collapsed={collapsed}
                primaryColor={primaryColor}
                onClick={() => {
                  onNavigate(item.href);
                  setMobileMenuOpen(false);
                }}
              />
            ))}
          </div>

          {/* Settings Section */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            {!collapsed && (
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:text-white"
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Settings
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    settingsExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
            )}
            {(settingsExpanded || collapsed) && (
              <div className="space-y-1 px-2 mt-2">
                {SETTINGS_ITEMS.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    active={currentPath === item.href}
                    collapsed={collapsed}
                    primaryColor={primaryColor}
                    onClick={() => {
                      onNavigate(item.href);
                      setMobileMenuOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-800 p-4">
          {collapsed ? (
            <div className="flex justify-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-black font-medium flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-gray-500 text-sm truncate">
                  {user?.role || 'Admin'}
                </div>
              </div>
              <button className="p-1 text-gray-400 hover:text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-white">
              {getPageTitle(currentPath)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function NavLink({
  item,
  active,
  collapsed,
  primaryColor,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  primaryColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
      style={active ? { backgroundColor: `${primaryColor}20`, color: primaryColor } : {}}
      title={collapsed ? item.label : undefined}
    >
      {item.icon}
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ backgroundColor: primaryColor, color: '#000' }}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/leads': 'Leads',
    '/conversations': 'Conversations',
    '/calendar': 'Calendar',
    '/documents': 'Documents',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
    '/settings/integrations': 'Integrations',
    '/settings/branding': 'Branding',
    '/settings/templates': 'Templates',
    '/settings/team': 'Team',
  };

  // Check for dynamic routes
  if (path.startsWith('/leads/')) return 'Lead Details';
  if (path.startsWith('/conversations/')) return 'Conversation';

  return titles[path] || 'Dashboard';
}

export default AppLayout;
