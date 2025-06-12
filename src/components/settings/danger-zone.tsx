'use client';

import { Button } from '@/components/ui/button';

export function DangerZone() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
      <p className="text-sm text-gray-400 mb-4">
        Permanently delete your account and all associated data.
      </p>
      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
        Delete Account
      </Button>
    </div>
  );
}