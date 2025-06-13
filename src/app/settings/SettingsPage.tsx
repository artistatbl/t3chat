'use client';

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { SettingsLayout } from '@/components/settings/settings-layout';
import { ProjectFeatures } from '@/components/settings/plan-benefits';
import { DangerZone } from '@/components/settings/danger-zone';
import { ModelSettings } from '@/components/settings/model-settings';

export default function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  
  // Redirect to account tab if no tab is specified
  useEffect(() => {
    if (!tab) {
      navigate('/settings/account', { replace: true });
    }
  }, [tab, navigate]);

  // Render the appropriate content based on the tab parameter
  const renderContent = () => {
    switch (tab) {
      case 'account':
        return (
          <div className="space-y-6">
            <ProjectFeatures />
            <DangerZone />
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <p className="text-gray-400">Customize your chat interface and theme preferences.</p>
            {/* Add appearance settings here */}
          </div>
        );
      case 'models':
        return (
          <div className="space-y-6">
            <ModelSettings />
          </div>
        );
      case 'apikey':
        return (
          <div className="space-y-6">
            {/* Import and use ApiKeyManager component here */}
            <p className="text-gray-400">Manage your API keys.</p>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        );
    }
  };

  return (
    <SettingsLayout>
      {renderContent()}
    </SettingsLayout>
  );
}