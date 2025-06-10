import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Thread = {
  id: string;
  name: string;
  createdAt: Date;
};

type ThreadStore = {
  threads: Thread[];
  addThread: (id: string, name: string) => void;
  getThreadName: (id: string) => string | null;
};

export const useThreadStore = create<ThreadStore>()(
  persist<ThreadStore>(
    (set: (fn: (state: ThreadStore) => ThreadStore) => void, get: () => ThreadStore) => ({
      threads: [],
      addThread: (id: string, name: string) => {
        set((state) => ({
          threads: [...state.threads, { id, name, createdAt: new Date() }],
          addThread: state.addThread,
          getThreadName: state.getThreadName
        }));
      },
      getThreadName: (id: string) => {
        const thread = get().threads.find((t) => t.id === id);
        return thread?.name || null;
      },
    }),
    {
      name: 't3chat-threads',
    }
  )
);