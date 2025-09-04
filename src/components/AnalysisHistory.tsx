import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  History, 
  Calendar, 
  FileText, 
  BarChart3, 
  Download,
  Trash2,
  Search,
  Eye,
  Save
} from 'lucide-react';
import { Client, AnalysisHistory as AnalysisHistoryType } from '@/types/client';
import { SearchTermData, AnalysisResults } from '@/types/ppc';
import { 
  getAnalysisHistory, 
  deleteAnalysisHistory,
  getAnalysisData,
  saveAnalysisHistory,
  saveAnalysisData,
  createAnalysisHistory,
  updateClientLastAnalysis
} from '@/utils/storage';

interface AnalysisHistoryProps {
  currentClient: Client | null;
  currentAnalysis?: {
    searchTermData: SearchTermData[];
    analysisResults: AnalysisResults;
    config: any;
  };
  onLoadAnalysis: (data: {
    searchTermData: SearchTermData[];
    analysisResults: AnalysisResults;
  }) => void;
}

export function AnalysisHistory({ 
  currentClient, 
  currentAnalysis, 
  onLoadAnalysis 
}: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisHistoryType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [analysisName, setAnalysisName] = useState('');

  useEffect(() => {
    if (currentClient) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [currentClient?.id]); // Only depend on client ID to prevent unnecessary re-renders

  const loadHistory = () => {
    if (!currentClient) return;
    const clientHistory = getAnalysisHistory(currentClient.id);
    setHistory(clientHistory);
  };

  const handleSaveCurrentAnalysis = () => {
    if (!currentClient || !currentAnalysis || !analysisName.trim()) return;

    const historyEntry = createAnalysisHistory(
      currentClient.id,
      analysisName.trim(),
      currentAnalysis.searchTermData,
      currentAnalysis.analysisResults,
      currentAnalysis.config
    );

    saveAnalysisHistory(historyEntry);
    saveAnalysisData(
      historyEntry.id,
      currentAnalysis.searchTermData,
      currentAnalysis.analysisResults
    );
    updateClientLastAnalysis(currentClient.id);

    loadHistory();
    setSaveDialogOpen(false);
    setAnalysisName('');
  };

  const handleLoadAnalysis = (historyId: string) => {
    const analysisData = getAnalysisData(historyId);
    if (analysisData) {
      onLoadAnalysis({
        searchTermData: analysisData.searchTermData,
        analysisResults: analysisData.analysisResults
      });
    }
  };

  const handleDeleteAnalysis = (historyId: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      deleteAnalysisHistory(historyId);
      loadHistory();
    }
  };

  const filteredHistory = history.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  if (!currentClient) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a client to view analysis history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg text-gray-900">Analysis History</CardTitle>
            <Badge variant="outline" className="text-gray-600">
              {history.length} saved
            </Badge>
          </div>
          
          {currentAnalysis && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Analysis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Analysis Name</label>
                    <Input
                      value={analysisName}
                      onChange={(e) => setAnalysisName(e.target.value)}
                      placeholder="Enter analysis name..."
                      className="mt-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveCurrentAnalysis()}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCurrentAnalysis} disabled={!analysisName.trim()}>
                      Save Analysis
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {history.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {history.length === 0 ? 'No saved analyses yet' : 'No analyses match your search'}
            </p>
            <p className="text-sm text-gray-500">
              {history.length === 0 ? 'Run an analysis and save it to get started' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-2 truncate">{item.name}</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{item.searchTermsCount.toLocaleString()} terms</span>
                        <span>{item.config.ngramSizes.join(', ')}-grams</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadAnalysis(item.id)}
                      className="text-blue-600 hover:text-blue-700 h-7 px-2"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      <span className="text-xs">Load</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnalysis(item.id)}
                      className="text-red-600 hover:text-red-700 h-7 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-3 bg-gray-100 rounded min-h-[60px] flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {item.summary.totalImpressions.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Impressions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded min-h-[60px] flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {item.summary.totalClicks.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Clicks</p>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded min-h-[60px] flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {formatCurrency(item.summary.totalCost)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Cost</p>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded min-h-[60px] flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {item.summary.totalConversions.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Conversions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
