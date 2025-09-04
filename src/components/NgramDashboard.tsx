import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults, NgramData } from '@/types/ppc';
import { ArrowUpDown, Search, Download, Filter, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NgramDashboardProps {
  results: AnalysisResults;
}

type SortField = 'ngram' | 'frequency' | 'totalCost' | 'totalConversions' | 'costPerConversion' | 'performance';
type SortDirection = 'asc' | 'desc';

const NgramDashboard: React.FC<NgramDashboardProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('frequency');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getNgramData = (size: string): NgramData[] => {
    switch (size) {
      case '1': return results.unigrams;
      case '2': return results.bigrams;
      case '3': return results.trigrams;
      case '4': return results.fourgrams;
      default: return [];
    }
  };

  const currentData = useMemo(() => {
    let data = getNgramData(activeTab);
    
    // Filter by search query
    if (searchQuery) {
      data = data.filter(item => 
        item.ngram.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort data
    data.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'ngram':
          aValue = a.ngram;
          bValue = b.ngram;
          break;
        case 'frequency':
          aValue = a.frequency;
          bValue = b.frequency;
          break;
        case 'totalCost':
          aValue = a.totalCost;
          bValue = b.totalCost;
          break;
        case 'totalConversions':
          aValue = a.totalConversions;
          bValue = b.totalConversions;
          break;
        case 'costPerConversion':
          aValue = a.costPerConversion === Infinity ? Number.MAX_VALUE : a.costPerConversion;
          bValue = b.costPerConversion === Infinity ? Number.MAX_VALUE : b.costPerConversion;
          break;
        case 'performance':
          // Map performance scores to numeric values for sorting (good=3, warning=2, poor=1)
          const performanceMap = { 'good': 3, 'warning': 2, 'poor': 1, undefined: 0 };
          aValue = performanceMap[a.performanceScore as keyof typeof performanceMap] || 0;
          bValue = performanceMap[b.performanceScore as keyof typeof performanceMap] || 0;
          break;
        default:
          aValue = a.frequency;
          bValue = b.frequency;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return data;
  }, [activeTab, searchQuery, sortField, sortDirection, results]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-600" />;
    return <ArrowUpDown className={`w-4 h-4 text-gray-800 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />;
  };

  const getPerformanceBadge = (item: NgramData) => {
    switch (item.performanceScore) {
      case 'good':
        return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportToCsv = () => {
    const headers = ['N-gram', 'Count', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'CTR %', 'CPC', 'Conv Rate %', 'Cost/Conv', 'Performance'];
    const csvContent = [
      headers.join(','),
      ...currentData.map(row => [
        `"${row.ngram}"`,
        row.frequency,
        row.totalImpressions,
        row.totalClicks,
        row.totalCost.toFixed(2),
        row.totalConversions,
        row.ctr.toFixed(2),
        row.cpc.toFixed(2),
        row.conversionRate.toFixed(2),
        row.costPerConversion === Infinity ? '∞' : row.costPerConversion.toFixed(2),
        row.performanceScore
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-grams-analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          N-gram Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="1" disabled={results.unigrams.length === 0} className="text-gray-800 data-[state=active]:text-gray-900">
                1-grams ({results.unigrams.length})
              </TabsTrigger>
              <TabsTrigger value="2" disabled={results.bigrams.length === 0} className="text-gray-800 data-[state=active]:text-gray-900">
                2-grams ({results.bigrams.length})
              </TabsTrigger>
              <TabsTrigger value="3" disabled={results.trigrams.length === 0} className="text-gray-800 data-[state=active]:text-gray-900">
                3-grams ({results.trigrams.length})
              </TabsTrigger>
              <TabsTrigger value="4" disabled={results.fourgrams.length === 0} className="text-gray-800 data-[state=active]:text-gray-900">
                4-grams ({results.fourgrams.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search n-grams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <Button variant="outline" onClick={exportToCsv} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {['1', '2', '3', '4'].map((size) => (
            <TabsContent key={size} value={size} className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-gray-900 font-semibold"
                        onClick={() => handleSort('ngram')}
                      >
                        <div className="flex items-center gap-2 text-gray-900">
                          Search Query
                          {getSortIcon('ngram')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-gray-900 font-semibold"
                        onClick={() => handleSort('frequency')}
                      >
                        <div className="flex items-center gap-2 text-gray-900">
                          Count
                          {getSortIcon('frequency')}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-900 font-semibold">Impressions</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Clicks</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-gray-900 font-semibold"
                        onClick={() => handleSort('totalCost')}
                      >
                        <div className="flex items-center gap-2 text-gray-900">
                          Cost
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Cumulative cost for all search terms containing this n-gram. 
                                Individual n-gram costs will sum to more than total campaign spend.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          {getSortIcon('totalCost')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-gray-900 font-semibold"
                        onClick={() => handleSort('totalConversions')}
                      >
                        <div className="flex items-center gap-2 text-gray-900">
                          Conversions
                          {getSortIcon('totalConversions')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-gray-900 font-semibold"
                        onClick={() => handleSort('costPerConversion')}
                      >
                        <div className="flex items-center gap-2 text-gray-900">
                          Cost/Conv
                          {getSortIcon('costPerConversion')}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-900 font-semibold">CTR</TableHead>
                      <TableHead className="text-gray-900 font-semibold">CPC</TableHead>
                      <TableHead className="text-gray-900 font-semibold">Conv Rate</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-gray-900 font-semibold"
                        onClick={() => handleSort('performance')}
                      >
                        <div className="flex items-center gap-2 text-gray-900">
                          Performance
                          {getSortIcon('performance')}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-gray-600 py-8">
                          {searchQuery ? 'No n-grams match your search.' : 'No data available for this n-gram size.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-medium max-w-xs text-gray-900">
                            <div className="truncate" title={item.ngram}>
                              {item.ngram}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-800">{item.frequency.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-800">{item.totalImpressions.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-800">{item.totalClicks.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-800">${item.totalCost.toFixed(2)}</TableCell>
                          <TableCell className="text-gray-800">{item.totalConversions.toFixed(1)}</TableCell>
                          <TableCell className="text-gray-800">
                            {item.costPerConversion === Infinity ? '∞' : `$${item.costPerConversion.toFixed(2)}`}
                          </TableCell>
                          <TableCell className="text-gray-800">{item.ctr.toFixed(2)}%</TableCell>
                          <TableCell className="text-gray-800">${item.cpc.toFixed(2)}</TableCell>
                          <TableCell className="text-gray-800">{item.conversionRate.toFixed(2)}%</TableCell>
                          <TableCell>{getPerformanceBadge(item)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {currentData.length > 0 && (
                <div className="mt-4 text-sm text-gray-700">
                  Showing {currentData.length} {size}-gram{currentData.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NgramDashboard;
