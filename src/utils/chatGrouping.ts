import { useMemo } from 'react';

// Interface for chat item
export interface ChatItem {
  uuid: string;
  userId: string;
  title?: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  _id: string;
  parentChatId?: string; // UUID of parent chat if this is a branch
  branchDepth?: number; // How many levels deep this branch is
}

// Interface for grouped chats
export interface GroupedChats {
  today: ChatItem[];
  yesterday: ChatItem[];
  lastWeek: ChatItem[];
  lastMonth: ChatItem[];
  older: ChatItem[];
}

/**
 * Hook to group chats by date ranges (today, yesterday, last week, last month, older)
 * @param chats Array of chat items to group
 * @returns Object containing grouped chat arrays
 */
export function useGroupedChats(chats: ChatItem[] | undefined): GroupedChats {
  return useMemo(() => {
    if (!chats) return { today: [], yesterday: [], lastWeek: [], lastMonth: [], older: [] };
    
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const oneMonthMs = 30 * oneDayMs;
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    
    const yesterdayMs = todayMs - oneDayMs;
    const lastWeekMs = todayMs - oneWeekMs;
    const lastMonthMs = todayMs - oneMonthMs;
    
    return chats.reduce((groups: GroupedChats, chat: ChatItem) => {
      const chatDate = chat.createdAt;
      
      if (chatDate >= todayMs) {
        groups.today.push(chat);
      } else if (chatDate >= yesterdayMs) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeekMs) {
        groups.lastWeek.push(chat);
      } else if (chatDate >= lastMonthMs) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
      
      return groups;
    }, { today: [], yesterday: [], lastWeek: [], lastMonth: [], older: [] });
  }, [chats]);
}