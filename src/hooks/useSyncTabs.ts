'use client';

import { useEffect, useRef } from 'react';
import { UIMessage } from 'ai';

type SyncEvent = {
  type: 'NEW_MESSAGE' | 'TYPING' | 'STOP_TYPING' | 'TITLE_CHANGE';
  threadId: string;
  data?: UIMessage | string;
};

/**
 * Custom hook for synchronizing chat state between multiple tabs
 * Uses the BroadcastChannel API to communicate between tabs
 */
export function useSyncTabs(threadId: string) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize the broadcast channel
  useEffect(() => {
    if (!threadId) return;
    
    // Create a unique channel name based on the thread ID
    const channelName = `t3chat-sync-${threadId}`;
    
    // Create the broadcast channel
    channelRef.current = new BroadcastChannel(channelName);
    
    // Clean up function
    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [threadId]);

  // Function to broadcast a new message to other tabs
  const broadcastNewMessage = (message: UIMessage) => {
    if (!channelRef.current) return;
    
    const event: SyncEvent = {
      type: 'NEW_MESSAGE',
      threadId,
      data: message
    };
    
    channelRef.current.postMessage(event);
  };

  // Function to broadcast typing status
  const broadcastTyping = (isTyping: boolean) => {
    if (!channelRef.current) return;
    
    const event: SyncEvent = {
      type: isTyping ? 'TYPING' : 'STOP_TYPING',
      threadId
    };
    
    channelRef.current.postMessage(event);
  };

  // Function to broadcast title changes
  const broadcastTitleChange = (title: string) => {
    if (!channelRef.current) return;
    
    const event: SyncEvent = {
      type: 'TITLE_CHANGE',
      threadId,
      data: title
    };
    
    channelRef.current.postMessage(event);
  };

  // Function to subscribe to events from other tabs
  const subscribeToEvents = (callback: (event: SyncEvent) => void) => {
    if (!channelRef.current) return () => {};
    
    const handleMessage = (event: MessageEvent) => {
      const syncEvent = event.data as SyncEvent;
      if (syncEvent.threadId === threadId) {
        callback(syncEvent);
      }
    };
    
    channelRef.current.addEventListener('message', handleMessage);
    
    // Return cleanup function
    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
    };
  };

  return {
    broadcastNewMessage,
    broadcastTyping,
    broadcastTitleChange,
    subscribeToEvents
  };
}