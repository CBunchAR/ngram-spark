import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PerformanceThresholds, OptimizationMode } from '@/types/ppc';
import { Settings, RotateCcw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PerformanceThresholdsProps {
  thresholds: PerformanceThresholds;
  optimizationMode: OptimizationMode;
  onThresholdsChange: (thresholds: PerformanceThresholds) => void;
}

// Industry presets for common benchmarks
const INDUSTRY_PRESETS = {
  'general': {
    name: 'General/E-commerce',
    thresholds: {
      ctr: { good: 3, poor: 1 },
      cpc: { good: 2, poor: 5 },
      conversionRate: { good: 2, poor: 0.5 },
      minVolume: { clicks: 10, conversions: 1 }
    }
  },
  'legal': {
    name: 'Legal/Finance',
    thresholds: {
      ctr: { good: 2, poor: 0.8 },
      cpc: { good: 15, poor: 50 },
      conversionRate: { good: 3, poor: 1 },
      minVolume: { clicks: 5, conversions: 1 }
    }
  },
  'healthcare': {
    name: 'Healthcare',
    thresholds: {
      ctr: { good: 2.5, poor: 1 },
      cpc: { good: 8, poor: 25 },
      conversionRate: { good: 3, poor: 0.8 },
      minVolume: { clicks: 8, conversions: 1 }
    }
  },
  'saas': {
    name: 'SaaS/B2B',
    thresholds: {
      ctr: { good: 4, poor: 1.5 },
      cpc: { good: 5, poor: 15 },
      conversionRate: { good: 5, poor: 1 },
      minVolume: { clicks: 15, conversions: 2 }
    }
  },
  'retail': {
    name: 'Retail/Shopping',
    thresholds: {
      ctr: { good: 4, poor: 1.5 },
      cpc: { good: 1.5, poor: 4 },
      conversionRate: { good: 4, poor: 1 },
      minVolume: { clicks: 20, conversions: 2 }
    }
  }
};

export function PerformanceThresholds({ 
  thresholds, 
  optimizationMode, 
  onThresholdsChange 
}: PerformanceThresholdsProps) {
  
  const handleInputChange = (category: string, threshold: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    const newThresholds = {
      ...thresholds,
      [category]: {
        ...thresholds[category as keyof PerformanceThresholds],
        [threshold]: numValue
      }
    };
    
    onThresholdsChange(newThresholds);
  };

  const applyPreset = (presetKey: string) => {
    const preset = INDUSTRY_PRESETS[presetKey as keyof typeof INDUSTRY_PRESETS];
    if (preset) {
      onThresholdsChange(preset.thresholds);
    }
  };

  const resetToDefaults = () => {
    applyPreset('general');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <Settings className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Thresholds</h3>
            <p className="text-sm text-gray-600">
              Adjust benchmarks based on your industry and campaign goals
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {optimizationMode} Mode
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Industry Presets */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Industry Presets
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(INDUSTRY_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(key)}
              className="text-xs h-8"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Custom Thresholds */}
      <div className="space-y-6">
        {/* CTR Thresholds */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-900">
              Click-Through Rate (CTR) %
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  CTR thresholds determine when n-grams are classified as good, warning, or poor performers.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctr-good" className="text-xs text-gray-600">
                Good Performance (≥)
              </Label>
              <Input
                id="ctr-good"
                type="number"
                step="0.1"
                value={thresholds.ctr.good}
                onChange={(e) => handleInputChange('ctr', 'good', e.target.value)}
                className="mt-1"
                placeholder="e.g. 3.0"
              />
            </div>
            <div>
              <Label htmlFor="ctr-poor" className="text-xs text-gray-600">
                Poor Performance (&lt;)
              </Label>
              <Input
                id="ctr-poor"
                type="number"
                step="0.1"
                value={thresholds.ctr.poor}
                onChange={(e) => handleInputChange('ctr', 'poor', e.target.value)}
                className="mt-1"
                placeholder="e.g. 1.0"
              />
            </div>
          </div>
        </div>

        {/* CPC Thresholds */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-900">
              Cost Per Click (CPC) $
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  CPC thresholds vary greatly by industry. Legal/finance often have CPCs of $20-50+, while e-commerce might be $1-5.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpc-good" className="text-xs text-gray-600">
                Good Performance (≤)
              </Label>
              <Input
                id="cpc-good"
                type="number"
                step="0.5"
                value={thresholds.cpc.good}
                onChange={(e) => handleInputChange('cpc', 'good', e.target.value)}
                className="mt-1"
                placeholder="e.g. 2.00"
              />
            </div>
            <div>
              <Label htmlFor="cpc-poor" className="text-xs text-gray-600">
                Poor Performance (&gt;)
              </Label>
              <Input
                id="cpc-poor"
                type="number"
                step="0.5"
                value={thresholds.cpc.poor}
                onChange={(e) => handleInputChange('cpc', 'poor', e.target.value)}
                className="mt-1"
                placeholder="e.g. 5.00"
              />
            </div>
          </div>
        </div>

        {/* Conversion Rate Thresholds - Only show in conversions mode */}
        {optimizationMode === 'conversions' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-900">
                Conversion Rate %
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Conversion rate thresholds for when optimizing for conversions. These vary significantly by industry and campaign type.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="conv-good" className="text-xs text-gray-600">
                  Good Performance (≥)
                </Label>
                <Input
                  id="conv-good"
                  type="number"
                  step="0.1"
                  value={thresholds.conversionRate.good}
                  onChange={(e) => handleInputChange('conversionRate', 'good', e.target.value)}
                  className="mt-1"
                  placeholder="e.g. 2.0"
                />
              </div>
              <div>
                <Label htmlFor="conv-poor" className="text-xs text-gray-600">
                  Poor Performance (&lt;)
                </Label>
                <Input
                  id="conv-poor"
                  type="number"
                  step="0.1"
                  value={thresholds.conversionRate.poor}
                  onChange={(e) => handleInputChange('conversionRate', 'poor', e.target.value)}
                  className="mt-1"
                  placeholder="e.g. 0.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Volume Thresholds */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-900">
              Minimum Volume for "Good" Rating
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Minimum activity required before an n-gram can be classified as "good" performance, regardless of rates.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-clicks" className="text-xs text-gray-600">
                Minimum Clicks
              </Label>
              <Input
                id="min-clicks"
                type="number"
                value={thresholds.minVolume.clicks}
                onChange={(e) => handleInputChange('minVolume', 'clicks', e.target.value)}
                className="mt-1"
                placeholder="e.g. 10"
              />
            </div>
            {optimizationMode === 'conversions' && (
              <div>
                <Label htmlFor="min-conversions" className="text-xs text-gray-600">
                  Minimum Conversions
                </Label>
                <Input
                  id="min-conversions"
                  type="number"
                  value={thresholds.minVolume.conversions}
                  onChange={(e) => handleInputChange('minVolume', 'conversions', e.target.value)}
                  className="mt-1"
                  placeholder="e.g. 1"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
        <p className="text-xs text-gray-600">
          <strong>Current criteria:</strong> N-grams with CTR ≥{thresholds.ctr.good}%, 
          CPC ≤${thresholds.cpc.good}
          {optimizationMode === 'conversions' && `, Conv Rate ≥${thresholds.conversionRate.good}%`}
          , and {optimizationMode === 'conversions' ? `≥${thresholds.minVolume.conversions} conversions` : `≥${thresholds.minVolume.clicks} clicks`} 
          {' '}will be rated as "Good" performance.
        </p>
      </div>
    </Card>
  );
}
