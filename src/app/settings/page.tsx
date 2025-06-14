'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsLayout } from '@/components/settings/settings-layout';

export default function SettingsPage() {
  const router = useRouter();
  
  // Redirect to the account settings page by default
  useEffect(() => {
    router.push('/settings/account');
  }, [router]);

  return (
    <SettingsLayout>
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    </SettingsLayout>
  );
}