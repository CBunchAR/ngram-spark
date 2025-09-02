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

export interface AnalysisConfig {
  ngramSizes: number[];
  minImpressions: number;
  minClicks: number;
  minCost: number;
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