// ============================================
// App Router - Route Configuration
// ============================================
// Central routing with lazy loading

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppLayout } from './AppLayout';

// ============================================
// LAZY LOADED COMPONENTS
// ============================================

// Dashboard
const Dashboard = lazy(() => import('../dashboard/Dashboard'));

// Leads
const LeadList = lazy(() => import('../leads/LeadList'));
const LeadDetailView = lazy(() => import('../leads/LeadDetailView'));

// Conversations
const ConversationList = lazy(() => import('../conversations/ConversationList'));
const ConversationView = lazy(() => import('../conversations/ConversationView'));

// Documents
const DocumentManager = lazy(() => import('../documents/DocumentManager'));

// Analytics
const AnalyticsDashboard = lazy(() => import('../analytics/AnalyticsDashboard'));

// Settings
const GeneralSettings = lazy(() => import('../settings/GeneralSettings'));
const IntegrationSettings = lazy(() => import('../settings/IntegrationSettings'));
const BrandingSettings = lazy(() => import('../settings/BrandingSettings'));
const TemplateManager = lazy(() => import('../settings/TemplateManager'));
const TeamManagement = lazy(() => import('../settings/TeamManagement'));

// ============================================
// LOADING COMPONENT
// ============================================

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );
}

// ============================================
// ERROR BOUNDARY
// ============================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-400 mb-4">Something went wrong loading this page.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// ============================================
// ROUTER COMPONENT
// ============================================

interface Props {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    avatarUrl?: string;
  };
}

export function AppRouter({ tenant, user }: Props) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation function
  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  // Route matching
  const renderRoute = () => {
    // Dashboard
    if (currentPath === '/') {
      return <Dashboard />;
    }

    // Leads
    if (currentPath === '/leads') {
      return <LeadList onSelectLead={(id) => navigate(`/leads/${id}`)} />;
    }
    if (currentPath.startsWith('/leads/')) {
      const leadId = currentPath.split('/')[2];
      return <LeadDetailView leadId={leadId} onBack={() => navigate('/leads')} />;
    }

    // Conversations
    if (currentPath === '/conversations') {
      return <ConversationList onSelectConversation={(id) => navigate(`/conversations/${id}`)} />;
    }
    if (currentPath.startsWith('/conversations/')) {
      const conversationId = currentPath.split('/')[2];
      return <ConversationView conversationId={conversationId} onBack={() => navigate('/conversations')} />;
    }

    // Documents
    if (currentPath === '/documents') {
      return <DocumentManager tenantId={tenant?.id || ''} />;
    }

    // Calendar - placeholder
    if (currentPath === '/calendar') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Calendar integration coming soon</p>
        </div>
      );
    }

    // Analytics
    if (currentPath === '/analytics') {
      return <AnalyticsDashboard />;
    }

    // Settings
    if (currentPath === '/settings') {
      return <GeneralSettings tenantId={tenant?.id || ''} />;
    }
    if (currentPath === '/settings/integrations') {
      return <IntegrationSettings tenantId={tenant?.id || ''} tenantSlug={tenant?.slug || ''} />;
    }
    if (currentPath === '/settings/branding') {
      return <BrandingSettings tenantId={tenant?.id || ''} />;
    }
    if (currentPath === '/settings/templates') {
      return <TemplateManager tenantId={tenant?.id || ''} />;
    }
    if (currentPath === '/settings/team') {
      return <TeamManagement tenantId={tenant?.id || ''} />;
    }

    // 404
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-4xl font-bold text-white mb-2">404</p>
        <p className="text-gray-400 mb-4">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400"
        >
          Go to Dashboard
        </button>
      </div>
    );
  };

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={navigate}
      tenant={tenant}
      user={user}
    >
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>{renderRoute()}</Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}

export default AppRouter;
