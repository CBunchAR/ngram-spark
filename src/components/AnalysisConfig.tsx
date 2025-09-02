import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Play, Settings } from 'lucide-react';
import { AnalysisConfig as AnalysisConfigType } from '@/types/ppc';

interface AnalysisConfigProps {
  config: AnalysisConfigType;
  onConfigChange: (config: AnalysisConfigType) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  dataCount: number;
}

export function AnalysisConfig({ 
  config, 
  onConfigChange, 
  onAnalyze, 
  isAnalyzing, 
  dataCount 
}: AnalysisConfigProps) {
  const updateNgramSizes = (size: number, enabled: boolean) => {
    const newSizes = enabled 
      ? [...config.ngramSizes, size].sort()
      : config.ngramSizes.filter(s => s !== size);
    
    onConfigChange({ ...config, ngramSizes: newSizes });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Analysis Configuration</h3>
      </div>

      <div className="space-y-6">
        {/* N-gram sizes */}
        <div>
          <Label className="text-base font-medium mb-3 block">N-gram Sizes</Label>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(size => (
              <div key={size} className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor={`ngram-${size}`} className="text-sm">
                  {size}-gram {size === 1 ? '(words)' : size === 2 ? '(phrases)' : ''}
                </Label>
                <Switch
                  id={`ngram-${size}`}
                  checked={config.ngramSizes.includes(size)}
                  onCheckedChange={(checked) => updateNgramSizes(size, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Minimum thresholds */}
        <div>
          <Label className="text-base font-medium mb-3 block">Minimum Thresholds</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min-impressions" className="text-sm text-muted-foreground">
                Min Impressions
              </Label>
              <Input
                id="min-impressions"
                type="number"
                min="0"
                value={config.minImpressions}
                onChange={(e) => onConfigChange({
                  ...config,
                  minImpressions: parseInt(e.target.value) || 0
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="min-clicks" className="text-sm text-muted-foreground">
                Min Clicks
              </Label>
              <Input
                id="min-clicks"
                type="number"
                min="0"
                value={config.minClicks}
                onChange={(e) => onConfigChange({
                  ...config,
                  minClicks: parseInt(e.target.value) || 0
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="min-cost" className="text-sm text-muted-foreground">
                Min Cost ($)
              </Label>
              <Input
                id="min-cost"
                type="number"
                min="0"
                step="0.01"
                value={config.minCost}
                onChange={(e) => onConfigChange({
                  ...config,
                  minCost: parseFloat(e.target.value) || 0
                })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Analysis button */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Ready to analyze {dataCount.toLocaleString()} search terms
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Selected N-gram sizes: {config.ngramSizes.join(', ') || 'None'}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={onAnalyze}
            disabled={isAnalyzing || config.ngramSizes.length === 0}
            className="w-full gradient-primary"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      </div>
    </Card>
  );
}