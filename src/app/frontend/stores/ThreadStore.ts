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
  persist(
    (set, get) => ({
      threads: [],
      addThread: (id: string, name: string) => {
        set((state) => ({
          threads: [...state.threads, { id, name, createdAt: new Date() }],
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