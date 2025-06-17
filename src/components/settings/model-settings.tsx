'use client';

import { useModelStore } from '@/app/stores/ModelStore';
import { getAvailableModels } from '@/lib/models';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AIModel } from '@/lib/models';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Cpu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ModelSettings() {
  const { selectedModel, setModel } = useModelStore();
  const models = getAvailableModels();
  const isMobile = useIsMobile();

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl font-bold">
            Model Selection
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          Choose your preferred AI model for the best experience
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <RadioGroup
            value={selectedModel}
            onValueChange={(value) => setModel(value as AIModel)}
            className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-1'}`}
          >
            {models.map((model) => (
              <Card
                key={model.id}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  selectedModel === model.id 
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'hover:border-primary/30 hover:shadow-md hover:bg-accent/5 border-border/50'
                }`}
              >
                <RadioGroupItem
                  value={model.id}
                  id={model.id}
                  className="sr-only"
                />
                <Label 
                  htmlFor={model.id}
                  className="block cursor-pointer"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          selectedModel === model.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted group-hover:bg-primary/10'
                        }`}>
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{model.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                      </div>
                      {selectedModel === model.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {model.description}
                    </p>
                  </div>
                </Label>
              </Card>
            ))}
          </RadioGroup>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}