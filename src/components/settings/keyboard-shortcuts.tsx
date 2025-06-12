'use client';
import React from 'react';


export function KeyboardShortcuts() {
  const shortcuts = [
    { action: 'Search', keys: ['⌘', 'K'] },
    { action: 'New Chat', keys: ['⌘', 'Shift', 'N'] },
    { action: 'Toggle Sidebar', keys: ['⌘', 'B'] },
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-8">
      <h3 className="text-sm font-medium mb-3">Keyboard Shortcuts</h3>
      
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex justify-between items-center mb-2 text-sm">
          <span>{shortcut.action}</span>
          <div className="flex items-center">
            {shortcut.keys.map((key, keyIndex) => (
              <React.Fragment key={keyIndex}>
                {keyIndex > 0 && <span className="mx-1">+</span>}
                <span className="bg-gray-800 px-2 py-0.5 rounded text-xs">{key}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}