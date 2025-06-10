'use client';

import APIKeyManager from '@/components/global/APIKeyForm';
import Chat from '@/components/global/Chat';
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeyStore } from './frontend/stores/APIKeyStore';
import { useModelStore } from './frontend/stores/ModelStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/global/ChatSidebar';

export default function HomePage() {
  const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());
  const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
  const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

  if (!isAPIKeysHydrated || !isModelStoreHydrated) return null;

  if (!hasRequiredKeys)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl pt-10 pb-44 mx-auto">
        <APIKeyManager />
      </div>
    );

  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex-1 relative">
        <Chat threadId={uuidv4()} initialMessages={[]} />
      </div>
    </SidebarProvider>
  );
}
