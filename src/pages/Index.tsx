import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisConfig } from '@/components/AnalysisConfig';
import { ResultsTable } from '@/components/ResultsTable';
import { InsightsSummary } from '@/components/InsightsSummary';
import { SearchTermData, AnalysisResults, AnalysisConfig as AnalysisConfigType } from '@/types/ppc';
import { analyzeNgrams } from '@/utils/ngramAnalysis';
import { BarChart3, Lightbulb, FileText } from 'lucide-react';

const Index = () => {
  const [searchTermData, setSearchTermData] = useState<SearchTermData[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [config, setConfig] = useState<AnalysisConfigType>({
    ngramSizes: [1, 2, 3],
    minImpressions: 10,
    minClicks: 1,
    minCost: 0.01,
  });

  const handleDataLoaded = (data: SearchTermData[]) => {
    setSearchTermData(data);
    setAnalysisResults(null);
  };

  const handleAnalyze = async () => {
    if (searchTermData.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const results = analyzeNgrams(searchTermData, config);
    setAnalysisResults(results);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PPC N-gram Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                Optimize your Google Ads campaigns with intelligent keyword analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!searchTermData.length ? (
          // File Upload Step
          <div className="max-w-2xl mx-auto">
            <FileUpload 
              onDataLoaded={handleDataLoaded}
              isLoading={isAnalyzing}
            />
          </div>
        ) : !analysisResults ? (
          // Configuration Step
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-success/10">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Data Loaded Successfully</h2>
                  <p className="text-sm text-muted-foreground">
                    {searchTermData.length.toLocaleString()} search terms ready for analysis
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold">
                    {searchTermData.reduce((sum, item) => sum + item.impressions, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Impressions</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold">
                    {searchTermData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold">
                    ${searchTermData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold">
                    {searchTermData.reduce((sum, item) => sum + item.conversions, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Conversions</p>
                </div>
              </div>
            </Card>

            <AnalysisConfig
              config={config}
              onConfigChange={setConfig}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              dataCount={searchTermData.length}
            />
          </div>
        ) : (
          // Results Step
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Analysis Results</h2>
                  <p className="text-muted-foreground">
                    N-gram analysis completed for {searchTermData.length.toLocaleString()} search terms
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="outline">
                  {config.ngramSizes.length} N-gram sizes
                </Badge>
                <Badge variant="outline">
                  ${analysisResults.summary.totalCost.toFixed(2)} analyzed
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="insights" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="unigrams" disabled={!analysisResults.unigrams.length}>
                  1-grams ({analysisResults.unigrams.length})
                </TabsTrigger>
                <TabsTrigger value="bigrams" disabled={!analysisResults.bigrams.length}>
                  2-grams ({analysisResults.bigrams.length})
                </TabsTrigger>
                <TabsTrigger value="trigrams" disabled={!analysisResults.trigrams.length}>
                  3-grams ({analysisResults.trigrams.length})
                </TabsTrigger>
                <TabsTrigger value="fourgrams" disabled={!analysisResults.fourgrams.length}>
                  4-grams ({analysisResults.fourgrams.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights">
                <InsightsSummary results={analysisResults} />
              </TabsContent>

              <TabsContent value="unigrams">
                <ResultsTable 
                  data={analysisResults.unigrams} 
                  title="1-gram Analysis (Individual Words)"
                  ngramSize={1}
                />
              </TabsContent>

              <TabsContent value="bigrams">
                <ResultsTable 
                  data={analysisResults.bigrams} 
                  title="2-gram Analysis (Word Pairs)"
                  ngramSize={2}
                />
              </TabsContent>

              <TabsContent value="trigrams">
                <ResultsTable 
                  data={analysisResults.trigrams} 
                  title="3-gram Analysis (Three-Word Phrases)"
                  ngramSize={3}
                />
              </TabsContent>

              <TabsContent value="fourgrams">
                <ResultsTable 
                  data={analysisResults.fourgrams} 
                  title="4-gram Analysis (Four-Word Phrases)"
                  ngramSize={4}
                />
              </TabsContent>
            </Tabs>

            <div className="pt-6 border-t">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    setSearchTermData([]);
                    setAnalysisResults(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Start over with new data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
