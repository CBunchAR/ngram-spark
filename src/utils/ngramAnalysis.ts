import { SearchTermData, NgramData, AnalysisConfig, AnalysisResults } from '@/types/ppc';

export function parseCSVData(csvData: any[]): SearchTermData[] {
  return csvData.map(row => ({
    searchTerm: (row['Search Term'] || row['Search term'] || row['search_term'] || '').toString().toLowerCase().trim(),
    impressions: parseFloat(row['Impressions'] || row['impressions'] || '0') || 0,
    clicks: parseFloat(row['Clicks'] || row['clicks'] || '0') || 0,
    cost: parseFloat(row['Cost'] || row['cost'] || '0') || 0,
    conversions: parseFloat(row['Conversions'] || row['conversions'] || '0') || 0,
    ctr: parseFloat(row['CTR'] || row['ctr'] || '0') || 0,
    cpc: parseFloat(row['CPC'] || row['cpc'] || '0') || 0,
    conversionRate: parseFloat(row['Conv. rate'] || row['conv_rate'] || row['conversion_rate'] || '0') || 0,
  })).filter(item => item.searchTerm && item.impressions > 0);
}

export function generateNgrams(text: string, n: number): string[] {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  if (words.length < n) return [];
  
  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

export function calculatePerformanceScore(ngram: NgramData): 'good' | 'warning' | 'poor' {
  const { ctr, conversionRate, cpc, totalConversions } = ngram;
  
  // Good performance: High CTR, good conversion rate, reasonable CPC
  if (ctr > 3 && conversionRate > 2 && totalConversions > 0) {
    return 'good';
  }
  
  // Poor performance: Low CTR and conversion rate, or very high CPC with low conversions
  if (ctr < 1 || (conversionRate < 0.5 && cpc > 5)) {
    return 'poor';
  }
  
  return 'warning';
}

export function analyzeNgrams(data: SearchTermData[], config: AnalysisConfig): AnalysisResults {
  const ngramMap = new Map<string, {
    frequency: number;
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    totalConversions: number;
  }>();

  // Filter data based on config
  const filteredData = data.filter(item => 
    item.impressions >= config.minImpressions &&
    item.clicks >= config.minClicks &&
    item.cost >= config.minCost
  );

  // Generate all n-grams
  const allNgrams: { [key: number]: NgramData[] } = {};
  
  for (const size of config.ngramSizes) {
    const sizeNgrams = new Map<string, {
      frequency: number;
      totalImpressions: number;
      totalClicks: number;
      totalCost: number;
      totalConversions: number;
    }>();

    filteredData.forEach(item => {
      const ngrams = generateNgrams(item.searchTerm, size);
      
      ngrams.forEach(ngram => {
        const existing = sizeNgrams.get(ngram) || {
          frequency: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalCost: 0,
          totalConversions: 0,
        };
        
        sizeNgrams.set(ngram, {
          frequency: existing.frequency + 1,
          totalImpressions: existing.totalImpressions + item.impressions,
          totalClicks: existing.totalClicks + item.clicks,
          totalCost: existing.totalCost + item.cost,
          totalConversions: existing.totalConversions + item.conversions,
        });
      });
    });

    // Convert to NgramData array
    allNgrams[size] = Array.from(sizeNgrams.entries()).map(([ngram, stats]) => {
      const ctr = stats.totalImpressions > 0 ? (stats.totalClicks / stats.totalImpressions) * 100 : 0;
      const cpc = stats.totalClicks > 0 ? stats.totalCost / stats.totalClicks : 0;
      const conversionRate = stats.totalClicks > 0 ? (stats.totalConversions / stats.totalClicks) * 100 : 0;
      const costPerConversion = stats.totalConversions > 0 ? stats.totalCost / stats.totalConversions : 0;
      
      const ngramData: NgramData = {
        ngram,
        frequency: stats.frequency,
        totalImpressions: stats.totalImpressions,
        totalClicks: stats.totalClicks,
        totalCost: stats.totalCost,
        totalConversions: stats.totalConversions,
        ctr,
        cpc,
        conversionRate,
        costPerConversion,
        performanceScore: 'good' // Will be calculated below
      };
      
      ngramData.performanceScore = calculatePerformanceScore(ngramData);
      return ngramData;
    }).sort((a, b) => b.totalImpressions - a.totalImpressions);
  }

  // Calculate summary statistics
  const totalImpressions = filteredData.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = filteredData.reduce((sum, item) => sum + item.clicks, 0);
  const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
  const totalConversions = filteredData.reduce((sum, item) => sum + item.conversions, 0);

  return {
    unigrams: allNgrams[1] || [],
    bigrams: allNgrams[2] || [],
    trigrams: allNgrams[3] || [],
    fourgrams: allNgrams[4] || [],
    summary: {
      totalSearchTerms: filteredData.length,
      totalImpressions,
      totalClicks,
      totalCost,
      totalConversions,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
      avgConversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    }
  };
}

export function exportToCsv(data: NgramData[], filename: string): void {
  const headers = ['N-gram', 'Frequency', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'CTR %', 'CPC', 'Conv Rate %', 'Cost/Conv'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.ngram}"`,
      row.frequency,
      row.totalImpressions,
      row.totalClicks,
      row.totalCost.toFixed(2),
      row.totalConversions,
      row.ctr.toFixed(2),
      row.cpc.toFixed(2),
      row.conversionRate.toFixed(2),
      row.costPerConversion.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function generateNegativeKeywords(data: NgramData[]): string[] {
  return data
    .filter(item => item.performanceScore === 'poor' && item.frequency >= 2)
    .map(item => item.ngram)
    .slice(0, 100); // Limit to top 100 negative keywords
}