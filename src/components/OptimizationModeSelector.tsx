import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizationMode } from '@/types/ppc';
import { Target, MousePointer, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface OptimizationModeSelectorProps {
  selectedMode: OptimizationMode;
  onModeChange: (mode: OptimizationMode) => void;
  totalConversions: number;
}

export function OptimizationModeSelector({ 
  selectedMode, 
  onModeChange, 
  totalConversions 
}: OptimizationModeSelectorProps) {
  const hasConversions = totalConversions > 0;
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-100">
          <Target className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Optimization Mode</h3>
          <p className="text-sm text-gray-600">
            Choose how to evaluate n-gram performance for this campaign
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conversions Mode */}
        <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMode === 'conversions'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onModeChange('conversions')}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Conversions Focus</h4>
            </div>
            {selectedMode === 'conversions' && (
              <Badge variant="default" className="bg-blue-600">Selected</Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Optimize for conversions and conversion rate. Best for established campaigns with conversion data.
          </p>
          
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Good: High CTR (3%+), Conv Rate (2%+), Active conversions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Poor: Low CTR (1%-), Low conv rate (0.5%-), High CPC</span>
            </div>
          </div>
          
          {!hasConversions && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700">
                No conversions detected in this dataset. Consider using Clicks mode.
              </p>
            </div>
          )}
        </div>

        {/* Clicks Mode */}
        <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMode === 'clicks'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onModeChange('clicks')}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Clicks Focus</h4>
            </div>
            {selectedMode === 'clicks' && (
              <Badge variant="default" className="bg-green-600">Selected</Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Optimize for clicks and CTR. Ideal for new campaigns or when building traffic before conversions.
          </p>
          
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Good: High CTR (5%+), Low CPC (3-), Good click volume (10+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Poor: Low CTR (1.5%-), Very high CPC (8+)</span>
            </div>
          </div>
          
          {hasConversions && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Conversions detected. You may get better insights with Conversions mode.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Current dataset: {totalConversions} total conversions
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <Info className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                The optimization mode affects how n-grams are scored as "good", "warning", or "poor". 
                You can change this setting anytime before running the analysis.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
