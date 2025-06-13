'use client';

import { SettingsLayout } from '@/components/settings/settings-layout';

export default function AppearanceSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <p className="text-gray-400">Customize your chat interface and theme preferences.</p>
        {/* Add appearance settings here */}
      </div>
    </SettingsLayout>
  );
}