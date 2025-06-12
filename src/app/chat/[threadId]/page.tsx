'use client';

import Chat from '@/components/chat/Chat';
import ChatLayout from '@/components/chat/ChatLayout';
import { UIMessage } from 'ai';
import { useParams } from 'react-router';

export default function ChatThreadPage() {
  const { id } = useParams(); // Get the id parameter from the URL
  const threadId = id || ''; // Use the id from the URL
  const initialMessages: UIMessage[] = [];

  return (
    <ChatLayout>
      <Chat threadId={threadId} initialMessages={initialMessages} />
    </ChatLayout>

  );
}