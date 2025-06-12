'use client';


export function UsageStats() {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Message Usage</h3>
        <span className="text-xs text-gray-400">Resets 06/20/2023</span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs">Standard</span>
          <span className="text-xs">58/1500</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2">
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
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div className="bg-pink-600 h-2 rounded-full" style={{ width: '28%' }}></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">72 messages remaining</p>
      </div>
    </div>
  );
}