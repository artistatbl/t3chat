'use client';

import { useEffect, useRef, useCallback } from 'react';
import { UIMessage } from 'ai';

export function useSyncTabs(threadId: string) {
    const channelRef = useRef<BroadcastChannel | null>(null);
  
    useEffect(() => {
      if (!threadId) return;
      
      const channelName = `t3chat-sync-${threadId}`;
      channelRef.current = new BroadcastChannel(channelName);
      
      return () => {
        channelRef.current?.close();
        channelRef.current = null;
      };
    }, [threadId]);
  
    const broadcastNewMessage = useCallback((message: UIMessage) => {
      channelRef.current?.postMessage({ type: 'NEW_MESSAGE', payload: message });
    }, []);
  
    const broadcastTyping = useCallback((isTyping: boolean) => {
      channelRef.current?.postMessage({ type: 'TYPING', payload: isTyping });
    }, []);
  
    const broadcastTitleChange = useCallback((title: string) => {
      channelRef.current?.postMessage({ type: 'TITLE_CHANGE', payload: title });
    }, []);
    
    const subscribeToEvents = useCallback((callback: (event: { type: string; payload: unknown }) => void) => {
      if (!channelRef.current) return;
      
      channelRef.current.onmessage = (event) => callback(event.data);
      
      return () => {
        if (channelRef.current) {
          channelRef.current.onmessage = null;
        }
      };
    }, []);
  
    return {
      broadcastNewMessage,
      broadcastTyping,
      broadcastTitleChange,
      subscribeToEvents
    };
  }