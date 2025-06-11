'use client';

import Chat from '@/components/global/Chat';
import { UIMessage } from 'ai';

interface ChatThreadPageProps {
  params: { threadId: string };
}

export default function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = params;
  const initialMessages: UIMessage[] = [];

  // Sidebar is now handled in the root layout via SidebarWrapper
  return <Chat threadId={threadId} initialMessages={initialMessages} />;
}