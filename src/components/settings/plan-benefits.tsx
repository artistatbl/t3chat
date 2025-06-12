'use client';

import { Button } from '@/components/ui/button';

export function PlanBenefits() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-6">Pro Plan Benefits</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-semibold">Access to All Models</h3>
          </div>
          <p className="text-sm text-gray-400 ml-8">
            Get access to our full suite of models including Claude, GPT-4, and more!
          </p>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-semibold">Generous Limits</h3>
          </div>
          <p className="text-sm text-gray-400 ml-8">
            Receive 1500 standard credits per month, plus 100 premium credits per month.
          </p>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-semibold">Priority Support</h3>
          </div>
          <p className="text-sm text-gray-400 ml-8">
            Get faster responses and dedicated assistance from the T3 team whenever you need help!
          </p>
        </div>
      </div>
      
      <Button className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white">
        Manage Subscription
      </Button>
      
      <p className="text-xs text-gray-500 mt-2">
        *Premium credits are used for GPT Image Gen, Claude Sonnet, and Gemini 3. Additional Premium credits can be purchased separately.
      </p>
    </div>
  );
}