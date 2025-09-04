export interface Client {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  lastAnalysis?: string;
  totalAnalyses: number;
}

export interface AnalysisHistory {
  id: string;
  clientId: string;
  name: string;
  timestamp: string;
  searchTermsCount: number;
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    totalConversions: number;
    avgCtr: number;
    avgCpc: number;
    avgConversionRate: number;
  };
  config: {
    ngramSizes: number[];
    minImpressions: number;
    minClicks: number;
    minCost: number;
  };
}

export interface StoredAnalysis {
  history: AnalysisHistory;
  searchTermData: any[];
  analysisResults: any;
}
