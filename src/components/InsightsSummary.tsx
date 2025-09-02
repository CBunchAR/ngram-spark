import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Eye,
  MousePointer,
  DollarSign,
  BarChart3,
  Download
} from 'lucide-react';
import { AnalysisResults, NgramData } from '@/types/ppc';
import { generateNegativeKeywords, exportToCsv } from '@/utils/ngramAnalysis';

interface InsightsSummaryProps {
  results: AnalysisResults;
}

export function InsightsSummary({ results }: InsightsSummaryProps) {
  const { summary } = results;
  
  const getAllNgrams = (): NgramData[] => {
    return [...results.unigrams, ...results.bigrams, ...results.trigrams, ...results.fourgrams];
  };

  const getTopPerformers = (limit = 10): NgramData[] => {
    return getAllNgrams()
      .filter(item => item.performanceScore === 'good' && item.totalConversions > 0)
      .sort((a, b) => b.totalConversions - a.totalConversions)
      .slice(0, limit);
  };

  const getPoorPerformers = (limit = 10): NgramData[] => {
    return getAllNgrams()
      .filter(item => item.performanceScore === 'poor')
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  };

  const getOpportunities = (limit = 10): NgramData[] => {
    return getAllNgrams()
      .filter(item => 
        item.totalImpressions > 1000 && 
        item.totalConversions === 0 && 
        item.ctr > 2
      )
      .sort((a, b) => b.totalImpressions - a.totalImpressions)
      .slice(0, limit);
  };

  const handleExportNegativeKeywords = () => {
    const negativeKeywords = generateNegativeKeywords(getAllNgrams());
    const csvContent = negativeKeywords.map(keyword => `"${keyword}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'negative-keywords.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle,
    color = 'text-primary'
  }: {
    icon: any;
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }) => (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-primary/10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Campaign Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Target}
            title="Search Terms"
            value={summary.totalSearchTerms.toLocaleString()}
            subtitle="analyzed"
          />
          <StatCard
            icon={Eye}
            title="Total Impressions"
            value={summary.totalImpressions.toLocaleString()}
            subtitle={`${formatPercentage(summary.avgCtr)} avg CTR`}
          />
          <StatCard
            icon={MousePointer}
            title="Total Clicks"
            value={summary.totalClicks.toLocaleString()}
            subtitle={formatCurrency(summary.avgCpc) + " avg CPC"}
          />
          <StatCard
            icon={DollarSign}
            title="Total Cost"
            value={formatCurrency(summary.totalCost)}
            subtitle={`${summary.totalConversions} conversions`}
          />
        </div>
      </Card>

      {/* Top Performers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold">Top Performing N-grams</h3>
          </div>
          {getTopPerformers().length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(getTopPerformers(50), 'top-performers.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
        
        {getTopPerformers().length > 0 ? (
          <div className="space-y-3">
            {getTopPerformers().map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.ngram}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.totalConversions} conversions • {formatPercentage(item.conversionRate)} rate
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-success text-success-foreground mb-1">
                    {formatCurrency(item.totalCost / item.totalConversions)} cost/conv
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {item.totalImpressions.toLocaleString()} impressions
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No high-performing n-grams found. Try adjusting your analysis thresholds.
          </p>
        )}
      </Card>

      {/* Poor Performers / Negative Keywords */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <h3 className="text-lg font-semibold">Negative Keyword Candidates</h3>
          </div>
          {getPoorPerformers().length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportNegativeKeywords}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Negative List
            </Button>
          )}
        </div>
        
        {getPoorPerformers().length > 0 ? (
          <div className="space-y-3">
            {getPoorPerformers().map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.ngram}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(item.ctr)} CTR • {formatPercentage(item.conversionRate)} conv rate
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-destructive text-destructive-foreground mb-1">
                    {formatCurrency(item.totalCost)} wasted
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {item.frequency} search terms
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No clear negative keyword candidates identified.
          </p>
        )}
      </Card>

      {/* Opportunities */}
      {getOpportunities().length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold">Optimization Opportunities</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(getOpportunities(50), 'opportunities.csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="space-y-3">
            {getOpportunities().map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.ngram}</p>
                  <p className="text-xs text-muted-foreground">
                    High impressions, decent CTR, but no conversions yet
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-warning text-warning-foreground mb-1">
                    {formatPercentage(item.ctr)} CTR
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {item.totalImpressions.toLocaleString()} impressions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}