'use client';

import { ApiKeyManager } from '@/components/settings/apikey';
import { SettingsLayout } from '@/components/settings/settings-layout';

export default function ApiKeySettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <ApiKeyManager />
      </div>
    </SettingsLayout>
  );
}