'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { AIModel, getModelConfig, getAvailableModels } from '@/lib/models';
import { cn } from '@/lib/utils';

const PureChatModelDropdown = () => {
  const getKey = useAPIKeyStore((state) => state.getKey);
  const { selectedModel, setModel } = useModelStore();
  const [searchQuery, setSearchQuery] = useState('');

  const availableModels = useMemo(() => getAvailableModels(), []);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return availableModels;
    const query = searchQuery.toLowerCase();
    return availableModels.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
    );
  }, [availableModels, searchQuery]);

  const hasApiKeyForModel = useCallback(
    (model: AIModel) => {
      const modelConfig = getModelConfig(model);
      const apiKey = getKey(modelConfig.provider);
      return !!apiKey;
    },
    [getKey]
  );

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'flex items-center gap-3 h-7.5 text-sm rounded-lg transition-all duration-200',


            )}
            aria-label={`Selected model: ${selectedModel}`}
          >
            <span className="font-semibold tracking-tight">{selectedModel}</span>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(
            'w-[320px] sm:w-[380px] p-3 mt-2',
            'bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl',
            'border border-zinc-200/20 dark:border-zinc-700/50',
            'shadow-lg rounded-xl'
          )}
          align="start"
          sideOffset={8}
        >
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-9 pr-4 py-2.5 text-sm rounded-lg',
                  'bg-zinc-100/50 dark:bg-zinc-800/50',
                  'border border-zinc-200/20 dark:border-zinc-700/50',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                  'placeholder:text-zinc-400 dark:placeholder:text-zinc-500'
                )}
              />
            </div>
            <div className="max-h-[320px] overflow-y-auto pr-1 -mr-1">
              <div className="space-y-1">
                {filteredModels.map((modelInfo) => {
                  const hasApiKey = hasApiKeyForModel(modelInfo.id);
                  return (
                    <DropdownMenuItem
                      key={modelInfo.id}
                      onSelect={() => setModel(modelInfo.id)}
                      className={cn(
                        'flex items-center justify-between gap-3 p-3 text-sm rounded-lg transition-colors',
                        'cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70',
                        'focus:bg-zinc-100/80 dark:focus:bg-zinc-800/80',
                        selectedModel === modelInfo.id && 'bg-zinc-100/50 dark:bg-zinc-800/50'
                      )}
                    >
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium tracking-tight truncate">{modelInfo.name}</span>
                          {!hasApiKey && (
                            <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                              No API key
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {modelInfo.description}
                        </span>
                      </div>
                      {selectedModel === modelInfo.id && (
                        <Check
                          className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0"
                          aria-label="Selected"
                        />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const ChatModelDropdown = memo(PureChatModelDropdown);