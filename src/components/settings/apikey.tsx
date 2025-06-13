'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAPIKeyStore, PROVIDERS, Provider } from '@/app/stores/APIKeyStore';
import { AlertCircle, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAvailableModels } from '@/lib/models';

export function ApiKeyManager() {
  const { keys, setKeys } = useAPIKeyStore(); // Removed unused 'getKey'
  
  // Initialize state with proper default values instead of empty objects
  const initialApiKeys = {} as Record<Provider, string>;
  const initialShowKeys = {} as Record<Provider, boolean>;
  const initialLoading = {} as Record<Provider, boolean>;
  
  PROVIDERS.forEach(provider => {
    initialApiKeys[provider] = keys[provider] || '';
    initialShowKeys[provider] = false;
    initialLoading[provider] = false;
  });
  
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>(initialApiKeys);
  const [showKeys, setShowKeys] = useState<Record<Provider, boolean>>(initialShowKeys);
  const [isLoading, setIsLoading] = useState<Record<Provider, boolean>>(initialLoading);
  const models = getAvailableModels();
  
  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider]?.push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  // Update state when keys change from store
  useEffect(() => {
    const updatedApiKeys = { ...apiKeys };
    let hasChanges = false;
    
    PROVIDERS.forEach(provider => {
      if (updatedApiKeys[provider] !== keys[provider]) {
        updatedApiKeys[provider] = keys[provider] || '';
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setApiKeys(updatedApiKeys);
    }
  }, [keys, apiKeys]);

  const handleSaveKey = (provider: Provider) => {
    setIsLoading(prev => ({ ...prev, [provider]: true }));
    
    // Simulate API call delay
    setTimeout(() => {
      setKeys({ [provider]: apiKeys[provider] });
      setIsLoading(prev => ({ ...prev, [provider]: false }));
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved successfully`);
    }, 500);
  };

  const handleClearKey = (provider: Provider) => {
    setApiKeys(prev => ({ ...prev, [provider]: '' }));
    setKeys({ [provider]: '' });
    toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key removed`);
  };

  const toggleShowKey = (provider: Provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <Card className="w-full ">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">API Keys</CardTitle>
        <CardDescription>
          Configure your API keys to use different AI models. Your keys are stored locally in your browser.
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-transparent p-0 mx-4 mt-2">
          {PROVIDERS.map(provider => (
            <TabsTrigger 
              key={provider} 
              value={provider} 
              className="capitalize data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-0 py-2.5"
            >
              {provider}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {PROVIDERS.map(provider => (
          <TabsContent key={provider} value={provider} className="space-y-4">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor={`${provider}-key`} className="text-sm font-medium flex items-center gap-2">
                    {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key
                    {keys[provider] && <Badge variant="outline" className="bg-green-500/10 text-green-500 border-0 px-2.5 py-0.5">Active</Badge>}
                  </label>
                  
                  {keys[provider] && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleClearKey(provider)}
                      className="h-7 px-2.5 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" /> Clear
                    </Button>
                  )}
                </div>
                
                <div className="relative">
                  <Input
                    id={`${provider}-key`}
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={apiKeys[provider]}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                    placeholder={provider === 'openai' ? 'sk-...' : provider === 'google' ? 'AIza...' : 'sk-or-...'}
                    className="pr-10 bg-muted/50 border-0 focus-visible:ring-1 h-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(provider)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Available Models</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modelsByProvider[provider]?.map(model => (
                    <div key={model.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
                      {keys[provider] ? 
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : 
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-6">
              <Button 
                onClick={() => handleSaveKey(provider)} 
                disabled={isLoading[provider] || !apiKeys[provider] || apiKeys[provider] === keys[provider]}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 h-10 px-6"
              >
                {isLoading[provider] ? 'Saving...' : 'Save API Key'}
              </Button>
            </CardFooter>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}