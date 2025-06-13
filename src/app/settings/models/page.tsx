'use client';

import { ModelSettings } from '@/components/settings/model-settings';
import { SettingsLayout } from '@/components/settings/settings-layout';

export default function ModelsSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <ModelSettings />
      </div>
    </SettingsLayout>
  );
}