"use client";

import { PrivacySettings } from "@/components/settings/privacy-settings";
import { SettingsLayout } from "@/components/settings/settings-layout";

export default function ModelsSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <PrivacySettings />
      </div>
    </SettingsLayout>
  );
}
