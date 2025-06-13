'use client';

import { ProjectFeatures } from '@/components/settings/plan-benefits';
import { DangerZone } from '@/components/settings/danger-zone';
import { SettingsLayout } from '@/components/settings/settings-layout';

export default function AccountSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <ProjectFeatures />
        <DangerZone />
      </div>
    </SettingsLayout>
  );
}