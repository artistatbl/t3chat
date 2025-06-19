'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { UIMessage } from 'ai';

// Define event types for better type safety
export type SyncEventType = 'NEW_MESSAGE' | 'TYPING' | 'TITLE_CHANGE';
export type SyncEventPayload = UIMessage | boolean | string;

export type SyncEvent = {
  type: SyncEventType;
  payload: SyncEventPayload;
};

// Define a type for the broadcast reference data
export type BroadcastData = {
  type: SyncEventType;
  payload: SyncEventPayload;
  timestamp: number;
};

export function useSyncTabs(threadId: string) {
    // Use a ref to prevent re-creation of the channel on re-renders
    const channelRef = useRef<BroadcastChannel | null>(null);
    
    // Use a ref for the last message to prevent redundant broadcasts
    const lastBroadcastRef = useRef<BroadcastData | null>(null);
  
    // Initialize the broadcast channel only when threadId changes
    useEffect(() => {
      if (!threadId) return;
      
      // Create a unique channel name for this thread
      const channelName = `t3chat-sync-${threadId}`;
      
      // Only create a new channel if one doesn't exist or if threadId changed
      if (!channelRef.current) {
        channelRef.current = new BroadcastChannel(channelName);
      }
      
      // Clean up function to close the channel when component unmounts
      return () => {
        channelRef.current?.close();
        channelRef.current = null;
        lastBroadcastRef.current = null;
      };
    }, [threadId]);
    
    // Helper function to prevent redundant broadcasts
    const shouldBroadcast = useCallback((type: SyncEventType, payload: SyncEventPayload): boolean => {
      const now = Date.now();
      const lastBroadcast = lastBroadcastRef.current;
      
      // Always broadcast if no previous broadcast or different type
      if (!lastBroadcast || lastBroadcast.type !== type) {
        lastBroadcastRef.current = { type, payload, timestamp: now };
        return true;
      }
      
      // For typing status, only broadcast if changed
      if (type === 'TYPING' && lastBroadcast.payload !== payload) {
        lastBroadcastRef.current = { type, payload, timestamp: now };
        return true;
      }
      
      // For messages, check if content changed or it's been more than 200ms
      if (type === 'NEW_MESSAGE') {
        const isNewContent = JSON.stringify(lastBroadcast.payload) !== JSON.stringify(payload);
        const isTimeElapsed = now - lastBroadcast.timestamp >= 200;
        
        if (isNewContent || isTimeElapsed) {
          lastBroadcastRef.current = { type, payload, timestamp: now };
          return true;
        }
      }
      
      // For title changes, only broadcast if title changed
      if (type === 'TITLE_CHANGE' && lastBroadcast.payload !== payload) {
        lastBroadcastRef.current = { type, payload, timestamp: now };
        return true;
      }
      
      return false;
    }, []);
  
    // Optimized broadcast functions with throttling
    const broadcastNewMessage = useCallback((message: UIMessage) => {
      if (!channelRef.current || !message) return;
      
      if (shouldBroadcast('NEW_MESSAGE', message)) {
        channelRef.current.postMessage({ type: 'NEW_MESSAGE', payload: message });
      }
    }, [shouldBroadcast]);
  
    const broadcastTyping = useCallback((isTyping: boolean) => {
      if (!channelRef.current) return;
      
      if (shouldBroadcast('TYPING', isTyping)) {
        channelRef.current.postMessage({ type: 'TYPING', payload: isTyping });
      }
    }, [shouldBroadcast]);
  
    const broadcastTitleChange = useCallback((title: string) => {
      if (!channelRef.current || !title) return;
      
      if (shouldBroadcast('TITLE_CHANGE', title)) {
        channelRef.current.postMessage({ type: 'TITLE_CHANGE', payload: title });
      }
    }, [shouldBroadcast]);
    
    // Optimized event subscription
    const subscribeToEvents = useCallback((callback: (event: SyncEvent) => void) => {
      if (!channelRef.current) return undefined;
      
      const handleMessage = (event: MessageEvent<SyncEvent>) => {
        callback(event.data);
      };
      
      channelRef.current.onmessage = handleMessage;
      
      return () => {
        if (channelRef.current) {
          channelRef.current.onmessage = null;
        }
      };
    }, []);
  
    // Use useMemo to prevent unnecessary re-creation of the returned object
    return useMemo(() => ({
      broadcastNewMessage,
      broadcastTyping,
      broadcastTitleChange,
      subscribeToEvents
    }), [broadcastNewMessage, broadcastTyping, broadcastTitleChange, subscribeToEvents]);
  }
