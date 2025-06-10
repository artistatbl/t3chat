'use client';

import Chat from '@/components/global/Chat';
import { v4 as uuidv4 } from 'uuid';
import { useAPIKeyStore } from './frontend/stores/APIKeyStore';
import { useModelStore } from './frontend/stores/ModelStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/global/ChatSidebar';

export default function HomePage() {
  const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
  const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

  if (!isAPIKeysHydrated || !isModelStoreHydrated) return null;

  // Always show the chat interface - API key check moved to ChatInput
  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex-1 relative">
        <Chat threadId={uuidv4()} initialMessages={[]} />
      </div>
    </SidebarProvider>
  );
}
