'use client';

import { useState } from 'react';
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
  const { keys, setKeys } = useAPIKeyStore();
  
  // Initialize state with proper default values
  const initialInputKeys = {} as Record<Provider, string>;
  const initialShowKeys = {} as Record<Provider, boolean>;
  const initialLoading = {} as Record<Provider, boolean>;
  
  PROVIDERS.forEach(provider => {
    initialInputKeys[provider] = keys[provider] || '';
    initialShowKeys[provider] = false;
    initialLoading[provider] = false;
  });
  
  const [inputKeys, setInputKeys] = useState<Record<Provider, string>>(initialInputKeys);
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

  const handleSaveKey = (provider: Provider) => {
    setIsLoading(prev => ({ ...prev, [provider]: true }));
    
    // Simulate API call delay
    setTimeout(() => {
      setKeys({ [provider]: inputKeys[provider] });
      setIsLoading(prev => ({ ...prev, [provider]: false }));
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved successfully`);
    }, 500);
  };

  const handleClearKey = (provider: Provider) => {
    setKeys({ [provider]: '' });
    setInputKeys(prev => ({ ...prev, [provider]: '' }));
    toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key removed`);
  };

  const toggleShowKey = (provider: Provider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleInputChange = (provider: Provider, value: string) => {
    setInputKeys(prev => ({ ...prev, [provider]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 space-y-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">API Keys</CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Configure your API keys to use different AI models. Your keys are stored locally in your browser.
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-transparent p-0 mx-4 mt-2">
          {PROVIDERS.map(provider => (
            <TabsTrigger 
              key={provider} 
              value={provider} 
              className="capitalize data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm border-0 py-3 transition-all duration-200"
            >
              {provider}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {PROVIDERS.map(provider => (
          <TabsContent key={provider} value={provider} className="space-y-4">
            <CardContent className="space-y-8 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor={`${provider}-key`} className="text-sm font-semibold flex items-center gap-2">
                    {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key
                    {keys[provider] && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-0 px-3 py-0.5 font-medium">
                        Active
                      </Badge>
                    )}
                  </label>
                  
                  {keys[provider] && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleClearKey(provider)}
                      className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" /> Clear
                    </Button>
                  )}
                </div>
                
                <div className="relative">
                  <Input
                    id={`${provider}-key`}
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={inputKeys[provider]}
                    onChange={(e) => handleInputChange(provider, e.target.value)}
                    placeholder={provider === 'openai' ? 'sk-...' : provider === 'google' ? 'AIza...' : 'sk-or-...'}
                    className="pr-10 bg-background border border-input focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary h-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(provider)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                    tabIndex={0}
                  >
                    {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Available Models</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modelsByProvider[provider]?.map(model => (
                    <div 
                      key={model.id} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-input/10 hover:border-input/30 hover:shadow-md transition-all duration-200"
                    >
                      {keys[provider] ? 
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" /> : 
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-0.5">{model.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-6">
              <Button 
                onClick={() => handleSaveKey(provider)} 
                disabled={isLoading[provider] || !inputKeys[provider] || inputKeys[provider] === keys[provider]}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 h-11 px-8 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 disabled:shadow-none"
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