# Live Tabs Sync Feature

The live tabs sync feature in T3Chat allows users to synchronize their chat sessions across multiple browser tabs or devices in real-time. This ensures a consistent user experience, as any changes made in one tab are immediately reflected in all other connected tabs.

## Core Implementation

The synchronization system is built around the browser's native **BroadcastChannel API**, which enables cross-tab communication within the same origin. This implementation is lightweight, efficient, and doesn't require additional server resources for client-side synchronization.

### Key Components

#### 1. `useSyncTabs` Hook

The central component of the synchronization system is the custom `useSyncTabs` hook located in `src/hooks/useSyncTabs.ts`. This hook:

- Creates a unique BroadcastChannel for each chat thread
- Provides methods to broadcast and receive different types of events
- Handles cleanup when components unmount

```typescript
export function useSyncTabs(threadId: string) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize the broadcast channel with a unique name per thread
  useEffect(() => {
    if (!threadId) return;
    
    const channelName = `t3chat-sync-${threadId}`;
    channelRef.current = new BroadcastChannel(channelName);
    
    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [threadId]);

  // Methods for broadcasting different types of events
  const broadcastNewMessage = (message: UIMessage) => {...};
  const broadcastTyping = (isTyping: boolean) => {...};
  const broadcastTitleChange = (title: string) => {...};
  
  // Method to subscribe to events from other tabs
  const subscribeToEvents = (callback: (event: SyncEvent) => void) => {...};

  return {
    broadcastNewMessage,
    broadcastTyping,
    broadcastTitleChange,
    subscribeToEvents
  };
}
```

#### 2. Event Types

The synchronization system supports several event types:

```typescript
type SyncEvent = {
  type: 'NEW_MESSAGE' | 'TYPING' | 'STOP_TYPING' | 'TITLE_CHANGE';
  threadId: string;
  data?: UIMessage | string;
};
```

- `NEW_MESSAGE`: Broadcasts a new message (user or assistant) to all tabs
- `TYPING`: Indicates a user is currently typing in another tab
- `STOP_TYPING`: Indicates a user has stopped typing
- `TITLE_CHANGE`: Broadcasts when a chat title is updated

## Integration with Chat Components

### Chat Component Integration

The `Chat` component (`src/components/chat/Chat.tsx`) integrates with the synchronization system by:

1. Initializing the sync hook:
   ```typescript
   const { broadcastNewMessage, subscribeToEvents } = useSyncTabs(threadId);
   ```

2. Subscribing to events from other tabs:
   ```typescript
   useEffect(() => {
     if (!threadId) return;
     
     const unsubscribe = subscribeToEvents((event) => {
       switch (event.type) {
         case 'NEW_MESSAGE':
           // Process the incoming message
           const newMessage = event.data as UIMessage & { isFinalMessage?: boolean };
           
           setMessages((prev) => {
             // Check if message already exists
             const existingMessageIndex = prev.findIndex(msg => msg.id === newMessage.id);
             
             if (existingMessageIndex >= 0) {
               // Update existing message if needed
               if (newMessage.isFinalMessage || 
                   !(prev[existingMessageIndex] as UIMessage & 
                     { isFinalMessage?: boolean }).isFinalMessage) {
                 const updatedMessages = [...prev];
                 updatedMessages[existingMessageIndex] = newMessage;
                 return updatedMessages;
               }
               return prev;
             }
             
             // Add new message if it doesn't exist
             return [...prev, newMessage];
           });
           break;
           
         case 'TYPING':
           // Could implement typing indicator here
           break;
           
         case 'TITLE_CHANGE':
           // Title changes are handled by Convex automatically
           break;
       }
     });
     
     return unsubscribe;
   }, [threadId, subscribeToEvents]);
   ```

3. Broadcasting messages to other tabs:
   ```typescript
   // In the append function
   broadcastNewMessage(message);
   ```

4. Implementing throttling for streaming messages to prevent overwhelming the channel:
   ```typescript
   const currentTime = Date.now();
   // Only broadcast every 200ms to avoid overwhelming the channel
   if (!lastBroadcastTime.current || currentTime - lastBroadcastTime.current >= 200) {
     lastBroadcastTime.current = currentTime;
     broadcastNewMessage(messageToSend);
   }
   ```

### ChatInput Component Integration

The `ChatInput` component (`src/components/chat/ChatInput.tsx`) integrates with the synchronization system by:

1. Initializing the sync hook:
   ```typescript
   const { broadcastTyping, broadcastTitleChange } = useSyncTabs(threadId);
   ```

2. Broadcasting typing status:
   ```typescript
   useEffect(() => {
     // Only broadcast if there's actual input
     if (input.trim().length > 0) {
       broadcastTyping(true);
       
       // Set a timeout to broadcast stop typing after 2 seconds of inactivity
       const timeout = setTimeout(() => {
         broadcastTyping(false);
       }, 2000);
       
       return () => clearTimeout(timeout);
     } else {
       broadcastTyping(false);
     }
   }, [input, broadcastTyping]);
   ```

3. Broadcasting title changes:
   ```typescript
   // After generating a title
   if (title) {
     broadcastTitleChange(title);
   }
   ```

## Persistence with Convex

While the BroadcastChannel API handles real-time synchronization between tabs, the application uses Convex as its backend database for persistent storage. The `useConvexChat` hook (`src/hooks/useConvexChat.ts`) handles:

1. Saving messages to the database
2. Retrieving messages when a tab is first loaded
3. Updating chat titles

This dual approach ensures both real-time updates and persistent storage:

- **BroadcastChannel**: Provides immediate updates to all open tabs
- **Convex**: Ensures data persistence and synchronization across devices

## Complete Synchronization Flow

### When a User Sends a Message

1. User types a message in the `ChatInput` component
2. While typing, `broadcastTyping(true)` is called to notify other tabs
3. When the message is sent:
   - The message is added to the local state
   - `saveUserMessage()` saves it to Convex
   - `broadcastNewMessage()` sends it to other tabs
4. In other tabs:
   - The `subscribeToEvents` callback receives the message
   - The message is added to the local state if it doesn't exist
   - The UI updates to show the new message

### When an AI Response is Streaming

1. As chunks of the AI response arrive:
   - The local message state is updated
   - `broadcastNewMessage()` is called with throttling (every 200ms)
2. In other tabs:
   - Partial updates are received and applied
   - The streaming effect is simulated across all tabs
3. When streaming completes:
   - The final message is saved to Convex
   - A final `broadcastNewMessage()` is called with the complete message

### When a Chat Title Changes

1. When a title is generated or changed:
   - `saveChatTitle()` updates it in Convex
   - `broadcastTitleChange()` notifies other tabs
2. In other tabs:
   - The title update is received
   - Convex also automatically syncs the title change

## Performance Considerations

The implementation includes several optimizations:

1. **Throttling for streaming messages**: Updates are broadcast at most every 200ms during streaming to prevent overwhelming the channel
2. **Efficient message updates**: Messages are only updated if they don't exist or if the new version is more complete
3. **Cleanup on unmount**: BroadcastChannel connections are properly closed when components unmount
4. **Unique channels per thread**: Each chat thread has its own dedicated channel to minimize message processing

## Conclusion

The live tabs sync feature in T3Chat provides a seamless user experience by ensuring that chat sessions remain synchronized across multiple browser tabs. By combining the browser's BroadcastChannel API for real-time updates with Convex for persistence, the application achieves efficient and reliable synchronization without requiring complex server-side infrastructure for this specific feature.