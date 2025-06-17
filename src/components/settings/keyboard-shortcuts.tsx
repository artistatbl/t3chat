'use client';
import React from 'react';


export function KeyboardShortcuts() {
  const shortcuts = [
    { action: 'Search', keys: ['⌘', 'K'] },
    { action: 'New Chat', keys: ['⌘', 'Shift', 'N'] },
    { action: 'Toggle Sidebar', keys: ['⌘', 'B'] },
  ];

  return (

      <div className="space-y-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <span className="text-sm font-medium">{shortcut.action}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <React.Fragment key={keyIndex}>
                  {keyIndex > 0 && <span className="text-xs text-muted-foreground mx-1">+</span>}
                  <kbd className="bg-background border border-border px-2 py-1 rounded text-xs font-mono shadow-sm">
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

  );
}