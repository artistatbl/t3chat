'use client';

import { useModelStore } from '@/app/stores/ModelStore';
import { getAvailableModels } from '@/lib/models';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/app/hooks/use-mobile';
import type { AIModel } from '@/lib/models';

export function ModelSettings() {
  const { selectedModel, setModel } = useModelStore();
  const models = getAvailableModels();
  const isMobile = useIsMobile();

  return (
    <Card className="p-4 md:p-6">
      <CardHeader className="px-0 pt-0 space-y-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight">Model Selection</CardTitle>
          <p className="text-sm text-muted-foreground">Choose your preferred AI model for the best experience</p>
        </div>
      </CardHeader>
      
      <RadioGroup
        value={selectedModel}
        onValueChange={(value) => setModel(value as AIModel)}
        className={`grid gap-3 pt-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        {models.map((model) => (
          <Card
            key={model.id}
            className={`relative overflow-hidden transition-all duration-200 ${
              selectedModel === model.id 
                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/10' 
                : 'hover:border-primary/20 hover:shadow-md hover:bg-accent/5'
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
              <div className="flex flex-col h-full p-3 md:p-4 space-y-2 md:space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-semibold text-base md:text-lg">{model.name}</div>
                  <div className="text-xs md:text-sm text-muted-foreground/80">{model.provider}</div>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground/90">
                  {model.description}
                </div>
              </div>
            </Label>
          </Card>
        ))}
      </RadioGroup>
    </Card>
  );
}