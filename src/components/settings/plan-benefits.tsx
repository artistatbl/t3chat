'use client';

import { Button } from '@/components/ui/button';

export function ProjectFeatures() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Project Features
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            title: 'Multiple Model Support',
            description: 'Compatible with various AI models including Claude, GPT-4, and more!'
          },
          {
            title: 'Flexible Usage',
            description: 'Configure your own usage limits based on your API provider settings.'
          },
          {
            title: 'Community Support',
            description: 'Get help from our active open source community through GitHub issues and discussions!'
          }
        ].map((feature, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg border border-border hover:border-primary transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-medium text-base">
                {feature.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button 
          className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Get Started
        </Button>
        
        <p className="mt-3 text-xs text-muted-foreground">
          *Some features may require API keys from third-party providers.
        </p>
      </div>
    </div>
  );
}