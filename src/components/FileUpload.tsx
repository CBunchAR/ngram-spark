import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { SearchTermData } from '@/types/ppc';
import { parseCSVData } from '@/utils/ngramAnalysis';

interface FileUploadProps {
  onDataLoaded: (data: SearchTermData[]) => void;
  isLoading: boolean;
}

export function FileUpload({ onDataLoaded, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    // First, read the file as text to preprocess it for Google Ads format
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        
        // Split into lines and find the actual header row
        const lines = csvText.split('\n');
        let headerRowIndex = -1;
        let processedLines: string[] = [];
        
        // Look for the line that contains the actual column headers
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase();
          if (line.includes('search term') && line.includes('clicks') && line.includes('cost')) {
            headerRowIndex = i;
            break;
          }
        }
        
        if (headerRowIndex === -1) {
          setError('Could not find valid column headers. Please ensure this is a Google Ads search term report.');
          return;
        }
        
        // Include the header row and all data rows after it
        processedLines = lines.slice(headerRowIndex);
        
        // Join back into CSV text
        const processedCsvText = processedLines.join('\n');
        
        // Now parse with Papa Parse
        Papa.parse(processedCsvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          transformHeader: (header: string) => {
            return header.trim();
          },
          complete: (results) => {
            try {
              const data = parseCSVData(results.data);
              
              if (data.length === 0) {
                setError('No valid search term data found. Please ensure your CSV is a Google Ads search term report with search terms that have data.');
                return;
              }

              onDataLoaded(data);
            } catch (err) {
              console.error('Error processing CSV:', err);
              setError('Error processing file data. Please check that this is a valid Google Ads search term report.');
            }
          },
          error: (error) => {
            console.error('Papa Parse error:', error);
            setError('Error parsing CSV. Please ensure this is a valid CSV file.');
          }
        });
        
      } catch (err) {
        console.error('Error reading file:', err);
        setError('Error reading file. Please try again.');
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <Card className="p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Upload Search Term Report</h2>
        <p className="text-muted-foreground">
          Upload your Google Ads search term report CSV to begin N-gram analysis
        </p>
      </div>

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragOver ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              or click to browse files (max 10MB)
            </p>
          </div>

          <Button 
            variant="outline" 
            disabled={isLoading}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isLoading ? 'Processing...' : 'Choose File'}
          </Button>

          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Google Ads Search Term Report Format:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Search term</li>
          <li>Impr. (Impressions)</li>
          <li>Clicks</li>
          <li>Cost</li>
          <li>Conversions</li>
          <li>CTR (optional)</li>
          <li>Avg. CPC (optional)</li>
          <li>Conv. rate (optional)</li>
        </ul>
        <p className="mt-3 text-xs">
          Export your search term report directly from Google Ads. The tool will automatically handle header rows and summary data.
        </p>
      </div>
    </Card>
  );
}