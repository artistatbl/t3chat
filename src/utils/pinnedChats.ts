import { useMemo } from 'react';
import { ChatItem } from './chatGrouping';

/**
 * Hook to separate pinned and unpinned chats
 * @param chats Array of chat items to process
 * @returns Object containing pinned and unpinned chat arrays
 */
export function usePinnedChats(chats: ChatItem[] | undefined) {
  return useMemo(() => {
    if (!chats) return { pinned: [], unpinned: [] };
    
    return chats.reduce(
      (result: { pinned: ChatItem[]; unpinned: ChatItem[] }, chat: ChatItem) => {
        if (chat.pinned) {
          result.pinned.push(chat);
        } else {
          result.unpinned.push(chat);
        }
        return result;
      },
      { pinned: [], unpinned: [] }
    );
  }, [chats]);
}