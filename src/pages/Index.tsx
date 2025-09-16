import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisConfig } from '@/components/AnalysisConfig';
import { ResultsTable } from '@/components/ResultsTable';
import { InsightsSummary } from '@/components/InsightsSummary';
import NgramDashboard from '@/components/NgramDashboard';
import { ClientManager } from '@/components/ClientManager';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { OptimizationModeSelector } from '@/components/OptimizationModeSelector';
import { PerformanceThresholds } from '@/components/PerformanceThresholds';
import { SearchTermData, AnalysisResults, AnalysisConfig as AnalysisConfigType, OptimizationMode, PerformanceThresholds as PerformanceThresholdsType } from '@/types/ppc';
import { Client } from '@/types/client';
import { analyzeNgrams } from '@/utils/ngramAnalysis';
import { BarChart3, Lightbulb, FileText, SidebarOpen, SidebarClose } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [searchTermData, setSearchTermData] = useState<SearchTermData[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [config, setConfig] = useState<AnalysisConfigType>({
    ngramSizes: [1, 2, 3],
    minImpressions: 10,
    minClicks: 1,
    minCost: 0.01,
    optimizationMode: 'conversions' as OptimizationMode,
    performanceThresholds: {
      ctr: { good: 3, poor: 1 },
      cpc: { good: 2, poor: 5 },
      conversionRate: { good: 2, poor: 0.5 },
      minVolume: { clicks: 10, conversions: 1 }
    }
  });

  const handleDataLoaded = (data: SearchTermData[]) => {
    setSearchTermData(data);
    setAnalysisResults(null);
  };

  const handleClientChange = (client: Client | null) => {
    setCurrentClient(client);
    // Clear current data when switching clients
    setSearchTermData([]);
    setAnalysisResults(null);
  };

  const handleLoadAnalysis = (data: { searchTermData: SearchTermData[]; analysisResults: AnalysisResults }) => {
    setSearchTermData(data.searchTermData);
    setAnalysisResults(data.analysisResults);
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
        {/* Client Management */}
        <ClientManager onClientChange={handleClientChange} />
        
        {!currentClient ? (
          // No Client Selected
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select or Create a Client</h3>
              <p className="text-gray-600">
                Choose a client from the dropdown above or create a new one to get started with your analysis.
              </p>
            </div>
          </div>
        ) : !searchTermData.length ? (
          // File Upload Step
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FileUpload 
                onDataLoaded={handleDataLoaded}
                isLoading={isAnalyzing}
              />
            </div>
            <div>
              <AnalysisHistory
                currentClient={currentClient}
                onLoadAnalysis={handleLoadAnalysis}
              />
            </div>
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
                  <h2 className="text-lg font-semibold text-gray-900">Data Loaded Successfully</h2>
                  <p className="text-sm text-gray-600">
                    {searchTermData.length.toLocaleString()} search terms ready for analysis
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {searchTermData.reduce((sum, item) => sum + item.impressions, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Total Impressions</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {searchTermData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Total Clicks</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    ${searchTermData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">Total Cost</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {searchTermData.reduce((sum, item) => sum + item.conversions, 0)}
                  </p>
                  <p className="text-xs text-gray-600">Total Conversions</p>
                </div>
              </div>
            </Card>

            <OptimizationModeSelector
              selectedMode={config.optimizationMode}
              onModeChange={(mode) => setConfig(prev => ({ ...prev, optimizationMode: mode }))}
              totalConversions={searchTermData.reduce((sum, item) => sum + item.conversions, 0)}
            />

            <PerformanceThresholds
              thresholds={config.performanceThresholds}
              optimizationMode={config.optimizationMode}
              onThresholdsChange={(thresholds) => setConfig(prev => ({ ...prev, performanceThresholds: thresholds }))}
            />

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
          <div className={`grid grid-cols-1 gap-6 ${showHistorySidebar ? 'lg:grid-cols-4' : ''}`}>
            <div className={showHistorySidebar ? 'lg:col-span-3' : ''}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                      <p className="text-gray-600">
                        N-gram analysis completed for {searchTermData.length.toLocaleString()} search terms
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {config.ngramSizes.length} N-gram sizes
                    </Badge>
                    <Badge variant="outline">
                      ${analysisResults.summary.totalCost.toFixed(2)} analyzed
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                      className="ml-2"
                    >
                      {showHistorySidebar ? (
                        <>
                          <SidebarClose className="w-4 h-4 mr-2" />
                          Hide History
                        </>
                      ) : (
                        <>
                          <SidebarOpen className="w-4 h-4 mr-2" />
                          Show History
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dashboard" className="text-gray-800 data-[state=active]:text-gray-900">N-gram Dashboard</TabsTrigger>
                    <TabsTrigger value="insights" className="text-gray-800 data-[state=active]:text-gray-900">Insights Summary</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard">
                    <NgramDashboard results={analysisResults} />
                  </TabsContent>

                  <TabsContent value="insights">
                    <InsightsSummary results={analysisResults} optimizationMode={config.optimizationMode} />
                  </TabsContent>
                </Tabs>

                <div className="pt-6 border-t">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSearchTermData([]);
                        setAnalysisResults(null);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Start over with new data
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {showHistorySidebar && (
              <div className="lg:col-span-1">
                <AnalysisHistory
                  currentClient={currentClient}
                  currentAnalysis={analysisResults ? {
                    searchTermData,
                    analysisResults,
                    config
                  } : undefined}
                  onLoadAnalysis={handleLoadAnalysis}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
