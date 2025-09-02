import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Minus
} from 'lucide-react';
import { NgramData, SortField, SortDirection } from '@/types/ppc';
import { exportToCsv } from '@/utils/ngramAnalysis';

interface ResultsTableProps {
  data: NgramData[];
  title: string;
  ngramSize: number;
}

export function ResultsTable({ data, title, ngramSize }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalImpressions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;
    
    if (searchTerm) {
      filtered = data.filter(item => 
        item.ngram.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'desc' 
        ? bStr.localeCompare(aStr)
        : aStr.localeCompare(bStr);
    });

    return filtered;
  }, [data, sortField, sortDirection, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  const getPerformanceBadge = (score: string) => {
    switch (score) {
      case 'good':
        return <Badge className="bg-success text-success-foreground">Good</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'poor':
        return <Badge className="bg-destructive text-destructive-foreground">Poor</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPerformanceIcon = (score: string) => {
    switch (score) {
      case 'good':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'poor':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-warning" />;
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-4 py-3 text-left cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'desc' ? 
            <ChevronDown className="w-4 h-4" /> : 
            <ChevronUp className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedData.length.toLocaleString()} results
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCsv(filteredAndSortedData, `${ngramSize}-gram-analysis.csv`)}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search n-grams..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="border-b">
                <SortableHeader field="ngram">N-gram</SortableHeader>
                <SortableHeader field="frequency">Frequency</SortableHeader>
                <SortableHeader field="totalImpressions">Impressions</SortableHeader>
                <SortableHeader field="totalClicks">Clicks</SortableHeader>
                <SortableHeader field="totalCost">Cost</SortableHeader>
                <SortableHeader field="totalConversions">Conversions</SortableHeader>
                <SortableHeader field="ctr">CTR</SortableHeader>
                <SortableHeader field="cpc">CPC</SortableHeader>
                <SortableHeader field="conversionRate">Conv Rate</SortableHeader>
                <SortableHeader field="performanceScore">Performance</SortableHeader>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm max-w-xs truncate" title={item.ngram}>
                      {item.ngram}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.frequency}</td>
                  <td className="px-4 py-3 text-sm">{item.totalImpressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{item.totalClicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(item.totalCost)}</td>
                  <td className="px-4 py-3 text-sm">{item.totalConversions}</td>
                  <td className="px-4 py-3 text-sm">{formatPercentage(item.ctr)}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(item.cpc)}</td>
                  <td className="px-4 py-3 text-sm">{formatPercentage(item.conversionRate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getPerformanceIcon(item.performanceScore)}
                      {getPerformanceBadge(item.performanceScore)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm flex items-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}