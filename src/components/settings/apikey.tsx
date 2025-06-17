'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAPIKeyStore, PROVIDERS, Provider } from '@/app/stores/APIKeyStore';
import { AlertCircle, CheckCircle2, Eye, EyeOff, X, Key } from 'lucide-react';
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
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl font-bold">API Keys</CardTitle>
        </div>
        <CardDescription>
          Configure your API keys to use different AI models
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="">
            {PROVIDERS.map(provider => {
              return (
                <TabsTrigger 
                  key={provider} 
                  value={provider} 
                  className="relative flex items-center gap-2 capitalize py-2 px-2 text-sm border-b-2 border-transparent hover:border-primary"
                >
                  <span>{provider}</span>

                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {PROVIDERS.map(provider => (
            <TabsContent key={provider} value={provider}>
              <div className="space-y-6">
                {/* API Key Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <h4 className="font-medium">{provider} API Key</h4>
                        {keys[provider] && (
                          <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {keys[provider] && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleClearKey(provider)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Input
                      type={showKeys[provider] ? 'text' : 'password'}
                      value={inputKeys[provider]}
                      onChange={(e) => handleInputChange(provider, e.target.value)}
                      placeholder={provider === 'openai' ? 'sk-...' : provider === 'google' ? 'AIza...' : 'sk-or-...'}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-lg"
                    >
                      {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Available Models */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Available Models</h4>
                    <Badge variant="outline">
                      {modelsByProvider[provider]?.length || 0} models
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {modelsByProvider[provider]?.map(model => (
                      <Card 
                        key={model.id} 
                        className={`p-4 ${keys[provider] ? 'bg-green-50/50 dark:bg-green-900/50' : 'bg-amber-50/50 dark:bg-amber-900/50'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg ${keys[provider] ? 'bg-green-100 dark:bg-green-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                            {keys[provider] ? 
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{model.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {model.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <CardFooter className="mt-6 px-0">
                <Button 
                  onClick={() => handleSaveKey(provider)} 
                  disabled={isLoading[provider] || !inputKeys[provider] || inputKeys[provider] === keys[provider]}
                  className={`w-full sm:w-auto`}
                >
                  {isLoading[provider] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-lg animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Save API Key
                    </>
                  )}
                </Button>
              </CardFooter>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}