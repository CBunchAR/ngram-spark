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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            setError('Error parsing CSV file');
            return;
          }

          const data = parseCSVData(results.data);
          
          if (data.length === 0) {
            setError('No valid data found. Please ensure your CSV has the required columns: Search Term, Impressions, Clicks, Cost, Conversions');
            return;
          }

          onDataLoaded(data);
        } catch (err) {
          setError('Error processing file data');
        }
      },
      error: () => {
        setError('Error reading file');
      }
    });
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
        <p className="font-medium mb-2">Required CSV columns:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Search Term (or Search term)</li>
          <li>Impressions</li>
          <li>Clicks</li>
          <li>Cost</li>
          <li>Conversions</li>
        </ul>
        <p className="mt-3 text-xs">
          This tool works with standard Google Ads search term report exports.
        </p>
      </div>
    </Card>
  );
}