export interface SearchTermData {
  searchTerm: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

export interface NgramData {
  ngram: string;
  frequency: number;
  totalImpressions: number;
  totalClicks: number;
  totalCost: number;
  totalConversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  costPerConversion: number;
  performanceScore: 'good' | 'warning' | 'poor';
}

export type OptimizationMode = 'conversions' | 'clicks';

export interface PerformanceThresholds {
  // CTR thresholds (percentages)
  ctr: {
    good: number;    // CTR above this = good performance
    poor: number;    // CTR below this = poor performance
  };
  // CPC thresholds (dollars)
  cpc: {
    good: number;    // CPC below this = good performance  
    poor: number;    // CPC above this = poor performance
  };
  // Conversion rate thresholds (percentages) - for conversion mode
  conversionRate: {
    good: number;    // Conv rate above this = good performance
    poor: number;    // Conv rate below this = poor performance
  };
  // Minimum volumes for "good" classification
  minVolume: {
    clicks: number;      // Minimum clicks for good performance
    conversions: number; // Minimum conversions for good performance (conversion mode)
  };
}

export interface AnalysisConfig {
  ngramSizes: number[];
  minImpressions: number;
  minClicks: number;
  minCost: number;
  optimizationMode: OptimizationMode;
  performanceThresholds: PerformanceThresholds;
}

export interface AnalysisResults {
  unigrams: NgramData[];
  bigrams: NgramData[];
  trigrams: NgramData[];
  fourgrams: NgramData[];
  summary: {
    totalSearchTerms: number;
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    totalConversions: number;
    avgCtr: number;
    avgCpc: number;
    avgConversionRate: number;
  };
}

export type SortField = keyof NgramData;
export type SortDirection = 'asc' | 'desc';