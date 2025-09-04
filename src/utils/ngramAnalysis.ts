import { SearchTermData, NgramData, AnalysisConfig, AnalysisResults } from '@/types/ppc';

export function parseCSVData(csvData: any[]): SearchTermData[] {
  // Helper function to parse numeric values, handling Google Ads format (commas, --, etc.)
  const parseNumericValue = (value: any): number => {
    if (!value || value === '' || value === ' --' || value === '--') return 0;
    // Remove commas and quotes, then parse
    const cleanValue = value.toString().replace(/[",]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };
  
  // Parse CTR percentage - remove % sign
  const parseCTR = (value: any): number => {
    if (!value || value === '' || value === ' --' || value === '--') return 0;
    const cleanValue = value.toString().replace(/[%",]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };
  
  // Parse conversion rate percentage
  const parseConvRate = (value: any): number => {
    if (!value || value === '' || value === ' --' || value === '--') return 0;
    const cleanValue = value.toString().replace(/[%",]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parsedData = csvData.map(row => {
    const searchTerm = (row['Search term'] || row['Search Term'] || row['search_term'] || '').toString().toLowerCase().trim();
    
    const impressions = parseNumericValue(row['Impr.'] || row['Impressions'] || row['impressions']);
    const clicks = parseNumericValue(row['Clicks'] || row['clicks']);
    const cost = parseNumericValue(row['Cost'] || row['cost']);
    const conversions = parseNumericValue(row['Conversions'] || row['conversions']);
    const ctr = parseCTR(row['CTR'] || row['ctr']);
    const cpc = parseNumericValue(row['Avg. CPC'] || row['CPC'] || row['cpc']);
    const conversionRate = parseConvRate(row['Conv. rate'] || row['conv_rate'] || row['conversion_rate']);

    return {
      searchTerm,
      impressions,
      clicks,
      cost,
      conversions,
      ctr,
      cpc,
      conversionRate,
    };
  });
  
  const filteredData = parsedData.filter(item => {
    // Filter out invalid rows:
    // 1. Must have a search term
    // 2. Must not be summary rows (containing "Total:")
    // 3. Must have some meaningful data
    const hasSearchTerm = item.searchTerm && item.searchTerm.length > 0;
    const notSummaryRow = !item.searchTerm.includes('total:') && 
                         !item.searchTerm.includes('search terms') && 
                         !item.searchTerm.includes('total');
    const hasData = item.impressions > 0 || item.clicks > 0 || item.cost > 0 || item.conversions > 0;
    
    return hasSearchTerm && notSummaryRow && hasData;
  });
  
  console.log(`Successfully parsed ${filteredData.length} search terms from ${parsedData.length} total rows`);
  return filteredData;
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

  // Calculate summary statistics from all original data (not just filtered data)
  // This gives the true totals from the uploaded CSV
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);

  // Note: N-gram cost totals in the tables above represent the cumulative cost 
  // associated with each n-gram across all search terms containing it.
  // This helps identify high-impact n-grams but will sum to more than the actual spend.

  return {
    unigrams: allNgrams[1] || [],
    bigrams: allNgrams[2] || [],
    trigrams: allNgrams[3] || [],
    fourgrams: allNgrams[4] || [],
    summary: {
      totalSearchTerms: data.length, // Total from uploaded CSV
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