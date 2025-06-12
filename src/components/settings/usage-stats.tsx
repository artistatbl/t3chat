'use client';

import { Button } from '@/components/ui/button';

export function UsageStats() {
  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Message Usage</h3>
        <span className="text-xs text-gray-400">Resets 06/20/2023</span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">Standard</span>
          <span className="text-xs">58/1500</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-pink-600 h-2 rounded-full" style={{ width: '4%' }}></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">1442 messages remaining</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <span className="text-xs">Premium</span>
            <div className="ml-1 w-4 h-4 rounded-full bg-pink-600 flex items-center justify-center text-[10px]">P</div>
          </div>
          <span className="text-xs">28/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-pink-600 h-2 rounded-full" style={{ width: '28%' }}></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">72 messages remaining</p>
      </div>
      
      <Button variant="outline" size="sm" className="w-full flex items-center justify-center text-xs bg-transparent border border-pink-600 text-pink-600 hover:bg-pink-600/10">
        Buy more premium credits
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}